import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const result = await query('SELECT 1 as test');

    // Test if tables exist
    const tables = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
    `);

    // Count products
    const productCount = await query<{ count: number }>('SELECT COUNT(*) as count FROM products');

    // Get sample products
    const products = await query('SELECT id, name, slug, price FROM products LIMIT 5');

    return NextResponse.json({
      success: true,
      data: {
        connection: 'OK',
        database: process.env.DB_NAME,
        tables: tables,
        productCount: productCount[0],
        sampleProducts: products,
      },
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        sqlState: error.sqlState,
      },
      { status: 500 }
    );
  }
}
