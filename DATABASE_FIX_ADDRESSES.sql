-- ================================================
-- FIX: Add Customer Addresses to Existing Orders
-- ================================================
-- This script copies customer addresses to orders that don't have them
-- Run this once to update all existing orders
-- ================================================

-- Update orders table: Copy customer address from customers table
UPDATE orders o
SET 
    customer_address = c.address,
    customer_phone = COALESCE(o.customer_phone, c.phone)
FROM customers c
WHERE o.customer_id = c.id
  AND (o.customer_address IS NULL OR o.customer_address = '')
  AND c.address IS NOT NULL
  AND c.address != '';

-- Show results
SELECT 
    COUNT(*) as orders_updated
FROM orders
WHERE customer_address IS NOT NULL 
  AND customer_address != '';

-- ================================================
-- DONE!
-- ================================================
-- All orders with linked customers now have addresses
-- Orders without customer_id will need manual address entry
-- ================================================


