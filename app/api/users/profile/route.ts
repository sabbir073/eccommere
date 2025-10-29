import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, hashPassword, comparePassword } from '@/lib/auth';

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, phone, email } = body;

    // Check if email is taken by another user
    if (email && email !== currentUser.email) {
      const existingUser = await queryOne(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, currentUser.userId]
      );

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    await query(
      `UPDATE users SET
        first_name = ?,
        last_name = ?,
        phone = ?,
        email = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        first_name || null,
        last_name || null,
        phone || null,
        email || currentUser.email,
        currentUser.userId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
