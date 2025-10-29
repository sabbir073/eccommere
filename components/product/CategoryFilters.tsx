'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface CategoryFiltersProps {
  categorySlug: string;
}

export default function CategoryFilters({ categorySlug }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  const updateFilters = (newPriceRange?: string, newSortBy?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update price range
    const priceValue = newPriceRange !== undefined ? newPriceRange : priceRange;
    if (priceValue) {
      const [min, max] = priceValue.split('-');
      if (min) params.set('minPrice', min);
      if (max) params.set('maxPrice', max);
      params.set('priceRange', priceValue);
    } else {
      params.delete('minPrice');
      params.delete('maxPrice');
      params.delete('priceRange');
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

    router.push(`/category/${categorySlug}?${params.toString()}`);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriceRange = e.target.value;
    setPriceRange(newPriceRange);
    updateFilters(newPriceRange, undefined);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    updateFilters(undefined, newSortBy);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Price Range Filter */}
      <div className="flex-1">
        <select
          className="input-field"
          value={priceRange}
          onChange={handlePriceChange}
        >
          <option value="">All Prices</option>
          <option value="0-500">Under ৳500</option>
          <option value="500-1000">৳500 - ৳1,000</option>
          <option value="1000-5000">৳1,000 - ৳5,000</option>
          <option value="5000-10000">৳5,000 - ৳10,000</option>
          <option value="10000-50000">৳10,000 - ৳50,000</option>
          <option value="50000-">Above ৳50,000</option>
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
