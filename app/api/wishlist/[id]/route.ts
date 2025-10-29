import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// DELETE /api/wishlist/[id] - Remove from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if item belongs to user
    const wishlistItem = await query(
      'SELECT * FROM wishlist WHERE id = ? AND user_id = ?',
      [id, currentUser.userId]
    );

    if (wishlistItem.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    // Delete item
    await query('DELETE FROM wishlist WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
    });
  } catch (error) {
    console.error('Delete wishlist item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
