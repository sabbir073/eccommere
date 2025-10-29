import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { Product, ProductImage, ProductVariant } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get product
    const product = await queryOne<Product>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [slug]
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get images
    const images = await query<ProductImage>(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, is_primary DESC',
      [product.id]
    );

    // Get variants
    const variants = await query<ProductVariant>(
      'SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE ORDER BY name',
      [product.id]
    );

    // Get reviews (approved only)
    const reviews = await query(
      `SELECT r.*, u.first_name, u.last_name
       FROM product_reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = TRUE
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [product.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        images,
        variants,
        reviews,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
