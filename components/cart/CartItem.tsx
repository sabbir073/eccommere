'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: {
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
  };
  onUpdate: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  updating?: boolean;
}

export default function CartItem({ item, onUpdate, onRemove, updating = false }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const itemPrice = item.price + (item.price_modifier || 0);
  const total = itemPrice * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.stock_quantity) return;
    setQuantity(newQuantity);
    onUpdate(item.id, newQuantity);
  };

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Product Image */}
      <Link href={`/products/${item.product_slug}`} className="flex-shrink-0">
        <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
          {item.product_image ? (
            <Image
              src={item.product_image}
              alt={item.product_name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product_slug}`}
          className="font-semibold hover:text-primary-600 line-clamp-2"
        >
          {item.product_name}
        </Link>

        {item.variant_name && item.variant_value && (
          <p className="text-sm text-gray-600 mt-1">
            {item.variant_name}: {item.variant_value}
          </p>
        )}

        <p className="text-lg font-bold text-primary-600 mt-2">
          {formatPrice(itemPrice)}
        </p>

        {/* Stock Warning */}
        {item.stock_quantity < 5 && item.stock_quantity > 0 && (
          <p className="text-xs text-orange-600 mt-1">
            Only {item.stock_quantity} left in stock
          </p>
        )}

        {item.stock_quantity === 0 && (
          <p className="text-xs text-red-600 mt-1">
            Out of stock
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || updating}
            className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={item.stock_quantity}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            disabled={updating}
            className="w-16 text-center border rounded px-2 py-1"
          />
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= item.stock_quantity || updating}
            className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {/* Total Price */}
        <p className="text-lg font-bold">
          {formatPrice(total)}
        </p>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={updating}
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
