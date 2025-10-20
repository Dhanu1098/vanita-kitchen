'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Order, OrderItem } from '@/types';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function NewOrderPage() {
  const router = useRouter();
  const { customers, menuItems, addOrder } = useStore();
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch' as 'lunch' | 'dinner' | 'both',
    status: 'confirmed' as 'confirmed' | 'delivered' | 'cancelled',
    source: 'manual' as 'whatsapp' | 'manual' | 'subscription',
    deliveryCharge: 0,
    notes: '',
  });
  const [items, setItems] = useState<OrderItem[]>([]);

  const handleAddItem = () => {
    if (menuItems.length > 0) {
      const firstItem = menuItems[0];
      setItems([...items, {
        name: firstItem.name,
        quantity: 1,
        price: firstItem.price,
      }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Update price based on selected menu item
    if (field === 'name') {
      const menuItem = menuItems.find(m => m.name === value);
      if (menuItem) {
        newItems[index].price = menuItem.price;
      }
    }
    
    setItems(newItems);
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData({
      ...formData,
      customerId,
      customerName: customer?.name || '',
      customerPhone: customer?.phone || '',
      customerAddress: customer?.address || '',
    });
  };

  const calculateTotals = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cost = items.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.name === item.name);
      return sum + ((menuItem?.cost || 0) * item.quantity);
    }, 0);
    const totalPrice = itemsTotal + formData.deliveryCharge;
    return { itemsTotal, totalPrice, cost, deliveryCharge: formData.deliveryCharge, profit: totalPrice - cost };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || items.length === 0) {
      alert('Please fill all required fields and add at least one item');
      return;
    }

    const { totalPrice, cost, deliveryCharge, profit } = calculateTotals();

    const newOrder = {
      customerId: formData.customerId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      date: new Date(formData.date),
      mealType: formData.mealType,
      items,
      totalPrice,
      cost,
      deliveryCharge,
      profit,
      status: formData.status,
      source: formData.source,
      notes: formData.notes,
      deliveryStatus: 'not-assigned' as const,
    };

    await addOrder(newOrder);
    router.push('/orders');
  };

  const { itemsTotal, totalPrice, cost, deliveryCharge, profit } = calculateTotals();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Order</h1>
          <p className="text-gray-600 mt-2">Create a new order entry</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Select Customer</label>
                <select
                  className="input"
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Or Enter Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Customer phone"
                />
              </div>
              <div>
                <label className="label">Delivery Address</label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  placeholder="Delivery address"
                />
              </div>
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
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
                <label className="label">Status *</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
                <div>
                  <label className="label">Source</label>
                  <select
                    className="input"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                  >
                    <option value="manual">Manual</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
                <div>
                  <label className="label">Delivery Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="input"
                    value={formData.deliveryCharge}
                    onChange={(e) => setFormData({ ...formData, deliveryCharge: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special notes..."
              />
            </div>
          </div>

          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-primary flex items-center text-sm"
              >
                <Plus size={16} className="mr-1" />
                Add Item
              </button>
            </div>
            
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No items added yet. Click "Add Item" to start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <select
                        className="input"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      >
                        {menuItems.map((menuItem) => (
                          <option key={menuItem.id} value={menuItem.name}>
                            {menuItem.name} - ₹{menuItem.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        className="input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        className="input"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                        placeholder="Price"
                      />
                    </div>
                    <div className="w-32 font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card mb-6 bg-primary-50">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Items Total:</span>
                <span className="font-bold">₹{itemsTotal.toFixed(2)}</span>
              </div>
              {deliveryCharge > 0 && (
                <div className="flex justify-between text-lg">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-blue-600">+₹{deliveryCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg border-t pt-2">
                <span>Total Price:</span>
                <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Total Cost:</span>
                <span className="font-bold text-red-600">₹{cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl border-t pt-3">
                <span className="font-semibold">Profit:</span>
                <span className="font-bold text-green-600">₹{profit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary">
              Create Order
            </button>
            <button 
              type="button" 
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

