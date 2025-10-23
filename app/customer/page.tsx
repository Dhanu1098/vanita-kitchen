'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerHomePage() {
  const router = useRouter();
  const { menuItems, fetchMenuItems, settings, fetchSettings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'veg' | 'non-veg' | 'special'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [isOrderingOpen, setIsOrderingOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    fetchMenuItems();
    fetchSettings();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('customerCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Check ordering window (7 AM - 9 AM)
    const checkOrderingWindow = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setCurrentTime(currentTimeStr);
      
      // Ordering open between 7 AM (7:00) and 9 AM (9:00)
      const isOpen = (hours >= 7 && hours < 9);
      setIsOrderingOpen(isOpen);
    };

    checkOrderingWindow();
    const interval = setInterval(checkOrderingWindow, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (itemId: string) => {
    if (!isOrderingOpen) {
      alert('⏰ Ordering is closed!\n\nOrdering time: 7:00 AM - 9:00 AM\n\nPlease order tomorrow morning.');
      return;
    }

    const newCart = { ...cart, [itemId]: (cart[itemId] || 0) + 1 };
    setCart(newCart);
    localStorage.setItem('customerCart', JSON.stringify(newCart));
    
    // Show feedback
    const button = document.getElementById(`add-${itemId}`);
    if (button) {
      button.textContent = '✓ Added';
      setTimeout(() => {
        button.textContent = '+ Add';
      }, 1000);
    }
  };

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const getCategoryEmoji = (category: string) => {
    const emojis: {[key: string]: string} = {
      'veg': '🥗',
      'non-veg': '🍗',
      'special': '⭐'
    };
    return emojis[category] || '🍽️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 sm:p-6 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-3xl font-bold">🍽️ {settings?.businessName || 'Tiffin Service'}</h1>
              <p className="text-red-100 text-xs sm:text-sm mt-1">Fresh, Homemade Food • Daily Tiffin</p>
            </div>
            <button
              onClick={() => router.push('/customer/cart')}
              className="relative bg-white text-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Ordering Status Banner */}
          {isOrderingOpen ? (
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-between mb-3">
              <span>✅ Ordering Open</span>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">🕐 {currentTime} • Closes at 9:00 AM</span>
            </div>
          ) : (
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-3 text-center">
              ⏰ Ordering Closed • Opens Tomorrow at 7:00 AM
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'veg', 'non-veg', 'special'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              {category === 'all' ? '🍽️ All' : 
               category === 'veg' ? '🥗 Veg' :
               category === 'non-veg' ? '🍗 Non-Veg' :
               '⭐ Special'}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No items found</h2>
            <p className="text-gray-600">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
                  <span className="text-6xl">{getCategoryEmoji(item.category)}</span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      {item.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.category === 'veg' ? 'bg-green-100 text-green-800' :
                      item.category === 'non-veg' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{item.price}</p>
                      {cart[item.id] > 0 && (
                        <p className="text-sm text-green-600 font-semibold">
                          {cart[item.id]} in cart
                        </p>
                      )}
                    </div>
                    <button
                      id={`add-${item.id}`}
                      onClick={() => addToCart(item.id)}
                      disabled={!isOrderingOpen}
                      className={`px-4 sm:px-6 py-2 rounded-full font-semibold active:scale-95 transition-all flex items-center gap-2 shadow-md ${
                        isOrderingOpen 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={18} />
                      {isOrderingOpen ? 'Add' : 'Closed'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button (Mobile) */}
      {cartItemCount > 0 && (
        <button
          onClick={() => router.push('/customer/cart')}
          className="fixed bottom-24 right-6 bg-green-500 text-white px-6 py-4 rounded-full font-bold shadow-2xl hover:scale-110 transition-transform z-50 flex items-center gap-2"
        >
          <ShoppingCart size={20} />
          View Cart ({cartItemCount})
        </button>
      )}
    </div>
  );
}

