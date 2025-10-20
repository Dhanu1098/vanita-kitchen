-- ====================================
-- Quick Test: Create Subscription Expiring in 2 Days
-- ====================================

-- Step 1: Check if customers exist
SELECT id, name, phone FROM customers LIMIT 5;

-- Step 2: Create test subscription (UPDATE customer_id with actual ID from above)
INSERT INTO subscriptions (
  id,
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
  gen_random_uuid(),
  'PASTE_CUSTOMER_ID_HERE',  -- ⚠️ Replace with actual customer ID from Step 1
  'monthly',
  'both',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '2 days',  -- Exactly 2 days from today
  1000.00,
  'active',
  NOW(),
  NOW()
);

-- Step 3: Verify the subscription was created
SELECT 
  s.id,
  c.name as customer_name,
  s.plan_type,
  s.meal_type,
  s.start_date,
  s.end_date,
  EXTRACT(DAY FROM (s.end_date - CURRENT_DATE)) as days_until_expiry,
  s.price,
  s.status
FROM subscriptions s
JOIN customers c ON c.id = s.customer_id
WHERE s.status = 'active'
AND s.end_date >= CURRENT_DATE
AND s.end_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY s.end_date;

-- Step 4: Check specifically for 2-day expiring subscriptions
SELECT 
  s.id,
  c.name as customer_name,
  s.plan_type,
  s.meal_type,
  s.end_date,
  EXTRACT(DAY FROM (s.end_date - CURRENT_DATE)) as days_until_expiry,
  s.price
FROM subscriptions s
JOIN customers c ON c.id = s.customer_id
WHERE s.status = 'active'
AND s.end_date::date = (CURRENT_DATE + INTERVAL '2 days')::date;
-- This should return at least 1 row for auto-alerts to work!

-- Step 5: Verify settings are configured
SELECT 
  subscription_expiry_alerts as "Alerts Enabled?",
  notification_email as "Email Address",
  business_name as "Business Name"
FROM settings;
-- Expected: Alerts Enabled = true, Email Address should be set

-- ====================================
-- CLEANUP (Run this to delete test subscription later)
-- ====================================
-- DELETE FROM subscriptions 
-- WHERE plan_type = 'monthly' 
-- AND price = 1000.00 
-- AND end_date::date = (CURRENT_DATE + INTERVAL '2 days')::date;

