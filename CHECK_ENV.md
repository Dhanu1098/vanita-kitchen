# 🔍 EmailJS Configuration Check

## Step 1: `.env.local` File Check Karo

File location: `c:\xampp\htdocs\dhanu\VK\.env.local`

**File mein yeh lines honi chahiye:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://iqdyzxcdsnoxdtesrpjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_DAILY=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_SUBSCRIPTION=template_xxxxxxx
```

⚠️ **IMPORTANT:**
- `=` ke baad space NAHI hona chahiye
- Values mein quotes NAHI chahiye
- Har variable name `NEXT_PUBLIC_` se start hona chahiye

**SAHI ✅:**
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
```

**GALAT ❌:**
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID = service_abc123
NEXT_PUBLIC_EMAILJS_SERVICE_ID="service_abc123"
EMAILJS_SERVICE_ID=service_abc123
```

---

## Step 2: Dev Server Restart Karo

Terminal mein:

1. **Stop Server**: `Ctrl + C`
2. **Start Server**: `npm run dev`
3. Wait for: `✓ Ready in X.Xs`

---

## Step 3: Browser Console Check Karo

1. Settings page kholo: http://localhost:3001/settings
2. Browser console kholo (Press `F12`)
3. Console tab mein dekho

**Agar Configuration SAHI hai:**
```
📧 EmailJS Configuration Check:
Service ID: ✅ Present
Public Key: ✅ Present
Daily Template: ✅ Present
Subscription Template: ✅ Present
```

**Agar Configuration GALAT hai:**
```
📧 EmailJS Configuration Check:
Service ID: ❌ Missing
Public Key: ❌ Missing
...
```

---

## Step 4: Settings Page Check Karo

Settings page ke niche "Test Notifications" section mein:

- **✅ Green Box**: "EmailJS Configured" = Setup complete!
- **⚠️ Yellow Box**: "EmailJS Not Configured" = Kuch missing hai

---

## Common Issues & Solutions

### Issue 1: Sab kuch add kiya lekin still "Not Configured"

**Solution:**
1. `.env.local` file close karo
2. Dev server **completely** stop karo (`Ctrl+C`)
3. Terminal mein naya command: `npm run dev`
4. Browser **hard refresh** karo (`Ctrl+Shift+R`)

### Issue 2: Environment variables show nahi ho rahe

**Solution:**
1. File ka naam exactly `.env.local` hai? (No `.txt`)
2. File project root mein hai? (`c:\xampp\htdocs\dhanu\VK\`)
3. Variable names exactly match kar rahe hain?

### Issue 3: Values copy-paste kiye lekin kaam nahi kar raha

**Solution:**
1. Hidden characters/spaces remove karo
2. Each line ek hi line mein ho (no line breaks)
3. Example:
   ```
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
   ```
   (Ek line, no extra spaces)

---

## Quick Test Command

Browser console mein ye paste karo:

```javascript
console.log('Service ID:', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID);
console.log('Public Key:', process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
console.log('Daily Template:', process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_DAILY);
console.log('Subscription Template:', process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_SUBSCRIPTION);
```

Sab values dikhengi, `undefined` nahi hona chahiye!

---

## ✅ Final Checklist

- [ ] `.env.local` file exists
- [ ] 4 EmailJS variables added
- [ ] No spaces around `=`
- [ ] No quotes around values
- [ ] Dev server restarted
- [ ] Browser refreshed (Ctrl+Shift+R)
- [ ] Console shows "✅ Present" for all
- [ ] Settings page shows green box

Agar sab ✅ hai toh test email send karo! 🚀

