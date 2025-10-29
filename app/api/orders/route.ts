import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validations';
import { generateOrderNumber, calculateShippingCost } from '@/lib/utils';
import { sendOrderConfirmation } from '@/lib/email';

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params: any[] = [];

    if (currentUser) {
      if (currentUser.role === 'admin') {
        // Admin sees all orders
        whereClause = '';
      } else {
        // User sees only their orders
        whereClause = 'WHERE user_id = ?';
        params.push(currentUser.userId);
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      params
    );

    const total = countResult[0]?.total || 0;

    // Get orders
    const orders = await query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order (checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);
    const currentUser = await getCurrentUser();

    const { cartItems } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.price * item.quantity;
    }

    const shippingCost = calculateShippingCost(validatedData.shipping_city);
    const tax = 0; // Add tax calculation if needed
    const discount = 0; // Add discount logic if needed
    const total = subtotal + shippingCost + tax - discount;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Prepare billing address
    let billingData = {};
    if (validatedData.billing_same_as_shipping) {
      billingData = {
        billing_name: validatedData.shipping_name,
        billing_phone: validatedData.shipping_phone,
        billing_email: validatedData.shipping_email,
        billing_address_line1: validatedData.shipping_address_line1,
        billing_address_line2: validatedData.shipping_address_line2,
        billing_city: validatedData.shipping_city,
        billing_state: validatedData.shipping_state,
        billing_postal_code: validatedData.shipping_postal_code,
        billing_country: validatedData.shipping_country,
      };
    } else {
      billingData = {
        billing_name: validatedData.billing_name,
        billing_phone: validatedData.billing_phone,
        billing_email: validatedData.billing_email,
        billing_address_line1: validatedData.billing_address_line1,
        billing_address_line2: validatedData.billing_address_line2,
        billing_city: validatedData.billing_city,
        billing_state: validatedData.billing_state,
        billing_postal_code: validatedData.billing_postal_code,
        billing_country: validatedData.billing_country,
      };
    }

    // Insert order
    const orderResult: any = await query(
      `INSERT INTO orders (
        order_number, user_id, guest_email, status, subtotal, shipping_cost,
        tax, discount, total, payment_method, payment_status,
        shipping_name, shipping_phone, shipping_email, shipping_address_line1,
        shipping_address_line2, shipping_city, shipping_state, shipping_postal_code,
        shipping_country, billing_name, billing_phone, billing_email,
        billing_address_line1, billing_address_line2, billing_city, billing_state,
        billing_postal_code, billing_country, notes
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, 'cash_on_delivery', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        currentUser?.userId || null,
        currentUser ? null : validatedData.shipping_email,
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        validatedData.shipping_name,
        validatedData.shipping_phone,
        validatedData.shipping_email,
        validatedData.shipping_address_line1,
        validatedData.shipping_address_line2 || null,
        validatedData.shipping_city,
        validatedData.shipping_state || null,
        validatedData.shipping_postal_code || null,
        validatedData.shipping_country,
        billingData.billing_name || null,
        billingData.billing_phone || null,
        billingData.billing_email || null,
        billingData.billing_address_line1 || null,
        billingData.billing_address_line2 || null,
        billingData.billing_city || null,
        billingData.billing_state || null,
        billingData.billing_postal_code || null,
        billingData.billing_country || null,
        validatedData.notes || null,
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cartItems) {
      await query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, variant_id,
          variant_details, quantity, price, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.product_sku || null,
          item.variant_id || null,
          item.variant_details || null,
          item.quantity,
          item.price,
          item.price * item.quantity,
        ]
      );

      // Update product stock
      await query(
        'UPDATE products SET stock_quantity = stock_quantity - ?, total_sales = total_sales + ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      );

      // Update variant stock if applicable
      if (item.variant_id) {
        await query(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      }
    }

    // Clear cart for logged-in users or guests
    if (currentUser) {
      await query('DELETE FROM cart WHERE user_id = ?', [currentUser.userId]);
    } else {
      // Clear guest cart
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const guestId = cookieStore.get('guest_session_id')?.value;
      if (guestId) {
        await query('DELETE FROM cart WHERE guest_session_id = ?', [guestId]);
      }
    }

    // Get order for email
    const order = await query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    // Send confirmation email
    await sendOrderConfirmation(order[0]);

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber,
      },
      message: 'Order placed successfully',
    });
  } catch (error: any) {
    console.error('Create order error:', error);

    if (error.name === 'ZodError') {
      const errorMessage = error.errors?.[0]?.message || 'Invalid form data';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}
