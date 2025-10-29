import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { LoadingGrid } from '@/components/ui/Loading';

export const metadata: Metadata = {
  title: 'Search Products - E-Commerce Store',
};

async function searchProducts(query: string, page: number = 1) {
  if (!query) return null;

  const params = new URLSearchParams();
  params.set('search', query);
  params.set('page', page.toString());
  params.set('limit', '20');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params.toString()}`,
    { cache: 'no-store' }
  );

  if (!response.ok) return null;

  return response.json();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1');

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      {query && (
        <p className="text-gray-600 mb-8">
          Showing results for: <span className="font-semibold">"{query}"</span>
        </p>
      )}

      <Suspense fallback={<LoadingGrid />}>
        <SearchResults query={query} page={page} />
      </Suspense>
    </div>
  );
}

async function SearchResults({ query, page }: { query: string; page: number }) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-xl text-gray-600">Enter a search term to find products</p>
      </div>
    );
  }

  const result = await searchProducts(query, page);

  if (!result || !result.data) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Failed to load search results</p>
      </div>
    );
  }

  const { products, pagination } = result.data;

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😞</div>
        <p className="text-xl font-semibold mb-2">No products found</p>
        <p className="text-gray-600 mb-6">
          Try different keywords or browse our categories
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-gray-600">
        Found {pagination.total} {pagination.total === 1 ? 'product' : 'products'}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        baseUrl={`/search?q=${encodeURIComponent(query)}`}
      />
    </>
  );
}
