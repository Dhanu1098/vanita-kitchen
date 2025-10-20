import { NextResponse } from 'next/server';
import { checkAndSendSubscriptionAlerts } from '@/lib/subscriptionNotifier';

/**
 * API Route to check and send subscription expiry alerts
 * 
 * Usage:
 * - Call this API daily via cron job or scheduled task
 * - GET http://localhost:3000/api/check-subscriptions
 * 
 * Setup Windows Task Scheduler:
 * 1. Open Task Scheduler
 * 2. Create Basic Task
 * 3. Trigger: Daily at 9:00 AM
 * 4. Action: Start a Program
 * 5. Program: curl
 * 6. Arguments: http://localhost:3000/api/check-subscriptions
 * 
 * OR use a free cron service like:
 * - cron-job.org
 * - easycron.com
 * - cronitor.io
 */
export async function GET() {
  try {
    console.log('🔔 API: Subscription alert check triggered');
    
    const result = await checkAndSendSubscriptionAlerts();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Subscription alerts checked. Sent ${result.alertsSent} alert(s).`,
        alertsSent: result.alertsSent,
        errors: result.errors,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Subscription alert check completed with errors.',
        alertsSent: result.alertsSent,
        errors: result.errors,
      }, { status: 207 }); // 207 Multi-Status
    }
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check subscription alerts',
      error: error.message,
    }, { status: 500 });
  }
}

// Also support POST for flexibility
export async function POST() {
  return GET();
}

