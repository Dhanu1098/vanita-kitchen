# 📧 EmailJS Setup Guide - FREE Email Service

EmailJS ek **FREE** service hai jo bina backend ke directly client-side se emails send kar sakta hai!

## 🚀 Step 1: EmailJS Account Banao (FREE)

1. **Website kholo**: https://www.emailjs.com/
2. **Sign Up** pe click karo
3. Email/Google se sign up karo
4. **FREE** plan select karo (200 emails/month FREE!)

---

## 📝 Step 2: Email Service Add Karo

1. EmailJS Dashboard mein **"Email Services"** pe jao
2. **"Add New Service"** click karo
3. **Gmail** select karo (ya koi bhi email provider)
4. **"Connect Account"** pe click karo
5. Apna Gmail account select karo aur permission do
6. **Service ID** note kar lo (example: `service_abc123`)

---

## 📄 Step 3: Email Templates Banao

### Template 1: Daily Summary Email

1. Dashboard mein **"Email Templates"** pe jao
2. **"Create New Template"** click karo
3. Template Name: `Daily Tiffin Summary`

**Email Template:**
```
Subject: 📊 Daily Tiffin Service Summary - {{date}}

Hello {{business_name}},

Here's your daily business summary:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 TODAY'S PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Total Orders: {{total_orders}}
   • 🍛 Lunch: {{lunch_count}} orders
   • 🌙 Dinner: {{dinner_count}} orders

💰 FINANCIAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Revenue: {{total_revenue}}
   • Cost: {{total_cost}}
   • Profit: {{total_profit}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: {{date}}

Keep up the great work! 🚀

Best regards,
Tiffin Service Management System
```

4. **Template ID** note kar lo (example: `template_xyz789`)
5. **Save** karo

---

### Template 2: Subscription Expiry Alert

1. Phir se **"Create New Template"** click karo
2. Template Name: `Subscription Expiry Alert`

**Email Template:**
```
Subject: ⏰ Subscription Expiring Soon - {{customer_name}}

Hello {{business_name}},

🔔 SUBSCRIPTION EXPIRY REMINDER

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Customer Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Customer: {{customer_name}}
📋 Plan: {{plan_type}}
🍽️ Meal Type: {{meal_type}}
💵 Price: {{subscription_price}}

⚠️ EXPIRY INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Expiry Date: {{expiry_date}}
   • Days Remaining: {{days_remaining}} days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please contact the customer to renew their subscription!

Best regards,
Tiffin Service Management System
```

3. **Template ID** note kar lo (example: `template_sub456`)
4. **Save** karo

---

## 🔑 Step 4: Public Key Lo

1. Dashboard mein **"Account"** section pe jao
2. **"General"** tab mein
3. **"Public Key"** copy karo (example: `FJk8sL_mN9pQrStUv`)

---

## ⚙️ Step 5: .env.local File Update Karo

Apni project ki `.env.local` file mein yeh add karo:

```env
# EmailJS Configuration (FREE Service - 200 emails/month)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=FJk8sL_mN9pQrStUv
NEXT_PUBLIC_EMAILJS_TEMPLATE_DAILY=template_xyz789
NEXT_PUBLIC_EMAILJS_TEMPLATE_SUBSCRIPTION=template_sub456
```

**⚠️ IMPORTANT:** 
- `service_abc123` ko apni Service ID se replace karo
- `FJk8sL_mN9pQrStUv` ko apni Public Key se replace karo
- `template_xyz789` ko Daily Summary Template ID se replace karo
- `template_sub456` ko Subscription Template ID se replace karo

---

## 🎯 Step 6: Test Karo!

1. **Dev server restart karo**:
   ```bash
   # Terminal mein Ctrl+C dabao
   npm run dev
   ```

2. **Settings page pe jao**: http://localhost:3001/settings

3. **Notification email address dalo**

4. **"Send Test" button click karo**

5. **Email check karo!** 📧

---

## ✅ Success Indicators

Agar sab kuch sahi hai toh:

- ✅ Settings page mein **"EmailJS Configured"** green box dikhega
- ✅ Test button click karne par email send hoga
- ✅ 2-5 seconds mein email inbox mein aa jayega
- ✅ Alert mein success message dikhega

---

## 🐛 Troubleshooting

### Problem 1: "EmailJS is not configured"
**Solution:** 
- `.env.local` file check karo
- Sare 4 values properly add kiye hain?
- Dev server restart kiya?

### Problem 2: Email nahi aa raha
**Solution:**
- Spam folder check karo
- EmailJS dashboard mein "Logs" check karo
- Template variables properly use kiye hain?
- Service properly connected hai?

### Problem 3: "Failed to send email"
**Solution:**
- Internet connection check karo
- EmailJS dashboard mein service active hai?
- Public Key sahi hai?
- Template IDs correct hain?

---

## 💡 Important Notes

1. **FREE Plan Limits:**
   - 200 emails/month FREE
   - 1 email service
   - 2 email templates
   - Enough for testing!

2. **Upgrade Kab Kare:**
   - Agar 200+ emails/month chahiye
   - Production use ke liye
   - Multiple services chahiye

3. **Email Provider:**
   - Gmail best hai
   - Outlook bhi use kar sakte ho
   - Any SMTP provider

4. **Security:**
   - Public key safe hai (client-side ke liye)
   - Private key kabhi commit mat karo
   - `.env.local` file `.gitignore` mein hai

---

## 📚 Additional Resources

- **EmailJS Docs**: https://www.emailjs.com/docs/
- **Dashboard**: https://dashboard.emailjs.com/
- **Support**: https://www.emailjs.com/docs/faq/

---

## 🎉 Done!

Congratulations! Ab tumhara email system fully functional hai! 🚀

**Next Steps:**
1. Production mein deploy karne se pehle proper email templates design karo
2. Business email use karo (professional dikhega)
3. Email frequency manage karo (customers ko spam mat karo)

---

**Happy Coding! 💻✨**

