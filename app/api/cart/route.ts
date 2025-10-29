import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

// Helper to get or create guest session ID
async function getGuestSessionId(request: NextRequest): Promise<string> {
  const cookieStore = await cookies();
  let guestId = cookieStore.get('guest_session_id')?.value;

  if (!guestId) {
    guestId = randomUUID();
  }

  return guestId;
}

// GET /api/cart - Get cart items
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    let cartItems;

    if (currentUser) {
      // Logged in user - get from database
      cartItems = await query(
        `SELECT
          c.*,
          p.name as product_name,
          p.slug as product_slug,
          p.price,
          p.stock_quantity,
          p.sku as product_sku,
          v.name as variant_name,
          v.price_modifier,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image
         FROM cart c
         JOIN products p ON c.product_id = p.id
         LEFT JOIN product_variants v ON c.variant_id = v.id
         WHERE c.user_id = ?`,
        [currentUser.userId]
      );
    } else {
      // Guest user - get from session
      const guestId = await getGuestSessionId(request);
      cartItems = await query(
        `SELECT
          c.*,
          p.name as product_name,
          p.slug as product_slug,
          p.price,
          p.stock_quantity,
          p.sku as product_sku,
          v.name as variant_name,
          v.price_modifier,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image
         FROM cart c
         JOIN products p ON c.product_id = p.id
         LEFT JOIN product_variants v ON c.variant_id = v.id
         WHERE c.guest_session_id = ?`,
        [guestId]
      );
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price) + (parseFloat(item.price_modifier) || 0);
      return sum + (price * item.quantity);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        subtotal,
        itemCount: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add to cart
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const { product_id, variant_id, quantity } = await request.json();

    if (!product_id || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Item added to cart',
    });

    if (currentUser) {
      // Logged in user
      const existing = await query(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
        [currentUser.userId, product_id, variant_id || null, variant_id || null]
      );

      if (existing.length > 0) {
        await query(
          'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
          [quantity, existing[0].id]
        );
      } else {
        await query(
          'INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
          [currentUser.userId, product_id, variant_id || null, quantity]
        );
      }
    } else {
      // Guest user
      const guestId = await getGuestSessionId(request);

      // Set cookie for guest session
      response.cookies.set('guest_session_id', guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      const existing = await query(
        'SELECT * FROM cart WHERE guest_session_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
        [guestId, product_id, variant_id || null, variant_id || null]
      );

      if (existing.length > 0) {
        await query(
          'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
          [quantity, existing[0].id]
        );
      } else {
        await query(
          'INSERT INTO cart (guest_session_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
          [guestId, product_id, variant_id || null, quantity]
        );
      }
    }

    return response;
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser) {
      // Logged in user
      await query('DELETE FROM cart WHERE user_id = ?', [currentUser.userId]);
    } else {
      // Guest user
      const guestId = await getGuestSessionId(request);
      await query('DELETE FROM cart WHERE guest_session_id = ?', [guestId]);
    }

    return NextResponse.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
