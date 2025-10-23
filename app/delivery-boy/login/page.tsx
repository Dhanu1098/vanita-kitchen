'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Lock, Phone } from 'lucide-react';

export default function DeliveryBoyLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, this would be an API call
      // For now, we'll use localStorage for demo
      
      // Validate phone and pin
      if (phone.length < 10) {
        throw new Error('कृपया सही फ़ोन नंबर दर्ज करें\nPlease enter a valid phone number');
      }
      
      if (pin.length !== 4) {
        throw new Error('PIN 4 अंकों का होना चाहिए\nPIN must be 4 digits');
      }

      // Store delivery boy session
      localStorage.setItem('deliveryBoyPhone', phone);
      localStorage.setItem('deliveryBoyLoggedIn', 'true');
      
      // Redirect to delivery boy dashboard
      router.push('/delivery-boy/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bike size={40} className="text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🏍️ Delivery Boy Portal</h1>
          <p className="text-sm sm:text-base text-gray-600">डिलीवरी बॉय लॉगइन</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📞 Phone Number (फ़ोन नंबर)
            </label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔒 4-Digit PIN (पिन)
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg tracking-widest"
                placeholder="****"
                maxLength={4}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              पिन नहीं है? एडमिन से संपर्क करें
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? '⏳ लॉगिन हो रहा है...' : '✅ Login (लॉगिन करें)'}
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            मदद चाहिए? एडमिन से संपर्क करें<br/>
            Need help? Contact admin
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">🎯 Demo Login (टेस्टिंग के लिए):</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-700 font-mono">📞 Phone: <span className="font-bold">9876543210</span></p>
            <p className="text-sm text-gray-700 font-mono">🔒 PIN: <span className="font-bold">1234</span></p>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">(केवल टेस्टिंग के लिए)</p>
        </div>
      </div>
    </div>
  );
}

