-- ================================================
-- FIX: Delivery Boy System Database Errors
-- ================================================
-- Run this if you get errors with DATABASE_DELIVERY_SYSTEM_V2.sql

-- ================================================
-- 1. ADD MISSING COLUMNS TO ORDERS TABLE
-- ================================================

-- Add delivery_boy_id column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='orders' 
                   AND column_name='delivery_boy_id') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_boy_id UUID;
        ALTER TABLE public.orders ADD CONSTRAINT fk_delivery_boy 
            FOREIGN KEY (delivery_boy_id) REFERENCES public.delivery_boys(id);
        RAISE NOTICE 'Added delivery_boy_id column to orders table';
    ELSE
        RAISE NOTICE 'delivery_boy_id column already exists';
    END IF;
END $$;

-- Add payment_method column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='orders' 
                   AND column_name='payment_method') THEN
        ALTER TABLE public.orders ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cash';
        RAISE NOTICE 'Added payment_method column to orders table';
    ELSE
        RAISE NOTICE 'payment_method column already exists';
    END IF;
END $$;

-- Add is_paid column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='orders' 
                   AND column_name='is_paid') THEN
        ALTER TABLE public.orders ADD COLUMN is_paid BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_paid column to orders table';
    ELSE
        RAISE NOTICE 'is_paid column already exists';
    END IF;
END $$;

-- Add paid_at column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='orders' 
                   AND column_name='paid_at') THEN
        ALTER TABLE public.orders ADD COLUMN paid_at TIMESTAMP;
        RAISE NOTICE 'Added paid_at column to orders table';
    ELSE
        RAISE NOTICE 'paid_at column already exists';
    END IF;
END $$;

-- Add cash_collected_by column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='orders' 
                   AND column_name='cash_collected_by') THEN
        ALTER TABLE public.orders ADD COLUMN cash_collected_by UUID;
        ALTER TABLE public.orders ADD CONSTRAINT fk_cash_collector 
            FOREIGN KEY (cash_collected_by) REFERENCES public.delivery_boys(id);
        RAISE NOTICE 'Added cash_collected_by column to orders table';
    ELSE
        RAISE NOTICE 'cash_collected_by column already exists';
    END IF;
END $$;

-- ================================================
-- 2. ADD MISSING COLUMNS TO DELIVERY_BOYS TABLE
-- ================================================

DO $$ 
BEGIN
    -- login_pin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='delivery_boys' 
                   AND column_name='login_pin') THEN
        ALTER TABLE public.delivery_boys ADD COLUMN login_pin VARCHAR(6);
    END IF;

    -- is_active_today
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='delivery_boys' 
                   AND column_name='is_active_today') THEN
        ALTER TABLE public.delivery_boys ADD COLUMN is_active_today BOOLEAN DEFAULT false;
    END IF;

    -- current_slot
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='delivery_boys' 
                   AND column_name='current_slot') THEN
        ALTER TABLE public.delivery_boys ADD COLUMN current_slot VARCHAR(20);
    END IF;

    -- cash_in_hand
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='delivery_boys' 
                   AND column_name='cash_in_hand') THEN
        ALTER TABLE public.delivery_boys ADD COLUMN cash_in_hand DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- total_earnings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='delivery_boys' 
                   AND column_name='total_earnings') THEN
        ALTER TABLE public.delivery_boys ADD COLUMN total_earnings DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- payment_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='delivery_boys' 
                   AND column_name='payment_type') THEN
        ALTER TABLE public.delivery_boys ADD COLUMN payment_type VARCHAR(20) DEFAULT 'per-delivery';
    END IF;

    -- slot_rate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name='delivery_boys' 
                   AND column_name='slot_rate') THEN
        ALTER TABLE public.delivery_boys ADD COLUMN slot_rate DECIMAL(10,2) DEFAULT 0;
    END IF;

    RAISE NOTICE 'All delivery_boys columns checked/added';
END $$;

-- ================================================
-- 3. UPDATE SAMPLE DATA WITH PINs
-- ================================================

-- Set default PINs for sample delivery boys
UPDATE public.delivery_boys 
SET login_pin = '1234' 
WHERE login_pin IS NULL OR login_pin = '';

-- ================================================
-- SUCCESS MESSAGE
-- ================================================

SELECT '✅ Database fix complete! 
- All missing columns added
- Sample delivery boys have PIN: 1234
- Ready to use!' as message;

