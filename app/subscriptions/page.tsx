'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Plus, Edit, Trash2, Calendar, DollarSign, RefreshCw, Eye } from 'lucide-react';
import { Subscription } from '@/types';
import { format, addDays, addWeeks, addMonths, differenceInDays } from 'date-fns';

export default function SubscriptionsPage() {
  const { subscriptions, customers, addSubscription, updateSubscription, deleteSubscription, fetchSubscriptions, loading } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [viewSubscription, setViewSubscription] = useState<Subscription | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    planType: 'monthly' as 'daily' | 'weekly' | 'monthly',
    mealType: 'both' as 'lunch' | 'dinner' | 'both',
    price: 0,
    startDate: new Date().toISOString().split('T')[0],
    duration: 1,
  });

  useEffect(() => {
    // Fetch subscriptions on mount
    fetchSubscriptions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  };

  const calculateEndDate = (startDate: string, planType: string, duration: number) => {
    const start = new Date(startDate);
    switch (planType) {
      case 'daily':
        return addDays(start, duration);
      case 'weekly':
        return addWeeks(start, duration);
      case 'monthly':
        return addMonths(start, duration);
      default:
        return start;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.price) {
      alert('Please fill all required fields');
      return;
    }

    const endDate = calculateEndDate(formData.startDate, formData.planType, formData.duration);

    const newSubscription = {
      customerId: formData.customerId,
      planType: formData.planType,
      mealType: formData.mealType,
      price: formData.price,
      startDate: new Date(formData.startDate),
      endDate,
      status: 'active' as const,
    };

    await addSubscription(newSubscription);
    setShowModal(false);
    setFormData({
      customerId: '',
      planType: 'monthly',
      mealType: 'both',
      price: 0,
      startDate: new Date().toISOString().split('T')[0],
      duration: 1,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await updateSubscription(id, { status: newStatus as any });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const pausedSubscriptions = subscriptions.filter(s => s.status === 'paused');
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
              <p className="text-gray-600 mt-2">Manage customer subscriptions ({subscriptions.length} total)</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn btn-secondary flex items-center gap-2"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-green-50">
            <h3 className="text-sm text-gray-600 mb-1">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-green-600">{activeSubscriptions.length}</p>
          </div>
          <div className="card bg-yellow-50">
            <h3 className="text-sm text-gray-600 mb-1">Paused Subscriptions</h3>
            <p className="text-3xl font-bold text-yellow-600">{pausedSubscriptions.length}</p>
          </div>
          <div className="card bg-red-50">
            <h3 className="text-sm text-gray-600 mb-1">Expired Subscriptions</h3>
            <p className="text-3xl font-bold text-red-600">{expiredSubscriptions.length}</p>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="hidden lg:block card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold">Customer</th>
                  <th className="text-left py-4 px-4 font-semibold">Plan Type</th>
                  <th className="text-left py-4 px-4 font-semibold">Meal Type</th>
                  <th className="text-left py-4 px-4 font-semibold">Price</th>
                  <th className="text-left py-4 px-4 font-semibold">Start Date</th>
                  <th className="text-left py-4 px-4 font-semibold">End Date</th>
                  <th className="text-left py-4 px-4 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{getCustomerName(subscription.customerId)}</td>
                    <td className="py-4 px-4 capitalize">{subscription.planType}</td>
                    <td className="py-4 px-4 capitalize">{subscription.mealType}</td>
                    <td className="py-4 px-4 font-semibold">₹{subscription.price}</td>
                    <td className="py-4 px-4">{format(new Date(subscription.startDate), 'dd MMM yyyy')}</td>
                    <td className="py-4 px-4">{format(new Date(subscription.endDate), 'dd MMM yyyy')}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                        subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewSubscription(subscription)}
                          className="p-2 hover:bg-blue-100 rounded"
                          title="View Details"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(subscription.id, subscription.status)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {subscription.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDelete(subscription.id)}
                          className="p-2 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subscriptions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No subscriptions found</p>
                <p className="text-sm">Add your first subscription to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-2.5">
          {subscriptions.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">
              <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No subscriptions found</p>
              <p className="text-xs">Add your first subscription</p>
            </div>
          ) : (
            subscriptions.map((subscription) => {
              const customer = customers.find(c => c.id === subscription.customerId);
              const daysLeft = differenceInDays(new Date(subscription.endDate), new Date());
              const statusColor = subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800';

              return (
                <div key={subscription.id} className="card p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate">{customer?.name || 'Unknown'}</h3>
                      <p className="text-xs text-gray-600 capitalize">{subscription.planType} • {subscription.mealType}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                      {subscription.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-bold text-sm text-green-600">₹{subscription.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">Days Left</p>
                      <p className={`font-bold text-sm ${daysLeft > 7 ? 'text-green-600' : daysLeft > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {daysLeft > 0 ? daysLeft : 'Expired'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-2 border-t mt-2">
                    <button
                      onClick={() => setViewSubscription(subscription)}
                      className="flex-1 btn btn-secondary py-1.5 text-xs"
                    >
                      <Eye size={14} className="inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="btn bg-red-500 text-white hover:bg-red-600 py-1.5 px-3 text-xs"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View Subscription Modal */}
        {viewSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Subscription Details</h2>
                <button 
                  onClick={() => setViewSubscription(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-lg border-2 border-primary-100">
                  <h3 className="font-semibold text-lg mb-3 text-primary-800">Customer Information</h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-primary-900">{getCustomerName(viewSubscription.customerId)}</p>
                    <p className="text-sm text-gray-600">Customer ID: {viewSubscription.customerId}</p>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                    <p className="text-sm text-orange-600 font-medium mb-1">Plan Type</p>
                    <p className="text-2xl font-bold text-orange-700 capitalize">{viewSubscription.planType}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">Meal Type</p>
                    <p className="text-2xl font-bold text-purple-700 capitalize">{viewSubscription.mealType}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                  <h3 className="font-semibold text-lg mb-3 text-green-800">Subscription Price</h3>
                  <p className="text-4xl font-bold text-green-700">₹{viewSubscription.price}</p>
                  <p className="text-sm text-green-600 mt-1">per {viewSubscription.planType}</p>
                </div>

                {/* Duration */}
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <h3 className="font-semibold text-lg mb-3 text-blue-800">Subscription Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Start Date</p>
                      <p className="text-xl font-bold text-blue-700">
                        {format(new Date(viewSubscription.startDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 mb-1">End Date</p>
                      <p className="text-xl font-bold text-blue-700">
                        {format(new Date(viewSubscription.endDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm text-blue-600">Remaining Days</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {differenceInDays(new Date(viewSubscription.endDate), new Date())} days
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                  <h3 className="font-semibold text-lg mb-3">Current Status</h3>
                  <div className="flex items-center justify-between">
                    <span className={`px-6 py-3 rounded-full text-lg font-bold ${
                      viewSubscription.status === 'active' ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                      viewSubscription.status === 'paused' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                      'bg-red-100 text-red-700 border-2 border-red-300'
                    }`}>
                      {viewSubscription.status.toUpperCase()}
                    </span>
                    <button 
                      onClick={() => {
                        toggleStatus(viewSubscription.id, viewSubscription.status);
                        setViewSubscription(null);
                      }}
                      className="btn btn-primary"
                    >
                      {viewSubscription.status === 'active' ? 'Pause Subscription' : 'Activate Subscription'}
                    </button>
                  </div>
                </div>

                {/* Created Date */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Created on: {format(new Date(viewSubscription.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setViewSubscription(null)}
                  className="flex-1 btn btn-secondary"
                >
                  Close
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this subscription?')) {
                      await handleDelete(viewSubscription.id);
                      setViewSubscription(null);
                    }
                  }}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Subscription
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Subscription Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">Add New Subscription</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="label">Customer *</label>
                    <select
                      className="input"
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      required
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Plan Type *</label>
                    <select
                      className="input"
                      value={formData.planType}
                      onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Meal Type *</label>
                    <select
                      className="input"
                      value={formData.mealType}
                      onChange={(e) => setFormData({ ...formData, mealType: e.target.value as any })}
                      required
                    >
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Price *</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      placeholder="Subscription price"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Start Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Duration *</label>
                    <input
                      type="number"
                      min="1"
                      className="input"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      placeholder={`Number of ${formData.planType}s`}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="btn btn-primary flex-1">
                    Add Subscription
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

