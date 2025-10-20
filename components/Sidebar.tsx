'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  CalendarCheck, 
  BarChart3, 
  Menu as MenuIcon,
  Settings,
  MessageSquare,
  Mail,
  TruckIcon,
  MapPin,
  UserCheck
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Subscriptions', href: '/subscriptions', icon: CalendarCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Email Reports', href: '/reports', icon: Mail },
  { name: 'WhatsApp Entry', href: '/whatsapp', icon: MessageSquare },
  { name: 'Menu Items', href: '/menu', icon: MenuIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const deliveryMenuItems = [
  { name: 'My Deliveries', href: '/delivery', icon: TruckIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">Tiffin Service</h1>
        <p className="text-sm text-gray-500">Management System</p>
      </div>
      
      <nav className="px-4 space-y-2 pb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* Delivery Section */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <Link
            href="/delivery"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              pathname === '/delivery'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TruckIcon size={20} />
            <span className="font-medium">My Deliveries</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

