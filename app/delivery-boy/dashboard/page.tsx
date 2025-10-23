'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle, 
  XCircle,
  Clock,
  IndianRupee,
  LogOut,
  User,
  TrendingUp,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Order } from '@/types';
import { format } from 'date-fns';

export default function DeliveryBoyDashboard() {
  const router = useRouter();
  const { orders, updateOrder, fetchOrders } = useStore();
  
  const [deliveryBoyPhone, setDeliveryBoyPhone] = useState('');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [cashInHand, setCashInHand] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);

  useEffect(() => {
    // Check if logged in
    const loggedIn = localStorage.getItem('deliveryBoyLoggedIn');
    const phone = localStorage.getItem('deliveryBoyPhone');
    
    if (!loggedIn || !phone) {
      router.push('/delivery-boy/login');
      return;
    }
    
    setDeliveryBoyPhone(phone);
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders assigned to this delivery boy
    // For demo: using phone 9876543210
    const filtered = orders.filter(order => {
      // In real app: match by delivery_boy_id
      // For now, show pending deliveries
      return order.deliveryStatus === 'assigned' || 
             order.deliveryStatus === 'out-for-delivery' ||
             order.deliveryStatus === 'picked-up';
    });
    
    setMyOrders(filtered);
    
    // Calculate cash in hand (delivered orders not settled)
    const deliveredOrders = orders.filter(o => 
      o.deliveryStatus === 'delivered' && 
      o.paymentMethod === 'cash'
    );
    const totalCash = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    setCashInHand(totalCash);
    
    // Calculate today's earnings (incentive per delivery)
    const todayDelivered = deliveredOrders.filter(o => {
      const orderDate = new Date(o.deliveredAt || o.date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return orderDate === today;
    });
    setTodayEarnings(todayDelivered.length * 10); // ₹10 per delivery
  }, [orders]);

  const handleLogout = () => {
    localStorage.removeItem('deliveryBoyLoggedIn');
    localStorage.removeItem('deliveryBoyPhone');
    router.push('/delivery-boy/login');
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['deliveryStatus']) => {
    try {
      const updates: Partial<Order> = {
        deliveryStatus: newStatus
      };
      
      if (newStatus === 'picked-up') {
        updates.pickedUpAt = new Date();
      } else if (newStatus === 'out-for-delivery') {
        updates.assignedAt = new Date();
      } else if (newStatus === 'delivered') {
        updates.deliveredAt = new Date();
        updates.status = 'delivered';
      }
      
      await updateOrder(orderId, updates);
      alert('✅ Status updated successfully!');
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const openNavigation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'assigned': 'bg-blue-100 text-blue-800',
      'picked-up': 'bg-purple-100 text-purple-800',
      'out-for-delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.assigned;
  };

  const stats = {
    pending: myOrders.filter(o => o.deliveryStatus === 'assigned').length,
    inProgress: myOrders.filter(o => o.deliveryStatus === 'out-for-delivery' || o.deliveryStatus === 'picked-up').length,
    completed: orders.filter(o => {
      const today = new Date().toISOString().split('T')[0];
      const orderDate = new Date(o.deliveredAt || o.date).toISOString().split('T')[0];
      return o.deliveryStatus === 'delivered' && orderDate === today;
    }).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white p-2 rounded-full flex-shrink-0">
                <User size={20} className="sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold">🏍️ My Deliveries</h1>
                <p className="text-blue-100 text-xs sm:text-sm truncate">📞 {deliveryBoyPhone}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full sm:w-auto"
            >
              <LogOut size={16} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Logout</span>
            </button>
          </div>

          {/* Slot Selection */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {(['morning', 'afternoon', 'evening'] as const).map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                  selectedSlot === slot
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                {slot === 'morning' ? '🌞' : slot === 'afternoon' ? '☀️' : '🌙'} {slot.charAt(0).toUpperCase() + slot.slice(1)}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <p className="text-blue-100 text-xs sm:text-sm mb-1">Pending</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <p className="text-blue-100 text-xs sm:text-sm mb-1">In Progress</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.inProgress}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <p className="text-blue-100 text-xs sm:text-sm mb-1">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.completed}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
              <p className="text-blue-100 text-xs sm:text-sm mb-1">💰 Cash</p>
              <p className="text-xl sm:text-2xl font-bold">₹{cashInHand}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {myOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <AlertCircle size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Orders Assigned</h2>
            <p className="text-sm sm:text-base text-gray-600">Check back later for new deliveries!</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {myOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 truncate">{order.customerName}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.deliveryStatus)}`}>
                        {order.deliveryStatus.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">₹{order.totalPrice}</p>
                      <p className={`text-sm font-semibold ${order.paymentMethod === 'cash' ? 'text-green-600' : 'text-blue-600'}`}>
                        {order.paymentMethod === 'cash' ? '💵 Cash' : '💳 Paid'}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${order.customerPhone}`} className="text-blue-600 font-semibold hover:underline">
                          {order.customerPhone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Delivery Address</p>
                        <p className="text-gray-900">{order.customerAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Order Items</p>
                        <p className="text-gray-900">{order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Meal Type</p>
                        <p className="text-gray-900 capitalize">{order.mealType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => openNavigation(order.customerAddress || '')}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 sm:py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all text-sm sm:text-base shadow-lg"
                    >
                      <Navigation size={18} />
                      🗺️ Navigate
                    </button>

                    {order.deliveryStatus === 'assigned' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'picked-up')}
                        className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 sm:py-4 rounded-xl font-bold hover:bg-purple-700 active:scale-95 transition-all text-sm sm:text-base shadow-lg"
                      >
                        <Package size={18} />
                        📦 Picked Up
                      </button>
                    )}

                    {order.deliveryStatus === 'picked-up' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'out-for-delivery')}
                        className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-3 sm:py-4 rounded-xl font-bold hover:bg-orange-700 active:scale-95 transition-all text-sm sm:text-base shadow-lg"
                      >
                        <Navigation size={18} />
                        🚚 Out for Delivery
                      </button>
                    )}

                    {order.deliveryStatus === 'out-for-delivery' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 sm:py-4 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all text-sm sm:text-base shadow-lg"
                        >
                          <CheckCircle size={18} />
                          ✅ Delivered
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'failed')}
                          className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 sm:py-4 rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all text-sm sm:text-base shadow-lg"
                        >
                          <XCircle size={18} />
                          ❌ Failed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

