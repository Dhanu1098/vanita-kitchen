-- ================================================
-- SIMPLE DELIVERY SYSTEM - DATABASE SCHEMA
-- ================================================
-- Ultra-simple delivery system for solo delivery person
-- No areas, no staff management - just addresses!
-- ================================================

-- 1. REMOVE UNNECESSARY TABLES
-- Drop delivery_areas and delivery_boys tables if they exist
DROP TABLE IF EXISTS delivery_areas CASCADE;
DROP TABLE IF EXISTS delivery_boys CASCADE;

-- 2. REMOVE UNNECESSARY COLUMNS FROM ORDERS
-- Remove foreign key references to deleted tables
DO $$ 
BEGIN
    -- Remove area_id column from orders
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='orders' AND column_name='area_id') THEN
        ALTER TABLE orders DROP COLUMN IF EXISTS area_id;
    END IF;

    -- Remove delivery_boy_id column from orders
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='orders' AND column_name='delivery_boy_id') THEN
        ALTER TABLE orders DROP COLUMN IF EXISTS delivery_boy_id;
    END IF;

    -- Remove assigned_at column (not needed)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='orders' AND column_name='assigned_at') THEN
        ALTER TABLE orders DROP COLUMN IF EXISTS assigned_at;
    END IF;

    -- Remove delivery_proof column (not needed for simple system)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='orders' AND column_name='delivery_proof') THEN
        ALTER TABLE orders DROP COLUMN IF EXISTS delivery_proof;
    END IF;
END $$;

-- 3. REMOVE UNNECESSARY COLUMNS FROM CUSTOMERS
-- Remove area_id from customers table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='customers' AND column_name='area_id') THEN
        ALTER TABLE customers DROP COLUMN IF EXISTS area_id;
    END IF;
END $$;

-- 4. ADD ESSENTIAL DELIVERY COLUMNS TO ORDERS
-- Only what we actually need for delivery tracking
DO $$ 
BEGIN
    -- Add customer_phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='customer_phone') THEN
        ALTER TABLE orders ADD COLUMN customer_phone TEXT;
    END IF;

    -- Add customer_address column (MOST IMPORTANT!)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='customer_address') THEN
        ALTER TABLE orders ADD COLUMN customer_address TEXT;
    END IF;

    -- Add delivery_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='delivery_status') THEN
        ALTER TABLE orders ADD COLUMN delivery_status TEXT DEFAULT 'not-assigned' 
            CHECK (delivery_status IN ('not-assigned', 'assigned', 'picked-up', 'out-for-delivery', 'delivered', 'failed'));
    END IF;

    -- Add picked_up_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='picked_up_at') THEN
        ALTER TABLE orders ADD COLUMN picked_up_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add delivered_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='delivered_at') THEN
        ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add delivery_notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='delivery_notes') THEN
        ALTER TABLE orders ADD COLUMN delivery_notes TEXT;
    END IF;
END $$;

-- 5. DROP OLD INDEXES (if they exist)
DROP INDEX IF EXISTS idx_orders_area_id;
DROP INDEX IF EXISTS idx_orders_delivery_boy_id;
DROP INDEX IF EXISTS idx_customers_area_id;
DROP INDEX IF EXISTS idx_delivery_boys_status;

-- 6. CREATE NEW INDEXES FOR BETTER PERFORMANCE
-- Only indexes for columns we're actually using
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_date_delivery_status ON orders(date, delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_address ON orders(customer_address);

-- ================================================
-- COMPLETE! 
-- ================================================
-- ✅ delivery_areas table - REMOVED
-- ✅ delivery_boys table - REMOVED
-- ✅ Unnecessary columns - REMOVED
-- ✅ Old indexes - REMOVED
-- ✅ Essential columns - ADDED
-- ================================================
-- Simple delivery system ready!
-- Just add orders with full addresses and start delivering
-- Google Maps will handle route optimization
-- ================================================
