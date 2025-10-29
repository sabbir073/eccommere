'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import Loading from '@/components/ui/Loading';

import { showSuccess, showError, showWarning, showInfo, showConfirm, showDeleteConfirm } from '@/lib/sweetalert';
interface CartItemData {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  price: number;
  quantity: number;
  stock_quantity: number;
  product_image?: string;
  variant_name?: string;
  variant_value?: string;
  price_modifier?: number;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();

      if (data.success) {
        setItems(data.data.items);
      } else {
        if (response.status === 401) {
          // User not logged in - could implement guest cart here
          setError('Please login to view your cart');
        } else {
          setError(data.error || 'Failed to load cart');
        }
      }
    } catch (err) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      } else {
        showError(data.error || 'Failed to update cart');
        // Revert to original quantity
        await fetchCart();
      }
    } catch (err) {
      showError('Failed to update cart');
      await fetchCart();
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId: number) => {
    const result = await showConfirm('Remove this item from cart?'); if (!result.isConfirmed) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } else {
        showError(data.error || 'Failed to remove item');
      }
    } catch (err) {
      showError('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    const result = await showConfirm('Clear all items from cart?'); if (!result.isConfirmed) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setItems([]);
      } else {
        showError(data.error || 'Failed to clear cart');
      }
    } catch (err) {
      showError('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.price + (item.price_modifier || 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  if (error === 'Please login to view your cart') {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Please login to view your shopping cart
          </p>
          <Link href="/auth/login" className="btn-primary inline-block">
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">
            Add some products to your cart to see them here
          </p>
          <Link href="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          disabled={updating}
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-4 md:p-6">
            <div className="divide-y">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
                  updating={updating}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={subtotal}
            total={subtotal}
            itemCount={items.length}
            showCheckoutButton={true}
          />
        </div>
      </div>

      {/* Continue Shopping */}
      <div className="mt-8 text-center">
        <Link href="/products" className="text-primary-600 hover:underline">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
