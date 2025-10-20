'use client';

import Sidebar from '@/components/Sidebar';
import { MessageSquare, CheckCircle, Zap, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export default function WhatsAppGuidePage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare size={32} className="text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Integration Guide</h1>
          </div>
          <p className="text-gray-600">Complete guide for WhatsApp order management</p>
        </div>

        {/* Current Method */}
        <div className="card mb-6 border-l-4 border-green-600">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Zap size={24} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Current Method: Quick Manual Entry</h2>
              <p className="text-gray-700 mb-4">
                Currently, the "WhatsApp Entry" page allows you to quickly enter orders from WhatsApp messages.
                This is the <strong>fastest and FREE</strong> way to manage WhatsApp orders without any API setup.
              </p>
              <a href="/whatsapp" className="btn btn-primary inline-block">
                Go to WhatsApp Entry
              </a>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">कैसे Use करें? (How to Use)</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">WhatsApp पर Orders Check करें</h3>
                <p className="text-gray-600">Apne WhatsApp messages check karo aur dekho kitne orders aaye hain</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">System में "WhatsApp Entry" Page खोलें</h3>
                <p className="text-gray-600">Sidebar se "WhatsApp Entry" option pe click karo</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Customer Details WhatsApp से Copy करें</h3>
                <p className="text-gray-600">Customer ka naam, phone number copy-paste karo</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Meal Type और Items Select करें</h3>
                <p className="text-gray-600">Lunch/Dinner select karo aur menu items add karo</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold mb-1">Multiple Orders एक साथ Add करें</h3>
                <p className="text-gray-600">"Add Another Order" button se aur orders add kar sakte ho</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                6
              </div>
              <div>
                <h3 className="font-semibold mb-1">Submit All Orders</h3>
                <p className="text-gray-600">Sab orders ek saath submit ho jayenge aur profit calculation automatic hoga!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-green-600" />
              <h3 className="font-semibold">100% FREE</h3>
            </div>
            <p className="text-sm text-gray-600">Koi API charges nahi, koi subscription nahi</p>
          </div>
          
          <div className="card bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} className="text-blue-600" />
              <h3 className="font-semibold">Super Fast</h3>
            </div>
            <p className="text-sm text-gray-600">10-15 orders in just 2-3 minutes entry</p>
          </div>
          
          <div className="card bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-purple-600" />
              <h3 className="font-semibold">Easy to Use</h3>
            </div>
            <p className="text-sm text-gray-600">No technical knowledge required</p>
          </div>
        </div>

        {/* Advanced Integration Options */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Advanced Integration Options (Future)</h2>
          <p className="text-gray-600 mb-4">
            Agar aapko fully automatic WhatsApp integration chahiye (messages automatically read ho aur orders create ho), 
            to yeh options hain:
          </p>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">WhatsApp Business API (Official)</h3>
                  <p className="text-sm text-gray-600">Official Meta approved integration</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  Paid
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mt-3">
                <li>✅ Fully automated message reading</li>
                <li>✅ Send automated replies to customers</li>
                <li>✅ Official and reliable</li>
                <li>⚠️ Requires Meta approval (15-30 days)</li>
                <li>⚠️ Cost: ₹0.25-1 per message</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">Third-Party Services (WATI, Twilio, Interakt)</h3>
                  <p className="text-sm text-gray-600">Easy to setup, managed services</p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  Subscription
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mt-3">
                <li>✅ Quick setup (1-2 days)</li>
                <li>✅ Support team available</li>
                <li>✅ Built-in features</li>
                <li>⚠️ Monthly cost: ₹1000-2500</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-red-900">Unofficial Automation (Not Recommended)</h3>
                  <p className="text-sm text-red-700 mt-1">
                    WhatsApp Web automation tools exist but violate WhatsApp Terms of Service. 
                    Your number can be banned. <strong>Not recommended for business use.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="card bg-primary-50 border-l-4 border-primary-600">
          <h2 className="text-xl font-bold mb-2">हमारी Recommendation</h2>
          <p className="text-gray-700 mb-3">
            <strong>Abhi ke liye Manual Entry method best hai</strong> kyunki:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Completely FREE - koi charges nahi</li>
            <li>✅ Fast - 2-3 minutes mein 15 orders entry ho jayegi</li>
            <li>✅ No approval needed - turant start kar sakte ho</li>
            <li>✅ Full control - aap verify kar sakte ho har order ko</li>
            <li>✅ No risk - account ban hone ka dar nahi</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Jab aapka business badhega aur daily 50+ orders honge, tab automatic integration ke baare mein soch sakte ho.
          </p>
        </div>

        <div className="mt-6 text-center">
          <a href="/whatsapp" className="btn btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
            <MessageSquare size={24} />
            Start Adding Orders from WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

