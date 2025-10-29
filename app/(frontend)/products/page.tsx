import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters from '@/components/product/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import { LoadingGrid } from '@/components/ui/Loading';

export const metadata: Metadata = {
  title: 'All Products - Alabili',
  description: 'Browse our complete collection of quality products at great prices at Alabili.',
};

interface SearchParams {
  page?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  brand?: string;
  inStock?: string;
  featured?: string;
  sortBy?: string;
  search?: string;
}

async function getProducts(searchParams: SearchParams) {
  try {
    const page = parseInt(searchParams.page || '1');
    const limit = 20;

    // Build query parameters
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
    if (searchParams.brand) params.set('brand', searchParams.brand);
    if (searchParams.inStock) params.set('inStock', searchParams.inStock);
    if (searchParams.featured) params.set('featured', searchParams.featured);
    if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
    if (searchParams.search) params.set('search', searchParams.search);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error('Products API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return {
        success: false,
        data: { products: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      };
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      success: false,
      data: { products: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
    };
  }
}

async function getCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    // API returns { success: true, data: { categories: tree, flat: array } }
    // We want the flat array for the dropdown
    return result.success && result.data && result.data.flat ? result.data.flat : [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p className="text-gray-600">
          Discover our wide selection of quality products
        </p>
      </div>

      {/* Filters & Sort */}
      <ProductFilters categories={categories} />

      {/* Products Grid */}
      <Suspense fallback={<LoadingGrid />}>
        <ProductsGrid searchParams={params} />
      </Suspense>
    </div>
  );
}

async function ProductsGrid({ searchParams }: { searchParams: SearchParams }) {
  const { data } = await getProducts(searchParams);
  const { products, pagination } = data;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">No products found</p>
        <p className="text-gray-500 mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        Showing {products.length} of {pagination.total} products
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        baseUrl="/products"
      />
    </>
  );
}
