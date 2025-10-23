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
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Order } from '@/types';

export default function DeliveryDashboard() {
  const { 
    orders, 
    updateOrder, 
    fetchAll,
    customers 
  } = useStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'deliveries' | 'route-plan'>('deliveries');
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner' | 'both'>('lunch');

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>
            <p className="text-gray-600 mt-2">Manage deliveries and plan routes efficiently</p>
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

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 sm:gap-8">
              <button
                onClick={() => setActiveTab('deliveries')}
                className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                  activeTab === 'deliveries'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Package size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">My Deliveries</span>
                  <span className="sm:hidden">Deliveries</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('route-plan')}
                className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                  activeTab === 'route-plan'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Route size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Route Plan</span>
                  <span className="sm:hidden">Routes</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'deliveries' ? (
          <DeliveriesTab 
            orders={orders}
            selectedDate={selectedDate}
            updateOrder={updateOrder}
          />
        ) : (
          <RoutePlanTab
            orders={orders}
            selectedDate={selectedDate}
            selectedMealType={selectedMealType}
            setSelectedMealType={setSelectedMealType}
          />
        )}
      </div>
    </div>
  );
}

// Deliveries Tab Component
function DeliveriesTab({ 
  orders, 
  selectedDate, 
  updateOrder 
}: { 
  orders: Order[]; 
  selectedDate: string; 
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
}) {
  // Filter today's orders
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.date).toISOString().split('T')[0];
    return orderDate === selectedDate && order.status !== 'cancelled';
  });

  // Filter orders with addresses
  const ordersWithAddress = todayOrders.filter(o => o.customerAddress && o.customerAddress.trim() !== '');
  const ordersWithoutAddress = todayOrders.filter(o => !o.customerAddress || o.customerAddress.trim() === '');
  
  // Sort orders by delivery status
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

  const openNavigation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const startDeliveryRoute = () => {
    if (pendingOrders.length === 0) return;
    
    const ordersToDeliver = pendingOrders.slice(0, 9);
    
    if (ordersToDeliver.length === 1) {
      openNavigation(ordersToDeliver[0].customerAddress!);
      handleUpdateStatus(ordersToDeliver[0], 'out-for-delivery');
    } else {
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
      
      ordersToDeliver.forEach(order => {
        if (order.deliveryStatus !== 'out-for-delivery') {
          handleUpdateStatus(order, 'out-for-delivery');
        }
      });
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

  return (
    <>
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
    </>
  );
}

// Route Plan Tab Component
function RoutePlanTab({
  orders,
  selectedDate,
  selectedMealType,
  setSelectedMealType
}: {
  orders: Order[];
  selectedDate: string;
  selectedMealType: 'lunch' | 'dinner' | 'both';
  setSelectedMealType: (value: 'lunch' | 'dinner' | 'both') => void;
}) {
  const [optimizedRoute, setOptimizedRoute] = useState<any[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  // Get orders for selected date and meal type
  const getTodaysOrders = () => {
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      const matchesDate = orderDate === selectedDate;
      const matchesMeal = selectedMealType === 'both' || order.mealType === selectedMealType || order.mealType === 'both';
      const isConfirmed = order.status === 'confirmed' || order.status === 'pending';
      const hasAddress = order.customerAddress && order.customerAddress.trim() !== '';
      
      return matchesDate && matchesMeal && isConfirmed && hasAddress;
    });

    console.log('Route Plan - Date:', selectedDate);
    console.log('Route Plan - Meal Type:', selectedMealType);
    console.log('Route Plan - Total Orders:', orders.length);
    console.log('Route Plan - Filtered Orders:', filtered.length);
    console.log('Route Plan - Sample Order:', filtered[0]);
    
    return filtered;
  };

  const todaysOrders = getTodaysOrders();

  // Group orders by area
  const groupOrdersByArea = () => {
    const grouped: { [key: string]: Order[] } = {};
    
    todaysOrders.forEach(order => {
      const area = order.customerAddress ? extractArea(order.customerAddress) : 'Unknown Area';
      if (!grouped[area]) {
        grouped[area] = [];
      }
      grouped[area].push(order);
    });

    return grouped;
  };

  const extractArea = (address: string): string => {
    // Extract area from address (last meaningful part)
    const parts = address.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    // Common patterns:
    // "House 123, Street Name, Area, City, Pin" -> Area
    // "Area, City" -> Area
    // "City" -> City
    
    if (parts.length >= 3) {
      return parts[parts.length - 3]; // 3rd from last (usually area)
    } else if (parts.length === 2) {
      return parts[0]; // First part (area)
    } else if (parts.length === 1) {
      return parts[0]; // Single part
    }
    return 'Unknown Area';
  };

  const optimizeRoute = () => {
    const grouped = groupOrdersByArea();
    const areas = Object.keys(grouped);
    
    // Sort areas alphabetically for consistent routing
    areas.sort();
    
    // Optimization Strategy:
    // 1. Group by area (already done)
    // 2. Sort areas alphabetically (proximity assumption)
    // 3. Within each area, sort by order priority
    
    const route = areas.map((area, index) => {
      const areaOrders = grouped[area];
      
      // Sort orders within area by:
      // 1. Delivery status priority (out-for-delivery first)
      // 2. Order value (higher value first for VIP treatment)
      areaOrders.sort((a, b) => {
        // Priority 1: Status
        const statusPriority: { [key: string]: number } = {
          'out-for-delivery': 1,
          'picked-up': 2,
          'assigned': 3,
          'not-assigned': 4,
          'delivered': 5,
          'failed': 6
        };
        
        const statusDiff = (statusPriority[a.deliveryStatus] || 4) - (statusPriority[b.deliveryStatus] || 4);
        if (statusDiff !== 0) return statusDiff;
        
        // Priority 2: Order value (higher first)
        return b.totalPrice - a.totalPrice;
      });
      
      return {
        sequence: index + 1,
        area: area,
        orders: areaOrders,
        orderCount: areaOrders.length,
        estimatedTime: areaOrders.length * 5, // 5 min per delivery
        totalValue: areaOrders.reduce((sum, o) => sum + o.totalPrice, 0),
        customers: areaOrders.map(o => o.customerName).join(', ')
      };
    });

    // Sort route by total value (deliver high-value areas first)
    route.sort((a, b) => b.totalValue - a.totalValue);
    
    // Re-number sequence
    route.forEach((r, i) => r.sequence = i + 1);

    console.log('Route Optimized:', {
      totalAreas: route.length,
      totalOrders: todaysOrders.length,
      estimatedTime: route.reduce((sum, r) => sum + r.estimatedTime, 0)
    });

    setOptimizedRoute(route);
    setTotalDistance(route.length * 2.5); // 2.5 km average per area
    setEstimatedTime(route.reduce((sum, r) => sum + r.estimatedTime, 0) + (route.length * 3)); // +3 min travel between areas
  };

  useEffect(() => {
    if (todaysOrders.length > 0) {
      optimizeRoute();
    } else {
      setOptimizedRoute([]);
    }
  }, [selectedDate, selectedMealType, orders]);

  const generateMapLink = () => {
    const addresses = todaysOrders
      .map(o => o.customerAddress)
      .filter(addr => addr && addr.trim() !== '')
      .join('|');
    
    if (addresses) {
      const encoded = encodeURIComponent(addresses);
      return `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`;
    }
    return null;
  };

  return (
    <>
      {/* Meal Selection */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <label className="label mb-0">Meal Type:</label>
          <div className="flex gap-2">
            {['lunch', 'dinner', 'both'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedMealType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{todaysOrders.length}</p>
            </div>
            <MapPin className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Areas to Cover</p>
              <p className="text-3xl font-bold text-green-600">{optimizedRoute.length}</p>
            </div>
            <Navigation className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Est. Distance</p>
              <p className="text-3xl font-bold text-purple-600">{totalDistance} km</p>
            </div>
            <TrendingUp className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Est. Time</p>
              <p className="text-3xl font-bold text-orange-600">{estimatedTime} min</p>
            </div>
            <Clock className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="card mb-4 bg-blue-50 border-l-4 border-blue-600">
        <div className="text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Selected Date: {selectedDate}</p>
          <p>Meal Type: {selectedMealType}</p>
          <p>Total Orders in System: {orders.length}</p>
          <p>Orders for this date+meal: {todaysOrders.length}</p>
          <p>Areas: {optimizedRoute.length}</p>
          {todaysOrders.length === 0 && (
            <p className="text-red-600 mt-2">
              ⚠️ No orders found for this date and meal type. Try:
              <br/>• Selecting today's date
              <br/>• Changing meal type to "Both"
              <br/>• Adding orders with complete addresses
            </p>
          )}
        </div>
      </div>

      {/* Optimized Route */}
      {optimizedRoute.length > 0 ? (
        <>
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Optimized Delivery Route</h2>
                <p className="text-sm text-gray-600 mt-1">
                  🎯 Optimized by: Area clustering → High-value orders first → Status priority
                </p>
              </div>
              {generateMapLink() && (
                <a
                  href={generateMapLink()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <MapPin size={20} />
                  Open in Google Maps
                </a>
              )}
            </div>

            <div className="space-y-4">
              {optimizedRoute.map((stop, index) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {stop.sequence}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{stop.area}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {stop.orderCount} deliveries
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            ~{stop.estimatedTime} min
                          </span>
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            💰 ₹{stop.totalValue.toFixed(0)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <strong>Customers:</strong> {stop.customers}
                        </div>
                        
                        {/* Order details */}
                        <div className="mt-3 space-y-2">
                          {stop.orders.map((order: Order, idx: number) => (
                            <div key={order.id} className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{order.customerName}</p>
                                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                                  <p className="text-xs text-gray-500 mt-1">{order.customerAddress}</p>
                                  <div className="text-xs text-gray-600 mt-1">
                                    Items: {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-bold text-green-600">
                                    ₹{order.totalPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="card bg-gradient-to-r from-blue-50 to-green-50">
            <h3 className="font-bold text-gray-900 mb-4">Route Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">{todaysOrders.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{todaysOrders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Time per Stop</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(estimatedTime / optimizedRoute.length)} min
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <AlertCircle size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            No orders found for {selectedDate} ({selectedMealType})
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try selecting a different date or meal type
          </p>
        </div>
      )}
    </>
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
        <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 font-bold ${
          isNext ? 'bg-green-600 text-white text-lg' : 'bg-gray-200 text-gray-600'
        }`}>
          {index + 1}
        </div>

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

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => openNavigation(order.customerAddress!)}
            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 whitespace-nowrap"
          >
            <Navigation size={14} />
            Navigate
          </button>

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
