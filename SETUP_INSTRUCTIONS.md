# 🚀 Supabase Setup - Step by Step

## Step 1: Install Dependencies

Terminal mein run karo:
```bash
npm install
```

---

## Step 2: Environment File Banao

Project folder mein ek naya file banao: `.env.local`

Us file mein yeh lines add karo:
```
NEXT_PUBLIC_SUPABASE_URL=https://iqdyzxcdsnoxdtesrpjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZHl6eGNkc25veGR0ZXNycGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDU1NDQsImV4cCI6MjA3NjA4MTU0NH0.2wtXtWswDjhhvuzjeF5n-tkW5_ePD8wvR3iSCJdHh5E
```

**Important:** `.env.local` file ko Git mein commit mat karo!

---

## Step 3: Database Tables Create Karo

### 3.1 Supabase Dashboard Kholo
- Browser mein jao: https://supabase.com/dashboard
- Login karo
- Apna project select karo (jo credentials diye woh project)

### 3.2 SQL Editor Kholo
- Left sidebar mein **"SQL Editor"** pe click karo
- **"New Query"** button click karo

### 3.3 Database Schema Run Karo
1. Project folder mein `DATABASE_SETUP.sql` file kholo
2. **Saara content copy karo** (Ctrl+A, then Ctrl+C)
3. Supabase SQL Editor mein **paste karo** (Ctrl+V)
4. **"RUN"** button pe click karo (ya F5 press karo)

### 3.4 Verify Karo
SQL Editor mein yeh query run karo:
```sql
SELECT * FROM menu_items;
```

Agar 3 menu items dikhe (Standard Thali, Special Thali, Non-Veg Thali) to **SUCCESS!** ✅

---

## Step 4: App Start Karo

Terminal mein run karo:
```bash
npm run dev
```

Browser mein kholo:
```
http://localhost:3000
```

---

## ✅ Verification Checklist

- [ ] `npm install` successfully run hua
- [ ] `.env.local` file banayi with credentials
- [ ] Supabase SQL Editor mein `DATABASE_SETUP.sql` run kiya
- [ ] Menu items show ho rahe hain database mein
- [ ] App start ho gaya without errors
- [ ] Dashboard load ho raha hai

---

## 🎯 Ab Kya Hoga?

**Data Save Hoga Database Mein:**
- Ab jab aap customers, orders, subscriptions add karoge
- Sab kuch **Supabase PostgreSQL database** mein save hoga
- Browser close karne ke baad bhi data rahega
- Kisi bhi device se access kar sakte ho

**Real-time Updates:**
- Database se automatically data fetch hoga
- Loading state dikhega jab data load ho raha hai
- All CRUD operations database se connected hain

---

## 🆘 Common Issues

### Issue 1: "relation does not exist" error
**Solution:** Database tables create nahi hue. Step 3 fir se follow karo.

### Issue 2: App loading forever
**Solution:** 
1. Browser console check karo (F12)
2. Network tab mein Supabase requests dekho
3. .env.local file sahi hai ya nahi verify karo

### Issue 3: "Invalid API key"
**Solution:** `.env.local` file mein credentials check karo, spelling mistakes?

### Issue 4: npm install failing
**Solution:** 
```bash
npm cache clean --force
npm install
```

---

## 📱 Next Steps

1. ✅ Menu Items add karo
2. ✅ Customers add karo  
3. ✅ Orders create karo
4. ✅ Analytics dekho

**Sab kuch database mein automatically save hoga!** 🎉

---

Need help? Check `SUPABASE_SETUP_GUIDE.md` for detailed documentation.





