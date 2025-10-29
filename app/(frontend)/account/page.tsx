'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';

export default function AccountDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    wishlistItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersRes = await fetch('/api/orders?limit=5');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          const orders = ordersData.data.orders;
          setRecentOrders(orders);
          setStats((prev) => ({
            ...prev,
            totalOrders: ordersData.data.pagination.total,
            pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
          }));
        }
      }

      // Fetch wishlist
      const wishlistRes = await fetch('/api/wishlist');
      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        if (wishlistData.success) {
          setStats((prev) => ({
            ...prev,
            wishlistItems: wishlistData.data.count,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border-l-4 border-primary-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 mb-1">Pending Orders</p>
              <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 mb-1">Wishlist Items</p>
              <p className="text-3xl font-bold">{stats.wishlistItems}</p>
            </div>
            <div className="text-4xl">❤️</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link href="/account/orders" className="text-primary-600 hover:underline text-sm">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No orders yet</p>
            <Link href="/products" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Order #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-sm font-medium">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      ৳{order.total}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Link
          href="/account/wishlist"
          className="bg-white rounded-lg p-6 hover:shadow-lg transition border"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">❤️</div>
            <div>
              <h3 className="font-bold mb-1">My Wishlist</h3>
              <p className="text-sm text-gray-600">
                {stats.wishlistItems} items saved
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-white rounded-lg p-6 hover:shadow-lg transition border"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">📍</div>
            <div>
              <h3 className="font-bold mb-1">My Addresses</h3>
              <p className="text-sm text-gray-600">
                Manage delivery addresses
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
