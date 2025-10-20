# 📧 EmailJS Template Setup Guide (Copy-Paste Ready)

## 🎯 Template Variables Used

### Daily Summary Template:
- `{{to_email}}` - Recipient email
- `{{business_name}}` - Business name
- `{{date}}` - Report date
- `{{total_orders}}` - Total orders count
- `{{total_revenue}}` - Revenue amount
- `{{total_profit}}` - Profit amount
- `{{total_cost}}` - Cost amount
- `{{lunch_count}}` - Lunch orders count
- `{{dinner_count}}` - Dinner orders count

### Subscription Expiry Template:
- `{{to_email}}` - Recipient email
- `{{business_name}}` - Business name
- `{{customer_name}}` - Customer name
- `{{plan_type}}` - Subscription plan (Daily/Weekly/Monthly)
- `{{meal_type}}` - Meal type (Lunch/Dinner/Both)
- `{{expiry_date}}` - Expiry date
- `{{days_remaining}}` - Days until expiry
- `{{subscription_price}}` - Subscription price

---

## 📝 How to Add Templates in EmailJS

### Step 1: Create Template 1 (Daily Summary)

1. Go to: https://dashboard.emailjs.com/
2. Click **"Email Templates"** in left sidebar
3. Click **"Create New Template"** button
4. **Template Name**: `Daily Tiffin Summary`

5. **Email Subject** (paste this):
   ```
   📊 Daily Summary - {{date}} | {{business_name}}
   ```

6. Click **"Switch to HTML Mode"** (top right toggle)

7. **Copy ALL HTML from `EMAIL_TEMPLATES.html`** file:
   - Open `EMAIL_TEMPLATES.html`
   - Find: `<!-- TEMPLATE 1: DAILY SUMMARY EMAIL -->`
   - Copy from `<!DOCTYPE html>` to `</html>` (first template)
   - Paste in EmailJS HTML editor

8. **Important Settings:**
   - To Email: `{{to_email}}`
   - From Name: `Tiffin Service System`
   - From Email: (your connected Gmail)

9. Click **"Save"**
10. Copy **Template ID** (example: `template_abc123`)

---

### Step 2: Create Template 2 (Subscription Expiry)

1. Click **"Create New Template"** again
2. **Template Name**: `Subscription Expiry Alert`

3. **Email Subject** (paste this):
   ```
   ⏰ Subscription Expiring - {{customer_name}} | {{business_name}}
   ```

4. Click **"Switch to HTML Mode"**

5. **Copy 2nd Template from `EMAIL_TEMPLATES.html`**:
   - Find: `<!-- TEMPLATE 2: SUBSCRIPTION EXPIRY ALERT -->`
   - Copy from second `<!DOCTYPE html>` to `</html>`
   - Paste in EmailJS HTML editor

6. **Important Settings:**
   - To Email: `{{to_email}}`
   - From Name: `Tiffin Service System`
   - From Email: (your connected Gmail)

7. Click **"Save"**
8. Copy **Template ID** (example: `template_xyz456`)

---

## 🔧 Update .env.local File

After creating both templates, update your `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_EMAILJS_TEMPLATE_DAILY=template_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_SUBSCRIPTION=template_xyz456
```

Replace:
- `template_abc123` with your Daily Summary Template ID
- `template_xyz456` with your Subscription Expiry Template ID

---

## ✅ Test Your Templates

### Test in EmailJS Dashboard:

1. Go to your template
2. Click **"Test it"** button
3. Fill in sample data:
   ```
   to_email: your@email.com
   business_name: My Tiffin Service
   date: 18 Oct 2025
   total_orders: 15
   total_revenue: ₹3,450
   total_profit: ₹1,250
   total_cost: ₹2,200
   lunch_count: 9
   dinner_count: 6
   ```
4. Click **"Send Test"**
5. Check your inbox! 📧

---

## 🎨 Template Features

### Daily Summary Email:
- ✅ Beautiful gradient header (Purple)
- ✅ 4 stat cards (Orders, Revenue, Profit, Cost)
- ✅ Color-coded sections
- ✅ Motivational message
- ✅ Professional footer
- ✅ Mobile responsive
- ✅ Emoji icons for better visuals

### Subscription Expiry Email:
- ✅ Eye-catching orange gradient header
- ✅ Warning alert box
- ✅ Detailed customer card
- ✅ Expiry countdown
- ✅ Action checklist
- ✅ Professional layout
- ✅ Mobile responsive

---

## 📱 Mobile Responsive

Both templates are mobile-friendly:
- Auto-adjusts on small screens
- Tables stack properly
- Text remains readable
- Colors optimized for both light/dark modes

---

## 🎨 Customization Tips

Want to change colors? Edit these in HTML:

**Purple Gradient (Daily Summary):**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Orange Gradient (Subscription Expiry):**
```css
background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
```

**Stat Card Colors:**
- Blue: `#f0f4ff` background, `#667eea` text
- Green: `#f0fdf4` background, `#22c55e` text
- Red: `#fff1f2` background, `#ef4444` text

---

## 🚀 Quick Start Checklist

- [ ] Copy Template 1 HTML
- [ ] Create Daily Summary template in EmailJS
- [ ] Save Template 1 ID
- [ ] Copy Template 2 HTML
- [ ] Create Subscription Expiry template in EmailJS
- [ ] Save Template 2 ID
- [ ] Update .env.local with both IDs
- [ ] Restart dev server (`Ctrl+C` then `npm run dev`)
- [ ] Test emails from Settings page
- [ ] Check inbox! 📬

---

## 💡 Pro Tips

1. **Test First**: Always send test emails from EmailJS dashboard before using in app
2. **Check Spam**: First few emails might go to spam folder
3. **Gmail Works Best**: Use Gmail for most reliable delivery
4. **Variables Matter**: Make sure all {{variables}} match exactly
5. **HTML Mode**: Always use HTML mode in EmailJS, not rich text editor

---

## 🎯 Result

When done correctly, you'll get:
- ✅ Beautiful professional emails
- ✅ Auto-populated data
- ✅ Instant delivery (2-5 seconds)
- ✅ Mobile-friendly design
- ✅ No spam issues

---

**Need Help?** Check console logs or alert messages in the app!

