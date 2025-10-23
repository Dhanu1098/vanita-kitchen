'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Plus, Search, Edit, Trash2, Phone, MapPin, RefreshCw, TrendingUp, ShoppingCart, DollarSign, Calendar, Star } from 'lucide-react';
import { Customer } from '@/types';

export default function CustomersPage() {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer, fetchCustomers, fetchOrders, loading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'with-address' | 'without-address'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
  }, []);

  // Get customer insights
  const getCustomerInsights = (customerId: string) => {
    // Find customer
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return getEmptyInsights();

    // Filter orders by customer ID OR by customer phone (fallback)
    const customerOrders = orders.filter(o => 
      o.customerId === customerId || 
      (customer.phone && o.customerPhone === customer.phone) ||
      (customer.name && o.customerName === customer.name)
    );
    
    console.log(`Customer ${customer.name} (${customerId}):`, {
      ordersFound: customerOrders.length,
      orderIds: customerOrders.map(o => o.id)
    });
    
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Get favorite items
    const itemCounts: { [key: string]: number } = {};
    customerOrders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    const favoriteItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Last order date
    const lastOrder = customerOrders.length > 0 
      ? new Date(Math.max(...customerOrders.map(o => new Date(o.date).getTime())))
      : null;

    // Order frequency (orders per month)
    const firstOrder = customerOrders.length > 0
      ? new Date(Math.min(...customerOrders.map(o => new Date(o.date).getTime())))
      : null;
    
    const monthsDiff = firstOrder && lastOrder
      ? Math.max(1, Math.ceil((lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 1;
    const ordersPerMonth = totalOrders / monthsDiff;

    return {
      totalOrders,
      totalSpent,
      avgOrderValue,
      favoriteItems,
      lastOrder,
      ordersPerMonth: Math.round(ordersPerMonth * 10) / 10,
    };
  };

  const getEmptyInsights = () => ({
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    favoriteItems: [],
    lastOrder: null,
    ordersPerMonth: 0,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'with-address') return matchesSearch && customer.address && customer.address.trim() !== '';
    if (filterType === 'without-address') return matchesSearch && (!customer.address || customer.address.trim() === '');
    
    return matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        });
      } else {
        const newCustomer = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        };
        await addCustomer(newCustomer);
      }
      
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', address: '' });
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
    }
  };

  // Stats
  const stats = {
    total: customers.length,
    withAddress: customers.filter(c => c.address && c.address.trim() !== '').length,
    withoutAddress: customers.filter(c => !c.address || c.address.trim() === '').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600 mt-2">Manage your customer database</p>
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
                onClick={() => {
                  setEditingCustomer(null);
                  setFormData({ name: '', phone: '', address: '' });
                  setShowModal(true);
                }}
                className="btn btn-primary flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add Customer
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-green-600 mb-1">With Address</p>
            <p className="text-3xl font-bold text-green-600">{stats.withAddress}</p>
          </div>
          <div className="card">
            <p className="text-sm text-orange-600 mb-1">Without Address</p>
            <p className="text-3xl font-bold text-orange-600">{stats.withoutAddress}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Type */}
            <div>
              <select
                className="input"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All Customers ({customers.length})</option>
                <option value="with-address">With Address ({stats.withAddress})</option>
                <option value="without-address">Without Address ({stats.withoutAddress})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="hidden lg:block card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Address</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => {
                  const insights = getCustomerInsights(customer.id);
                  const isExpanded = selectedCustomerId === customer.id;
                  
                  return (
                    <React.Fragment key={customer.id}>
                      <tr 
                        className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedCustomerId(isExpanded ? null : customer.id)}
                      >
                        <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          {insights.totalOrders > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {insights.totalOrders} orders
                              </span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                ₹{insights.totalSpent.toFixed(0)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-gray-600">
                            <Phone size={14} className="mr-2" />
                            <a 
                              href={`tel:${customer.phone}`} 
                              className="hover:text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {customer.phone}
                            </a>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {customer.address && customer.address.trim() !== '' ? (
                            <div className="flex items-start text-gray-600 text-sm">
                              <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{customer.address}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">No address</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(customer);
                              }}
                              className="p-2 hover:bg-blue-50 rounded transition-colors"
                              title="Edit customer"
                            >
                              <Edit size={16} className="text-primary-600" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(customer.id);
                              }}
                              className="p-2 hover:bg-red-50 rounded transition-colors"
                              title="Delete customer"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomerId(isExpanded ? null : customer.id);
                              }}
                              className="p-2 hover:bg-purple-50 rounded transition-colors"
                              title="View insights"
                            >
                              <TrendingUp size={16} className="text-purple-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-t border-b border-blue-200">
                              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="text-purple-600" />
                                Customer Insights: {customer.name}
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                {/* Total Orders */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <ShoppingCart className="text-blue-600" size={24} />
                                    <span className="text-xs text-gray-500">Total Orders</span>
                                  </div>
                                  <p className="text-2xl font-bold text-gray-900">{insights.totalOrders}</p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {insights.ordersPerMonth} orders/month
                                  </p>
                                </div>

                                {/* Total Spent */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <DollarSign className="text-green-600" size={24} />
                                    <span className="text-xs text-gray-500">Total Spent</span>
                                  </div>
                                  <p className="text-2xl font-bold text-green-600">
                                    ₹{insights.totalSpent.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Lifetime value
                                  </p>
                                </div>

                                {/* Avg Order Value */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <Star className="text-purple-600" size={24} />
                                    <span className="text-xs text-gray-500">Avg Order</span>
                                  </div>
                                  <p className="text-2xl font-bold text-purple-600">
                                    ₹{insights.avgOrderValue.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Per order
                                  </p>
                                </div>

                                {/* Last Order */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <Calendar className="text-orange-600" size={24} />
                                    <span className="text-xs text-gray-500">Last Order</span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-900">
                                    {insights.lastOrder 
                                      ? new Date(insights.lastOrder).toLocaleDateString('en-IN')
                                      : 'Never'
                                    }
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {insights.lastOrder 
                                      ? `${Math.floor((Date.now() - insights.lastOrder.getTime()) / (1000 * 60 * 60 * 24))} days ago`
                                      : 'No orders yet'
                                    }
                                  </p>
                                </div>
                              </div>

                              {/* Favorite Items */}
                              {insights.favoriteItems.length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Star className="text-yellow-500" size={18} />
                                    Favorite Items
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {insights.favoriteItems.map((item, idx) => (
                                      <div 
                                        key={idx}
                                        className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 px-3 py-2 rounded-lg"
                                      >
                                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-600">Ordered {item.count} times</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {insights.totalOrders === 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                                  <p className="text-gray-700">No orders yet from this customer</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No customers found</p>
                <p className="text-sm">
                  {searchTerm ? 'Try different search term' : 'Add your first customer to get started'}
                </p>
              </div>
            )}
          </div>

          {/* Results Info */}
          {filteredCustomers.length > 0 && (
            <div className="border-t py-3 px-4 text-sm text-gray-600">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-2.5">
          {filteredCustomers.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No customers found</p>
              <p className="text-xs">
                {searchTerm ? 'Try different search term' : 'Add your first customer'}
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer, index) => {
              const insights = getCustomerInsights(customer.id);
              return (
                <div key={customer.id} className="card p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="font-bold text-base truncate">{customer.name}</h3>
                      <p className="text-xs text-gray-600">{customer.phone}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                    <div>
                      <p className="text-gray-600">Orders</p>
                      <p className="font-bold text-sm">{insights.totalOrders}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">Spent</p>
                      <p className="font-bold text-sm text-green-600">₹{insights.totalSpent}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add/Edit Customer Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Complete delivery address (House, Street, Area, City, Pin)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add complete address for delivery navigation
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
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
