import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// PUT /api/reviews/[id] - Approve review (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { is_approved } = await request.json();

    await query(
      'UPDATE product_reviews SET is_approved = ? WHERE id = ?',
      [is_approved, id]
    );

    // Update product average rating
    const review = await query(
      'SELECT product_id FROM product_reviews WHERE id = ?',
      [id]
    );

    if (review.length > 0) {
      const productId = review[0].product_id;

      // Recalculate average rating
      const stats = await query(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as total
         FROM product_reviews
         WHERE product_id = ? AND is_approved = TRUE`,
        [productId]
      );

      await query(
        'UPDATE products SET average_rating = ?, total_reviews = ? WHERE id = ?',
        [stats[0].avg_rating || 0, stats[0].total || 0, productId]
      );
    }

    return NextResponse.json({
      success: true,
      message: is_approved ? 'Review approved' : 'Review rejected',
    });
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get product_id before deleting
    const review = await query(
      'SELECT product_id FROM product_reviews WHERE id = ?',
      [id]
    );

    if (review.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const productId = review[0].product_id;

    // Delete review
    await query('DELETE FROM product_reviews WHERE id = ?', [id]);

    // Recalculate average rating
    const stats = await query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total
       FROM product_reviews
       WHERE product_id = ? AND is_approved = TRUE`,
      [productId]
    );

    await query(
      'UPDATE products SET average_rating = ?, total_reviews = ? WHERE id = ?',
      [stats[0].avg_rating || 0, stats[0].total || 0, productId]
    );

    return NextResponse.json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
