import { supabase } from './supabase';
import { sendSubscriptionExpiryEmail, isEmailJSConfigured } from './emailService';
import { format } from 'date-fns';

interface SubscriptionAlert {
  id: string;
  customer_id: string;
  customer_name: string;
  plan_type: string;
  meal_type: string;
  end_date: string;
  price: number;
  days_remaining: number;
}

/**
 * Check subscriptions and send alerts for those expiring in 2 days
 * This should be called daily (e.g., via cron job or scheduled task)
 */
export async function checkAndSendSubscriptionAlerts(): Promise<{
  success: boolean;
  alertsSent: number;
  errors: string[];
}> {
  console.log('🔍 Checking for expiring subscriptions...');

  // Check if EmailJS is configured
  if (!isEmailJSConfigured()) {
    console.error('❌ EmailJS not configured. Cannot send alerts.');
    return { success: false, alertsSent: 0, errors: ['EmailJS not configured'] };
  }

  try {
    // Get settings to fetch notification email
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (settingsError || !settingsData) {
      console.error('❌ Failed to fetch settings:', settingsError);
      return { success: false, alertsSent: 0, errors: ['Settings not found'] };
    }

    // Check if subscription expiry alerts are enabled
    if (!settingsData.subscription_expiry_alerts) {
      console.log('⚠️ Subscription expiry alerts are disabled in settings.');
      return { success: true, alertsSent: 0, errors: [] };
    }

    const notificationEmail = settingsData.notification_email;
    if (!notificationEmail) {
      console.error('❌ Notification email not set in settings.');
      return { success: false, alertsSent: 0, errors: ['Notification email not set'] };
    }

    // Calculate date 2 days from now
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    twoDaysLater.setHours(0, 0, 0, 0); // Start of day

    const threeDaysLater = new Date(twoDaysLater);
    threeDaysLater.setDate(threeDaysLater.getDate() + 1); // End of day

    console.log(`📅 Checking for subscriptions expiring on: ${format(twoDaysLater, 'dd MMM yyyy')}`);

    // Fetch active subscriptions with their customer details
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        customer_id,
        plan_type,
        meal_type,
        end_date,
        price,
        status
      `)
      .eq('status', 'active')
      .gte('end_date', twoDaysLater.toISOString())
      .lt('end_date', threeDaysLater.toISOString());

    if (subsError) {
      console.error('❌ Failed to fetch subscriptions:', subsError);
      return { success: false, alertsSent: 0, errors: [subsError.message] };
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('✅ No subscriptions expiring in 2 days.');
      return { success: true, alertsSent: 0, errors: [] };
    }

    console.log(`📬 Found ${subscriptions.length} subscription(s) expiring in 2 days.`);

    // Fetch customer details
    const customerIds = subscriptions.map(sub => sub.customer_id);
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name')
      .in('id', customerIds);

    if (customersError) {
      console.error('❌ Failed to fetch customers:', customersError);
      return { success: false, alertsSent: 0, errors: [customersError.message] };
    }

    // Create a map of customer_id to customer_name
    const customerMap = new Map(customers?.map(c => [c.id, c.name]) || []);

    let alertsSent = 0;
    const errors: string[] = [];

    // Send alert for each expiring subscription
    for (const sub of subscriptions) {
      const customerName = customerMap.get(sub.customer_id) || 'Unknown Customer';
      const endDate = new Date(sub.end_date);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      try {
        console.log(`📧 Sending alert for: ${customerName} (${sub.plan_type} - ${sub.meal_type})`);

        await sendSubscriptionExpiryEmail({
          to_email: notificationEmail,
          business_name: settingsData.business_name || 'My Tiffin Service',
          customer_name: customerName,
          plan_type: sub.plan_type.charAt(0).toUpperCase() + sub.plan_type.slice(1),
          meal_type: sub.meal_type === 'both' 
            ? 'Both (Lunch & Dinner)' 
            : sub.meal_type.charAt(0).toUpperCase() + sub.meal_type.slice(1),
          expiry_date: format(endDate, 'dd MMM yyyy'),
          days_remaining: daysRemaining,
          subscription_price: `₹${sub.price.toFixed(2)}`,
        });

        alertsSent++;
        console.log(`✅ Alert sent for ${customerName}`);
      } catch (error: any) {
        const errorMsg = `Failed to send alert for ${customerName}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`🎉 Subscription alerts process completed. Sent: ${alertsSent}/${subscriptions.length}`);

    return {
      success: errors.length === 0,
      alertsSent,
      errors,
    };
  } catch (error: any) {
    console.error('❌ Unexpected error in subscription alert checker:', error);
    return {
      success: false,
      alertsSent: 0,
      errors: [error.message || 'Unexpected error occurred'],
    };
  }
}

/**
 * Manual trigger for subscription alerts (for testing or manual runs)
 */
export async function manualTriggerSubscriptionAlerts() {
  console.log('🚀 Manual trigger: Checking subscription alerts...');
  return await checkAndSendSubscriptionAlerts();
}

