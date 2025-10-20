'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { 
  Package, 
  MapPin, 
  Navigation,
  RefreshCw,
  Phone,
  Route,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Order } from '@/types';

export default function DeliveryDashboard() {
  const { 
    orders, 
    updateOrder, 
    fetchAll 
  } = useStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  // Filter today's orders
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.date).toISOString().split('T')[0];
    return orderDate === selectedDate && order.status !== 'cancelled';
  });

  // Debug: Log orders to check addresses
  console.log('Today Orders:', todayOrders.map(o => ({
    name: o.customerName,
    address: o.customerAddress,
    hasAddress: !!o.customerAddress
  })));

  // Filter orders with addresses
  const ordersWithAddress = todayOrders.filter(o => o.customerAddress && o.customerAddress.trim() !== '');
  const ordersWithoutAddress = todayOrders.filter(o => !o.customerAddress || o.customerAddress.trim() === '');
  
  console.log('Orders WITH address:', ordersWithAddress.length);
  console.log('Orders WITHOUT address:', ordersWithoutAddress.length);

  // Sort orders by delivery status - pending first
  const sortedOrders = [...ordersWithAddress].sort((a, b) => {
    const statusPriority = {
      'not-assigned': 1,
      'assigned': 1,
      'picked-up': 2,
      'out-for-delivery': 3,
      'delivered': 4,
      'failed': 4
    };
    return (statusPriority[a.deliveryStatus] || 1) - (statusPriority[b.deliveryStatus] || 1);
  });

  // Get pending orders (not yet delivered)
  const pendingOrders = sortedOrders.filter(o => 
    o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'failed'
  );

  // Stats
  const stats = {
    total: todayOrders.length,
    pending: todayOrders.filter(o => 
      o.deliveryStatus === 'not-assigned' || 
      o.deliveryStatus === 'assigned' || 
      o.deliveryStatus === 'picked-up'
    ).length,
    inProgress: todayOrders.filter(o => o.deliveryStatus === 'out-for-delivery').length,
    delivered: todayOrders.filter(o => o.deliveryStatus === 'delivered').length,
    failed: todayOrders.filter(o => o.deliveryStatus === 'failed').length,
  };

  const handleUpdateStatus = async (order: Order, newStatus: Order['deliveryStatus']) => {
    try {
      const updateData: any = {
        deliveryStatus: newStatus,
      };

      if (newStatus === 'picked-up') {
        updateData.pickedUpAt = new Date();
      } else if (newStatus === 'out-for-delivery') {
        updateData.pickedUpAt = updateData.pickedUpAt || new Date();
      } else if (newStatus === 'delivered') {
        updateData.deliveredAt = new Date();
        updateData.status = 'delivered';
      }

      await updateOrder(order.id, updateData);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'not-assigned': 'bg-gray-100 text-gray-700',
      'assigned': 'bg-blue-100 text-blue-700',
      'picked-up': 'bg-purple-100 text-purple-700',
      'out-for-delivery': 'bg-yellow-100 text-yellow-700',
      'delivered': 'bg-green-100 text-green-700',
      'failed': 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors['not-assigned'];
  };

  // Open navigation to address
  const openNavigation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  // Open all pending addresses in optimized route
  const startDeliveryRoute = () => {
    if (pendingOrders.length === 0) return;
    
    // Take up to 9 orders (Google Maps free limit)
    const ordersToDeliver = pendingOrders.slice(0, 9);
    
    if (ordersToDeliver.length === 1) {
      // Single order - direct navigation
      openNavigation(ordersToDeliver[0].customerAddress!);
      handleUpdateStatus(ordersToDeliver[0], 'out-for-delivery');
    } else {
      // Multiple orders - optimized route
      const waypoints = ordersToDeliver
        .slice(1, -1)
        .map(o => encodeURIComponent(o.customerAddress!))
        .join('|');
      
      const firstAddress = encodeURIComponent(ordersToDeliver[0].customerAddress!);
      const lastAddress = encodeURIComponent(ordersToDeliver[ordersToDeliver.length - 1].customerAddress!);
      
      const url = waypoints 
        ? `https://www.google.com/maps/dir/?api=1&origin=${firstAddress}&destination=${lastAddress}&waypoints=${waypoints}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&origin=${firstAddress}&destination=${lastAddress}&travelmode=driving`;
      
      window.open(url, '_blank');
      
      // Mark all as out-for-delivery
      ordersToDeliver.forEach(order => {
        if (order.deliveryStatus !== 'out-for-delivery') {
          handleUpdateStatus(order, 'out-for-delivery');
        }
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
            <p className="text-gray-600 mt-2">Start delivering with one click</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="card">
            <p className="text-sm text-yellow-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="card">
            <p className="text-sm text-green-600 mb-1">Delivered</p>
            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
          </div>
          <div className="card">
            <p className="text-sm text-red-600 mb-1">Failed</p>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        {/* Start Delivery Button */}
        {pendingOrders.length > 0 && (
          <div className="card mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
                <p className="text-gray-600">
                  {pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} ready for delivery
                  {pendingOrders.length > 9 && ' (will open first 9 in route)'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Google Maps will automatically optimize your route
                </p>
              </div>
              <button
                onClick={startDeliveryRoute}
                className="btn btn-primary btn-lg flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                <Play size={24} />
                <div className="text-left">
                  <div className="font-bold">Start Delivery Route</div>
                  <div className="text-xs opacity-90">{pendingOrders.length} orders</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Orders Without Address Warning */}
        {ordersWithoutAddress.length > 0 && (
          <div className="card mb-6 bg-yellow-50 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {ordersWithoutAddress.length} order{ordersWithoutAddress.length > 1 ? 's' : ''} without address
                </h4>
                <p className="text-sm text-gray-600">
                  Please add delivery addresses to include in route planning
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {sortedOrders.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Sequence (Optimized by Google Maps)
            </h3>
            {sortedOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                isNext={index === 0 && order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'failed'}
                onUpdateStatus={handleUpdateStatus}
                openNavigation={openNavigation}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        ) : ordersWithoutAddress.length > 0 ? (
          <div className="card text-center py-12">
            <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No orders with delivery addresses</p>
            <p className="text-gray-500">Add addresses to orders for delivery planning</p>
          </div>
        ) : (
          <div className="card text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No orders for this date</p>
            <p className="text-gray-500">Orders will appear here when added</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Order Card Component
function OrderCard({
  order,
  index,
  isNext,
  onUpdateStatus,
  openNavigation,
  getStatusColor,
}: {
  order: Order;
  index: number;
  isNext: boolean;
  onUpdateStatus: (order: Order, status: Order['deliveryStatus']) => void;
  openNavigation: (address: string) => void;
  getStatusColor: (status: string) => string;
}) {
  const isCompleted = order.deliveryStatus === 'delivered' || order.deliveryStatus === 'failed';
  
  return (
    <div className={`card ${isNext ? 'border-2 border-green-500 bg-green-50' : ''} ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Order Number */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 font-bold ${
          isNext ? 'bg-green-600 text-white text-lg' : 'bg-gray-200 text-gray-600'
        }`}>
          {index + 1}
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{order.customerName}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.deliveryStatus)}`}>
              {order.deliveryStatus.replace('-', ' ')}
            </span>
            {isNext && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-600 text-white animate-pulse">
                START HERE ▶
              </span>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {order.customerPhone && (
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                  {order.customerPhone}
                </a>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
              <span className="break-words">{order.customerAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={14} />
              <span className="capitalize">{order.mealType} • ₹{order.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Navigate Button */}
          <button
            onClick={() => openNavigation(order.customerAddress!)}
            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 whitespace-nowrap"
            title="Open in Google Maps"
          >
            <Navigation size={14} />
            Navigate
          </button>

          {/* Delivered Button */}
          {order.deliveryStatus === 'out-for-delivery' && (
            <>
              <button
                onClick={() => onUpdateStatus(order, 'delivered')}
                className="btn btn-sm bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 whitespace-nowrap"
              >
                <CheckCircle size={14} />
                Delivered
              </button>
              <button
                onClick={() => onUpdateStatus(order, 'failed')}
                className="btn btn-sm bg-red-500 hover:bg-red-600 text-white whitespace-nowrap"
              >
                Failed
              </button>
            </>
          )}

          {/* Mark In Progress */}
          {(order.deliveryStatus === 'not-assigned' || order.deliveryStatus === 'assigned' || order.deliveryStatus === 'picked-up') && (
            <button
              onClick={() => onUpdateStatus(order, 'out-for-delivery')}
              className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white whitespace-nowrap"
            >
              In Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
