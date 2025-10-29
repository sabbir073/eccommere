import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';

// GET /api/users/addresses - Get user addresses
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Please login to view addresses' },
        { status: 401 }
      );
    }

    const addresses = await query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [currentUser.userId]
    );

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/users/addresses - Create address
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Please login to add address' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // If setting as default, unset other defaults
    if (validatedData.is_default) {
      await query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [currentUser.userId]
      );
    }

    // Insert address
    const result: any = await query(
      `INSERT INTO addresses (
        user_id, full_name, phone, email, address_line1, address_line2,
        city, state, postal_code, country, is_default, address_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        currentUser.userId,
        validatedData.full_name,
        validatedData.phone,
        validatedData.email || null,
        validatedData.address_line1,
        validatedData.address_line2 || null,
        validatedData.city,
        validatedData.state || null,
        validatedData.postal_code || null,
        validatedData.country,
        validatedData.is_default,
        validatedData.address_type,
      ]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.insertId },
      message: 'Address added successfully',
    });
  } catch (error: any) {
    console.error('Create address error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add address' },
      { status: 500 }
    );
  }
}
