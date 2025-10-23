'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useStore } from '@/store/useStore';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Bike,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  IndianRupee,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { DeliveryBoy } from '@/types';

export default function DeliveryStaffPage() {
  const { deliveryBoys, addDeliveryBoy, updateDeliveryBoy, deleteDeliveryBoy, fetchDeliveryBoys, loading } = useStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBoy, setSelectedBoy] = useState<DeliveryBoy | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'on-leave'>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'bike' as 'bike' | 'scooter' | 'cycle' | 'car',
    vehicleNumber: '',
    address: '',
    status: 'active' as 'active' | 'inactive' | 'on-leave',
    salary: 15000,
    incentivePerDelivery: 10,
    workingHours: '9:00 AM - 6:00 PM',
    aadharNumber: '',
    licenseNumber: '',
    emergencyContact: '',
    notes: '',
  });

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleType: 'bike',
      vehicleNumber: '',
      address: '',
      status: 'active',
      salary: 15000,
      incentivePerDelivery: 10,
      workingHours: '9:00 AM - 6:00 PM',
      aadharNumber: '',
      licenseNumber: '',
      emergencyContact: '',
      notes: '',
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDeliveryBoy({
        ...formData,
        joiningDate: new Date(),
        rating: 5.0,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
      });
      setShowAddModal(false);
      resetForm();
      alert('✅ Delivery boy added successfully!');
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoy) return;
    
    try {
      await updateDeliveryBoy(selectedBoy.id, {
        ...formData,
        joiningDate: selectedBoy.joiningDate,
      });
      setShowEditModal(false);
      setSelectedBoy(null);
      resetForm();
      alert('✅ Delivery boy updated successfully!');
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
      await deleteDeliveryBoy(id);
      alert('✅ Delivery boy deleted successfully!');
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const openEditModal = (boy: DeliveryBoy) => {
    setSelectedBoy(boy);
    setFormData({
      name: boy.name,
      phone: boy.phone,
      email: boy.email || '',
      vehicleType: boy.vehicleType,
      vehicleNumber: boy.vehicleNumber || '',
      address: boy.address || '',
      status: boy.status,
      salary: boy.salary,
      incentivePerDelivery: boy.incentivePerDelivery,
      workingHours: boy.workingHours || '9:00 AM - 6:00 PM',
      aadharNumber: boy.aadharNumber || '',
      licenseNumber: boy.licenseNumber || '',
      emergencyContact: boy.emergencyContact || '',
      notes: boy.notes || '',
    });
    setShowEditModal(true);
  };

  const filteredBoys = filterStatus === 'all' 
    ? deliveryBoys 
    : deliveryBoys.filter(boy => boy.status === filterStatus);

  const stats = {
    total: deliveryBoys.length,
    active: deliveryBoys.filter(b => b.status === 'active').length,
    inactive: deliveryBoys.filter(b => b.status === 'inactive').length,
    onLeave: deliveryBoys.filter(b => b.status === 'on-leave').length,
    totalDeliveries: deliveryBoys.reduce((sum, b) => sum + b.totalDeliveries, 0),
    avgRating: deliveryBoys.length > 0 
      ? (deliveryBoys.reduce((sum, b) => sum + b.rating, 0) / deliveryBoys.length).toFixed(1)
      : '0.0',
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      'on-leave': 'bg-yellow-100 text-yellow-800',
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };

  const getVehicleIcon = (type: string) => {
    return <Bike size={16} className="text-gray-600" />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Delivery Staff</h1>
              <p className="text-gray-600 mt-2">Manage your delivery team</p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <UserPlus size={20} />
              Add Delivery Boy
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="card bg-blue-50 border-l-4 border-blue-600 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-600 font-semibold">Total Staff</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mt-0.5 sm:mt-1">{stats.total}</p>
              </div>
              <UserPlus className="text-blue-600" size={28} />
            </div>
          </div>

          <div className="card bg-green-50 border-l-4 border-green-600 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-green-600 font-semibold">Active</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 mt-0.5 sm:mt-1">{stats.active}</p>
              </div>
              <CheckCircle className="text-green-600" size={28} />
            </div>
          </div>

          <div className="card bg-purple-50 border-l-4 border-purple-600 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-purple-600 font-semibold">Deliveries</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 mt-0.5 sm:mt-1">{stats.totalDeliveries}</p>
              </div>
              <TrendingUp className="text-purple-600" size={28} />
            </div>
          </div>

          <div className="card bg-orange-50 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-semibold">Avg Rating</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{stats.avgRating}</p>
              </div>
              <Star className="text-orange-600" size={40} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <label className="label mb-0">Filter:</label>
            <div className="flex gap-2">
              {(['all', 'active', 'inactive', 'on-leave'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery Boys List */}
        {loading ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : filteredBoys.length === 0 ? (
          <div className="card text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No delivery boys found</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary mt-4"
            >
              Add Your First Delivery Boy
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBoys.map((boy) => (
              <div key={boy.id} className="card hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {boy.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{boy.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusBadge(boy.status)}`}>
                        {boy.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(boy)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(boy.id, boy.name)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-700">{boy.phone}</span>
                  </div>
                  {boy.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-700">{boy.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    {getVehicleIcon(boy.vehicleType)}
                    <span className="text-gray-700 capitalize">{boy.vehicleType}</span>
                    {boy.vehicleNumber && <span className="text-gray-500">({boy.vehicleNumber})</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-700">Joined: {format(boy.joiningDate, 'dd MMM yyyy')}</span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                      <Star size={16} fill="currentColor" />
                      <span className="text-lg font-bold">{boy.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{boy.totalDeliveries}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{boy.successfulDeliveries}</p>
                    <p className="text-xs text-gray-600">Success</p>
                  </div>
                </div>

                {/* Salary & Incentive */}
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-green-600" />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">₹{boy.salary}</span> /month
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    +₹{boy.incentivePerDelivery} per delivery
                  </div>
                </div>

                {boy.address && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{boy.address}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">Add Delivery Boy</h2>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="Rahul Kumar"
                    />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      placeholder="rahul@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Emergency Contact</label>
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="input"
                      placeholder="9876543211"
                    />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                      className="input"
                    >
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="cycle">Cycle</option>
                      <option value="car">Car</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Vehicle Number</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      className="input"
                      placeholder="MH-12-AB-1234"
                    />
                  </div>
                </div>

                {/* Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Aadhar Number</label>
                    <input
                      type="text"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                      className="input"
                      placeholder="1234 5678 9012"
                    />
                  </div>
                  <div>
                    <label className="label">License Number</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="input"
                      placeholder="DL-1234567890"
                    />
                  </div>
                </div>

                {/* Salary & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Incentive/Delivery (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.incentivePerDelivery}
                      onChange={(e) => setFormData({ ...formData, incentivePerDelivery: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="label">Working Hours</label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    className="input"
                    placeholder="9:00 AM - 6:00 PM"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="label">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="Full address..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="Any additional notes..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Add Delivery Boy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
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

        {/* Edit Modal - Same as Add Modal but with update */}
        {showEditModal && selectedBoy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Delivery Boy</h2>
              </div>
              <form onSubmit={handleEdit} className="p-6 space-y-4">
                {/* Same fields as Add Modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Emergency Contact</label>
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                      className="input"
                    >
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="cycle">Cycle</option>
                      <option value="car">Car</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Vehicle Number</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Aadhar Number</label>
                    <input
                      type="text"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">License Number</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Incentive/Delivery (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.incentivePerDelivery}
                      onChange={(e) => setFormData({ ...formData, incentivePerDelivery: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Working Hours</label>
                  <input
                    type="text"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Update Delivery Boy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedBoy(null);
                      resetForm();
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

