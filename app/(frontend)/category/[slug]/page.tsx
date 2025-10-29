import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ProductCard from '@/components/product/ProductCard';
import CategoryFilters from '@/components/product/CategoryFilters';
import Pagination from '@/components/ui/Pagination';
import { LoadingGrid } from '@/components/ui/Loading';

async function getCategory(slug: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`,
    { cache: 'no-store' }
  );

  if (!response.ok) return null;

  const result = await response.json();
  if (!result.success || !result.data || !result.data.flat) return null;

  const category = result.data.flat.find((cat: any) => cat.slug === slug);

  return category;
}

async function getCategoryProducts(slug: string, searchParams: any) {
  const params = new URLSearchParams();
  params.set('category', slug);
  params.set('page', searchParams.page || '1');
  params.set('limit', '20');

  if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
  if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
  if (searchParams.brand) params.set('brand', searchParams.brand);
  if (searchParams.inStock) params.set('inStock', searchParams.inStock);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products?${params.toString()}`,
    { cache: 'no-store' }
  );

  if (!response.ok) return null;

  return response.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: category.meta_title || `${category.name} - E-Commerce Store`,
    description: category.meta_description || category.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<any>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container-custom py-8">
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
      </div>

      {/* Filters & Sort */}
      <CategoryFilters categorySlug={slug} />

      {/* Products */}
      <Suspense fallback={<LoadingGrid />}>
        <CategoryProducts slug={slug} searchParams={search} />
      </Suspense>
    </div>
  );
}

async function CategoryProducts({ slug, searchParams }: { slug: string; searchParams: any }) {
  const result = await getCategoryProducts(slug, searchParams);

  if (!result || !result.data) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Failed to load products</p>
      </div>
    );
  }

  const { products, pagination } = result.data;

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">No products found in this category</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-gray-600">
        Showing {products.length} of {pagination.total} products
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        baseUrl={`/category/${slug}`}
      />
    </>
  );
}
