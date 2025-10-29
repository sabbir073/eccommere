'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Loading from '@/components/ui/Loading';
import { formatPrice } from '@/lib/utils';

import { showSuccess, showError, showWarning, showInfo, showConfirm, showDeleteConfirm } from '@/lib/sweetalert';
export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();

      if (data.success) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: number) => {
    const result = await showConfirm('Remove this item from wishlist?'); if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        showError(data.error || 'Failed to remove item');
      }
    } catch (err) {
      showError('Failed to remove item');
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      const data = await response.json();

      if (data.success) {
        showError('Added to cart!');
      } else {
        showError(data.error || 'Failed to add to cart');
      }
    } catch (err) {
      showError('Failed to add to cart');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-6">
            Save your favorite items to buy them later
          </p>
          <Link href="/products" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 border hover:shadow-lg transition">
                {/* Product Image */}
                <Link href={`/products/${item.product_slug}`} className="block mb-3">
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div>
                  <Link
                    href={`/products/${item.product_slug}`}
                    className="font-semibold hover:text-primary-600 line-clamp-2 mb-2 block"
                  >
                    {item.product_name}
                  </Link>

                  {/* Rating */}
                  {item.average_rating > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-500 text-sm">
                        {'★'.repeat(Math.round(item.average_rating))}
                        {'☆'.repeat(5 - Math.round(item.average_rating))}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-primary-600">
                      {formatPrice(item.price)}
                    </span>
                    {item.compare_price && item.compare_price > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.compare_price)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  {item.stock_quantity === 0 ? (
                    <p className="text-sm text-red-600 mb-3">Out of Stock</p>
                  ) : item.stock_quantity < 5 ? (
                    <p className="text-sm text-orange-600 mb-3">
                      Only {item.stock_quantity} left!
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 mb-3">In Stock</p>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => addToCart(item.product_id)}
                      disabled={item.stock_quantity === 0}
                      className="btn-primary w-full text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {item.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full text-sm text-red-600 hover:text-red-700 py-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
