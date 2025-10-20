'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { 
  calculateDailyAnalytics, 
  calculateWeeklyAnalytics, 
  calculateMonthlyAnalytics, 
  calculateYearlyAnalytics,
  formatCurrency,
  getProfitMargin 
} from '@/utils/analytics';
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, RefreshCw } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';

export default function AnalyticsPage() {
  const { orders, fetchOrders } = useStore();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    // Fetch orders on mount
    fetchOrders();
  }, []);

  useEffect(() => {
    const today = new Date();
    
    if (timeRange === 'daily') {
      // Last 30 days
      const data = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(today, i);
        const dayStats = calculateDailyAnalytics(orders, date);
        data.push({
          date: format(date, 'dd MMM'),
          revenue: dayStats.totalRevenue,
          cost: dayStats.totalCost,
          profit: dayStats.totalProfit,
          orders: dayStats.totalOrders,
          lunch: dayStats.lunchCount,
          dinner: dayStats.dinnerCount,
        });
      }
      setChartData(data);
      setStats(calculateDailyAnalytics(orders, today));
    } else if (timeRange === 'weekly') {
      // Last 12 weeks
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const date = subDays(today, i * 7);
        const weekStats = calculateWeeklyAnalytics(orders, date);
        data.push({
          date: `Week ${format(weekStats.weekStart, 'dd MMM')}`,
          revenue: weekStats.totalRevenue,
          cost: weekStats.totalCost,
          profit: weekStats.totalProfit,
          orders: weekStats.totalOrders,
          lunch: weekStats.lunchCount,
          dinner: weekStats.dinnerCount,
        });
      }
      setChartData(data);
      setStats(calculateWeeklyAnalytics(orders, today));
    } else if (timeRange === 'monthly') {
      // Last 12 months
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthStats = calculateMonthlyAnalytics(orders, date);
        data.push({
          date: format(date, 'MMM yyyy'),
          revenue: monthStats.totalRevenue,
          cost: monthStats.totalCost,
          profit: monthStats.totalProfit,
          orders: monthStats.totalOrders,
          lunch: monthStats.lunchCount,
          dinner: monthStats.dinnerCount,
        });
      }
      setChartData(data);
      setStats(calculateMonthlyAnalytics(orders, today));
    } else if (timeRange === 'yearly') {
      // Last 5 years
      const data = [];
      const currentYear = today.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        const yearStats = calculateYearlyAnalytics(orders, year);
        data.push({
          date: year.toString(),
          revenue: yearStats.totalRevenue,
          cost: yearStats.totalCost,
          profit: yearStats.totalProfit,
          orders: yearStats.totalOrders,
          lunch: yearStats.lunchCount,
          dinner: yearStats.dinnerCount,
        });
      }
      setChartData(data);
      setStats(calculateYearlyAnalytics(orders, currentYear));
    }
  }, [orders, timeRange]);

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

  const profitMargin = stats ? getProfitMargin(stats.totalRevenue, stats.totalCost) : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">Detailed business insights and reports ({orders.length} orders analyzed)</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn btn-secondary flex items-center gap-2 mr-2"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button 
                onClick={() => setTimeRange('daily')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === 'daily' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Daily
              </button>
              <button 
                onClick={() => setTimeRange('weekly')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === 'weekly' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setTimeRange('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === 'monthly' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setTimeRange('yearly')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === 'yearly' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Revenue</span>
              <DollarSign size={20} />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
            <p className="text-sm opacity-90 mt-2">From {stats?.totalOrders || 0} orders</p>
          </div>
          
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Profit</span>
              <TrendingUp size={20} />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.totalProfit || 0)}</p>
            <p className="text-sm opacity-90 mt-2">{profitMargin.toFixed(1)}% margin</p>
          </div>
          
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Cost</span>
              <Package size={20} />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(stats?.totalCost || 0)}</p>
            <p className="text-sm opacity-90 mt-2">Operating expenses</p>
          </div>
          
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Orders</span>
              <Calendar size={20} />
            </div>
            <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
            <p className="text-sm opacity-90 mt-2">
              {stats?.lunchCount || 0} lunch, {stats?.dinnerCount || 0} dinner
            </p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Average Order Value</h3>
            <p className="text-3xl font-bold text-primary-600">
              {stats?.totalOrders ? formatCurrency(stats.totalRevenue / stats.totalOrders) : '₹0'}
            </p>
            <p className="text-sm text-gray-600 mt-2">Per order revenue</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Average Profit per Order</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.totalOrders ? formatCurrency(stats.totalProfit / stats.totalOrders) : '₹0'}
            </p>
            <p className="text-sm text-gray-600 mt-2">Per order profit</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Profit Margin</h3>
            <p className="text-3xl font-bold text-blue-600">{profitMargin.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-2">
              {profitMargin > 40 ? 'Excellent' : profitMargin > 25 ? 'Good' : 'Need improvement'}
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Meal Distribution</h3>
            <div className="flex items-center justify-center h-24">
              {stats?.totalOrders > 0 ? (
                <div className="text-center">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{stats?.lunchCount}</p>
                      <p className="text-xs text-gray-600">Lunch</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{stats?.dinnerCount}</p>
                      <p className="text-xs text-gray-600">Dinner</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Revenue & Profit Chart */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Revenue & Profit Trend</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Meal Type Analytics */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Lunch vs Dinner Orders</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">🍛 Lunch Orders</p>
                  <p className="text-3xl font-bold text-orange-700 mt-1">{stats?.lunchCount || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-orange-600">Percentage</p>
                  <p className="text-xl font-bold text-orange-700">
                    {stats?.totalOrders ? ((stats.lunchCount / stats.totalOrders) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">🌙 Dinner Orders</p>
                  <p className="text-3xl font-bold text-indigo-700 mt-1">{stats?.dinnerCount || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-indigo-600">Percentage</p>
                  <p className="text-xl font-bold text-indigo-700">
                    {stats?.totalOrders ? ((stats.dinnerCount / stats.totalOrders) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="lunch" fill="#f97316" name="Lunch Orders" />
              <Bar dataKey="dinner" fill="#6366f1" name="Dinner Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost vs Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Cost vs Revenue Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                <Bar dataKey="cost" fill="#ef4444" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Order Volume</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

