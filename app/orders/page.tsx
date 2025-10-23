'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/analytics';
import { Plus, Search, Filter, Trash2, Eye, RefreshCw, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { orders, deleteOrder, updateOrder, fetchOrders, loading, menuItems } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [editingStatus, setEditingStatus] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Fetch orders on mount
    fetchOrders();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus as any });
      setEditingStatus({...editingStatus, [orderId]: false});
      await fetchOrders();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleEditOrder = (order: any) => {
    setEditOrder({
      ...order,
      date: new Date(order.date).toISOString().split('T')[0],
      items: [...order.items],
    });
  };

  const handleUpdateOrder = async () => {
    try {
      if (!editOrder || editOrder.items.length === 0) {
        alert('Please add at least one item');
        return;
      }

      const totalPrice = editOrder.items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0) + (editOrder.deliveryCharge || 0);
      
      const cost = editOrder.items.reduce((sum: number, item: any) => {
        const menuItem = menuItems.find(m => m.name === item.name);
        return sum + ((menuItem?.cost || 0) * item.quantity);
      }, 0);

      const profit = totalPrice - cost;

      await updateOrder(editOrder.id, {
        customerName: editOrder.customerName,
        customerPhone: editOrder.customerPhone || '',
        customerAddress: editOrder.customerAddress || '',
        date: new Date(editOrder.date),
        mealType: editOrder.mealType,
        items: editOrder.items,
        totalPrice,
        cost,
        deliveryCharge: editOrder.deliveryCharge || 0,
        profit,
        status: editOrder.status,
        notes: editOrder.notes || '',
      });

      alert('✅ Order updated successfully!');
      setEditOrder(null);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('❌ Error updating order. Please try again.');
    }
  };

  const handleEditItemChange = (index: number, field: string, value: any) => {
    const newItems = [...editOrder.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditOrder({ ...editOrder, items: newItems });
  };

  const handleAddEditItem = () => {
    if (menuItems.length > 0) {
      const firstItem = menuItems[0];
      setEditOrder({
        ...editOrder,
        items: [...editOrder.items, { name: firstItem.name, quantity: 1, price: firstItem.price }]
      });
    }
  };

  const handleRemoveEditItem = (index: number) => {
    const newItems = editOrder.items.filter((_: any, i: number) => i !== index);
    setEditOrder({ ...editOrder, items: newItems });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📦 Orders</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage orders ({orders.length} total)</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                <span className="text-sm">Refresh</span>
              </button>
              <a href="/orders/new" className="btn btn-primary flex items-center justify-center w-full sm:w-auto">
                <Plus size={18} className="mr-2" />
                <span className="text-sm">Add Order</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4 sm:mb-6 p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table - Desktop */}
        <div className="hidden lg:block card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold">Customer</th>
                  <th className="text-left py-4 px-4 font-semibold">Date</th>
                  <th className="text-left py-4 px-4 font-semibold">Meal Type</th>
                  <th className="text-left py-4 px-4 font-semibold">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold">Delivery</th>
                  <th className="text-left py-4 px-4 font-semibold">Profit</th>
                  <th className="text-left py-4 px-4 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 font-semibold">Source</th>
                  <th className="text-left py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">{order.customerName}</td>
                    <td className="py-4 px-4">{format(new Date(order.date), 'dd MMM yyyy')}</td>
                    <td className="py-4 px-4 capitalize">{order.mealType}</td>
                    <td className="py-4 px-4 font-semibold">{formatCurrency(order.totalPrice)}</td>
                    <td className="py-4 px-4">
                      {order.deliveryCharge > 0 ? (
                        <span className="text-blue-600 font-medium">+{formatCurrency(order.deliveryCharge)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={order.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(order.profit)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {editingStatus[order.id] ? (
                        <select
                          className="px-3 py-1 rounded-lg text-xs font-medium border-2 border-primary-500"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          onBlur={() => setEditingStatus({...editingStatus, [order.id]: false})}
                          autoFocus
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span 
                          onClick={() => setEditingStatus({...editingStatus, [order.id]: true})}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 capitalize">{order.source}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setViewOrder(order)}
                          className="p-2 hover:bg-blue-100 rounded"
                          title="View Details"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button 
                          onClick={() => handleEditOrder(order)}
                          className="p-2 hover:bg-green-100 rounded"
                          title="Edit Order"
                        >
                          <Edit size={16} className="text-green-600" />
                        </button>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          className="p-2 hover:bg-red-100 rounded"
                          title="Delete Order"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No orders found</p>
                <p className="text-sm">Add your first order to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders Cards - Mobile */}
        <div className="lg:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">
              <ShoppingCart size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No orders found</p>
              <p className="text-xs">Add your first order</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="card p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate">{order.customerName}</h3>
                    <p className="text-xs text-gray-600">{format(new Date(order.date), 'dd MMM')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">{formatCurrency(order.totalPrice)}</p>
                    <p className="text-xs text-gray-500 capitalize">{order.mealType}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-1 border-t">
                  <span className="text-sm text-gray-600">Status:</span>
                  {editingStatus[order.id] ? (
                    <select
                      className="px-3 py-1 rounded-lg text-xs font-medium border-2 border-primary-500"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      onBlur={() => setEditingStatus({...editingStatus, [order.id]: false})}
                      autoFocus
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span 
                      onClick={() => setEditingStatus({...editingStatus, [order.id]: true})}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Profit:</span>
                    <span className={`ml-1 font-semibold ${order.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(order.profit)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      order.source === 'whatsapp' ? 'bg-green-100 text-green-800' :
                      order.source === 'subscription' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.source}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 pt-2 border-t">
                  <button
                    onClick={() => setViewOrder(order)}
                    className="flex-1 btn btn-secondary py-1.5 text-xs"
                  >
                    <Eye size={14} className="inline mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="flex-1 btn btn-primary py-1.5 text-xs"
                  >
                    <Edit size={14} className="inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="btn bg-red-500 text-white hover:bg-red-600 py-1.5 px-3 text-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Order Modal */}
        {editOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Order</h2>
                <button 
                  onClick={() => setEditOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Customer Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={editOrder.customerName}
                      onChange={(e) => setEditOrder({...editOrder, customerName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Customer Phone</label>
                    <input
                      type="tel"
                      className="input"
                      value={editOrder.customerPhone || ''}
                      onChange={(e) => setEditOrder({...editOrder, customerPhone: e.target.value})}
                      placeholder="9876543210"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Delivery Address *</label>
                    <input
                      type="text"
                      className="input"
                      value={editOrder.customerAddress || ''}
                      onChange={(e) => setEditOrder({...editOrder, customerAddress: e.target.value})}
                      placeholder="Complete delivery address (House, Street, Area, City)"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Order Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={editOrder.date}
                      onChange={(e) => setEditOrder({...editOrder, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Meal Type *</label>
                    <select
                      className="input"
                      value={editOrder.mealType}
                      onChange={(e) => setEditOrder({...editOrder, mealType: e.target.value})}
                      required
                    >
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Status *</label>
                    <select
                      className="input"
                      value={editOrder.status}
                      onChange={(e) => setEditOrder({...editOrder, status: e.target.value})}
                      required
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    <button
                      type="button"
                      onClick={handleAddEditItem}
                      className="btn btn-secondary text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <label className="label text-xs">Item</label>
                          <select
                            className="input"
                            value={item.name}
                            onChange={(e) => {
                              const menuItem = menuItems.find(m => m.name === e.target.value);
                              handleEditItemChange(index, 'name', e.target.value);
                              if (menuItem) {
                                handleEditItemChange(index, 'price', menuItem.price);
                              }
                            }}
                          >
                            {menuItems.map((menuItem) => (
                              <option key={menuItem.id} value={menuItem.name}>
                                {menuItem.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="label text-xs">Quantity</label>
                          <input
                            type="number"
                            className="input"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleEditItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="w-32">
                          <label className="label text-xs">Price (₹)</label>
                          <input
                            type="number"
                            className="input"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleEditItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="w-32">
                          <label className="label text-xs">Total</label>
                          <div className="input bg-gray-100">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded mb-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Charge */}
                <div className="border-t pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Delivery Charge (₹)</label>
                      <input
                        type="number"
                        className="input"
                        min="0"
                        step="0.01"
                        value={editOrder.deliveryCharge || 0}
                        onChange={(e) => setEditOrder({...editOrder, deliveryCharge: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="label">Total Amount</label>
                      <div className="input bg-green-50 text-green-700 font-bold text-xl">
                        ₹{(editOrder.items.reduce((sum: number, item: any) => 
                          sum + (item.price * item.quantity), 0) + (editOrder.deliveryCharge || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t pt-6">
                  <label className="label">Notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={editOrder.notes || ''}
                    onChange={(e) => setEditOrder({...editOrder, notes: e.target.value})}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setEditOrder(null)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateOrder}
                  className="flex-1 btn btn-primary"
                >
                  Update Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        {viewOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button 
                  onClick={() => setViewOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">{viewOrder.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium">{format(new Date(viewOrder.date), 'dd MMM yyyy')}</p>
                    </div>
                    {viewOrder.customerPhone && (
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium">{viewOrder.customerPhone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Meal Type:</span>
                      <p className="font-medium capitalize">{viewOrder.mealType}</p>
                    </div>
                    {viewOrder.customerAddress && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Address:</span>
                        <p className="font-medium">{viewOrder.customerAddress}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Source:</span>
                      <p className="font-medium capitalize">{viewOrder.source}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {viewOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-bold">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Financial Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Items Total:</span>
                      <span className="font-medium">₹{(viewOrder.totalPrice - viewOrder.deliveryCharge).toFixed(2)}</span>
                    </div>
                    {viewOrder.deliveryCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Delivery Charge:</span>
                        <span className="font-medium text-blue-600">+₹{viewOrder.deliveryCharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg">₹{viewOrder.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Cost:</span>
                      <span className="font-medium text-red-600">₹{viewOrder.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-green-700">Profit:</span>
                      <span className="font-bold text-lg text-green-600">₹{viewOrder.profit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Status</h3>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      viewOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      viewOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      viewOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {viewOrder.status.toUpperCase()}
                    </span>
                    <select
                      className="px-4 py-2 border rounded-lg font-medium"
                      value={viewOrder.status}
                      onChange={(e) => {
                        handleStatusChange(viewOrder.id, e.target.value);
                        setViewOrder({...viewOrder, status: e.target.value});
                      }}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                {viewOrder.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Notes</h3>
                    <p className="text-gray-700">{viewOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setViewOrder(null)}
                  className="flex-1 btn btn-secondary"
                >
                  Close
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this order?')) {
                      await handleDelete(viewOrder.id);
                      setViewOrder(null);
                    }
                  }}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShoppingCart({ size, className }: { size: number; className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

