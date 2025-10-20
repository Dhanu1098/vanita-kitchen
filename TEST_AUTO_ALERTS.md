# 🔍 Auto Alert Troubleshooting Guide

## ❌ Issue: "No subscriptions expiring in 2 days"

Terminal logs dikha rahe hain:
```
🔔 API: Subscription alert check triggered
🔍 Checking for expiring subscriptions...
📅 Checking for subscriptions expiring on: 20 Oct 2025
✅ No subscriptions expiring in 2 days.
```

**Matlab**: API perfectly work kar raha hai, but database mein koi subscription nahi hai jo exactly 2 days mein expire ho raha hai!

---

## ✅ Solution: Test Subscription Create Karo

### Method 1: Via App (Easiest)

1. **Go to**: Subscriptions page (sidebar)
2. **Click**: "Add Subscription" button
3. **Fill details**:
   - Customer: Koi bhi select karo
   - Plan Type: Daily/Weekly/Monthly
   - Meal Type: Lunch/Dinner/Both
   - **Start Date**: Aaj ka date (18 Oct 2025)
   - **End Date**: **20 Oct 2025** (exactly 2 days from today!)
   - Price: Kuch bhi (e.g., ₹1000)
   - Status: **Active** (important!)
4. **Save**
5. **Test**: Email Reports → Test Auto (2 Days) button

---

### Method 2: Via Supabase (Direct)

1. **Open**: Supabase Dashboard
2. **Go to**: Table Editor → subscriptions
3. **Click**: Insert Row
4. **Fill**:
   ```
   customer_id: (select any customer ID from customers table)
   plan_type: monthly
   meal_type: both
   start_date: 2025-10-18 (today)
   end_date: 2025-10-20 (2 days from today)
   price: 1000
   status: active
   ```
5. **Save**
6. **Test**: Email Reports → Test Auto (2 Days) button

---

## 🧪 Quick Test SQL Query

Copy-paste this in Supabase SQL Editor to create a test subscription:

```sql
-- First, get a customer ID
SELECT id, name FROM customers LIMIT 1;

-- Then insert test subscription (replace 'customer_id_here' with actual ID)
INSERT INTO subscriptions (
  customer_id,
  plan_type,
  meal_type,
  start_date,
  end_date,
  price,
  status,
  created_at,
  updated_at
) VALUES (
  'customer_id_here',  -- Replace with actual customer ID from above query
  'monthly',
  'both',
  NOW(),
  NOW() + INTERVAL '2 days',  -- Exactly 2 days from now
  1000.00,
  'active',
  NOW(),
  NOW()
);

-- Verify insertion
SELECT 
  s.id,
  c.name as customer_name,
  s.plan_type,
  s.meal_type,
  s.end_date,
  s.status,
  EXTRACT(DAY FROM (s.end_date - NOW())) as days_remaining
FROM subscriptions s
JOIN customers c ON c.id = s.customer_id
WHERE s.status = 'active'
AND s.end_date >= NOW()
AND s.end_date <= NOW() + INTERVAL '3 days'
ORDER BY s.end_date;
```

---

## 🔍 Verification Steps

### Step 1: Check Subscriptions in Database

```sql
-- Check all active subscriptions
SELECT 
  c.name as customer_name,
  s.plan_type,
  s.meal_type,
  s.end_date,
  s.status,
  EXTRACT(DAY FROM (s.end_date - NOW())) as days_remaining
FROM subscriptions s
JOIN customers c ON c.id = s.customer_id
WHERE s.status = 'active'
ORDER BY s.end_date;
```

### Step 2: Check Settings

```sql
-- Check if subscription alerts are enabled
SELECT 
  subscription_expiry_alerts,
  notification_email
FROM settings;
```

Expected:
- `subscription_expiry_alerts`: true
- `notification_email`: Your email address

---

## 🎯 What Auto Alert Checks

Auto alert system checks subscriptions where:
1. ✅ Status = 'active'
2. ✅ End date = **Exactly 2 days from now**
3. ✅ Settings: subscription_expiry_alerts = true
4. ✅ Settings: notification_email is set

---

## 📅 Date Calculation Logic

```
Today: 18 Oct 2025 (example)
Target: 20 Oct 2025 (2 days later)

System checks:
- end_date >= 2025-10-20 00:00:00
- end_date < 2025-10-21 00:00:00
- status = 'active'
```

