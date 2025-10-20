'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import { useStore } from '@/store/useStore';
import { calculateDailyAnalytics, calculateMonthlyAnalytics, formatCurrency } from '@/utils/analytics';
import { 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Users,
  Calendar,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Dashboard() {
  const { orders, customers, subscriptions, fetchAll, loading } = useStore();
  const [todayAnalytics, setTodayAnalytics] = useState<any>(null);
  const [monthAnalytics, setMonthAnalytics] = useState<any>(null);
  const [last7DaysData, setLast7DaysData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const calculateStats = () => {
    const today = new Date();
    const todayStats = calculateDailyAnalytics(orders, today);
    const monthStats = calculateMonthlyAnalytics(orders, today);
    
    setTodayAnalytics(todayStats);
    setMonthAnalytics(monthStats);
    
    // Last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStats = calculateDailyAnalytics(orders, date);
      last7Days.push({
        date: format(date, 'dd MMM'),
        revenue: dayStats.totalRevenue,
        profit: dayStats.totalProfit,
        orders: dayStats.totalOrders,
      });
    }
    setLast7DaysData(last7Days);
  };

  useEffect(() => {
    calculateStats();
  }, [orders]);

  useEffect(() => {
    // Refresh data on mount
    fetchAll();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Today's Orders"
            value={todayOrders}
            icon={ShoppingCart}
            color="blue"
          />
          <StatsCard
            title="Today's Revenue"
            value={formatCurrency(todayAnalytics?.totalRevenue || 0)}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Today's Profit"
            value={formatCurrency(todayAnalytics?.totalProfit || 0)}
            icon={TrendingUp}
            color="primary"
          />
          <StatsCard
            title="Active Subscriptions"
            value={activeSubscriptions}
            icon={Calendar}
            color="purple"
          />
        </div>

        {/* Monthly Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-primary-600">{customers.length}</span>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-green-600">
                {formatCurrency(monthAnalytics?.totalRevenue || 0)}
              </span>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Monthly Profit</h3>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-blue-600">
                {formatCurrency(monthAnalytics?.totalProfit || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Last 7 Days Revenue & Profit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Last 7 Days Orders</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#22c55e" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <a href="/orders" className="text-primary-600 hover:text-primary-700 flex items-center">
              View All <ArrowUpRight size={16} className="ml-1" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Meal Type</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.customerName}</td>
                    <td className="py-3 px-4">{format(new Date(order.date), 'dd MMM yyyy')}</td>
                    <td className="py-3 px-4 capitalize">{order.mealType}</td>
                    <td className="py-3 px-4">{formatCurrency(order.totalPrice)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders yet. Start by adding orders from WhatsApp or manual entry.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

