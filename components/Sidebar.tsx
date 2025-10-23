'use client';

import React, { useState } from 'react';
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
  MessageCircle,
  Mail,
  TruckIcon,
  MapPin,
  UserCheck,
  Navigation,
  X
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Subscriptions', href: '/subscriptions', icon: CalendarCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Email Reports', href: '/reports', icon: Mail },
  { name: 'WhatsApp Entry', href: '/whatsapp', icon: MessageSquare },
  { name: 'WhatsApp Broadcast', href: '/whatsapp-broadcast', icon: MessageCircle },
  { name: 'Menu Items', href: '/menu', icon: MenuIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const deliveryMenuItems = [
  { name: 'My Deliveries', href: '/delivery', icon: TruckIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`h-screen w-64 bg-white shadow-lg fixed left-0 top-0 overflow-y-auto z-40 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600">Tiffin Service</h1>
          <p className="text-xs sm:text-sm text-gray-500">Management System</p>
        </div>
      
      <nav className="px-4 space-y-2 pb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} className="sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">{item.name}</span>
            </Link>
          );
        })}

        {/* Delivery Section */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Delivery Management
          </p>
          <Link
            href="/delivery"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
              pathname === '/delivery'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TruckIcon size={18} className="sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">My Deliveries</span>
          </Link>
          <Link
            href="/delivery/staff"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
              pathname === '/delivery/staff'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UserCheck size={18} className="sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Delivery Staff</span>
          </Link>
        </div>
      </nav>
    </div>
    </>
  );
}