---

## 🧪 Test Scenario

### Create Test Subscription:

**Option A: Expires Today + 2 Days**
```
Start Date: 18 Oct 2025 (today)
End Date: 20 Oct 2025 (exactly 2 days)
Status: Active
```

**Option B: Already Expiring Soon**
```
Start Date: 15 Oct 2025 (past)
End Date: 20 Oct 2025 (2 days)
Status: Active
```

---

## ✅ Full Testing Flow

### 1. Create Test Subscription
```
Subscriptions page → Add New
- Customer: John Doe
- Plan: Monthly
- Meal: Both
- Start: Today
- End: Today + 2 days
- Price: ₹1000
- Status: Active
```

### 2. Verify in Database
```sql
SELECT * FROM subscriptions 
WHERE status = 'active' 
AND end_date::date = (NOW() + INTERVAL '2 days')::date;
```

Should return 1 row!

### 3. Check Settings
```
Settings page → Notification Settings
- Subscription Expiry Alerts: ✅ Enabled
- Notification Email: your@email.com
```

### 4. Test Auto Alert
```
Email Reports page → Automatic Alerts card
- Count should show: 1
- Click: "Test Auto (2 Days)" button
- Wait for success message
- Check email inbox! 📧
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Count shows 0
**Problem**: No subscriptions expiring in exactly 2 days
**Fix**: Create test subscription with end_date = today + 2 days

### Issue 2: API returns success but no email
**Problem**: EmailJS not configured or notification email missing
**Fix**: 
- Check Settings page → Notification Email field
- Verify EmailJS credentials in `.env.local`
- Check console logs for errors

### Issue 3: API returns error
**Problem**: Settings not found or subscription alerts disabled
**Fix**:
- Go to Settings page
- Enable "Subscription Expiry Alerts"
- Add notification email
- Save

### Issue 4: Email goes to spam
**Problem**: Gmail/Outlook marking as spam
**Fix**: 
- Check spam folder
- Mark as "Not Spam"
- Add sender to contacts

---

## 📊 Debug Console Logs

Check browser console for detailed logs:

**Expected Success Logs:**
```
📧 Sending Subscription Expiry Email to: your@email.com
📋 Customer: John Doe
✅ Email sent successfully: {status: 200, text: "OK"}
```

**Expected Error Logs:**
```
❌ EmailJS not configured. Cannot send subscription expiry email.
OR
❌ Failed to send subscription email: Invalid template ID
```

---

## 🎯 Quick Fix Checklist

- [ ] At least 1 customer exists in database
- [ ] Created subscription with end_date = exactly 2 days from today
- [ ] Subscription status = 'active'
- [ ] Settings → Subscription Expiry Alerts = Enabled
- [ ] Settings → Notification Email = Set
- [ ] EmailJS configured (4 env variables in .env.local)
- [ ] Dev server restarted after .env changes
- [ ] Email Reports page shows count > 0 in Auto Alerts card
- [ ] Clicked "Test Auto (2 Days)" button
- [ ] Checked email inbox (including spam folder)

---

## 🚀 Expected Result

After creating test subscription:

**Email Reports Page:**
```
Automatic Alerts (2 Days)
Expiring in 2 Days: 1
[Button: Test Auto (2 Days)]
```

**After clicking button:**
```
✅ Auto-check completed! 1 alert(s) sent for subscriptions expiring in 2 days.
```

**In Email Inbox:**
```
Subject: ⏰ Subscription Expiring - John Doe | My Tiffin Service

[Beautiful orange gradient email with customer details]
```

---

## 📧 Test Email Template Variables

Email will contain:
- Business Name: From settings
- Customer Name: From subscription
- Plan Type: Monthly/Weekly/Daily
- Meal Type: Lunch/Dinner/Both
- Expiry Date: 20 Oct 2025
- Days Remaining: 2
- Subscription Price: ₹1,000

---

## 💡 Pro Tip

Create multiple test subscriptions:
```
Subscription 1: Expires in 1 day (manual alerts only)
Subscription 2: Expires in 2 days (auto alert will catch)
Subscription 3: Expires in 3 days (neither will catch)
Subscription 4: Expires in 7 days (manual alerts will catch)
```

This way you can test both manual and automatic alerts!

---

**Need Help?** Check console logs and terminal logs for detailed error messages! 🔍

