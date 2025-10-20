# ⏰ Automatic Subscription Alerts - Setup Guide

## 🎯 Overview

Subscription expiry alerts ab automatically send ho sakte hain **2 din pehle**! 

### Two Alert Systems:

1. **Manual Alerts** (Email Reports page)
   - Next 7 days ke sabhi expiring subscriptions
   - Jab chahiye tab send karo

2. **Automatic Alerts** (NEW!) 
   - Exactly 2 days before expiry
   - Automatically daily run hota hai
   - Cron job se setup karo

---

## 🚀 Automatic Alert System - How It Works

### Flow:
```
1. Cron job daily 9 AM pe API call karti hai
2. API checks: Kaunse subscriptions exactly 2 days mein expire honge?
3. Found subscriptions ke liye emails send hoti hain
4. Settings mein set email address pe alert jata hai
5. Done! ✅
```

---

## 📝 Setup Methods

### Option 1: Windows Task Scheduler (FREE - Local)

#### Step 1: API Test Karo
1. Dev server running hona chahiye
2. Browser mein jao: `http://localhost:3000/api/check-subscriptions`
3. Response dekho (should show JSON with success: true)

#### Step 2: Task Scheduler Setup

1. **Open Task Scheduler**
   - Windows Search → "Task Scheduler"
   - Ya `taskschd.msc` run karo

2. **Create Basic Task**
   - Right sidebar → "Create Basic Task"
   - Name: `Tiffin Subscription Alerts`
   - Description: `Daily check for expiring subscriptions`
   - Click "Next"

3. **Trigger Setup**
   - Select: "Daily"
   - Start date: Aaj ka date
   - Time: `09:00:00` (9 AM)
   - Recur every: `1` days
   - Click "Next"

4. **Action Setup**
   - Select: "Start a program"
   - Click "Next"

5. **Program Details**
   - Program/script: `curl`
   - Add arguments: `http://localhost:3000/api/check-subscriptions`
   - Click "Next"
   - Click "Finish"

**Important**: Dev server (`npm run dev`) hamesha running hona chahiye!

---

### Option 2: Free Online Cron Services (Better for Production)

#### Recommended Services:

1. **cron-job.org** (Easiest - FREE)
   - Website: https://cron-job.org/
   - 50 jobs FREE
   - Every minute se yearly tak

2. **EasyCron** (Good UI - FREE)
   - Website: https://www.easycron.com/
   - 100 executions/day FREE

3. **Cronitor** (Professional - FREE tier)
   - Website: https://cronitor.io/
   - Monitoring included

#### Setup with cron-job.org:

1. **Create Account**
   - Go to: https://cron-job.org/
   - Sign up (FREE!)

2. **Create Cronjob**
   - Dashboard → "Create cronjob"
   - Title: `Tiffin Subscription Alerts`
   - URL: `https://yourdomain.com/api/check-subscriptions`
   - Schedule: Daily at 9:00 AM
   - Timezone: Select your timezone (Asia/Kolkata)
   - Save

3. **Test It**
   - Click "Run now" to test
   - Check logs for response

**Note**: Ye production ke liye hai jab app online deploy ho

---

### Option 3: Node-Cron (Code-based - Advanced)

Agar tum app ko always-running server pe deploy kar rahe ho:

1. **Install node-cron**:
   ```bash
   npm install node-cron
   ```

2. **Create cron job** (`lib/cronJobs.ts`):
   ```typescript
   import cron from 'node-cron';
   import { checkAndSendSubscriptionAlerts } from './subscriptionNotifier';

   export function startSubscriptionAlertCron() {
     // Run every day at 9:00 AM
     cron.schedule('0 9 * * *', async () => {
       console.log('🔔 Running scheduled subscription alert check...');
       await checkAndSendSubscriptionAlerts();
     });
     
     console.log('✅ Subscription alert cron job started (9:00 AM daily)');
   }
   ```

3. **Start cron in app**:
   ```typescript
   // app/layout.tsx or api route
   import { startSubscriptionAlertCron } from '@/lib/cronJobs';
   
   if (typeof window === 'undefined') {
     startSubscriptionAlertCron();
   }
   ```

---

## 🧪 Testing Automatic Alerts

### Method 1: Email Reports Page

1. Go to **Email Reports** (sidebar)
2. Scroll to "Subscription Expiry Alerts"
3. Right side card: "Automatic Alerts (2 Days)"
4. Click **"Test Auto (2 Days)"** button
5. Check response message
6. Check email inbox!

### Method 2: Direct API Call

```bash
# Using curl
curl http://localhost:3000/api/check-subscriptions

# Using browser
# Open: http://localhost:3000/api/check-subscriptions
```

### Method 3: Postman/Thunder Client

1. Create GET request
2. URL: `http://localhost:3000/api/check-subscriptions`
3. Send
4. Check response JSON

---

## 📊 API Response Format

```json
{
  "success": true,
  "message": "Subscription alerts checked. Sent 2 alert(s).",
  "alertsSent": 2,
  "errors": []
}
```

