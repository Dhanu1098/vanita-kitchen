# Tiffin Service Management System

A comprehensive management system for tiffin service businesses with order tracking, analytics, profit/loss calculations, and subscription management.

## Features

### 📊 Dashboard
- Real-time overview of daily orders, revenue, and profit
- Visual analytics with interactive charts
- Monthly and weekly summaries
- Recent orders tracking

### 📦 Order Management
- Add, edit, and delete orders
- Track order status (pending, confirmed, delivered, cancelled)
- Calculate profit/loss per order
- Multiple meal types (lunch, dinner, both)
- Source tracking (WhatsApp, manual, subscription)

### 👥 Customer Management
- Customer database with contact details
- Easy customer search and filtering
- Customer history tracking

### 📅 Subscription Management
- Daily, weekly, and monthly subscription plans
- Subscription status tracking (active, paused, expired)
- Automatic renewal reminders
- Flexible meal type selection

### 📈 Analytics
- Daily, weekly, monthly, and yearly analytics
- Revenue vs cost analysis
- Profit margin calculations
- Order volume trends
- Visual charts and graphs

### 💬 WhatsApp Integration
- Quick order entry from WhatsApp messages
- Bulk order processing
- Automatic customer creation

### 🍱 Menu Management
- Manage menu items with pricing
- Track cost price and selling price
- Calculate profit per item
- Category-wise organization (veg, non-veg, special)

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand with persistence
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date Handling:** date-fns

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Orders

1. **Manual Entry:** Navigate to Orders > Add Order
2. **WhatsApp Entry:** Use the WhatsApp Entry page for bulk order addition
3. Fill in customer details and select menu items
4. System automatically calculates profit/loss

### Managing Subscriptions

1. Go to Subscriptions page
2. Click "Add Subscription"
3. Select customer, plan type, and duration
4. System tracks active, paused, and expired subscriptions

### Viewing Analytics

1. Navigate to Analytics page
2. Switch between Daily, Weekly, Monthly, and Yearly views
3. View detailed charts and metrics
4. Track revenue, costs, and profit trends

### Managing Menu

1. Go to Menu Items page
2. Add items with selling price and cost price
3. System automatically calculates profit margins

## Data Storage

All data is stored locally in your browser using Zustand persist middleware. Data persists across browser sessions.

## Features Overview

- ✅ Order Management with Profit/Loss Tracking
- ✅ Customer Database
- ✅ Subscription Management
- ✅ WhatsApp Quick Entry
- ✅ Comprehensive Analytics (Daily, Weekly, Monthly, Yearly)
- ✅ Menu Management with Cost Tracking
- ✅ Modern, Responsive UI
- ✅ Real-time Calculations
- ✅ Local Data Persistence

## Future Enhancements

- WhatsApp Business API Integration
- SMS Notifications
- Payment Tracking
- Delivery Route Optimization
- Mobile App
- Multi-user Support
- Cloud Backup

## Support

For issues or questions, please refer to the documentation or contact support.

---

Built with ❤️ for Tiffin Service Businesses

