'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartSummary from '@/components/cart/CartSummary';
import Loading from '@/components/ui/Loading';
import { calculateShippingCost } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

interface CartItem {
  product_id: number;
  product_name: string;
  product_sku?: string;
  variant_id?: number;
  variant_details?: string;
  quantity: number;
  price: number;
  price_modifier?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_email: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'Bangladesh',
    billing_same_as_shipping: true,
    billing_name: '',
    billing_phone: '',
    billing_email: '',
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: 'Bangladesh',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user info
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.data);
          // Pre-fill form with user data
          setFormData((prev) => ({
            ...prev,
            shipping_name: `${userData.data.first_name} ${userData.data.last_name}`,
            shipping_email: userData.data.email,
            shipping_phone: userData.data.phone || '',
          }));
        }
      }

      // Fetch cart
      const cartRes = await fetch('/api/cart');
      const cartData = await cartRes.json();

      if (cartData.success && cartData.data.items.length > 0) {
        setCartItems(cartData.data.items);
      } else {
        router.push('/cart');
      }
    } catch (err) {
      setError('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        ...formData,
        // Clean up billing email if empty
        billing_email: formData.billing_email || '',
        cartItems: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          variant_id: item.variant_id,
          variant_details: item.variant_details,
          quantity: item.quantity,
          price: item.price + (item.price_modifier || 0),
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // Show success toast
        showToast('Order placed successfully!', 'success');
        // Redirect to order confirmation
        router.push(`/order/${data.data.orderNumber}?success=true`);
      } else {
        // Show error toast
        showToast(data.error || 'Failed to place order', 'error');
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      // Show error toast
      showToast('An error occurred. Please try again.', 'error');
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.price + (item.price_modifier || 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const shipping = formData.shipping_city
    ? calculateShippingCost(formData.shipping_city)
    : 0;

  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Notice */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm">
                  Have an account?{' '}
                  <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
                    Login
                  </Link>{' '}
                  for faster checkout
                </p>
              </div>
            )}

            {/* Shipping Information */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="shipping_name"
                    required
                    className="input-field"
                    value={formData.shipping_name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="shipping_phone"
                    required
                    className="input-field"
                    value={formData.shipping_phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="shipping_email"
                    required
                    className="input-field"
                    value={formData.shipping_email}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="shipping_address_line1"
                    required
                    className="input-field"
                    placeholder="Street address, house number"
                    value={formData.shipping_address_line1}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="shipping_address_line2"
                    className="input-field"
                    placeholder="Apartment, suite, unit (optional)"
                    value={formData.shipping_address_line2}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="shipping_city"
                    required
                    className="input-field"
                    placeholder="Enter your city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="shipping_postal_code"
                    className="input-field"
                    value={formData.shipping_postal_code}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="shipping_country"
                    required
                    className="input-field"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="billing_same"
                  name="billing_same_as_shipping"
                  checked={formData.billing_same_as_shipping}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="billing_same" className="text-sm font-medium">
                  Billing address same as shipping
                </label>
              </div>

              {!formData.billing_same_as_shipping && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="billing_name"
                      required={!formData.billing_same_as_shipping}
                      className="input-field"
                      value={formData.billing_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="billing_phone"
                      required={!formData.billing_same_as_shipping}
                      className="input-field"
                      value={formData.billing_phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="billing_email"
                      className="input-field"
                      value={formData.billing_email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="billing_address_line1"
                      required={!formData.billing_same_as_shipping}
                      className="input-field"
                      placeholder="Street address, house number"
                      value={formData.billing_address_line1}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="billing_address_line2"
                      className="input-field"
                      placeholder="Apartment, suite, unit (optional)"
                      value={formData.billing_address_line2}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="billing_city"
                      required={!formData.billing_same_as_shipping}
                      className="input-field"
                      placeholder="Enter your city"
                      value={formData.billing_city}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="billing_postal_code"
                      className="input-field"
                      value={formData.billing_postal_code}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="billing_country"
                      required={!formData.billing_same_as_shipping}
                      className="input-field"
                      value={formData.billing_country}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Order Notes (Optional)</h2>
              <textarea
                name="notes"
                rows={4}
                className="input-field"
                placeholder="Any special instructions for delivery..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 p-4 border-2 border-primary-600 rounded-lg bg-primary-50">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked
                  readOnly
                />
                <label htmlFor="cod" className="font-medium">
                  Cash on Delivery
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Pay with cash when your order is delivered
              </p>
            </div>
          </div>

          {/* Order Summary - Sticky with Button */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              itemCount={cartItems.length}
              showCheckoutButton={false}
              customButton={
                <>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full"
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>

                  <p className="text-xs text-gray-600 text-center mt-4">
                    By placing this order, you agree to our{' '}
                    <Link href="/terms" className="text-primary-600 hover:underline">
                      Terms & Conditions
                    </Link>
                  </p>
                </>
              }
            />
          </div>
        </div>
      </form>
    </div>
  );
}
