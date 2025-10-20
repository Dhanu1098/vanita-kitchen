# Supabase Database Setup Guide

## ✅ Database Connected!

Aapka Tiffin Service Management System ab **Supabase database** se connected hai!

---

## 🚀 Setup Steps (Follow karein)

### Step 1: Database Tables Create karein

1. **Supabase Dashboard** kholo: https://supabase.com/dashboard
2. Apna project select karo
3. Left sidebar mein **"SQL Editor"** pe click karo
4. **"New Query"** button click karo
5. `DATABASE_SETUP.sql` file ka saara content copy karo
6. SQL Editor mein paste karo
7. **"RUN"** button pe click karo

Yeh automatically create kar dega:
- ✅ `customers` table
- ✅ `orders` table  
- ✅ `subscriptions` table
- ✅ `menu_items` table
- ✅ Default menu items
- ✅ Proper indexes and security policies

---

## 📦 Install Dependencies

Terminal mein run karo:

```bash
npm install
```

Yeh install karega:
- `@supabase/supabase-js` - Supabase client library

---

## 🔧 Environment Variables

`.env.local` file already create ho gayi hai with your credentials:
- Supabase URL
- Supabase Anon Key

**Important:** `.env.local` file ko git mein commit mat karo!

---

## 🎯 What Changed?

### 1. **Real Database Storage** 
- Local storage ki jagah ab **Supabase PostgreSQL** database use ho raha hai
- Data server pe store hoga, browser mein nahi

### 2. **Async Operations**
- All add/update/delete operations ab `async` hain
- Data automatically fetch hota hai database se

### 3. **Data Loader**
- App start hone pe automatically data fetch hoga
- Loading state dikhega jab tak data load ho raha hai

### 4. **UUID Primary Keys**
- Database standard UUID use kar raha hai instead of timestamps

---

## 🔍 Verify Database Setup

SQL Editor mein yeh queries run karke check karo:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check menu items
SELECT * FROM menu_items;

-- Count records (should be 0 for new database)
SELECT 
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM subscriptions) as subscriptions,
  (SELECT COUNT(*) FROM menu_items) as menu_items;
```

---

## 🎨 How It Works Now

### Adding Data:
```
User adds order in UI
    ↓
Frontend sends to Supabase
    ↓
Supabase saves in PostgreSQL
    ↓
Frontend refreshes data
    ↓
UI updates automatically
```

### Reading Data:
```
App starts
    ↓
DataLoader component runs
    ↓
Fetches all data from Supabase
    ↓
Stores in Zustand state
    ↓
UI renders with data
```

---

## 📊 Database Tables Structure

### customers
- id (UUID, Primary Key)
- name (Text)
- phone (Text)
- address (Text)
- created_at (Timestamp)

### orders
- id (UUID, Primary Key)
- customer_id (UUID, Foreign Key)
- customer_name (Text)
- date (Date)
- meal_type (Text: lunch/dinner/both)
- items (JSONB)
- total_price (Decimal)
- cost (Decimal)
- profit (Decimal)
- status (Text: pending/confirmed/delivered/cancelled)
- source (Text: whatsapp/manual/subscription)
- notes (Text)
- created_at (Timestamp)

### subscriptions
- id (UUID, Primary Key)
- customer_id (UUID, Foreign Key)
- plan_type (Text: daily/weekly/monthly)
- meal_type (Text: lunch/dinner/both)
- price (Decimal)
- start_date (Date)
- end_date (Date)
- status (Text: active/expired/paused)
- created_at (Timestamp)

### menu_items
- id (UUID, Primary Key)
- name (Text)
- price (Decimal)
- cost (Decimal)
- category (Text: veg/non-veg/special)
- created_at (Timestamp)

---

## 🔐 Security

Row Level Security (RLS) enabled hai with public access policies.

**Production mein:**
- Authentication add karein
- User-specific policies banayein
- API keys ko secure rakhein

---

## 🎯 Next Steps

1. ✅ SQL file run karo Supabase SQL Editor mein
2. ✅ `npm install` run karo
3. ✅ `npm run dev` se app start karo
4. ✅ Data add karo - automatically database mein save hoga!

---

## 🆘 Troubleshooting

### Error: "relation does not exist"
**Solution:** SQL file run nahi kiya. Step 1 follow karo.

### Error: "Invalid API key"
**Solution:** `.env.local` file check karo, credentials sahi hain?

### Data show nahi ho raha
**Solution:** Browser console check karo for errors. Network tab mein Supabase requests dekho.

### Loading forever
**Solution:** Database tables create hue ya nahi check karo SQL Editor se.

---

## ✨ Benefits

✅ **Real Database** - Professional PostgreSQL database  
✅ **Multi-device Access** - Kisi bhi device se access karo  
✅ **Data Backup** - Automatic backups by Supabase  
✅ **Scalable** - Jitna chahe data store karo  
✅ **Fast** - Optimized queries with indexes  
✅ **Secure** - Row level security enabled  

---

Enjoy your cloud-powered Tiffin Service Management System! 🎉





