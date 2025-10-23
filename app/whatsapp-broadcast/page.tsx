'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Send, Users, MessageCircle, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Customer } from '@/types';

export default function WhatsAppBroadcastPage() {
  const { customers, fetchCustomers, loading } = useStore();
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'sending' | 'completed'>('idle');
  const [sentCount, setSentCount] = useState(0);
  const [currentCustomer, setCurrentCustomer] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers with phone numbers
  const customersWithPhone = customers.filter(c => c.phone && c.phone.trim() !== '');
  
  // Search filter
  const filteredCustomers = customersWithPhone.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Toggle selection
  const toggleCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  // Select all
  const selectAll = () => {
    setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedCustomers(new Set());
  };

  // Get selected customer objects
  const selectedCustomerList = customers.filter(c => selectedCustomers.has(c.id));

  // Auto broadcast with WhatsApp Web
  const startAutoBroadcast = async () => {
    if (selectedCustomers.size === 0) {
      alert('कृपया कम से कम एक customer select करें!');
      return;
    }

    if (!message.trim()) {
      alert('कृपया message लिखें!');
      return;
    }

    const confirmMsg = `${selectedCustomers.size} customers को message भेजना है?\n\n⚠️ How it works:\n1. हर customer के लिए WhatsApp Web खुलेगा\n2. Message automatically draft होगा\n3. आप Send button (➤) दबाएं\n4. Next customer automatically आएगा\n\n⏱️ Time: ${selectedCustomers.size} customers = ${Math.ceil(selectedCustomers.size * 0.5)} minutes\n\nReady?`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    setBroadcastStatus('sending');
    setSentCount(0);

    // Start sending one by one
    let count = 0;
    for (const customer of selectedCustomerList) {
      setCurrentCustomer(customer.name);
      
      // Format phone number
      let phone = customer.phone.replace(/\D/g, '');
      if (!phone.startsWith('91') && phone.length === 10) {
        phone = '91' + phone;
      }

      // Create WhatsApp link with message pre-filled
      const encodedMsg = encodeURIComponent(message);
      const link = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMsg}`;
      
      // Open new tab/window for this customer
      const customerWindow = window.open(link, '_blank', 'noopener,noreferrer');
      
      if (!customerWindow) {
        const retry = confirm(
          `❌ Pop-up blocked for ${customer.name}!\n\n` +
          `Please:\n` +
          `1. Allow pop-ups for this site\n` +
          `2. Click OK to retry\n` +
          `3. Or Cancel to skip this customer`
        );
        
        if (retry) {
          // Retry opening
          const retryWindow = window.open(link, '_blank', 'noopener,noreferrer');
          if (!retryWindow) {
            alert('Still blocked! Please check browser settings.');
            continue;
          }
        } else {
          continue;
        }
      }

      count++;
      setSentCount(count);

      // Wait for user to send message
      const shouldContinue = await new Promise<boolean>((resolve) => {
        const userResponse = confirm(
          `📱 ${customer.name} (${customer.phone})\n\n` +
          `✅ WhatsApp खुल गया है!\n` +
          `Message draft हो गया है।\n\n` +
          `👉 Send button (➤) दबाएं WhatsApp में\n` +
          `👉 फिर यहाँ OK दबाएं next customer के लिए\n\n` +
          `Progress: ${count}/${selectedCustomers.size}\n\n` +
          `Cancel = Stop broadcasting`
        );
        resolve(userResponse);
      });

      if (!shouldContinue) {
        alert(`⏹️ Broadcasting stopped at ${count}/${selectedCustomers.size} customers.`);
        break;
      }

      // Small delay before next
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setBroadcastStatus('completed');
    setCurrentCustomer('');
    alert(`🎉 Complete! ${count} customers को message भेज दिया!\n\nAll WhatsApp tabs अब close कर सकते हैं।`);
  };

  // Message templates
  const templates = [
    {
      title: 'Daily Menu',
      text: '🍱 आज का Special Menu:\n\nLunch:\n- Dal Rice\n- Roti Sabji\n- Salad\n\nDinner:\n- Paneer Sabji\n- Roti\n- Rice\n\nOrder करने के लिए reply करें! 🙏'
    },
    {
      title: 'Offer/Promotion',
      text: '🎉 Special Offer!\n\nइस महीने subscription लेने पर 10% छूट!\n\nजल्दी करें, सीमित समय के लिए!\n\nज्यादा जानकारी के लिए reply करें। 🙏'
    },
    {
      title: 'Holiday Notice',
      text: '📢 सूचना\n\nकल Sunday होने के कारण tiffin service बंद रहेगी।\n\nMonday से फिर शुरू होगी।\n\nधन्यवाद! 🙏'
    },
    {
      title: 'Payment Reminder',
      text: '💰 Payment Reminder\n\nआपकी पिछली payment pending है।\n\nकृपया जल्दी से जल्दी payment कर दें।\n\nधन्यवाद! 🙏'
    }
  ];

  const useTemplate = (text: string) => {
    setMessage(text);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={32} className="text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Broadcast</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Customer Selection */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
                <div className="text-center">
                  <Users className="mx-auto mb-2 text-blue-600" size={24} />
                  <p className="text-2xl font-bold text-gray-900">{customersWithPhone.length}</p>
                  <p className="text-sm text-gray-600">Total Customers</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
                  <p className="text-2xl font-bold text-green-600">{selectedCustomers.size}</p>
                  <p className="text-sm text-gray-600">Selected</p>
                </div>
                <div className="text-center">
                  <Send className="mx-auto mb-2 text-purple-600" size={24} />
                  <p className="text-2xl font-bold text-purple-600">{sentCount}</p>
                  <p className="text-sm text-gray-600">Sent</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={selectAll}
                  className="btn btn-secondary text-sm"
                >
                  Select All ({filteredCustomers.length})
                </button>
                <button
                  onClick={deselectAll}
                  className="btn btn-secondary text-sm"
                >
                  Deselect All
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Customer List */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No customers found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredCustomers.map((customer) => (
                      <label
                        key={customer.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer.id)}
                          onChange={() => toggleCustomer(customer.id)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Message Composer */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">📝 Compose Message</h3>

              {/* Message Templates */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quick Templates:
                </label>
                <div className="space-y-2">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => useTemplate(template.text)}
                      className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded text-blue-700 transition-colors"
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-4">
                <label className="label">Your Message:</label>
                <textarea
                  className="input min-h-[200px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="अपना message यहाँ लिखें...

Example:
🍱 आज का Special Menu:
- Dal Rice
- Roti Sabji
- Salad

Order के लिए reply करें! 🙏"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length} characters
                </p>
              </div>

              {/* Preview */}
              {message && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                  <div className="text-sm whitespace-pre-wrap text-gray-900">
                    {message}
                  </div>
                </div>
              )}

              {/* Broadcast Button */}
              <button
                onClick={startAutoBroadcast}
                disabled={selectedCustomers.size === 0 || !message.trim() || broadcastStatus === 'sending'}
                className="btn btn-primary w-full flex items-center justify-center gap-3 text-lg py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Zap size={24} />
                {broadcastStatus === 'sending' 
                  ? `Sending... ${sentCount}/${selectedCustomers.size}`
                  : `🚀 Auto Broadcast (${selectedCustomers.size})`
                }
              </button>

              {/* Progress */}
              {broadcastStatus === 'sending' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-300">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress:</span>
                    <span className="font-bold text-blue-600">{sentCount}/{selectedCustomers.size}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-green-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(sentCount / selectedCustomers.size) * 100}%` }}
                    />
                  </div>
                  {currentCustomer && (
                    <p className="text-sm text-gray-700 text-center animate-pulse">
                      📱 Sending to: <strong>{currentCustomer}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Completed */}
              {broadcastStatus === 'completed' && (
                <div className="mt-4 p-4 bg-green-100 rounded-lg border-2 border-green-400">
                  <p className="text-center">
                    <span className="text-3xl">🎉</span>
                    <br />
                    <span className="text-green-800 font-bold">
                      All Done! {sentCount} messages sent successfully!
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      setBroadcastStatus('idle');
                      setSentCount(0);
                      setSelectedCustomers(new Set());
                      setMessage('');
                    }}
                    className="btn btn-secondary w-full mt-3"
                  >
                    Start New Broadcast
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

