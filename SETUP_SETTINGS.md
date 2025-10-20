# 🚀 Settings Table Setup Guide

Apne Supabase database mein Settings table add karne ke liye yeh steps follow karo:

## Step 1: Supabase Dashboard Open Karo
- Apna browser mein jao: https://supabase.com
- Login karo
- Apna project select karo

## Step 2: SQL Editor Kholo
- Left sidebar mein **"SQL Editor"** pe click karo
- Ya direct: https://iqdyzxcdsnoxdtesrpjo.supabase.co (apna project URL)

## Step 3: SQL Script Run Karo

Niche diya hua **complete SQL script** copy-paste karo aur **RUN** karo:

```sql
-- Settings Table for Tiffin Service Management System

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL DEFAULT 'My Tiffin Service',
  contact_number VARCHAR(20),
  business_address TEXT,
  email VARCHAR(255),
  
  -- Notification Settings
  new_order_notifications BOOLEAN DEFAULT true,
  daily_summary_email BOOLEAN DEFAULT false,
  subscription_expiry_alerts BOOLEAN DEFAULT true,
  notification_email VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if not exists
INSERT INTO settings (business_name, contact_number, business_address, email)
VALUES ('My Tiffin Service', '', '', '')
ON CONFLICT DO NOTHING;

-- Only keep one settings row
CREATE UNIQUE INDEX IF NOT EXISTS settings_single_row ON settings ((true));
```

## Step 4: Verify Karo

1. Left sidebar mein **"Table Editor"** pe click karo
2. **"settings"** table dikhna chahiye
3. Ek row hoga default values ke saath

## Step 5: App Refresh Karo

- Apne browser mein app refresh karo (F5)
- **Settings** tab pe jao
- Sab fields editable honge! ✅

---

## ✨ Features

### 📧 Email Notifications

**Daily Summary Email:**
- Har roz 9 PM ko automatic email jayega
- Orders, Revenue, Profit ka summary
- Notification email field mein apna email dalo

**Subscription Expiry Alerts:**
- Subscription expire hone se 3 din pehle alert
- Email notification automatically jayega
- Customer ko remind kar sakte ho

### 💾 Dynamic Settings

- **Business Name** - Apna tiffin service ka naam
- **Contact Number** - Business contact
- **Business Email** - Main email
- **Address** - Business ka pata
- **Notification Email** - Jaha alerts chahiye

---

## 🔧 Troubleshooting

**Agar table create nahi ho raha:**
1. SQL script dobara copy karo
2. Pura script select karke RUN karo
3. Error message dekho aur bata do

**Agar data save nahi ho raha:**
1. Browser console check karo (F12)
2. Network tab mein errors dekho
3. Supabase project active hai confirm karo

---

## 📝 Important Notes

- Sirf **ek row** rahegi settings table mein
- Har update automatically database mein save hoga
- Email notifications ke liye email service setup karni hogi (future feature)
- Abhi notifications ka UI complete hai, email integration baad mein hoga

---

## ✅ Done!

Ab jao **Settings** page pe aur apni details fill karo! 🎉

