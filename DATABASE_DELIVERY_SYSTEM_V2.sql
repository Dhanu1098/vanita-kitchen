-- ================================================
-- DELIVERY BOY SYSTEM V2 - Complete Update
-- ================================================
-- New features: Slots, Cash Management, Settlements
-- Run this in Supabase SQL Editor

-- ================================================
-- 1. UPDATE DELIVERY BOYS TABLE
-- ================================================

-- Add new columns to delivery_boys table
ALTER TABLE public.delivery_boys 
ADD COLUMN IF NOT EXISTS login_pin VARCHAR(6),
ADD COLUMN IF NOT EXISTS is_active_today BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_slot VARCHAR(20),
ADD COLUMN IF NOT EXISTS cash_in_hand DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'per-delivery', -- 'per-delivery' or 'per-slot' or 'fixed'
ADD COLUMN IF NOT EXISTS slot_rate DECIMAL(10,2) DEFAULT 0;

-- Update working_hours to support slots
COMMENT ON COLUMN public.delivery_boys.working_hours IS 'JSON: {"morning": true, "afternoon": false, "evening": true}';
COMMENT ON COLUMN public.delivery_boys.current_slot IS 'Current active slot: morning/afternoon/evening';

-- ================================================
-- 2. CREATE DELIVERY SLOTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.delivery_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Morning', 'Afternoon', 'Evening'
    slot_key VARCHAR(20) NOT NULL UNIQUE, -- 'morning', 'afternoon', 'evening'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    base_rate DECIMAL(10,2) DEFAULT 0, -- Base rate for this slot
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default slots
INSERT INTO public.delivery_slots (name, slot_key, start_time, end_time, base_rate) VALUES
('Morning Slot', 'morning', '08:00:00', '12:00:00', 150),
('Afternoon Slot', 'afternoon', '12:00:00', '17:00:00', 150),
('Evening Slot', 'evening', '17:00:00', '22:00:00', 200)
ON CONFLICT (slot_key) DO NOTHING;

