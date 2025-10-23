'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Home, Package, User } from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1 p-2">
          <Link
            href="/customer"
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
              isActive('/customer')
                ? 'bg-red-50 text-red-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>

          <Link
            href="/customer/cart"
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors relative ${
              isActive('/customer/cart')
                ? 'bg-red-50 text-red-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart size={24} />
            <span className="text-xs mt-1 font-medium">Cart</span>
          </Link>

          <Link
            href="/customer/orders"
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
              isActive('/customer/orders')
                ? 'bg-red-50 text-red-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package size={24} />
            <span className="text-xs mt-1 font-medium">Orders</span>
          </Link>

          <Link
            href="/customer/profile"
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
              isActive('/customer/profile')
                ? 'bg-red-50 text-red-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User size={24} />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
