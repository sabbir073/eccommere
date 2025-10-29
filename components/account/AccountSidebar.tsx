'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface AccountSidebarProps {
  user: any;
}

export default function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const menuItems = [
    { href: '/account', label: 'Dashboard', icon: '📊' },
    { href: '/account/orders', label: 'My Orders', icon: '📦' },
    { href: '/account/wishlist', label: 'Wishlist', icon: '❤️' },
    { href: '/account/addresses', label: 'Addresses', icon: '📍' },
    { href: '/account/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="bg-white rounded-lg p-6 sticky top-24">
      {/* User Info */}
      <div className="mb-6 pb-6 border-b">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl text-primary-600">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </span>
        </div>
        <p className="text-center font-semibold">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-center text-sm text-gray-600">
          {user?.email}
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === item.href
                ? 'bg-primary-50 text-primary-600 font-semibold'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
