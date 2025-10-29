import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { reviewSchema } from '@/lib/validations';

// GET /api/reviews - List reviews (Admin only for management)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const approved = searchParams.get('approved');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const whereClauses = [];
    const params: any[] = [];

    if (approved === 'true') {
      whereClauses.push('pr.is_approved = TRUE');
    } else if (approved === 'false') {
      whereClauses.push('pr.is_approved = FALSE');
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM product_reviews pr ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get reviews
    const reviews = await query(
      `SELECT
        pr.*,
        p.name as product_name,
        p.slug as product_slug,
        COALESCE(u.first_name, pr.guest_name) as user_name,
        u.email as user_email
       FROM product_reviews pr
       LEFT JOIN products p ON pr.product_id = p.id
       LEFT JOIN users u ON pr.user_id = u.id
       ${whereClause}
       ORDER BY pr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();

    // Validate input
    const validatedData = reviewSchema.parse(body);

    // Check if product exists
    const product = await query(
      'SELECT id FROM products WHERE id = ?',
      [validatedData.product_id]
    );

    if (product.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    if (currentUser) {
      const existingReview = await query(
        'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?',
        [validatedData.product_id, currentUser.userId]
      );

      if (existingReview.length > 0) {
        return NextResponse.json(
          { success: false, error: 'You have already reviewed this product' },
          { status: 400 }
        );
      }

      // Check if user purchased this product
      const hasPurchased = await query(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id = ? AND oi.product_id = ?
         LIMIT 1`,
        [currentUser.userId, validatedData.product_id]
      );

      const isVerifiedPurchase = hasPurchased.length > 0;

      // Insert review
      await query(
        `INSERT INTO product_reviews (
          product_id, user_id, rating, title, comment, is_verified_purchase, is_approved
        ) VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
        [
          validatedData.product_id,
          currentUser.userId,
          validatedData.rating,
          validatedData.title || null,
          validatedData.comment || null,
          isVerifiedPurchase,
        ]
      );
    } else {
      // Guest review
      if (!validatedData.guest_name || !validatedData.guest_email) {
        return NextResponse.json(
          { success: false, error: 'Name and email are required for guest reviews' },
          { status: 400 }
        );
      }

      await query(
        `INSERT INTO product_reviews (
          product_id, guest_name, guest_email, rating, title, comment, is_approved
        ) VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
        [
          validatedData.product_id,
          validatedData.guest_name,
          validatedData.guest_email,
          validatedData.rating,
          validatedData.title || null,
          validatedData.comment || null,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
    });
  } catch (error: any) {
    console.error('Create review error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
