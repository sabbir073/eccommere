import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';

// PUT /api/users/addresses/[id] - Update address
export async function PUT(
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
    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // Check if address belongs to user
    const address = await queryOne(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, currentUser.userId]
    );

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (validatedData.is_default) {
      await query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
        [currentUser.userId, id]
      );
    }

    // Update address
    await query(
      `UPDATE addresses SET
        full_name = ?, phone = ?, email = ?, address_line1 = ?, address_line2 = ?,
        city = ?, state = ?, postal_code = ?, country = ?, is_default = ?, address_type = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
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
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
    });
  } catch (error: any) {
    console.error('Update address error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/addresses/[id] - Delete address
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

    // Check if address belongs to user
    const address = await queryOne(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, currentUser.userId]
    );

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // Delete address
    await query('DELETE FROM addresses WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
