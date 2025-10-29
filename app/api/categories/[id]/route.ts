import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';
import { Category } from '@/lib/types';

// PUT /api/categories/[id] - Update category (Admin only)
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
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Check if category exists
    const existing = await queryOne<Category>(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Update category
    await query(
      `UPDATE categories SET
        name = ?, slug = ?, description = ?, parent_id = ?,
        image_url = ?, icon = ?, is_active = ?, display_order = ?,
        meta_title = ?, meta_description = ?, meta_keywords = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        validatedData.name,
        validatedData.slug,
        validatedData.description || null,
        validatedData.parent_id || null,
        validatedData.image_url || null,
        body.icon || null,
        validatedData.is_active,
        body.display_order || 0,
        validatedData.meta_title || null,
        validatedData.meta_description || null,
        body.meta_keywords || null,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
    });
  } catch (error: any) {
    console.error('Update category error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category (Admin only)
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

    // Check if category has products
    const products = await query(
      'SELECT id FROM products WHERE category_id = ? LIMIT 1',
      [id]
    );

    if (products.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with products. Remove products first.' },
        { status: 400 }
      );
    }

    // Check if category has subcategories
    const subcategories = await query(
      'SELECT id FROM categories WHERE parent_id = ? LIMIT 1',
      [id]
    );

    if (subcategories.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    // Delete category
    await query('DELETE FROM categories WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
