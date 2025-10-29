import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  itemCount: number;
  showCheckoutButton?: boolean;
  customButton?: React.ReactNode;
}

export default function CartSummary({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total,
  itemCount,
  showCheckoutButton = true,
  customButton,
}: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>

        {shipping > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold">{formatPrice(shipping)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-semibold">{formatPrice(tax)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-semibold">-{formatPrice(discount)}</span>
          </div>
        )}

        {shipping === 0 && itemCount > 0 && (
          <div className="text-sm text-gray-600 bg-white p-3 rounded">
            💡 Shipping will be calculated at checkout
            <div className="mt-1 text-xs">
              Inside Dhaka: ৳80 | Outside Dhaka: ৳150
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {showCheckoutButton && (
        <>
          <Link
            href="/checkout"
            className="btn-primary w-full block text-center mb-3"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/products"
            className="btn-outline w-full block text-center"
          >
            Continue Shopping
          </Link>
        </>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>✓</span>
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <span>✓</span>
          <span>Cash on Delivery Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span>✓</span>
          <span>Easy Returns & Refunds</span>
        </div>
      </div>

      {/* Custom Button Slot (e.g., Place Order button) */}
      {customButton && (
        <div className="mt-4">
          {customButton}
        </div>
      )}
    </div>
  );
}
