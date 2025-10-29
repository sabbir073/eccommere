import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/wishlist - Get wishlist items
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Please login to view wishlist' },
        { status: 401 }
      );
    }

    const wishlistItems = await query(
      `SELECT
        w.*,
        p.name as product_name,
        p.slug as product_slug,
        p.price,
        p.compare_price,
        p.stock_quantity,
        p.average_rating,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ? AND p.is_active = TRUE
       ORDER BY w.created_at DESC`,
      [currentUser.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        items: wishlistItems,
        count: wishlistItems.length,
      },
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Please login to add items to wishlist' },
        { status: 401 }
      );
    }

    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await query(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );

    if (product.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existing = await query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [currentUser.userId, product_id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Product already in wishlist' },
        { status: 400 }
      );
    }

    // Add to wishlist
    await query(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [currentUser.userId, product_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist',
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}
