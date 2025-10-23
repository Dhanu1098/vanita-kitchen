# 🔍 Testing & Debug Guide

## 🧪 **How to Test Order Placement:**

### **Step 1: Open Customer App**
```
1. Open browser
2. Go to: http://localhost:3000/customer
3. Open Developer Tools (F12)
4. Go to "Console" tab
5. Keep it open
```

### **Step 2: Place Test Order**
```
1. Browse menu
2. Add items to cart
3. Go to checkout
4. Fill details:
   Name: Test User
   Phone: 9876543210
   Address: Test Address, Area A
5. Click "Place Order"
6. Watch console for errors
```

### **Step 3: Check Console Logs**

Look for these messages:
```javascript
// Success:
"Placing order:" {orderData}
"Order added successfully:" {data}

// Error:
"Order placement error:" {error}
"Supabase error:" {error}
```

---

## 🐛 **Common Errors & Fixes:**

### **Error 1: "column does not exist"**

**Cause:** Database table missing columns

**Fix:**
```sql
-- Run in Supabase SQL Editor:
-- From: DATABASE_FIX_DELIVERY_BOY.sql

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_boy_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cash_collected_by UUID;
```

---

### **Error 2: "permission denied"**

**Cause:** Supabase RLS (Row Level Security) blocking insert

**Fix:**
```sql
-- Run in Supabase SQL Editor:

-- Enable inserts for orders table
CREATE POLICY "Enable insert for all users" ON orders
FOR INSERT WITH CHECK (true);

-- Enable reads for all users
CREATE POLICY "Enable read for all users" ON orders
FOR SELECT USING (true);
```

---

### **Error 3: "Failed to place order"**

**Cause:** Network or validation error

**Debug:**
1. Check browser console
2. Look for exact error message
3. Check network tab
4. Verify Supabase connection

**Fix:**
```javascript
// Check .env.local file:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

// Make sure they are correct!
```

---

### **Error 4: "No error in console, but order not showing"**

**Cause:** Orders may be inserting but not fetching

**Debug:**
```sql
-- Check in Supabase:
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

**Fix:**
- Refresh the orders page
- Check if orders are in database
- Verify fetchOrders() is being called

---

## 🧪 **Complete Test Script:**

### **Test 1: Customer Flow (7-9 AM)**
```
✅ Open /customer
✅ Check green banner: "Ordering Open"
✅ Check live clock
✅ Search: "Thali"
✅ Filter: "Veg"
✅ Add to cart (see "✓ Added")
✅ Cart badge increases
✅ Click cart icon
✅ See items with quantity controls
✅ Increase/decrease quantity
✅ Remove item
✅ Check bill calculation
✅ Click "Proceed to Checkout"
✅ Fill all details
✅ Select meal type
✅ Select payment method
✅ Click "Place Order"
✅ See success message
✅ Redirect to orders page
✅ See order in list
```

### **Test 2: Customer Flow (After 9 AM)**
```
✅ Open /customer
✅ Check red banner: "Ordering Closed"
✅ "Add" buttons show "Closed"
✅ Click "Add" - see alert
✅ Can browse menu
✅ Can view past orders
✅ Cannot checkout
```

### **Test 3: Owner Flow**
```
✅ Open /orders
✅ See new order
✅ Check order details
✅ Click "Confirm"
✅ Go to /delivery/staff
✅ See delivery boys
✅ Go back to /orders
✅ Assign delivery boy
✅ See status update
```

### **Test 4: Delivery Boy Flow**
```
✅ Open /delivery-boy/login
✅ Enter: 9876543210
✅ Enter PIN: 1234
✅ Click login
✅ See dashboard
✅ See assigned orders
✅ Click "Navigate"
✅ Google Maps opens
✅ Go back
✅ Change status to "Delivered"
✅ See cash collected
```

---

## 🔧 **Debug Commands:**

### **Check if app is running:**
```bash
# In terminal:
npm run dev

