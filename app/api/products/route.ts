import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Product } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { productSchema } from '@/lib/validations';

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand');
    const inStock = searchParams.get('inStock');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClauses: string[] = ['p.is_active = TRUE'];
    let params: any[] = [];

    // Build WHERE clauses
    if (category) {
      whereClauses.push('c.slug = ?');
      params.push(category);
    }

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (minPrice) {
      whereClauses.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      whereClauses.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    if (brand) {
      whereClauses.push('p.brand = ?');
      params.push(brand);
    }

    if (inStock === 'true') {
      whereClauses.push('p.stock_quantity > 0');
    }

    if (featured === 'true') {
      whereClauses.push('p.is_featured = TRUE');
    }

    // Build ORDER BY clause
    let orderBy = 'p.created_at DESC';
    switch (sortBy) {
      case 'price_asc':
        orderBy = 'p.price ASC';
        break;
      case 'price_desc':
        orderBy = 'p.price DESC';
        break;
      case 'popular':
        orderBy = 'p.total_sales DESC';
        break;
      case 'rating':
        orderBy = 'p.average_rating DESC';
        break;
    }

    const whereClause = whereClauses.join(' AND ');

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}`,
      params
    );

    const total = countResult[0]?.total || 0;

    // Get products with primary image
    const products = await query<Product>(
      `SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const result: any = await query(
      `INSERT INTO products (
        name, slug, description, long_description, category_id, brand, sku,
        price, compare_price, cost_price, stock_quantity, low_stock_threshold,
        weight, dimensions, is_active, is_featured, meta_title, meta_description, meta_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    const productId = result.insertId;

    // Insert product images
    if (body.images && body.images.length > 0) {
      for (let i = 0; i < body.images.length; i++) {
        await query(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?)`,
          [productId, body.images[i], i === 0, i]
        );
      }
    }

    // Insert product variants
    if (body.variants && body.variants.length > 0) {
      for (const variant of body.variants) {
        if (variant.name) {
          await query(
            `INSERT INTO product_variants (product_id, name, sku, price_modifier, stock_quantity)
             VALUES (?, ?, ?, ?, ?)`,
            [
              productId,
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
      data: { id: productId },
      message: 'Product created successfully',
    });
  } catch (error: any) {
    console.error('Create product error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
