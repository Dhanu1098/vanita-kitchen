'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { calculateDailyAnalytics, calculateWeeklyAnalytics, calculateMonthlyAnalytics } from '@/utils/analytics';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { sendDailySummaryEmail, sendSubscriptionExpiryEmail, isEmailJSConfigured } from '@/lib/emailService';
import { Mail, Send, TrendingUp, Calendar, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

type ReportType = 'daily' | 'weekly' | 'monthly';

export default function ReportsPage() {
  const { orders, settings, subscriptions, customers } = useStore();
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sendingReport, setSendingReport] = useState(false);
  const [sendingManual, setSendingManual] = useState(false);
  const [sendingAuto, setSendingAuto] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Calculate analytics based on report type
  const getAnalytics = () => {
    const date = new Date(selectedDate);
    
    if (reportType === 'daily') {
      return calculateDailyAnalytics(orders, date);
    } else if (reportType === 'weekly') {
      return calculateWeeklyAnalytics(orders, date);
    } else {
      return calculateMonthlyAnalytics(orders, date);
    }
  };

  const analytics = getAnalytics();

  // Get date range string
  const getDateRangeString = () => {
    const date = new Date(selectedDate);
    
    if (reportType === 'daily') {
      return format(date, 'dd MMM yyyy');
    } else if (reportType === 'weekly') {
      const weekStart = startOfWeek(date);
      const weekEnd = endOfWeek(date);
      return `${format(weekStart, 'dd MMM')} - ${format(weekEnd, 'dd MMM yyyy')}`;
    } else {
      return format(date, 'MMMM yyyy');
    }
  };

  // Send Report Email
  const handleSendReport = async () => {
    if (!settings?.notificationEmail) {
      setEmailStatus({ type: 'error', message: 'Please set notification email in Settings first!' });
      return;
    }

    if (!isEmailJSConfigured()) {
      setEmailStatus({ type: 'error', message: 'EmailJS not configured! Check EMAILJS_SETUP.md' });
      return;
    }

    setSendingReport(true);
    setEmailStatus(null);

    try {
      const success = await sendDailySummaryEmail({
        to_email: settings.notificationEmail,
        business_name: settings.businessName || 'My Tiffin Service',
        date: getDateRangeString(),
        total_orders: analytics.totalOrders,
        total_revenue: `₹${analytics.totalRevenue.toFixed(2)}`,
        total_profit: `₹${analytics.totalProfit.toFixed(2)}`,
        total_cost: `₹${analytics.totalCost.toFixed(2)}`,
        lunch_count: analytics.lunchCount,
        dinner_count: analytics.dinnerCount,
      });

      if (success) {
        setEmailStatus({ 
          type: 'success', 
          message: `✅ ${reportType.toUpperCase()} Report sent to ${settings.notificationEmail}` 
        });
      }
    } catch (error: any) {
      setEmailStatus({ 
        type: 'error', 
        message: `❌ Failed to send email: ${error.message}` 
      });
    } finally {
      setSendingReport(false);
    }
  };

  // Send Subscription Expiry Alerts (Manual for next 7 days)
  const handleSendSubscriptionAlerts = async () => {
    if (!settings?.notificationEmail) {
      setEmailStatus({ type: 'error', message: 'Please set notification email in Settings first!' });
      return;
    }

    if (!isEmailJSConfigured()) {
      setEmailStatus({ type: 'error', message: 'EmailJS not configured! Check EMAILJS_SETUP.md' });
      return;
    }

    // Find subscriptions expiring in next 7 days
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const expiringSubs = subscriptions.filter(sub => {
      const endDate = new Date(sub.endDate);
      return sub.status === 'active' && endDate >= today && endDate <= sevenDaysLater;
    });

    if (expiringSubs.length === 0) {
      setEmailStatus({ type: 'success', message: '✅ No subscriptions expiring in next 7 days' });
      return;
    }

    setSendingManual(true);
    setEmailStatus(null);

    try {
      let sentCount = 0;
      
      for (const sub of expiringSubs) {
        const customer = customers.find(c => c.id === sub.customerId);
        if (!customer) continue;

        const endDate = new Date(sub.endDate);
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        try {
          await sendSubscriptionExpiryEmail({
            to_email: settings.notificationEmail,
            business_name: settings.businessName || 'My Tiffin Service',
            customer_name: customer.name,
            plan_type: sub.planType.charAt(0).toUpperCase() + sub.planType.slice(1),
            meal_type: sub.mealType === 'both' ? 'Both (Lunch & Dinner)' : 
                       sub.mealType.charAt(0).toUpperCase() + sub.mealType.slice(1),
            expiry_date: format(endDate, 'dd MMM yyyy'),
            days_remaining: daysRemaining,
            subscription_price: `₹${sub.price.toFixed(2)}`,
          });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send alert for ${customer.name}:`, err);
        }
      }

      setEmailStatus({ 
        type: 'success', 
        message: `✅ Sent ${sentCount} subscription alerts (${expiringSubs.length} expiring soon)` 
      });
    } catch (error: any) {
      setEmailStatus({ 
        type: 'error', 
        message: `❌ Failed to send alerts: ${error.message}` 
      });
    } finally {
      setSendingManual(false);
    }
  };

  // Test Automatic Alert System
  const handleTestAutoAlerts = async () => {
    setSendingAuto(true);
    setEmailStatus(null);

    try {
      const response = await fetch('/api/check-subscriptions');
      const result = await response.json();

      if (result.success) {
        setEmailStatus({
          type: 'success',
          message: `✅ Auto-check completed! ${result.alertsSent} alert(s) sent for subscriptions expiring in 2 days.`,
        });
      } else {
        setEmailStatus({
          type: 'error',
          message: `⚠️ Auto-check completed with errors. ${result.alertsSent} alert(s) sent. Check console.`,
        });
      }
    } catch (error: any) {
      setEmailStatus({
        type: 'error',
        message: `❌ Failed to test auto-alerts: ${error.message}`,
      });
    } finally {
      setSendingAuto(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Email Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send business reports and alerts via email
          </p>
        </div>
        {!isEmailJSConfigured() && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <p className="text-sm text-red-800 font-medium">⚠️ EmailJS not configured</p>
          </div>
        )}
      </div>

      {/* Email Status */}
      {emailStatus && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          emailStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {emailStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          )}
          <p className={`text-sm font-medium ${
            emailStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {emailStatus.message}
          </p>
        </div>
      )}

      {/* Business Summary Report */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Business Summary Report</h2>
            <p className="text-sm text-gray-500">Select timeframe and send analytics via email</p>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setReportType('daily')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportType === 'daily'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setReportType('weekly')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportType === 'weekly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setReportType('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportType === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Preview Analytics */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Report Preview</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Date Range: <strong>{getDateRangeString()}</strong>
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                🍛 {analytics.lunchCount} | 🌙 {analytics.dinnerCount}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{analytics.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Profit</p>
              <p className="text-2xl font-bold text-blue-600">₹{analytics.totalProfit.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Cost</p>
              <p className="text-2xl font-bold text-red-600">₹{analytics.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Send Email Button */}
        <button
          onClick={handleSendReport}
          disabled={sendingReport || !isEmailJSConfigured()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {sendingReport ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Sending Email...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report via Email
            </>
          )}
        </button>

        {settings?.notificationEmail && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Will be sent to: <strong>{settings.notificationEmail}</strong>
          </p>
        )}
      </div>

      {/* Subscription Expiry Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Subscription Expiry Alerts</h2>
            <p className="text-sm text-gray-500">Two alert options: Manual (7 days) & Automatic (2 days)</p>
          </div>
        </div>

        {/* Two Options Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Manual Alerts (Next 7 Days) */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900">Manual Alerts</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Send alerts for all subscriptions expiring in next 7 days</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-orange-600">
                  {subscriptions.filter(sub => {
                    const today = new Date();
                    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const endDate = new Date(sub.endDate);
                    return sub.status === 'active' && endDate >= today && endDate <= sevenDaysLater;
                  }).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
              </div>
            </div>
            <button
              onClick={handleSendSubscriptionAlerts}
              disabled={sendingManual || !isEmailJSConfigured()}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sendingManual ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Now (7 Days)
                </>
              )}
            </button>
          </div>

          {/* Automatic Alerts (2 Days Before) */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Automatic Alerts (2 Days)</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Test automatic system - sends alerts exactly 2 days before expiry</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Expiring in 2 Days</p>
                <p className="text-3xl font-bold text-blue-600">
                  {subscriptions.filter(sub => {
                    const today = new Date();
                    const twoDaysLater = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
                    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
                    const endDate = new Date(sub.endDate);
                    return sub.status === 'active' && endDate >= twoDaysLater && endDate < threeDaysLater;
                  }).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Exactly 2 days</p>
              </div>
            </div>
            <button
              onClick={handleTestAutoAlerts}
              disabled={sendingAuto || !isEmailJSConfigured()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sendingAuto ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Test Auto (2 Days)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            ℹ️ How Automatic Alerts Work:
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>Automatic system</strong> checks subscriptions expiring in exactly 2 days</li>
            <li>Setup a daily cron job to call: <code className="bg-blue-100 px-2 py-1 rounded text-xs">GET /api/check-subscriptions</code></li>
            <li>Use Windows Task Scheduler or free cron services (cron-job.org)</li>
            <li><strong>"Test Auto"</strong> button lets you test this system manually</li>
          </ul>
        </div>

        {settings?.notificationEmail && (
          <p className="text-sm text-gray-500 text-center mt-4">
            All alerts sent to: <strong>{settings.notificationEmail}</strong>
          </p>
        )}
      </div>

      {/* Setup Instructions */}
      {!isEmailJSConfigured() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">⚙️ Email Setup Required</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
            <li>Create EmailJS account at <a href="https://www.emailjs.com/" target="_blank" className="underline font-medium">emailjs.com</a></li>
            <li>Copy templates from <code className="bg-yellow-100 px-2 py-1 rounded">EMAIL_TEMPLATES.html</code></li>
            <li>Add credentials to <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> file</li>
            <li>Restart dev server</li>
          </ol>
          <p className="text-sm text-yellow-700 mt-3">
            📖 Complete guide: <code className="bg-yellow-100 px-2 py-1 rounded">EMAILJS_SETUP.md</code>
          </p>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}

