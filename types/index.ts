export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  areaId?: string; // Link to delivery area
  createdAt: Date;
}

export interface DeliveryArea {
  id: string;
  name: string;
  color: string; // For map visualization
  description?: string;
  priority: number; // 1-5, for delivery sequence
  estimatedDeliveryTime: number; // in minutes
  createdAt: Date;
}

export interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: 'bike' | 'scooter' | 'cycle' | 'car';
  vehicleNumber?: string;
  address?: string;
  status: 'active' | 'inactive' | 'on-leave';
  joiningDate: Date;
  profilePhoto?: string;
  aadharNumber?: string;
  licenseNumber?: string;
  emergencyContact?: string;
  salary: number;
  incentivePerDelivery: number;
  workingHours?: string;
  rating: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Subscription {
  id: string;
  customerId: string;
  planType: 'daily' | 'weekly' | 'monthly';
  mealType: 'lunch' | 'dinner' | 'both';
  price: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'paused';
  createdAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  date: Date;
  mealType: 'lunch' | 'dinner' | 'both';
  items: OrderItem[];
  totalPrice: number;
  cost: number; // Cost to make the meal
  deliveryCharge: number; // Delivery charge for long distance
  profit: number; // Price - Cost + DeliveryCharge
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  source: 'whatsapp' | 'manual' | 'subscription';
  notes?: string;
  // Delivery fields
  areaId?: string;
  deliveryBoyId?: string;
  deliveryStatus: 'not-assigned' | 'assigned' | 'picked-up' | 'out-for-delivery' | 'delivered' | 'failed';
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  deliveryNotes?: string;
  deliveryProof?: string; // Photo URL or notes
  createdAt: Date;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  cost: number; // Cost to make
  category: 'veg' | 'non-veg' | 'special';
}

export interface Analytics {
  daily: DailyAnalytics;
  weekly: WeeklyAnalytics;
  monthly: MonthlyAnalytics;
  yearly: YearlyAnalytics;
}

export interface DailyAnalytics {
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  lunchCount: number;
  dinnerCount: number;
}

export interface WeeklyAnalytics {
  weekStart: Date;
  weekEnd: Date;
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  lunchCount: number;
  dinnerCount: number;
  dailyBreakdown: DailyAnalytics[];
}

export interface MonthlyAnalytics {
  month: number;
  year: number;
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  lunchCount: number;
  dinnerCount: number;
  weeklyBreakdown: WeeklyAnalytics[];
}

export interface YearlyAnalytics {
  year: number;
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  lunchCount: number;
  dinnerCount: number;
  monthlyBreakdown: MonthlyAnalytics[];
}

export interface Settings {
  id: string;
  businessName: string;
  contactNumber: string;
  businessAddress: string;
  email: string;
  newOrderNotifications: boolean;
  dailySummaryEmail: boolean;
  subscriptionExpiryAlerts: boolean;
  notificationEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

