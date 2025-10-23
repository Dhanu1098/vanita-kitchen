'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ArrowLeft, MapPin, Phone, User as UserIcon, CreditCard, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { menuItems, addOrder, fetchMenuItems } = useStore();
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [isOrderingOpen, setIsOrderingOpen] = useState(true);

  useEffect(() => {
    fetchMenuItems();
    const savedCart = localStorage.getItem('customerCart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    // Check ordering window
    const now = new Date();
    const hours = now.getHours();
    const isOpen = (hours >= 7 && hours < 9);
    setIsOrderingOpen(isOpen);
    const savedName = localStorage.getItem('customerName');
    const savedPhone = localStorage.getItem('customerPhone');
    const savedAddress = localStorage.getItem('customerAddress');
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (savedAddress) setAddress(savedAddress);
  }, []);

  const cartItems = Object.entries(cart).map(([itemId, quantity]) => {
    const item = menuItems.find(m => m.id === itemId);
    if (!item) return null;
    return { ...item, quantity, subtotal: item.price * quantity };
  }).filter(Boolean) as any[];

  const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
  const deliveryCharge = subtotal >= 200 ? 0 : 20;
  const discount = subtotal >= 300 ? Math.floor(subtotal * 0.05) : 0;
  const total = subtotal + deliveryCharge - discount;

  const handlePlaceOrder = async () => {
    // Check ordering window
    const now = new Date();
    const hours = now.getHours();
    const isOpen = (hours >= 7 && hours < 9);
    
    if (!isOpen) {
      alert('⏰ Ordering is closed!\n\nOrdering time: 7:00 AM - 9:00 AM\n\nPlease order tomorrow morning.');
      router.push('/customer');
      return;
    }

    if (!name.trim()) return alert('कृपया अपना नाम दर्ज करें\nPlease enter your name');
    if (!phone.trim() || phone.length < 10) return alert('कृपया सही फ़ोन नंबर दर्ज करें\nPlease enter valid phone number');
    if (!address.trim()) return alert('कृपया डिलीवरी एड्रेस दर्ज करें\nPlease enter delivery address');
    if (cartItems.length === 0) return alert('आपका कार्ट खाली है!\nYour cart is empty!');

    setLoading(true);
    try {
      localStorage.setItem('customerName', name);
      localStorage.setItem('customerPhone', phone);
      localStorage.setItem('customerAddress', address);

      const orderData = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerId: '',
        date: new Date(),
        mealType,
        items: cartItems.map((item: any) => ({ 
          name: item.name, 
          quantity: item.quantity, 
          price: item.price 
        })),
        totalPrice: total,
        cost: Math.floor(subtotal * 0.4),
        deliveryCharge,
        profit: total - Math.floor(subtotal * 0.4) - deliveryCharge,
        status: 'pending' as const,
        source: 'customer-app' as const,
        notes: `Payment: ${paymentMethod}. Ordered via customer app.`,
        deliveryStatus: 'not-assigned' as const
      };

      console.log('Placing order:', orderData);
      await addOrder(orderData);

      localStorage.removeItem('customerCart');
      setCart({});
      alert('🎉 ऑर्डर सफलतापूर्वक प्लेस हो गया!\n\nOrder placed successfully!\n\n🚚 Delivery: 12:00-1:00 PM\n💰 Payment: Cash on Delivery');
      router.push('/customer/orders');
    } catch (error: any) {
      console.error('Order placement error:', error);
      alert('❌ ऑर्डर प्लेस करने में समस्या!\n\nFailed to place order.\n\nError: ' + (error.message || 'Unknown error') + '\n\nPlease try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <div className="text-8xl mb-6 animate-pulse">🛒</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Cart is empty</h2>
          <p className="text-gray-600 mb-8 text-lg">Add items to your cart first</p>
          <button onClick={() => router.push('/customer')} className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all shadow-lg">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50 pb-32">
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white p-4 sm:p-6 shadow-2xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-full transition-all flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles size={20} className="hidden sm:block" />
              Checkout
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm">Complete your order</p>
          </div>
          {!isOrderingOpen && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Closed
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <UserIcon className="text-purple-500" size={24} />
            Your Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-pink-100">
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <MapPin className="text-pink-500" size={24} />
            Delivery Address
          </h2>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House No, Street, Area, City, Pincode" rows={3} className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none transition-all text-lg" />
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-xl p-6 border-2 border-orange-200">
          <h2 className="font-bold text-gray-900 text-xl mb-4">🍽️ Meal Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'lunch', emoji: '🌞', label: 'Lunch', bg: 'from-yellow-400 to-orange-400' },
              { value: 'dinner', emoji: '🌙', label: 'Dinner', bg: 'from-indigo-400 to-purple-400' }
            ].map(meal => (
              <button key={meal.value} onClick={() => setMealType(meal.value as any)} className={`p-6 rounded-2xl border-3 font-bold transition-all transform hover:scale-105 ${mealType === meal.value ? `bg-gradient-to-br ${meal.bg} text-white shadow-2xl scale-105` : 'bg-white border-2 border-gray-200 hover:border-orange-300'}`}>
                <div className="text-4xl mb-2">{meal.emoji}</div>
                {meal.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <CreditCard className="text-green-500" size={24} />
            Payment Method
          </h2>
          <div className="space-y-3">
            {[
              { value: 'cash', emoji: '💵', label: 'Cash on Delivery', desc: 'Pay when you receive', color: 'green' },
              { value: 'online', emoji: '💳', label: 'Online Payment', desc: 'Coming soon', color: 'blue' }
            ].map(payment => (
              <button key={payment.value} onClick={() => setPaymentMethod(payment.value as any)} className={`w-full p-5 rounded-2xl border-3 font-semibold text-left transition-all flex items-center justify-between ${paymentMethod === payment.value ? `border-${payment.color}-500 bg-${payment.color}-50 shadow-lg scale-105` : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{payment.emoji}</span>
                  <div>
                    <p className="font-bold text-lg">{payment.label}</p>
                    <p className="text-sm text-gray-600">{payment.desc}</p>
                  </div>
                </div>
                {paymentMethod === payment.value && <CheckCircle className={`text-${payment.color}-600`} size={28} />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl p-6 border-2 border-purple-200">
          <h2 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            <Sparkles className="text-purple-500" size={24} />
            Order Summary
          </h2>
          <div className="space-y-2 mb-4">
            {cartItems.map((item: any) => (
              <div key={item.id} className="flex justify-between text-base bg-white p-3 rounded-lg">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="font-bold">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-dashed border-purple-300 pt-4 space-y-2">
            <div className="flex justify-between text-gray-700 text-lg">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 text-lg">
                <span>Discount</span>
                <span className="font-semibold">-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-700 text-lg">
              <span>Delivery</span>
              <span className={`font-semibold ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-2xl font-bold border-t-2 border-purple-200 pt-4">
              <span>Total</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-40">
        <div className="max-w-3xl mx-auto">
          <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-5 rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-7 w-7 border-b-3 border-white"></div>
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle size={28} />
                Place Order • ₹{total}
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">🎉</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