-- ================================================
-- 3. CREATE CASH COLLECTIONS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.cash_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_boy_id UUID REFERENCES public.delivery_boys(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    collection_date DATE DEFAULT CURRENT_DATE,
    collection_time TIMESTAMP DEFAULT NOW(),
    is_settled BOOLEAN DEFAULT false,
    settled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_collections_boy ON public.cash_collections(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_cash_collections_date ON public.cash_collections(collection_date);
CREATE INDEX IF NOT EXISTS idx_cash_collections_settled ON public.cash_collections(is_settled);

-- ================================================
-- 4. CREATE DELIVERY BOY EARNINGS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.delivery_boy_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_boy_id UUID REFERENCES public.delivery_boys(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    slot VARCHAR(20), -- 'morning', 'afternoon', 'evening', or NULL for per-delivery
    deliveries_count INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    base_earning DECIMAL(10,2) DEFAULT 0, -- Slot rate or base salary
    incentive_earning DECIMAL(10,2) DEFAULT 0, -- Per delivery incentives
    bonus DECIMAL(10,2) DEFAULT 0, -- Any bonus
    penalty DECIMAL(10,2) DEFAULT 0, -- Any penalty
    total_earning DECIMAL(10,2) DEFAULT 0, -- base + incentive + bonus - penalty
    cash_collected DECIMAL(10,2) DEFAULT 0,
    cash_settled DECIMAL(10,2) DEFAULT 0,
    cash_pending DECIMAL(10,2) DEFAULT 0,
    is_settled BOOLEAN DEFAULT false,
    settled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(delivery_boy_id, date, slot)
);

CREATE INDEX IF NOT EXISTS idx_earnings_boy_date ON public.delivery_boy_earnings(delivery_boy_id, date);
CREATE INDEX IF NOT EXISTS idx_earnings_settled ON public.delivery_boy_earnings(is_settled);

-- ================================================
-- 5. CREATE DELIVERY BOY ATTENDANCE TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.delivery_boy_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_boy_id UUID REFERENCES public.delivery_boys(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    slot VARCHAR(20) NOT NULL, -- 'morning', 'afternoon', 'evening'
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'present', -- 'present', 'absent', 'half-day'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(delivery_boy_id, date, slot)
);

CREATE INDEX IF NOT EXISTS idx_attendance_boy_date ON public.delivery_boy_attendance(delivery_boy_id, date);

-- ================================================
-- 6. UPDATE ORDERS TABLE
-- ================================================

-- Add delivery boy ID column first (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='delivery_boy_id') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_boy_id UUID REFERENCES public.delivery_boys(id);
    END IF;
END $$;

-- Add payment tracking columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash', -- 'cash', 'online', 'card'
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cash_collected_by UUID REFERENCES public.delivery_boys(id);

-- ================================================
-- 7. CREATE SETTLEMENTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_boy_id UUID REFERENCES public.delivery_boys(id) ON DELETE CASCADE,
    settlement_date DATE DEFAULT CURRENT_DATE,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_deliveries INTEGER DEFAULT 0,
    total_earning DECIMAL(10,2) DEFAULT 0,
    cash_collected DECIMAL(10,2) DEFAULT 0,
    cash_deposited DECIMAL(10,2) DEFAULT 0,
    amount_to_pay DECIMAL(10,2) DEFAULT 0, -- earning - cash_deposited
    amount_paid DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'paid'
    payment_method VARCHAR(20), -- 'cash', 'bank', 'upi'
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlements_boy ON public.settlements(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_settlements_date ON public.settlements(settlement_date);

-- ================================================
-- 8. RLS POLICIES
-- ================================================

-- Enable RLS
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_boy_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_boy_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Allow all for authenticated users
CREATE POLICY "Allow all for authenticated" ON public.delivery_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.cash_collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.delivery_boy_earnings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.delivery_boy_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.settlements FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- 9. TRIGGERS FOR AUTO-UPDATES
-- ================================================

-- Trigger to update delivery boy earnings when order is delivered
CREATE OR REPLACE FUNCTION update_delivery_boy_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if delivery_boy_id exists and status changed to delivered
    IF NEW.delivery_boy_id IS NOT NULL AND 
       NEW.delivery_status = 'delivered' AND 
       (OLD.delivery_status IS NULL OR OLD.delivery_status != 'delivered') THEN
        
        -- Update or insert earnings record
        INSERT INTO public.delivery_boy_earnings (
            delivery_boy_id,
            date,
            deliveries_count,
            successful_deliveries,
            incentive_earning,
            total_earning
        )
        VALUES (
            NEW.delivery_boy_id,
            CURRENT_DATE,
            1,
            1,
            (SELECT incentive_per_delivery FROM public.delivery_boys WHERE id = NEW.delivery_boy_id),
            (SELECT incentive_per_delivery FROM public.delivery_boys WHERE id = NEW.delivery_boy_id)
        )
        ON CONFLICT (delivery_boy_id, date, slot)
        DO UPDATE SET
            deliveries_count = delivery_boy_earnings.deliveries_count + 1,
            successful_deliveries = delivery_boy_earnings.successful_deliveries + 1,
            incentive_earning = delivery_boy_earnings.incentive_earning + EXCLUDED.incentive_earning,
            total_earning = delivery_boy_earnings.total_earning + EXCLUDED.total_earning,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_earnings_on_delivery ON public.orders;

-- Create trigger
CREATE TRIGGER update_earnings_on_delivery
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_boy_earnings();

-- ================================================
-- 10. HELPER FUNCTIONS
-- ================================================

-- Function to get current slot based on time
CREATE OR REPLACE FUNCTION get_current_slot()
RETURNS VARCHAR AS $$
DECLARE
    current_time TIME := CURRENT_TIME;
    slot_name VARCHAR;
BEGIN
    SELECT slot_key INTO slot_name
    FROM public.delivery_slots
    WHERE start_time <= current_time AND end_time > current_time
    AND is_active = true
    LIMIT 1;
    
    RETURN slot_name;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate pending cash for delivery boy
CREATE OR REPLACE FUNCTION get_pending_cash(boy_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    pending DECIMAL;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO pending
    FROM public.cash_collections
    WHERE delivery_boy_id = boy_id
    AND is_settled = false;
    
    RETURN pending;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================

SELECT 'Delivery System V2 setup complete! ✅
- Slots system added
- Cash management enabled
- Earnings tracking ready
- Settlement system ready' as message;

