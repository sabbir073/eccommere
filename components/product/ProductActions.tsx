'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

interface Variant {
  id: number;
  name: string;
  price_modifier: number;
  stock_quantity: number;
  sku?: string;
}

interface ProductActionsProps {
  product: {
    id: number;
    price: number;
    stock_quantity: number;
    variants?: Variant[];
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | undefined>(undefined);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleVariantSelect = (variantId: number) => {
    setSelectedVariant(variantId);
  };

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0) {
      showToast('This product is out of stock', 'error');
      return;
    }

    setIsAddingToCart(true);
    const success = await addToCart(product.id, quantity, selectedVariant);
    setIsAddingToCart(false);

    if (success) {
      showToast('Product added to cart!', 'success');
      setQuantity(1);
    } else {
      showToast('Failed to add product to cart', 'error');
    }
  };

  // Calculate total price with variant modifier
  let totalPrice = product.price;
  if (selectedVariant) {
    const variant = product.variants?.find(v => v.id === selectedVariant);
    if (variant) {
      totalPrice += variant.price_modifier;
    }
  }

  return (
    <div className="space-y-4 border-t pt-5 mt-5">
      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2">Select Variant:</label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant: Variant) => (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(variant.id)}
                className={`px-3 py-2 text-sm border-2 rounded transition ${
                  selectedVariant === variant.id
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-300 hover:border-primary-600'
                }`}
              >
                {variant.name}
                {variant.price_modifier !== 0 && (
                  <span className="text-xs ml-1">
                    ({variant.price_modifier > 0 ? '+' : ''}
                    {formatPrice(variant.price_modifier)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-semibold mb-2">Quantity:</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 border-2 border-gray-300 rounded hover:border-primary-600 transition flex items-center justify-center font-semibold"
            disabled={quantity <= 1}
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={product.stock_quantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
            className="input-field w-20 text-center"
          />
          <button
            onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
            className="w-10 h-10 border-2 border-gray-300 rounded hover:border-primary-600 transition flex items-center justify-center font-semibold"
            disabled={quantity >= product.stock_quantity}
          >
            +
          </button>
        </div>
      </div>

      {/* Price with variants */}
      {totalPrice !== product.price && (
        <div className="p-3 bg-primary-50 border border-primary-200 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Total Price:</span>
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          className="btn-primary flex-1 py-3"
          disabled={product.stock_quantity === 0 || isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : product.stock_quantity > 0 ? (
            <>🛒 Add to Cart</>
          ) : (
            'Out of Stock'
          )}
        </button>
        <button className="btn-outline px-6 py-3">
          ♡
        </button>
      </div>

      {/* Shipping Info */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Delivery Information
        </h4>
        <ul className="space-y-1 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Inside Dhaka: ৳80 | Outside Dhaka: ৳150</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Cash on Delivery available</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Estimated delivery: 3-7 business days</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
