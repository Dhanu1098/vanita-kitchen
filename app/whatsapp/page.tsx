'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Order, OrderItem } from '@/types';
import { MessageSquare, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function WhatsAppEntryPage() {
  const router = useRouter();
  const { customers, menuItems, addOrder, addCustomer } = useStore();
  const [orders, setOrders] = useState<any[]>([{
    id: Date.now().toString(),
    customerName: '',
    phone: '',
    address: '',
    mealType: 'lunch',
    items: [],
    deliveryCharge: 0,
    orderDate: new Date().toISOString().split('T')[0],
  }]);
  const [showSuggestions, setShowSuggestions] = useState<{[key: string]: boolean}>({});
  const [filteredCustomers, setFilteredCustomers] = useState<{[key: string]: any[]}>({});

  const handleAddOrder = () => {
    setOrders([...orders, {
      id: Date.now().toString(),
      customerName: '',
      phone: '',
      address: '',
      mealType: 'lunch',
      items: [],
      deliveryCharge: 0,
      orderDate: new Date().toISOString().split('T')[0],
    }]);
  };

  const handleRemoveOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const handleOrderChange = (id: string, field: string, value: any) => {
    setOrders(orders.map(o => o.id === id ? { ...o, [field]: value } : o));
    
    // Handle autocomplete for customer name
    if (field === 'customerName' && value.length > 0) {
      const matches = customers.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers({...filteredCustomers, [id]: matches});
      setShowSuggestions({...showSuggestions, [id]: matches.length > 0});
    } else if (field === 'customerName') {
      setShowSuggestions({...showSuggestions, [id]: false});
    }
  };

  const handleSelectCustomer = (orderId: string, customer: any) => {
    setOrders(orders.map(o => 
      o.id === orderId 
        ? { ...o, customerName: customer.name, phone: customer.phone, address: customer.address || '' } 
        : o
    ));
    setShowSuggestions({...showSuggestions, [orderId]: false});
  };

  const handleAddItem = (orderId: string) => {
    if (menuItems.length > 0) {
      const firstItem = menuItems[0];
      setOrders(orders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            items: [...o.items, {
              name: firstItem.name,
              quantity: 1,
              price: firstItem.price,
            }]
          };
        }
        return o;
      }));
    }
  };

  const handleRemoveItem = (orderId: string, itemIndex: number) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: o.items.filter((_: any, i: number) => i !== itemIndex)
        };
      }
      return o;
    }));
  };

  const handleItemChange = (orderId: string, itemIndex: number, field: string, value: any) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const newItems = [...o.items];
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
        
        // Update price based on selected menu item
        if (field === 'name') {
          const menuItem = menuItems.find(m => m.name === value);
          if (menuItem) {
            newItems[itemIndex].price = menuItem.price;
          }
        }
        
        return { ...o, items: newItems };
      }
      return o;
    }));
  };

  const calculateOrderTotal = (orderItems: OrderItem[], deliveryCharge: number = 0) => {
    const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cost = orderItems.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.name === item.name);
      return sum + ((menuItem?.cost || 0) * item.quantity);
    }, 0);
    const finalTotal = totalPrice + deliveryCharge;
    return { totalPrice: finalTotal, cost, deliveryCharge, profit: finalTotal - cost };
  };

  const handleSubmitAll = async () => {
    try {
      let successCount = 0;
      let skippedCount = 0;

      for (const order of orders) {
        console.log('Processing order:', {
          customerName: order.customerName,
          itemsCount: order.items?.length || 0,
          items: order.items,
          orderDate: order.orderDate,
          deliveryCharge: order.deliveryCharge
        });

        // Skip empty orders (no customer name or no items)
        if (!order.customerName || !order.items || order.items.length === 0) {
          console.log('Skipping order - missing data');
          skippedCount++;
          continue;
        }

        try {
          const { totalPrice, cost, deliveryCharge, profit } = calculateOrderTotal(order.items, order.deliveryCharge || 0);

          // Check if customer exists, if not create one
          let customer = customers.find(c => c.phone === order.phone);
          if (!customer && order.phone) {
            try {
              await addCustomer({
                name: order.customerName,
                phone: order.phone,
                address: '',
              });
              // Wait a bit for customer to be created
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (err) {
              console.error('Error creating customer:', err);
            }
          }

          // Create order with selected date
          const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
          await addOrder({
            customerId: customer?.id || null,
            customerName: order.customerName,
            customerPhone: order.phone || '',
            customerAddress: order.address || '',
            date: orderDate,
            mealType: order.mealType,
            items: order.items,
            totalPrice,
            cost,
            deliveryCharge,
            profit,
            status: 'confirmed' as const,
            source: 'whatsapp' as const,
            notes: order.deliveryCharge > 0 ? `Order from WhatsApp (Delivery Charge: ₹${order.deliveryCharge})` : 'Order from WhatsApp',
            deliveryStatus: 'not-assigned' as const,
          });
          
          console.log('✅ Order added successfully');
          successCount++;
        } catch (err: any) {
          console.error('❌ Error creating order:', err);
          const errorMsg = err?.message || JSON.stringify(err);
          alert(`Error adding order for ${order.customerName}: ${errorMsg}`);
        }
      }

      console.log(`Processed: ${successCount} successful, ${skippedCount} skipped`);

      if (successCount > 0) {
        const message = skippedCount > 0 
          ? `✅ ${successCount} order(s) added successfully! (${skippedCount} empty order(s) skipped)`
          : `✅ ${successCount} order(s) added successfully!`;
        alert(message);
        router.push('/');
      } else {
        alert('⚠️ No orders were added. Please fill customer name and add items to at least one order.');
      }
    } catch (error) {
      console.error('Error submitting orders:', error);
      alert('Error adding orders. Please check console for details.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare size={32} className="text-green-600" />
                <h1 className="text-3xl font-bold text-gray-900">WhatsApp Order Entry</h1>
              </div>
              <p className="text-gray-600">Quickly add multiple orders from WhatsApp confirmations</p>
            </div>
            <button 
              onClick={handleAddOrder}
              className="btn btn-primary flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add Another Order
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="card bg-green-50 border-l-4 border-green-600 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Quick Entry Mode:</strong> Add multiple orders at once from WhatsApp confirmations.
          </p>
          <ul className="text-sm text-gray-700 mt-2 space-y-1">
            <li>✅ <strong>Type customer name</strong> to see suggestions (auto-fills phone & address)</li>
            <li>✅ Add <strong>Complete Delivery Address</strong> for navigation</li>
            <li>✅ Select <strong>Order Date</strong> for old data entry</li>
            <li>✅ Add items and click "Submit All Orders"</li>
          </ul>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order, orderIndex) => (
            <div key={order.id} className="card border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order #{orderIndex + 1}</h3>
                {orders.length > 1 && (
                  <button 
                    onClick={() => handleRemoveOrder(order.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label className="label">Customer Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={order.customerName}
                    onChange={(e) => handleOrderChange(order.id, 'customerName', e.target.value)}
                    onFocus={() => {
                      if (order.customerName && filteredCustomers[order.id]?.length > 0) {
                        setShowSuggestions({...showSuggestions, [order.id]: true});
                      }
                    }}
                    placeholder="Type customer name..."
                    autoComplete="off"
                  />
                  {showSuggestions[order.id] && filteredCustomers[order.id]?.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCustomers[order.id].map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => handleSelectCustomer(order.id, customer)}
                          className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    value={order.phone}
                    onChange={(e) => handleOrderChange(order.id, 'phone', e.target.value)}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="label">Delivery Address *</label>
                <input
                  type="text"
                  className="input"
                  value={order.address}
                  onChange={(e) => handleOrderChange(order.id, 'address', e.target.value)}
                  placeholder="Complete delivery address (House/Flat, Street, Area, City)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label">Order Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={order.orderDate}
                    onChange={(e) => handleOrderChange(order.id, 'orderDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Meal Type *</label>
                  <select
                    className="input"
                    value={order.mealType}
                    onChange={(e) => handleOrderChange(order.id, 'mealType', e.target.value)}
                  >
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="label">Delivery Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="input"
                    value={order.deliveryCharge}
                    onChange={(e) => handleOrderChange(order.id, 'deliveryCharge', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Order Items</label>
                  <button
                    type="button"
                    onClick={() => handleAddItem(order.id)}
                    className="text-sm px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 flex items-center"
                  >
                    <Plus size={14} className="mr-1" />
                    Add Item
                  </button>
                </div>

                {order.items.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                    No items added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {order.items.map((item: OrderItem, itemIndex: number) => (
                      <div key={itemIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <select
                            className="input"
                            value={item.name}
                            onChange={(e) => handleItemChange(order.id, itemIndex, 'name', e.target.value)}
                          >
                            {menuItems.map((menuItem) => (
                              <option key={menuItem.id} value={menuItem.name}>
                                {menuItem.name} - ₹{menuItem.price}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            className="input"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(order.id, itemIndex, 'quantity', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="w-24 font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(order.id, itemIndex)}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {order.items.length > 0 && (
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Items Total:</span>
                    <span className="font-semibold">
                      ₹{order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  {order.deliveryCharge > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span>Delivery Charge:</span>
                      <span className="font-semibold text-blue-600">
                        +₹{order.deliveryCharge.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{calculateOrderTotal(order.items, order.deliveryCharge).totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleSubmitAll}
            className="btn btn-primary flex items-center text-lg px-8 py-3"
          >
            <CheckCircle size={24} className="mr-2" />
            Submit All Orders ({orders.length})
          </button>
          <button 
            onClick={() => router.push('/orders')}
            className="btn btn-secondary px-8 py-3"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

