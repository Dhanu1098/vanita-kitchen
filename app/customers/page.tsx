'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Plus, Search, Edit, Trash2, Phone, MapPin, RefreshCw } from 'lucide-react';
import { Customer } from '@/types';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, fetchCustomers, loading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'with-address' | 'without-address'>('all');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

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
      <div className="flex-1 ml-64 p-8">
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
        <div className="card">
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
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-gray-600">
                        <Phone size={14} className="mr-2" />
                        <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
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
                          onClick={() => handleEdit(customer)}
                          className="p-2 hover:bg-blue-50 rounded transition-colors"
                          title="Edit customer"
                        >
                          <Edit size={16} className="text-primary-600" />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 hover:bg-red-50 rounded transition-colors"
                          title="Delete customer"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
