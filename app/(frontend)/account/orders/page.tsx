'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import Pagination from '@/components/ui/Pagination';
import { formatPrice, formatDate } from '@/lib/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?page=${page}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet
          </p>
          <Link href="/products" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-6 border hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-bold text-lg">{order.order_number}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold">{formatDate(order.created_at)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-primary-600 text-lg">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="btn-primary flex-1 text-center"
                  >
                    View Details
                  </Link>

                  {order.status === 'delivered' && (
                    <button className="btn-outline flex-1">
                      Leave Review
                    </button>
                  )}

                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button className="text-red-600 hover:text-red-700 font-medium">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                baseUrl="/account/orders"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
