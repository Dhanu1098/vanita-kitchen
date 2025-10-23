'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Settings as SettingsIcon, Database, Bell, User, Save, Mail, Send } from 'lucide-react';
import { sendDailySummaryEmail, sendSubscriptionExpiryEmail, isEmailJSConfigured, getConfigurationStatus } from '@/lib/emailService';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { settings, updateSettings, fetchSettings } = useStore();
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactNumber: '',
    businessAddress: '',
    email: '',
    notificationEmail: '',
    newOrderNotifications: true,
    dailySummaryEmail: false,
    subscriptionExpiryAlerts: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.businessName,
        contactNumber: settings.contactNumber,
        businessAddress: settings.businessAddress,
        email: settings.email,
        notificationEmail: settings.notificationEmail,
        newOrderNotifications: settings.newOrderNotifications,
        dailySummaryEmail: settings.dailySummaryEmail,
        subscriptionExpiryAlerts: settings.subscriptionExpiryAlerts,
      });
    }
  }, [settings]);

  const handleSaveBusinessInfo = async () => {
    try {
      setSaving(true);
      await updateSettings({
        businessName: formData.businessName,
        contactNumber: formData.contactNumber,
        businessAddress: formData.businessAddress,
        email: formData.email,
      });
      alert('✅ Business information saved successfully!');
    } catch (error) {
      alert('❌ Error saving business information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await updateSettings({
        newOrderNotifications: formData.newOrderNotifications,
        dailySummaryEmail: formData.dailySummaryEmail,
        subscriptionExpiryAlerts: formData.subscriptionExpiryAlerts,
        notificationEmail: formData.notificationEmail,
      });
      alert('✅ Notification settings saved successfully!');
    } catch (error) {
      alert('❌ Error saving notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async (type: 'daily_summary' | 'subscription_expiry') => {
    if (!formData.notificationEmail) {
      alert('⚠️ Please enter notification email address first!');
      return;
    }

    const configStatus = getConfigurationStatus();
    
    if (!isEmailJSConfigured()) {
      let missingItems = [];
      if (!configStatus.serviceId) missingItems.push('Service ID');
      if (!configStatus.publicKey) missingItems.push('Public Key');
      if (!configStatus.dailyTemplate) missingItems.push('Daily Template ID');
      if (!configStatus.subscriptionTemplate) missingItems.push('Subscription Template ID');
      
      alert(
        '⚠️ EmailJS Not Configured!\n\n' +
        'Missing: ' + missingItems.join(', ') + '\n\n' +
        'Steps:\n' +
        '1. Check .env.local file\n' +
        '2. Make sure all NEXT_PUBLIC_EMAILJS_* variables are set\n' +
        '3. Restart dev server (Ctrl+C then npm run dev)\n' +
        '4. Check browser console for detailed logs\n\n' +
        'See EMAILJS_SETUP.md for complete guide'
      );
      console.log('📧 Configuration Status:', configStatus);
      return;
    }

    setTesting(true);
    try {
      if (type === 'daily_summary') {
        const success = await sendDailySummaryEmail({
          to_email: formData.notificationEmail,
          business_name: formData.businessName || 'My Tiffin Service',
          date: format(new Date(), 'dd MMM yyyy'),
          total_orders: 15,
          total_revenue: '₹3,450.00',
          total_profit: '₹1,250.00',
          total_cost: '₹2,200.00',
          lunch_count: 9,
          dinner_count: 6,
        });

        if (success) {
          alert('✅ Daily Summary Email sent successfully!\n\nCheck your inbox: ' + formData.notificationEmail);
        }
      } else if (type === 'subscription_expiry') {
        const success = await sendSubscriptionExpiryEmail({
          to_email: formData.notificationEmail,
          business_name: formData.businessName || 'My Tiffin Service',
          customer_name: 'John Doe',
          plan_type: 'Monthly',
          meal_type: 'Both (Lunch & Dinner)',
          expiry_date: format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'dd MMM yyyy'),
          days_remaining: 3,
          subscription_price: '₹3,000',
        });

        if (success) {
          alert('✅ Subscription Expiry Alert sent successfully!\n\nCheck your inbox: ' + formData.notificationEmail);
        }
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      alert('❌ Failed to send email!\n\n' + (error.message || 'Please check your EmailJS configuration.'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your application settings</p>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Business Info */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded">
                <User size={20} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold">Business Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Business Name *</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Your Tiffin Service Name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Contact Number</label>
                <input 
                  type="tel" 
                  className="input" 
                  placeholder="+91 XXXXXXXXXX"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Business Email</label>
                <input 
                  type="email" 
                  className="input" 
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Address</label>
                <textarea 
                  className="input" 
                  rows={3} 
                  placeholder="Your business address"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSaveBusinessInfo}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded">
                <Bell size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Email Notifications</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Notification Email Address</label>
                <div className="flex gap-2">
                  <Mail size={20} className="text-gray-400 mt-2" />
                  <input 
                    type="email" 
                    className="input flex-1" 
                    placeholder="email@example.com"
                    value={formData.notificationEmail}
                    onChange={(e) => setFormData({...formData, notificationEmail: e.target.value})}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Email address to receive notifications</p>
              </div>
              
              <div className="space-y-3 mt-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <div>
                    <span className="font-medium">New Order Notifications</span>
                    <p className="text-sm text-gray-600">Get notified when new orders arrive</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5"
                    checked={formData.newOrderNotifications}
                    onChange={(e) => setFormData({...formData, newOrderNotifications: e.target.checked})}
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer border-2 border-blue-200">
                  <div>
                    <span className="font-medium text-blue-800">📧 Daily Summary Email</span>
                    <p className="text-sm text-blue-600">Receive daily summary of orders, revenue & profit at 9 PM</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5"
                    checked={formData.dailySummaryEmail}
                    onChange={(e) => setFormData({...formData, dailySummaryEmail: e.target.checked})}
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition cursor-pointer border-2 border-orange-200">
                  <div>
                    <span className="font-medium text-orange-800">🔔 Subscription Expiry Alerts</span>
                    <p className="text-sm text-orange-600">Get notified 3 days before subscription expires</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5"
                    checked={formData.subscriptionExpiryAlerts}
                    onChange={(e) => setFormData({...formData, subscriptionExpiryAlerts: e.target.checked})}
                  />
                </label>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>

          {/* Test Notifications */}
          <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded">
                <Send size={20} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">Test Notifications</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Send test emails to verify your notification settings are working correctly.
              Make sure to save notification email address first.
            </p>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">📊 Test Daily Summary Email</h3>
                    <p className="text-sm text-gray-600">
                      Sends a sample daily summary with orders, revenue & profit data
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTestNotification('daily_summary')}
                    disabled={testing || !formData.notificationEmail}
                    className="btn bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    <Send size={16} />
                    {testing ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-1">⏰ Test Subscription Expiry Alert</h3>
                    <p className="text-sm text-gray-600">
                      Sends a sample subscription expiry reminder notification
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTestNotification('subscription_expiry')}
                    disabled={testing || !formData.notificationEmail}
                    className="btn bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    <Send size={16} />
                    {testing ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>

              {!formData.notificationEmail && (
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Please enter your notification email address above to enable test notifications.
                  </p>
                </div>
              )}

              <div className={`border-2 p-4 rounded-lg ${isEmailJSConfigured() ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                {isEmailJSConfigured() ? (
                  <div>
                    <p className="text-sm text-green-800 font-semibold mb-1">✅ EmailJS Configured</p>
                    <p className="text-xs text-green-700">
                      Emails will be sent to: <strong>{formData.notificationEmail || 'No email set'}</strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-yellow-800 font-semibold mb-1">⚠️ EmailJS Not Configured</p>
                    <p className="text-xs text-yellow-700 mb-2">
                      Please check <strong>EMAILJS_SETUP.md</strong> file for setup instructions.
                    </p>
                    <p className="text-xs text-yellow-600">
                      You need to add EmailJS credentials to <code className="bg-yellow-100 px-1 py-0.5 rounded">.env.local</code> file
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded">
                <Database size={20} className="text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold">Data Management</h2>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                All data is stored in Supabase cloud database. Your data is secure and accessible from anywhere.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-1">✅ Connected to Supabase</h3>
                <p className="text-sm text-green-700">Your database is active and syncing in real-time</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <SettingsIcon size={24} className="text-primary-600" />
              <h3 className="font-bold text-lg">Tiffin Service Management System</h3>
            </div>
            <p className="text-sm text-gray-700 font-medium">Version 1.0.0</p>
            <p className="text-sm text-gray-600 mt-2">
              Complete solution for managing tiffin service business with order tracking, 
              analytics, subscription management, and automated email notifications.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Dynamic Database
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Email Alerts
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                Real-time Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