# Should see:
✓ Ready in 1636ms
- Local: http://localhost:3000
```

### **Clear browser cache:**
```
1. Open Dev Tools (F12)
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"
```

### **Check localStorage:**
```javascript
// In browser console:
localStorage.getItem('customerCart')
localStorage.getItem('customerName')
localStorage.getItem('customerPhone')
localStorage.getItem('customerAddress')

// Clear if needed:
localStorage.clear()
```

### **Check Supabase connection:**
```javascript
// In browser console (on your app page):
console.log(window.location.origin)

// Should match your Supabase URL domain
```

---

## 📊 **Verify Data:**

### **Check Orders in Supabase:**
```sql
-- Run in Supabase SQL Editor:

-- See all orders:
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;

-- See today's orders:
SELECT * FROM orders 
WHERE date = CURRENT_DATE 
ORDER BY created_at DESC;

-- Count orders:
SELECT COUNT(*) FROM orders;

-- See orders by source:
SELECT source, COUNT(*) 
FROM orders 
GROUP BY source;
```

### **Check Customers:**
```sql
SELECT * FROM customers ORDER BY created_at DESC LIMIT 20;
```

### **Check Delivery Boys:**
```sql
SELECT * FROM delivery_boys ORDER BY created_at DESC;
```

### **Check Menu Items:**
```sql
SELECT * FROM menu_items ORDER BY created_at DESC;
```

---

## 🚨 **Emergency Fixes:**

### **If nothing works:**

**Step 1: Check .env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Step 2: Restart dev server**
```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

**Step 3: Clear all cache**
```
1. Close browser
2. Reopen
3. Hard refresh (Ctrl+Shift+R)
```

**Step 4: Check Supabase Dashboard**
```
1. Go to: https://supabase.com
2. Open your project
3. Go to "Table Editor"
4. Check if tables exist
5. Check if data is there
```

---

## 💡 **Pro Debug Tips:**

### **1. Enable Verbose Logging:**

Add to `store/useStore.ts`:
```typescript
addOrder: async (order) => {
  console.log('🔍 Starting addOrder...');
  console.log('📦 Order data:', order);
  
  try {
    const orderData: any = { /* ... */ };
    console.log('📝 Formatted orderData:', orderData);
    
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();
    
    console.log('📡 Supabase response:', { data, error });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Order added successfully!', data);
    await get().fetchOrders();
  } catch (error) {
    console.error('❌ addOrder error:', error);
    throw error;
  }
}
```

### **2. Test with Minimal Data:**

```javascript
// Simplest test order:
{
  customerName: "Test",
  customerPhone: "9876543210",
  customerAddress: "Test Address",
  date: new Date(),
  mealType: "lunch",
  items: [{ name: "Test Item", quantity: 1, price: 100 }],
  totalPrice: 100,
  cost: 40,
  deliveryCharge: 0,
  profit: 60,
  status: "pending",
  source: "customer-app",
  notes: "Test order",
  deliveryStatus: "not-assigned"
}
```

### **3. Check Network Requests:**

```
1. Open Dev Tools (F12)
2. Go to "Network" tab
3. Filter: "Fetch/XHR"
4. Place order
5. Look for POST request to Supabase
6. Check request payload
7. Check response
```

---

## 📞 **Get Help:**

If still not working, share these details:

```
1. Browser console error (exact message)
2. Network tab screenshot
3. Supabase SQL query results
4. Your .env.local structure (hide keys)
5. What step is failing
```

**Copy console error like this:**
```
Right-click on error → Copy → Paste in message
```

---

## ✅ **Quick Test Checklist:**

- [ ] Dev server running (npm run dev)
- [ ] No errors in terminal
- [ ] Browser opened (localhost:3000)
- [ ] Console open (F12)
- [ ] Supabase connected
- [ ] Tables exist
- [ ] Menu items added
- [ ] Can browse customer app
- [ ] Can add to cart
- [ ] Can checkout
- [ ] Order places successfully
- [ ] Order shows in /orders
- [ ] Can track order

---

## 🎯 **Next Steps After Testing:**

1. If all tests pass → Deploy to production
2. If some tests fail → Debug using this guide
3. If still stuck → Share console error
4. If working → Celebrate! 🎉

**Happy Testing! 🧪🚀**

