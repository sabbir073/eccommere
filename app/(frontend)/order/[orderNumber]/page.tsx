import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';

async function getOrder(orderNumber: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/track/${orderNumber}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data.order : null;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return null;
  }
}

export const metadata: Metadata = {
  title: 'Order Details - Alabili',
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { orderNumber } = await params;
  const { success } = await searchParams;

  // Show success message
  if (success === 'true') {
    return (
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-xl text-gray-600 mb-2">Thank you for your order</p>
          <p className="text-lg font-semibold text-primary-600 mb-8">
            Order Number: {orderNumber}
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-bold mb-4">What's Next?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>You will receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>We'll notify you when your order is shipped</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>You can track your order status in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Payment will be collected upon delivery (Cash on Delivery)</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/account/orders" className="btn-primary">
              View My Orders
            </Link>
            <Link href="/products" className="btn-outline">
              Continue Shopping
            </Link>
          </div>

          {/* Order Details */}
          <div className="mt-12 pt-8 border-t text-left">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="bg-white rounded-lg p-6 border">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-semibold">{formatDate(new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">Cash on Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="mt-8 text-sm text-gray-600">
            <p>
              Need help with your order?{' '}
              <Link href="/contact" className="text-primary-600 hover:underline">
                Contact Us
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If no success parameter, try to fetch and display order details
  const order = await getOrder(orderNumber);

  if (!order) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/track-order" className="text-primary-600 hover:underline mb-4 inline-block">
            ← Track Another Order
          </Link>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-gray-600 mt-2">
            Order placed on {formatDate(new Date(order.created_at))}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Order Status</h2>
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="text-sm text-gray-600">
                  Last updated: {formatDate(new Date(order.updated_at))}
                </span>
              </div>

              {/* Status Timeline */}
              <div className="mt-6 space-y-4">
                <div className={`flex items-start gap-3 ${['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Order Placed</p>
                    <p className="text-sm text-gray-600">Your order has been received</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Order Confirmed</p>
                    <p className="text-sm text-gray-600">We've confirmed your order</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Processing</p>
                    <p className="text-sm text-gray-600">Your order is being prepared</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${['shipped', 'delivered'].includes(order.status) ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Shipped</p>
                    <p className="text-sm text-gray-600">Your order is on the way</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${order.status === 'delivered' ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Delivered</p>
                    <p className="text-sm text-gray-600">Order has been delivered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product_name}</h3>
                      {item.variant_details && (
                        <p className="text-sm text-gray-600">{item.variant_details}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-600">Total: {formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="text-gray-700">
                <p className="font-semibold">{order.shipping_name}</p>
                <p>{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                <p>
                  {order.shipping_city}
                  {order.shipping_state && `, ${order.shipping_state}`}
                  {order.shipping_postal_code && ` ${order.shipping_postal_code}`}
                </p>
                <p>{order.shipping_country}</p>
                <p className="mt-2">Phone: {order.shipping_phone}</p>
                {order.shipping_email && <p>Email: {order.shipping_email}</p>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-6 border sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold capitalize">
                    {order.payment_method.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span>{formatPrice(order.shipping_cost)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link href="/contact" className="btn-outline w-full text-center block">
                  Need Help?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
