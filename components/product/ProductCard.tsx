'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

interface ProductCardProps {
  product: Product & { primary_image?: string };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const discount = calculateDiscount(product.price, product.compare_price);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_quantity === 0) {
      showToast('This product is out of stock', 'error');
      return;
    }

    setIsAdding(true);
    const success = await addToCart(product.id, 1);
    setIsAdding(false);

    if (success) {
      showToast('Product added to cart!', 'success');
    } else {
      showToast('Failed to add product to cart', 'error');
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="card p-4 group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}

        {/* Out of Stock Badge */}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 group-hover:text-primary-600 transition">
          {product.name}
        </h3>

        {/* Rating */}
        {product.average_rating > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-yellow-500 text-sm">
              {'★'.repeat(Math.round(product.average_rating))}
              {'☆'.repeat(5 - Math.round(product.average_rating))}
            </div>
            <span className="text-xs text-gray-600">({product.total_reviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg md:text-xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold && (
          <p className="text-xs text-orange-600 mb-2">
            Only {product.stock_quantity} left in stock!
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          className="btn-primary w-full text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={product.stock_quantity === 0 || isAdding}
          onClick={handleAddToCart}
        >
          {isAdding ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
