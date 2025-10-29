'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

export default function TrackOrderPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      showToast('Please enter an order number', 'error');
      return;
    }

    setLoading(true);

    try {
      // Fetch order details
      const response = await fetch(`/api/orders/track/${orderNumber}`);
      const data = await response.json();

      if (data.success) {
        // Redirect to order details page
        router.push(`/order/${orderNumber}`);
      } else {
        showToast(data.error || 'Order not found', 'error');
      }
    } catch (error) {
      showToast('Failed to track order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order number to check the status of your order
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
                Order Number *
              </label>
              <input
                type="text"
                id="orderNumber"
                placeholder="e.g., ORD-1234567890"
                className="input-field text-lg"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Your order number can be found in your confirmation email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tracking...
                </>
              ) : (
                'Track Order'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>Your order number starts with "ORD-" (e.g., ORD-1761630055744-349)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>Check your email for the order confirmation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>If you have an account, you can view all orders in your dashboard</span>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <a href="/account/orders" className="text-primary-600 hover:underline text-sm">
                View My Orders →
              </a>
              <a href="/contact" className="text-primary-600 hover:underline text-sm">
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
