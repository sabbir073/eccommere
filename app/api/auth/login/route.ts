import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { User } from '@/lib/types';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await queryOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [validatedData.email]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // MERGE GUEST CART WITH USER CART
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get('guest_session_id')?.value;

    if (guestSessionId) {
      // Get guest cart items
      const guestCartItems = await query(
        'SELECT * FROM cart WHERE guest_session_id = ?',
        [guestSessionId]
      );

      // Merge each guest item with user cart
      for (const guestItem of guestCartItems) {
        const existing = await query(
          'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
          [user.id, guestItem.product_id, guestItem.variant_id || null, guestItem.variant_id || null]
        );

        if (existing.length > 0) {
          // Update quantity (merge)
          await query(
            'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
            [guestItem.quantity, existing[0].id]
          );
        } else {
          // Transfer guest item to user cart
          await query(
            'UPDATE cart SET user_id = ?, guest_session_id = NULL WHERE id = ?',
            [user.id, guestItem.id]
          );
        }
      }

      // Delete remaining guest cart items (duplicates that were merged)
      await query('DELETE FROM cart WHERE guest_session_id = ?', [guestSessionId]);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Clear guest session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        token,
      },
      message: 'Login successful',
    });

    // Remove guest session cookie
    response.cookies.delete('guest_session_id');

    return response;
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