---

## ⚙️ Configuration

### Settings Required:

1. **EmailJS Setup** (Required)
   - Service ID
   - Public Key
   - Both templates created
   - See: `EMAILJS_SETUP.md`

2. **Notification Email** (Required)
   - Go to Settings page
   - Add "Notification Email"
   - Yahi email pe alerts jayenge

3. **Subscription Expiry Alerts Toggle** (Required)
   - Settings page pe enable karo
   - Default: ON

---

## 🎯 How 2-Day Logic Works

### Calculation:
```
Today: 18 Oct 2025
Target: 20 Oct 2025 (2 days later)

System checks:
- Subscriptions ending on exactly 20 Oct 2025
- Status: Active
- Sends email alert

Result:
- Customer gets 2 days to renew
- You get time to contact customer
- No last-minute surprises!
```

---

## 📧 What Email Contains

```
Subject: ⏰ Subscription Expiring - [Customer Name]

Content:
- Customer name
- Plan type (Daily/Weekly/Monthly)
- Meal type (Lunch/Dinner/Both)
- Expiry date
- Days remaining (2)
- Subscription price
- Beautiful orange gradient design
```

---

## 🔧 Troubleshooting

### ❌ API returning error:

**Check:**
1. Dev server running? (`npm run dev`)
2. Supabase connected?
3. Settings table has data?
4. EmailJS configured?
5. Notification email set?

**Console logs:**
- Check terminal for detailed error messages
- API logs everything

### ❌ No emails sent:

**Reasons:**
1. No subscriptions expiring in exactly 2 days
2. EmailJS not configured
3. Notification email missing
4. Subscription alerts disabled in settings

**Fix:**
1. Go to Email Reports → Test Auto button
2. Check console logs
3. Verify email configuration

### ❌ Wrong subscriptions selected:

**Check:**
- Subscription end_date in database
- Timezone settings
- Date calculations

---

## 📅 Daily Routine (Recommended)

### Option A: Windows Task Scheduler
```
Time: 9:00 AM daily
Action: curl API
Result: Automatic emails
```

### Option B: Manual Check
```
9:00 AM - Open Email Reports
9:01 AM - Click "Test Auto (2 Days)"
9:02 AM - Check email ✅
```

### Option C: Online Cron (Production)
```
Setup once, forget forever!
Runs automatically daily
Reliable & free
```

---

## 🎉 Benefits

✅ **Automatic**: Set karo aur bhool jao
✅ **2 Days Notice**: Perfect timing for customer contact
✅ **No Manual Work**: Cron job sab kuch handle karta hai
✅ **Free**: No cost for cron services
✅ **Reliable**: Daily guaranteed execution
✅ **Professional**: Beautiful email design

---

## 📊 Comparison: Manual vs Automatic

| Feature | Manual (7 Days) | Automatic (2 Days) |
|---------|----------------|-------------------|
| Timing | Anytime | Daily at 9 AM |
| Advance Notice | 7 days | 2 days |
| Trigger | Manual click | Automatic cron |
| Count | All in 7 days | Only 2 days |
| Use Case | Bulk review | Timely alerts |
| Setup | None | One-time cron |

**Best Practice**: Use both!
- Weekly: Manual check (7 days)
- Daily: Automatic alerts (2 days)

---

## 🔍 Monitoring & Logs

### Check Execution:

**Terminal Logs:**
```
🔍 Checking for expiring subscriptions...
📅 Checking for subscriptions expiring on: 20 Oct 2025
📬 Found 2 subscription(s) expiring in 2 days.
📧 Sending alert for: John Doe (Monthly - Both)
✅ Alert sent for John Doe
🎉 Subscription alerts process completed. Sent: 2/2
```

**Browser Console:**
- Open Email Reports page
- F12 → Console
- Look for EmailJS logs

---

## 🚀 Production Deployment

### When deploying to production:

1. **Use Environment Variables**
   - All EmailJS variables
   - Supabase credentials

2. **Use Online Cron Service**
   - Not Windows Task Scheduler
   - Use cron-job.org or similar

3. **Set Production URL**
   - Change from `localhost:3000`
   - To your actual domain

4. **Monitor Logs**
   - Check API responses daily
   - Verify emails being sent

---

## 📖 Related Documentation

- **EmailJS Setup**: `EMAILJS_SETUP.md`
- **Email Templates**: `EMAIL_TEMPLATES.html`
- **Reports Usage**: `REPORTS_USAGE.md`
- **Complete Guide**: `EMAIL_REPORTS_COMPLETE.md`

---

## 💡 Pro Tips

1. **Test First**: Use "Test Auto" button before setting cron
2. **Check Logs**: Always monitor first few runs
3. **Timezone**: Set correct timezone in cron job
4. **Backup**: Keep manual alerts option for emergencies
5. **Customer Contact**: After email, call customer for confirmation

---

**Your automatic subscription alert system is ready! 🎊**

Bas cron job setup karo aur daily automatic alerts shuru ho jayenge! 📧

