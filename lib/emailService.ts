import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Get these from your EmailJS dashboard: https://dashboard.emailjs.com/
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

// Template IDs
const TEMPLATE_DAILY_SUMMARY = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_DAILY || '';
const TEMPLATE_SUBSCRIPTION_EXPIRY = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_SUBSCRIPTION || '';

// Debug: Log configuration status (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('📧 EmailJS Configuration Check:');
  console.log('Service ID:', EMAILJS_SERVICE_ID ? '✅ Present' : '❌ Missing');
  console.log('Public Key:', EMAILJS_PUBLIC_KEY ? '✅ Present' : '❌ Missing');
  console.log('Daily Template:', TEMPLATE_DAILY_SUMMARY ? '✅ Present' : '❌ Missing');
  console.log('Subscription Template:', TEMPLATE_SUBSCRIPTION_EXPIRY ? '✅ Present' : '❌ Missing');
}

// Initialize EmailJS with public key
// This must be done before sending any emails
if (typeof window !== 'undefined') {
  if (EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialized successfully');
  } else {
    console.warn('⚠️ EmailJS Public Key not found - emails will not work');
  }
}

export interface DailySummaryData {
  to_email: string;
  business_name: string;
  date: string;
  total_orders: number;
  total_revenue: string;
  total_profit: string;
  total_cost: string;
  lunch_count: number;
  dinner_count: number;
}

export interface SubscriptionExpiryData {
  to_email: string;
  business_name: string;
  customer_name: string;
  plan_type: string;
  meal_type: string;
  expiry_date: string;
  days_remaining: number;
  subscription_price: string;
}

export const sendDailySummaryEmail = async (data: DailySummaryData): Promise<boolean> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !TEMPLATE_DAILY_SUMMARY) {
    throw new Error('EmailJS is not configured. Please check your environment variables.');
  }

  try {
    console.log('📧 Sending Daily Summary Email to:', data.to_email);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_DAILY_SUMMARY,
      data as any
    );
    
    console.log('✅ Email sent successfully:', response);
    return response.status === 200;
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    throw new Error(error.text || error.message || 'Failed to send email');
  }
};

export const sendSubscriptionExpiryEmail = async (data: SubscriptionExpiryData): Promise<boolean> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !TEMPLATE_SUBSCRIPTION_EXPIRY) {
    throw new Error('EmailJS is not configured. Please check your environment variables.');
  }

  try {
    console.log('📧 Sending Subscription Expiry Email to:', data.to_email);
    console.log('📋 Customer:', data.customer_name);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_SUBSCRIPTION_EXPIRY,
      data as any
    );
    
    console.log('✅ Email sent successfully:', response);
    return response.status === 200;
  } catch (error: any) {
    console.error('❌ Failed to send subscription email:', error);
    throw new Error(error.text || error.message || 'Failed to send email');
  }
};

export const isEmailJSConfigured = (): boolean => {
  const isConfigured = !!(EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY && TEMPLATE_DAILY_SUMMARY && TEMPLATE_SUBSCRIPTION_EXPIRY);
  
  if (!isConfigured && typeof window !== 'undefined') {
    console.log('⚠️ EmailJS Not Configured. Missing:');
    if (!EMAILJS_SERVICE_ID) console.log('❌ NEXT_PUBLIC_EMAILJS_SERVICE_ID');
    if (!EMAILJS_PUBLIC_KEY) console.log('❌ NEXT_PUBLIC_EMAILJS_PUBLIC_KEY');
    if (!TEMPLATE_DAILY_SUMMARY) console.log('❌ NEXT_PUBLIC_EMAILJS_TEMPLATE_DAILY');
    if (!TEMPLATE_SUBSCRIPTION_EXPIRY) console.log('❌ NEXT_PUBLIC_EMAILJS_TEMPLATE_SUBSCRIPTION');
  }
  
  return isConfigured;
};

// Helper function to get configuration status details
export const getConfigurationStatus = () => {
  return {
    serviceId: !!EMAILJS_SERVICE_ID,
    publicKey: !!EMAILJS_PUBLIC_KEY,
    dailyTemplate: !!TEMPLATE_DAILY_SUMMARY,
    subscriptionTemplate: !!TEMPLATE_SUBSCRIPTION_EXPIRY,
    isFullyConfigured: isEmailJSConfigured(),
  };
};

