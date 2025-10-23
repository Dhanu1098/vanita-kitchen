import { create } from 'zustand';
import { Customer, Order, Subscription, MenuItem, Settings, DeliveryArea, DeliveryBoy } from '@/types';
import { supabase } from '@/lib/supabase';

interface StoreState {
  customers: Customer[];
  orders: Order[];
  subscriptions: Subscription[];
  menuItems: MenuItem[];
  settings: Settings | null;
  deliveryAreas: DeliveryArea[];
  deliveryBoys: DeliveryBoy[];
  loading: boolean;
  
  // Fetch data
  fetchCustomers: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  fetchAll: () => Promise<void>;
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Subscription actions
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => Promise<void>;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  
  // Menu actions
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  
  // Settings actions
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  
  // Delivery Area actions
  fetchDeliveryAreas: () => Promise<void>;
  addDeliveryArea: (area: Omit<DeliveryArea, 'id' | 'createdAt'>) => Promise<void>;
  updateDeliveryArea: (id: string, area: Partial<DeliveryArea>) => Promise<void>;
  deleteDeliveryArea: (id: string) => Promise<void>;
  
  // Delivery Boy actions
  fetchDeliveryBoys: () => Promise<void>;
  addDeliveryBoy: (boy: Omit<DeliveryBoy, 'id' | 'createdAt'>) => Promise<void>;
  updateDeliveryBoy: (id: string, boy: Partial<DeliveryBoy>) => Promise<void>;
  deleteDeliveryBoy: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>()((set, get) => ({
  customers: [],
  orders: [],
  subscriptions: [],
  menuItems: [],
  settings: null,
  deliveryAreas: [],
  deliveryBoys: [],
  loading: false,
  
  // Fetch all data
  fetchAll: async () => {
    await Promise.all([
      get().fetchCustomers(),
      get().fetchOrders(),
      get().fetchSubscriptions(),
      get().fetchMenuItems(),
      get().fetchSettings(),
      get().fetchDeliveryAreas(),
      get().fetchDeliveryBoys(),
    ]);
  },
  
  // Fetch Customers
  fetchCustomers: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const customers = data.map((c: any) => ({
        ...c,
        createdAt: new Date(c.created_at),
      }));
      
      set({ customers, loading: false });
    } catch (error) {
      console.error('Error fetching customers:', error);
      set({ loading: false });
    }
  },
  
  // Fetch Orders
  fetchOrders: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      console.log('Fetched orders:', data);
      
      const orders = data.map((o: any) => ({
        id: o.id,
        customerId: o.customer_id || '',
        customerName: o.customer_name,
        customerPhone: o.customer_phone || '',
        customerAddress: o.customer_address || '',
        date: new Date(o.date),
        mealType: o.meal_type,
        items: o.items,
        totalPrice: parseFloat(o.total_price),
        cost: parseFloat(o.cost),
        deliveryCharge: parseFloat(o.delivery_charge || 0),
        profit: parseFloat(o.profit),
        status: o.status,
        source: o.source,
        notes: o.notes || '',
        areaId: o.area_id || undefined,
        deliveryBoyId: o.delivery_boy_id || undefined,
        deliveryStatus: o.delivery_status || 'not-assigned',
        assignedAt: o.assigned_at ? new Date(o.assigned_at) : undefined,
        pickedUpAt: o.picked_up_at ? new Date(o.picked_up_at) : undefined,
        deliveredAt: o.delivered_at ? new Date(o.delivered_at) : undefined,
        deliveryNotes: o.delivery_notes || '',
        deliveryProof: o.delivery_proof || '',
        createdAt: new Date(o.created_at),
      }));
      
      set({ orders, loading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ orders: [], loading: false });
    }
  },
  
  // Fetch Subscriptions
  fetchSubscriptions: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const subscriptions = data.map((s: any) => ({
        ...s,
        customerId: s.customer_id,
        planType: s.plan_type,
        mealType: s.meal_type,
        startDate: new Date(s.start_date),
        endDate: new Date(s.end_date),
        createdAt: new Date(s.created_at),
        price: parseFloat(s.price),
      }));
      
      set({ subscriptions, loading: false });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      set({ loading: false });
    }
  },
  
  // Fetch Menu Items
  fetchMenuItems: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const menuItems = data.map((m: any) => ({
        ...m,
        price: parseFloat(m.price),
        cost: parseFloat(m.cost),
      }));
      
      set({ menuItems, loading: false });
    } catch (error) {
      console.error('Error fetching menu items:', error);
      set({ loading: false });
    }
  },
  
  // Customer actions
  addCustomer: async (customer) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();
      
      if (error) throw error;
      
      await get().fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },
  
  updateCustomer: async (id, customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },
  
  deleteCustomer: async (id) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },
  
  // Order actions
  addOrder: async (order) => {
    try {
      const orderData: any = {
        customer_id: order.customerId || null,
        customer_name: order.customerName,
        customer_phone: order.customerPhone || '',
        customer_address: order.customerAddress || '',
        date: order.date.toISOString().split('T')[0],
        meal_type: order.mealType,
        items: order.items,
        total_price: order.totalPrice,
        cost: order.cost,
        delivery_charge: order.deliveryCharge || 0,
        profit: order.profit,
        status: order.status,
        source: order.source,
        notes: order.notes || '',
        delivery_status: order.deliveryStatus || 'not-assigned',
      };
      
      // Only add these fields if they exist (optional columns)
      if (order.areaId !== undefined) {
        orderData.area_id = order.areaId;
      }
      if (order.deliveryBoyId !== undefined) {
        orderData.delivery_boy_id = order.deliveryBoyId;
      }
      
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Order added successfully:', data);
      
      await get().fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },
  
  updateOrder: async (id, order) => {
    try {
      const updateData: any = {};
      if (order.customerId !== undefined) updateData.customer_id = order.customerId;
      if (order.customerName !== undefined) updateData.customer_name = order.customerName;
      if (order.customerPhone !== undefined) updateData.customer_phone = order.customerPhone;
      if (order.customerAddress !== undefined) updateData.customer_address = order.customerAddress;
      if (order.date !== undefined) updateData.date = order.date;
      if (order.mealType !== undefined) updateData.meal_type = order.mealType;
      if (order.items !== undefined) updateData.items = order.items;
      if (order.totalPrice !== undefined) updateData.total_price = order.totalPrice;
      if (order.cost !== undefined) updateData.cost = order.cost;
      if (order.deliveryCharge !== undefined) updateData.delivery_charge = order.deliveryCharge;
      if (order.profit !== undefined) updateData.profit = order.profit;
      if (order.status !== undefined) updateData.status = order.status;
      if (order.source !== undefined) updateData.source = order.source;
      if (order.notes !== undefined) updateData.notes = order.notes;
      if (order.areaId !== undefined) updateData.area_id = order.areaId;
      if (order.deliveryBoyId !== undefined) updateData.delivery_boy_id = order.deliveryBoyId;
      if (order.deliveryStatus !== undefined) updateData.delivery_status = order.deliveryStatus;
      if (order.assignedAt !== undefined) updateData.assigned_at = order.assignedAt;
      if (order.pickedUpAt !== undefined) updateData.picked_up_at = order.pickedUpAt;
      if (order.deliveredAt !== undefined) updateData.delivered_at = order.deliveredAt;
      if (order.deliveryNotes !== undefined) updateData.delivery_notes = order.deliveryNotes;
      if (order.deliveryProof !== undefined) updateData.delivery_proof = order.deliveryProof;
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },
  
  deleteOrder: async (id) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },
  
  // Subscription actions
  addSubscription: async (subscription) => {
    try {
      const subData = {
        customer_id: subscription.customerId,
        plan_type: subscription.planType,
        meal_type: subscription.mealType,
        price: subscription.price,
        start_date: subscription.startDate.toISOString().split('T')[0],
        end_date: subscription.endDate.toISOString().split('T')[0],
        status: subscription.status,
      };
      
      const { error } = await supabase
        .from('subscriptions')
        .insert([subData]);
      
      if (error) throw error;
      
      await get().fetchSubscriptions();
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  },
  
  updateSubscription: async (id, subscription) => {
    try {
      const updateData: any = {};
      if (subscription.customerId !== undefined) updateData.customer_id = subscription.customerId;
      if (subscription.planType !== undefined) updateData.plan_type = subscription.planType;
      if (subscription.mealType !== undefined) updateData.meal_type = subscription.mealType;
      if (subscription.price !== undefined) updateData.price = subscription.price;
      if (subscription.startDate !== undefined) updateData.start_date = subscription.startDate;
      if (subscription.endDate !== undefined) updateData.end_date = subscription.endDate;
      if (subscription.status !== undefined) updateData.status = subscription.status;
      
      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },
  
  deleteSubscription: async (id) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  },
  
  // Menu actions
  addMenuItem: async (item) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .insert([item]);
      
      if (error) throw error;
      
      await get().fetchMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  },
  
  updateMenuItem: async (id, item) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(item)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchMenuItems();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },
  
  deleteMenuItem: async (id) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },
  
  // Settings actions
  fetchSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }
      
      const settings: Settings = {
        id: data.id,
        businessName: data.business_name,
        contactNumber: data.contact_number || '',
        businessAddress: data.business_address || '',
        email: data.email || '',
        newOrderNotifications: data.new_order_notifications,
        dailySummaryEmail: data.daily_summary_email,
        subscriptionExpiryAlerts: data.subscription_expiry_alerts,
        notificationEmail: data.notification_email || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      set({ settings });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  },
  
  updateSettings: async (settings) => {
    try {
      const updateData: any = {};
      if (settings.businessName !== undefined) updateData.business_name = settings.businessName;
      if (settings.contactNumber !== undefined) updateData.contact_number = settings.contactNumber;
      if (settings.businessAddress !== undefined) updateData.business_address = settings.businessAddress;
      if (settings.email !== undefined) updateData.email = settings.email;
      if (settings.newOrderNotifications !== undefined) updateData.new_order_notifications = settings.newOrderNotifications;
      if (settings.dailySummaryEmail !== undefined) updateData.daily_summary_email = settings.dailySummaryEmail;
      if (settings.subscriptionExpiryAlerts !== undefined) updateData.subscription_expiry_alerts = settings.subscriptionExpiryAlerts;
      if (settings.notificationEmail !== undefined) updateData.notification_email = settings.notificationEmail;
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', get().settings?.id);
      
      if (error) throw error;
      
      await get().fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },
  
  // Delivery Area actions
  fetchDeliveryAreas: async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_areas')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      const areas = data.map((a: any) => ({
        id: a.id,
        name: a.name,
        color: a.color,
        description: a.description,
        priority: a.priority,
        estimatedDeliveryTime: a.estimated_delivery_time,
        createdAt: new Date(a.created_at),
      }));
      
      set({ deliveryAreas: areas });
    } catch (error) {
      console.error('Error fetching delivery areas:', error);
    }
  },
  
  addDeliveryArea: async (area) => {
    try {
      const { error } = await supabase
        .from('delivery_areas')
        .insert([{
          name: area.name,
          color: area.color,
          description: area.description,
          priority: area.priority,
          estimated_delivery_time: area.estimatedDeliveryTime,
        }]);
      
      if (error) throw error;
      
      await get().fetchDeliveryAreas();
    } catch (error) {
      console.error('Error adding delivery area:', error);
      throw error;
    }
  },
  
  updateDeliveryArea: async (id, area) => {
    try {
      const updateData: any = {};
      if (area.name !== undefined) updateData.name = area.name;
      if (area.color !== undefined) updateData.color = area.color;
      if (area.description !== undefined) updateData.description = area.description;
      if (area.priority !== undefined) updateData.priority = area.priority;
      if (area.estimatedDeliveryTime !== undefined) updateData.estimated_delivery_time = area.estimatedDeliveryTime;
      
      const { error } = await supabase
        .from('delivery_areas')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchDeliveryAreas();
    } catch (error) {
      console.error('Error updating delivery area:', error);
      throw error;
    }
  },
  
  deleteDeliveryArea: async (id) => {
    try {
      const { error } = await supabase
        .from('delivery_areas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchDeliveryAreas();
    } catch (error) {
      console.error('Error deleting delivery area:', error);
      throw error;
    }
  },
  
  // Delivery Boy actions
  fetchDeliveryBoys: async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_boys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const boys = data.map((b: any) => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        email: b.email,
        vehicleType: b.vehicle_type,
        vehicleNumber: b.vehicle_number,
        address: b.address,
        status: b.status,
        joiningDate: new Date(b.joining_date),
        profilePhoto: b.profile_photo,
        aadharNumber: b.aadhar_number,
        licenseNumber: b.license_number,
        emergencyContact: b.emergency_contact,
        salary: parseFloat(b.salary || 0),
        incentivePerDelivery: parseFloat(b.incentive_per_delivery || 0),
        workingHours: b.working_hours,
        rating: parseFloat(b.rating || 5.0),
        totalDeliveries: parseInt(b.total_deliveries || 0),
        successfulDeliveries: parseInt(b.successful_deliveries || 0),
        failedDeliveries: parseInt(b.failed_deliveries || 0),
        notes: b.notes,
        createdAt: new Date(b.created_at),
        updatedAt: b.updated_at ? new Date(b.updated_at) : undefined,
      }));
      
      set({ deliveryBoys: boys });
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
    }
  },
  
  addDeliveryBoy: async (boy) => {
    try {
      const insertData: any = {
        name: boy.name,
        phone: boy.phone,
        vehicle_type: boy.vehicleType,
        status: boy.status,
        salary: boy.salary,
        incentive_per_delivery: boy.incentivePerDelivery,
        rating: boy.rating,
        total_deliveries: boy.totalDeliveries,
        successful_deliveries: boy.successfulDeliveries,
        failed_deliveries: boy.failedDeliveries,
        joining_date: boy.joiningDate.toISOString().split('T')[0],
      };
      
      // Optional fields
      if (boy.email) insertData.email = boy.email;
      if (boy.vehicleNumber) insertData.vehicle_number = boy.vehicleNumber;
      if (boy.address) insertData.address = boy.address;
      if (boy.profilePhoto) insertData.profile_photo = boy.profilePhoto;
      if (boy.aadharNumber) insertData.aadhar_number = boy.aadharNumber;
      if (boy.licenseNumber) insertData.license_number = boy.licenseNumber;
      if (boy.emergencyContact) insertData.emergency_contact = boy.emergencyContact;
      if (boy.workingHours) insertData.working_hours = boy.workingHours;
      if (boy.notes) insertData.notes = boy.notes;
      
      const { error } = await supabase
        .from('delivery_boys')
        .insert([insertData]);
      
      if (error) throw error;
      
      await get().fetchDeliveryBoys();
    } catch (error) {
      console.error('Error adding delivery boy:', error);
      throw error;
    }
  },
  
  updateDeliveryBoy: async (id, boy) => {
    try {
      const updateData: any = {};
      if (boy.name !== undefined) updateData.name = boy.name;
      if (boy.phone !== undefined) updateData.phone = boy.phone;
      if (boy.email !== undefined) updateData.email = boy.email;
      if (boy.vehicleType !== undefined) updateData.vehicle_type = boy.vehicleType;
      if (boy.vehicleNumber !== undefined) updateData.vehicle_number = boy.vehicleNumber;
      if (boy.address !== undefined) updateData.address = boy.address;
      if (boy.status !== undefined) updateData.status = boy.status;
      if (boy.joiningDate !== undefined) updateData.joining_date = boy.joiningDate;
      if (boy.profilePhoto !== undefined) updateData.profile_photo = boy.profilePhoto;
      if (boy.aadharNumber !== undefined) updateData.aadhar_number = boy.aadharNumber;
      if (boy.licenseNumber !== undefined) updateData.license_number = boy.licenseNumber;
      if (boy.emergencyContact !== undefined) updateData.emergency_contact = boy.emergencyContact;
      if (boy.salary !== undefined) updateData.salary = boy.salary;
      if (boy.incentivePerDelivery !== undefined) updateData.incentive_per_delivery = boy.incentivePerDelivery;
      if (boy.workingHours !== undefined) updateData.working_hours = boy.workingHours;
      if (boy.rating !== undefined) updateData.rating = boy.rating;
      if (boy.totalDeliveries !== undefined) updateData.total_deliveries = boy.totalDeliveries;
      if (boy.successfulDeliveries !== undefined) updateData.successful_deliveries = boy.successfulDeliveries;
      if (boy.failedDeliveries !== undefined) updateData.failed_deliveries = boy.failedDeliveries;
      if (boy.notes !== undefined) updateData.notes = boy.notes;
      
      const { error } = await supabase
        .from('delivery_boys')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchDeliveryBoys();
    } catch (error) {
      console.error('Error updating delivery boy:', error);
      throw error;
    }
  },
  
  deleteDeliveryBoy: async (id) => {
    try {
      const { error } = await supabase
        .from('delivery_boys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchDeliveryBoys();
    } catch (error) {
      console.error('Error deleting delivery boy:', error);
      throw error;
    }
  },
}));
