'use client';

import { useState, useEffect } from 'react';
import { User, Phone, MapPin, ShoppingBag, Star, LogOut, Sparkles, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('customerName');
    const savedPhone = localStorage.getItem('customerPhone');
    const savedAddress = localStorage.getItem('customerAddress');
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (savedAddress) setAddress(savedAddress);
  }, []);

  const handleSave = () => {
    localStorage.setItem('customerName', name);
    localStorage.setItem('customerPhone', phone);
    localStorage.setItem('customerAddress', address);
    alert('✅ Profile updated successfully!');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('customerName');
      localStorage.removeItem('customerPhone');
      localStorage.removeItem('customerAddress');
      localStorage.removeItem('customerCart');
      router.push('/customer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 pb-20">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 shadow-2xl">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 bg-gradient-to-br from-white to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white">
              <User size={56} className="text-purple-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-2">
              <Star size={24} className="text-white" fill="white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{name || 'Guest User'}</h1>
          <p className="text-purple-100 text-lg flex items-center justify-center gap-2">
            <Phone size={18} />
            {phone || 'Add your phone number'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-purple-100">
          <h2 className="font-bold text-gray-900 text-2xl mb-6 flex items-center gap-3">
            <Sparkles className="text-purple-500" size={28} />
            Edit Profile
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="w-full pl-16 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-5 text-gray-400" size={22} />
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House No, Street, Area, City, Pincode" rows={3} className="w-full pl-16 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-lg" />
              </div>
            </div>
            <button onClick={handleSave} className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl">
              💾 Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-100">
          <button onClick={() => router.push('/customer/orders')} className="w-full p-6 flex items-center gap-5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all border-b-2 border-gray-100 group">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl group-hover:scale-110 transition-transform">
              <ShoppingBag className="text-purple-600" size={28} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900 text-lg">My Orders</p>
              <p className="text-sm text-gray-600">View your order history & track orders</p>
            </div>
            <span className="text-2xl">→</span>
          </button>
          <button onClick={() => router.push('/customer')} className="w-full p-6 flex items-center gap-5 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all border-b-2 border-gray-100 group">
            <div className="p-4 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl group-hover:scale-110 transition-transform">
              <Heart className="text-orange-600" size={28} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900 text-lg">Browse Menu</p>
              <p className="text-sm text-gray-600">Explore our delicious offerings</p>
            </div>
            <span className="text-2xl">→</span>
          </button>
          <button onClick={handleLogout} className="w-full p-6 flex items-center gap-5 hover:bg-red-50 transition-all text-red-600 group">
            <div className="p-4 bg-red-100 rounded-2xl group-hover:scale-110 transition-transform">
              <LogOut size={28} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-lg">Logout</p>
              <p className="text-sm text-red-500">Sign out of your account</p>
            </div>
            <span className="text-2xl">→</span>
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-3xl shadow-2xl p-8 text-center border-2 border-purple-200">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="font-bold text-gray-900 mb-2 text-xl">Fresh, Homemade Food</h3>
          <p className="text-gray-700 mb-4">Delivered with love ❤️</p>
          <p className="text-xs text-gray-500 bg-white px-4 py-2 rounded-full inline-block">Version 1.0.0 • Made with 💜</p>
        </div>
      </div>
    </div>
  );
}
