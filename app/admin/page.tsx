'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalUsers: 0,
    pendingReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersRes = await fetch('/api/orders?limit=10');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          const orders = ordersData.data.orders;
          setRecentOrders(orders);

          // Calculate stats from orders
          const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total), 0);
          const pendingCount = orders.filter((o: any) => o.status === 'pending').length;

          setStats((prev) => ({
            ...prev,
            totalOrders: ordersData.data.pagination.total,
            pendingOrders: pendingCount,
            totalRevenue: totalRevenue,
          }));
        }
      }

      // Fetch products count (would need a dedicated endpoint in production)
      const productsRes = await fetch('/api/products?limit=1');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        if (productsData.success) {
          setStats((prev) => ({
            ...prev,
            totalProducts: productsData.data.pagination.total,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingOrders} pending
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Products</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
              {stats.lowStockProducts > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  {stats.lowStockProducts} low stock
                </p>
              )}
            </div>
            <div className="text-4xl">🛍️</div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending Reviews</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingReviews}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-primary-600 hover:underline text-sm">
              View All →
            </Link>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">{order.shipping_name}</p>
                        <p className="text-gray-500 text-xs">{order.shipping_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View
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
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/admin/products/new"
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition border"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">➕</div>
            <div>
              <h3 className="font-bold mb-1">Add New Product</h3>
              <p className="text-sm text-gray-600">Create a new product listing</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/orders?status=pending"
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition border"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">⏳</div>
            <div>
              <h3 className="font-bold mb-1">Pending Orders</h3>
              <p className="text-sm text-gray-600">
                {stats.pendingOrders} orders awaiting confirmation
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/reviews?status=pending"
          className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition border"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">⭐</div>
            <div>
              <h3 className="font-bold mb-1">Review Moderation</h3>
              <p className="text-sm text-gray-600">
                {stats.pendingReviews} reviews to moderate
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
