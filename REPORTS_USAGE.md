# 📧 Email Reports - Usage Guide

## ✨ Features

**Email Reports** page se tum apne business ke reports manually email par send kar sakte ho!

### 🎯 Main Features:

1. **Business Summary Reports**
   - ✅ Daily Report
   - ✅ Weekly Report
   - ✅ Monthly Report
   
2. **Subscription Expiry Alerts**
   - Automatically find subscriptions expiring in next 7 days
   - Send bulk alerts with one click

---

## 📍 How to Use

### Step 1: Navigate to Email Reports

1. Open your Tiffin Service app
2. Click **"Email Reports"** in sidebar (Mail icon)

---

### Step 2: Send Business Summary Report

#### A. Select Report Type:
- Click on **Daily** / **Weekly** / **Monthly** button
- Each report calculates data for different time periods:
  - **Daily**: Selected date ka data
  - **Weekly**: Selected date ke week ka data (Monday to Sunday)
  - **Monthly**: Selected date ke month ka data

#### B. Select Date:
- Date picker se date select karo
- Jis date ka report chahiye wo select karo

#### C. Preview Analytics:
- Report Preview section mein live data dikhai dega:
  - Total Orders (Lunch + Dinner count)
  - Revenue
  - Profit
  - Cost

#### D. Send Email:
- **"Send Report via Email"** button click karo
- Email automatically send ho jayega configured email address par
- Success message dikhega when email sent

---

### Step 3: Send Subscription Expiry Alerts

#### What it does:
- Finds all subscriptions expiring in **next 7 days**
- Sends email alert for each expiring subscription
- One-click solution for bulk alerts

#### How to use:
1. Check "Subscriptions Expiring Soon" count
2. Click **"Send Subscription Expiry Alerts"** button
3. System will send separate email for each expiring subscription
4. Success message will show how many alerts were sent

---

## 📊 Report Email Contains:

### Business Summary Email includes:
- 📅 Date/Period covered
- 📊 Total Orders (with Lunch/Dinner breakdown)
- 💰 Total Revenue
- 📈 Total Profit
- 💸 Total Cost
- Beautiful color-coded design
- Professional layout

### Subscription Expiry Alert includes:
- 👤 Customer Name
- 📋 Subscription Plan Type (Daily/Weekly/Monthly)
- 🍛 Meal Type (Lunch/Dinner/Both)
- 📅 Expiry Date
- ⏰ Days Remaining
- 💰 Subscription Price
- Action checklist

---

## ✅ Requirements

### Before sending emails, make sure:

1. **EmailJS is configured**
   - Service ID set
   - Public Key set
   - Both templates created
   - All variables added to `.env.local`

2. **Notification Email is set**
   - Go to **Settings** page
   - Add "Notification Email" address
   - This is where reports will be sent

3. **Dev server is running**
   - `npm run dev` command running
   - App is accessible

---

## 🎨 Email Design

Both emails have:
- ✅ Beautiful gradients (Purple for reports, Orange for alerts)
- ✅ Color-coded sections
- ✅ Professional typography
- ✅ Mobile responsive
- ✅ Easy to read layout

---

## 💡 Use Cases

### Daily Report (Every Morning):
```
1. Open Email Reports
2. Select "Daily"
3. Select yesterday's date
4. Click Send
5. Check inbox! ✉️
```

### Weekly Report (Every Monday):
```
1. Open Email Reports
2. Select "Weekly"
3. Select any date from last week
4. Click Send
5. Get complete week summary! 📊
```

### Monthly Report (Start of Month):
```
1. Open Email Reports
2. Select "Monthly"
3. Select any date from last month
4. Click Send
5. Get complete month analytics! 📈
```

### Subscription Alerts (Anytime):
```
1. Open Email Reports
2. Scroll to "Subscription Expiry Alerts"
3. Click "Send Subscription Expiry Alerts"
4. All expiring subscriptions alerted! 🔔
```

---

## 🔧 Troubleshooting

### ❌ "EmailJS not configured" error:
- Check if `.env.local` has all 4 variables
- Restart dev server after adding variables
- Verify variables start with `NEXT_PUBLIC_`

### ❌ "Please set notification email" error:
- Go to Settings page
- Add email in "Notification Email" field
- Save settings

### ❌ Email not received:
- Check spam folder
- Verify email address is correct
- Check EmailJS dashboard for delivery status
- Console logs mein error check karo

### ❌ Wrong data in report:
- Verify date selection
- Check if orders exist for selected date
- Refresh page and try again

---

## 📱 Mobile Friendly

Email Reports page works perfectly on:
- 💻 Desktop
- 📱 Mobile
- 📲 Tablet

All emails are also mobile-responsive!

---

## 🎯 Pro Tips

1. **Daily Routine**: Every morning 10 AM pe yesterday ka daily report send karo
2. **Weekly Review**: Every Monday ko last week ka weekly report bhejo
3. **Month End**: Har mahine ke end mein monthly report generate karo
4. **Subscription Check**: Har 3 din mein subscription alerts check karo

---

## 🚀 Benefits

✅ **No Automatic Emails**: Sirf jab chahiye tab bhejo, spam nahi
✅ **Flexible Timing**: Any date ka report generate karo
✅ **Multiple Formats**: Daily/Weekly/Monthly choose karo
✅ **Live Preview**: Pehle preview dekho, phir send karo
✅ **Professional**: Beautiful formatted emails
✅ **One Click**: Simple UI, easy to use

---

## 📧 Example Workflow

### Morning Routine:
```
8:30 AM - Open app
8:31 AM - Go to Email Reports
8:32 AM - Select "Daily" + Yesterday
8:33 AM - Preview shows 23 orders, ₹5,670 revenue
8:34 AM - Click Send
8:35 AM - Email received! ✅
```

---

**Need Help?** Check console logs for detailed error messages!

