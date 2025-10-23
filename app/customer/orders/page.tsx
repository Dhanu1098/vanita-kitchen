'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Package, Clock, CheckCircle, XCircle, Phone, MapPin, Bike, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const { orders, fetchOrders } = useStore();
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
    const savedPhone = localStorage.getItem('customerPhone');
    if (savedPhone) setCustomerPhone(savedPhone);
  }, []);

  useEffect(() => {
    if (customerPhone) {
      const filtered = orders.filter(order => 
        order.customerPhone === customerPhone ||
        order.customerPhone?.replace(/\D/g, '') === customerPhone.replace(/\D/g, '')
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCustomerOrders(filtered);
    }
  }, [orders, customerPhone]);

  const getStatusColor = (status: string) => ({
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'confirmed': 'bg-blue-100 text-blue-800 border-blue-300',
    'delivered': 'bg-green-100 text-green-800 border-green-300',
    'cancelled': 'bg-red-100 text-red-800 border-red-300'
  }[status] || 'bg-gray-100 text-gray-800');

  const getDeliveryStatusColor = (status: string) => ({
    'not-assigned': 'bg-gray-100 text-gray-800 border-gray-300',
    'assigned': 'bg-blue-100 text-blue-800 border-blue-300',
    'picked-up': 'bg-purple-100 text-purple-800 border-purple-300',
    'out-for-delivery': 'bg-orange-100 text-orange-800 border-orange-300',
    'delivered': 'bg-green-100 text-green-800 border-green-300',
    'failed': 'bg-red-100 text-red-800 border-red-300'
  }[status] || 'bg-gray-100 text-gray-800');

  const getStatusIcon = (deliveryStatus: string) => {
    switch (deliveryStatus) {
      case 'delivered': return <CheckCircle className="text-green-600" size={48} />;
      case 'out-for-delivery': return <Bike className="text-orange-600" size={48} />;
      case 'failed': return <XCircle className="text-red-600" size={48} />;
      default: return <Package className="text-blue-600" size={48} />;
    }
  };

  const getStatusSteps = (order: any) => [
    { label: 'Order Placed', completed: true },
    { label: 'Confirmed', completed: order.status !== 'pending' },
    { label: 'Preparing', completed: order.deliveryStatus !== 'not-assigned' && order.deliveryStatus !== 'assigned' },
    { label: 'Out for Delivery', completed: order.deliveryStatus === 'out-for-delivery' || order.deliveryStatus === 'delivered' },
    { label: 'Delivered', completed: order.deliveryStatus === 'delivered' }
  ];

  if (!customerPhone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <div className="text-8xl mb-6 animate-bounce">📦</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No orders yet</h2>
          <p className="text-gray-600 mb-8 text-lg">Place your first order to see it here</p>
          <Link href="/customer" className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all shadow-lg">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 shadow-2xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Package size={28} />
            My Orders
          </h1>
          <p className="text-blue-100 text-sm flex items-center gap-2">
            <TrendingUp size={16} />
            {customerOrders.length} orders placed
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {customerOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl">
            <div className="text-8xl mb-6 animate-pulse">📦</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No orders yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Your order history will appear here</p>
            <Link href="/customer" className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition-all shadow-lg">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {customerOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100 hover:shadow-3xl transition-all">
                <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 p-5 border-b-2 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Order ID</p>
                      <p className="font-mono text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-full inline-block mt-1">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-medium">Total</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ₹{order.totalPrice}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 px-3 py-2 rounded-full inline-flex">
                    <Clock size={14} />
                    {new Date(order.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                        {getStatusIcon(order.deliveryStatus)}
                      </div>
                      <div>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                          {order.deliveryStatus.replace('-', ' ').toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-600 mt-2 capitalize flex items-center gap-1">
                          <span className="text-xl">{order.mealType === 'lunch' ? '🌞' : '🌙'}</span>
                          {order.mealType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
                    <div className="relative">
                      {getStatusSteps(order).map((step, index) => (
                        <div key={index} className="flex items-center mb-4 last:mb-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            step.completed ? 'bg-gradient-to-br from-green-400 to-emerald-500 scale-110' : 'bg-gray-300'
                          }`}>
                            {step.completed ? <CheckCircle className="text-white" size={24} /> : <div className="w-4 h-4 rounded-full bg-white"></div>}
                          </div>
                          <div className="ml-4 flex-1">
                            <p className={`font-bold text-lg ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-5 mb-4 border-2 border-orange-200">
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Sparkles className="text-orange-500" size={18} />
                      Order Items:
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-base bg-white p-3 rounded-lg shadow-sm">
                          <span className="text-gray-700 font-medium">• {item.name} × {item.quantity}</span>
                          <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.customerAddress && (
                    <div className="flex items-start gap-3 text-sm text-gray-600 mb-4 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                      <MapPin size={20} className="mt-0.5 flex-shrink-0 text-blue-500" />
                      <span className="font-medium">{order.customerAddress}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-purple-200">
                    <span className="text-sm text-gray-600 font-medium">Payment Method</span>
                    <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                      order.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.paymentMethod === 'cash' ? '💵 Cash on Delivery' : '💳 Paid Online'}
                    </span>
                  </div>

                  {order.deliveryBoyId && order.deliveryStatus !== 'not-assigned' && (
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <Bike size={20} />
                        Delivery Partner
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700 font-medium">On the way to you...</span>
                        {order.customerPhone && (
                          <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg">
                            <Phone size={18} />
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {order.deliveryStatus === 'delivered' && (
                    <button onClick={() => {
                      const newCart: {[key: string]: number} = {};
                      order.items.forEach((item: any) => { newCart[item.name] = item.quantity; });
                      localStorage.setItem('customerCart', JSON.stringify(newCart));
                      window.location.href = '/customer/cart';
                    }} className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-lg">
                      🔁 Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
