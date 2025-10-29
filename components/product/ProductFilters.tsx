'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProductFiltersProps {
  categories: Array<{ id: number; name: string; slug: string }>;
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  const updateFilters = (newCategory?: string, newSortBy?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update category
    const categoryValue = newCategory !== undefined ? newCategory : category;
    if (categoryValue) {
      params.set('category', categoryValue);
    } else {
      params.delete('category');
    }

    // Update sortBy
    const sortByValue = newSortBy !== undefined ? newSortBy : sortBy;
    if (sortByValue) {
      params.set('sortBy', sortByValue);
    } else {
      params.delete('sortBy');
    }

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    updateFilters(newCategory, undefined);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    updateFilters(undefined, newSortBy);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Category Filter */}
      <div className="flex-1">
        <select
          className="input-field"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Filter */}
      <div className="md:w-48">
        <select
          className="input-field"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="">Sort By</option>
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  );
}
