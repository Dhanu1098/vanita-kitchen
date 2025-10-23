'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Plus, Edit, Trash2, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { MenuItem } from '@/types';

export default function MenuPage() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, fetchMenuItems, loading } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    cost: 0,
    category: 'veg' as 'veg' | 'non-veg' | 'special',
  });

  useEffect(() => {
    // Fetch menu items on mount
    fetchMenuItems();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.cost) {
      alert('Please fill all required fields');
      return;
    }

    if (editingItem) {
      await updateMenuItem(editingItem.id, formData);
    } else {
      await addMenuItem(formData);
    }

    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: '', price: 0, cost: 0, category: 'veg' });
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      cost: item.cost,
      category: item.category,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      await deleteMenuItem(id);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      veg: 'bg-green-100 text-green-700',
      'non-veg': 'bg-red-100 text-red-700',
      special: 'bg-purple-100 text-purple-700',
    };
    return colors[category as keyof typeof colors] || colors.veg;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Items</h1>
              <p className="text-gray-600 mt-2">Manage your tiffin menu and pricing ({menuItems.length} items)</p>
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
                  setEditingItem(null);
                  setFormData({ name: '', price: 0, cost: 0, category: 'veg' });
                  setShowModal(true);
                }}
                className="btn btn-primary flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add Menu Item
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {menuItems.map((item) => {
            const profitPerItem = item.price - item.cost;
            const profitMargin = ((profitPerItem / item.price) * 100).toFixed(1);
            
            return (
              <div key={item.id} className="card hover:shadow-lg transition-shadow p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 truncate">{item.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(item.category)}`}>
                      {item.category.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Edit size={14} className="text-primary-600" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center text-xs sm:text-sm">
                      <DollarSign size={14} className="mr-1" />
                      Price
                    </span>
                    <span className="text-base sm:text-lg font-bold text-green-600">₹{item.price}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs sm:text-sm">Cost</span>
                    <span className="text-lg font-semibold text-red-600">₹{item.cost}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-700 font-medium flex items-center">
                      <TrendingUp size={16} className="mr-1" />
                      Profit
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary-600">₹{profitPerItem}</span>
                      <span className="text-xs text-gray-500 ml-2">({profitMargin}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {menuItems.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No menu items found</p>
            <p className="text-sm">Add your first menu item to get started</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="label">Item Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Standard Thali"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Category *</label>
                    <select
                      className="input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      required
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                      <option value="special">Special</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      placeholder="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Cost Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                      placeholder="60"
                      required
                    />
                  </div>
                  
                  {formData.price > 0 && formData.cost > 0 && (
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 mb-1">Profit per item:</p>
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{(formData.price - formData.cost).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Margin: {(((formData.price - formData.cost) / formData.price) * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
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

