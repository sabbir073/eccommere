import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to get guest session ID
async function getGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('guest_session_id')?.value || null;
}

// PUT /api/cart/[id] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { id } = await params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    let cartItem;

    if (currentUser) {
      // Check if item belongs to user
      cartItem = await query(
        'SELECT * FROM cart WHERE id = ? AND user_id = ?',
        [id, currentUser.userId]
      );
    } else {
      // Check if item belongs to guest
      const guestId = await getGuestSessionId();
      if (!guestId) {
        return NextResponse.json(
          { success: false, error: 'Cart session not found' },
          { status: 401 }
        );
      }

      cartItem = await query(
        'SELECT * FROM cart WHERE id = ? AND guest_session_id = ?',
        [id, guestId]
      );
    }

    if (cartItem.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Update quantity
    await query(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      [quantity, id]
    );

    return NextResponse.json({
      success: true,
      message: 'Cart updated',
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[id] - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { id } = await params;

    let cartItem;

    if (currentUser) {
      // Check if item belongs to user
      cartItem = await query(
        'SELECT * FROM cart WHERE id = ? AND user_id = ?',
        [id, currentUser.userId]
      );
    } else {
      // Check if item belongs to guest
      const guestId = await getGuestSessionId();
      if (!guestId) {
        return NextResponse.json(
          { success: false, error: 'Cart session not found' },
          { status: 401 }
        );
      }

      cartItem = await query(
        'SELECT * FROM cart WHERE id = ? AND guest_session_id = ?',
        [id, guestId]
      );
    }

    if (cartItem.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Delete item
    await query('DELETE FROM cart WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
