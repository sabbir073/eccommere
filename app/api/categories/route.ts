import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Category } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';

// Helper function to build category tree
function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<number, Category>();
  const rootCategories: Category[] = [];

  // Create a map of all categories
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // Build the tree
  categories.forEach(cat => {
    const category = categoryMap.get(cat.id)!;
    if (cat.parent_id === null) {
      rootCategories.push(category);
    } else if (cat.parent_id !== undefined) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(category);
      }
    }
  });

  return rootCategories;
}

// GET /api/categories - List all categories (tree structure)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let whereClause = includeInactive ? '' : 'WHERE c.is_active = TRUE';

    const categories = await query<Category>(
      `SELECT c.*, p.name as parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       ${whereClause}
       ORDER BY c.display_order, c.name`,
      []
    );

    // Build tree structure
    const categoryTree = buildCategoryTree(categories);

    return NextResponse.json({
      success: true,
      data: {
        categories: categoryTree,
        flat: categories, // Also return flat list
      },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create category (Admin only)
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
    const validatedData = categorySchema.parse(body);

    const result: any = await query(
      `INSERT INTO categories (
        name, slug, description, parent_id, image_url, icon,
        is_active, display_order, meta_title, meta_description, meta_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.insertId },
      message: 'Category created successfully',
    });
  } catch (error: any) {
    console.error('Create category error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
