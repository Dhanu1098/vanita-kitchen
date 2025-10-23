'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { menuItems, fetchMenuItems } = useStore();
  const [cart, setCart] = useState<{[key: string]: number}>({});

  useEffect(() => {
    fetchMenuItems();
    const savedCart = localStorage.getItem('customerCart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const updateCart = (newCart: {[key: string]: number}) => {
    setCart(newCart);
    localStorage.setItem('customerCart', JSON.stringify(newCart));
  };

  const increaseQuantity = (itemId: string) => updateCart({ ...cart, [itemId]: (cart[itemId] || 0) + 1 });
  const decreaseQuantity = (itemId: string) => {
    const currentQty = cart[itemId] || 0;
    if (currentQty <= 1) removeItem(itemId);
    else updateCart({ ...cart, [itemId]: currentQty - 1 });
  };
  const removeItem = (itemId: string) => {
    const newCart = { ...cart };
    delete newCart[itemId];
    updateCart(newCart);
  };

  const cartItems = Object.entries(cart)
    .map(([itemId, quantity]) => {
      const item = menuItems.find(m => m.id === itemId);
      if (!item) return null;
      return { ...item, quantity, subtotal: item.price * quantity };
    })
    .filter(Boolean) as any[];

  const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  const deliveryCharge = subtotal > 0 ? (subtotal >= 200 ? 0 : 20) : 0;
  const discount = subtotal >= 300 ? Math.floor(subtotal * 0.05) : 0;
  const total = subtotal + deliveryCharge - discount;

  const getCategoryEmoji = (category: string) => ({
    'veg': '🥗', 'non-veg': '🍗', 'special': '⭐'
  }[category] || '🍽️');

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-red-50 pb-32">
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-4 sm:p-6 shadow-2xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-full transition-all flex-shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                🛒 Cart
                {cartItems.length > 0 && (
                  <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">{cartItems.length}</span>
                )}
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm">Review your order</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
            <div className="text-8xl mb-6 animate-bounce">🛒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Add some delicious items to get started!</p>
            <Link href="/customer" className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all shadow-lg">
              🍽️ Browse Menu
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cartItems.map((item: any) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-red-200">
                  <div className="flex items-start gap-3 p-3 sm:p-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-3xl sm:text-4xl">{getCategoryEmoji(item.category)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-bold text-gray-900 text-base sm:text-xl truncate">{item.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 capitalize flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${item.category === 'veg' ? 'bg-green-500' : item.category === 'non-veg' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                            {item.category}
                          </p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all flex-shrink-0" title="Remove">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full p-1 shadow-inner">
                          <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-md">
                            <Minus size={16} />
                          </button>
                          <span className="font-bold text-gray-900 w-8 sm:w-10 text-center text-base sm:text-lg">{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.id)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-green-500 hover:text-white flex items-center justify-center transition-all shadow-md">
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400 line-through hidden sm:block">₹{item.price * item.quantity + 10}</p>
                          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">₹{item.subtotal}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-2xl p-6 mb-6 border-2 border-orange-200">
              <h3 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                <Sparkles className="text-orange-500" size={24} />
                Bill Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 text-lg bg-green-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1">🎉 Discount (5%)</span>
                    <span className="font-semibold">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Delivery Charges</span>
                  <span className={`font-semibold ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>
                    {deliveryCharge === 0 ? '🎁 FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                {subtotal > 0 && subtotal < 200 && (
                  <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    💡 Add ₹{200 - subtotal} more for FREE delivery!
                  </div>
                )}
                {subtotal >= 200 && subtotal < 300 && (
                  <div className="text-sm text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
                    ⭐ Add ₹{300 - subtotal} more to get 5% discount!
                  </div>
                )}
                <div className="border-t-2 border-dashed border-orange-300 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">₹{total}</span>
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">You saved ₹{discount + (deliveryCharge === 0 && subtotal >= 200 ? 20 : 0)}!</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-white via-white to-transparent z-40">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => router.push('/customer/checkout')} className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-2 sm:gap-3">
              <ShoppingBag size={24} className="sm:w-7 sm:h-7" />
              <span className="flex-1 text-center">Checkout • ₹{total}</span>
              <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
