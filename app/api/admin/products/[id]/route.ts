import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { Product } from '@/lib/types';

// GET /api/products/[id] - Get product by ID (for admin edit)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get product
    const product = await queryOne<any>(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get images
    const images = await query<any>(
      `SELECT id, image_url, is_primary, sort_order
       FROM product_images
       WHERE product_id = ?
       ORDER BY sort_order, id`,
      [id]
    );

    // Get variants
    const variants = await query<any>(
      `SELECT id, name, sku, price_modifier, stock_quantity
       FROM product_variants
       WHERE product_id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        images,
        variants,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (Admin only)
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
    const validatedData = productSchema.parse(body);

    // Check if product exists
    const existing = await queryOne<Product>(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    await query(
      `UPDATE products SET
        name = ?, slug = ?, description = ?, long_description = ?,
        category_id = ?, brand = ?, sku = ?, price = ?, compare_price = ?,
        cost_price = ?, stock_quantity = ?, low_stock_threshold = ?,
        weight = ?, dimensions = ?, is_active = ?, is_featured = ?,
        meta_title = ?, meta_description = ?, meta_keywords = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        validatedData.name,
        validatedData.slug,
        validatedData.description || null,
        validatedData.long_description || null,
        validatedData.category_id || null,
        validatedData.brand || null,
        validatedData.sku || null,
        validatedData.price,
        validatedData.compare_price || null,
        validatedData.cost_price || null,
        validatedData.stock_quantity,
        validatedData.low_stock_threshold,
        validatedData.weight || null,
        validatedData.dimensions || null,
        validatedData.is_active,
        validatedData.is_featured,
        validatedData.meta_title || null,
        validatedData.meta_description || null,
        validatedData.meta_keywords || null,
        id,
      ]
    );

    // Handle images if provided
    if (body.existingImages || body.newImages) {
      // Delete images not in existingImages list
      const existingImageIds = body.existingImages || [];
      if (existingImageIds.length > 0) {
        await query(
          `DELETE FROM product_images WHERE product_id = ? AND id NOT IN (${existingImageIds.join(',')})`,
          [id]
        );
      } else {
        // Delete all images if none are kept
        await query('DELETE FROM product_images WHERE product_id = ?', [id]);
      }

      // Add new images
      const newImages = body.newImages || [];
      for (let i = 0; i < newImages.length; i++) {
        await query(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?)`,
          [id, newImages[i], i === 0 && existingImageIds.length === 0, i]
        );
      }
    }

    // Handle variants if provided
    if (body.variants) {
      // Delete all existing variants and recreate (simpler approach)
      await query('DELETE FROM product_variants WHERE product_id = ?', [id]);

      // Insert new/updated variants
      for (const variant of body.variants) {
        if (variant.name) {
          await query(
            `INSERT INTO product_variants (product_id, name, sku, price_modifier, stock_quantity)
             VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              variant.name,
              variant.sku || null,
              variant.price_modifier || 0,
              variant.stock_quantity || 0,
            ]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    console.error('Update product error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
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

    // Check if product exists
    const product = await queryOne<Product>(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product (cascade will handle images, variants, etc.)
    await query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
