-- ================================================
-- DELIVERY BOYS TABLE
-- ================================================
-- This table stores delivery boy information and their status
-- Run this in Supabase SQL Editor

-- Create delivery_boys table
CREATE TABLE IF NOT EXISTS public.delivery_boys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    vehicle_type VARCHAR(50) DEFAULT 'bike', -- bike, scooter, cycle, car
    vehicle_number VARCHAR(50),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, on-leave
    joining_date DATE DEFAULT CURRENT_DATE,
    profile_photo TEXT,
    aadhar_number VARCHAR(20),
    license_number VARCHAR(50),
    emergency_contact VARCHAR(20),
    salary DECIMAL(10,2) DEFAULT 0,
    incentive_per_delivery DECIMAL(10,2) DEFAULT 0,
    working_hours VARCHAR(50) DEFAULT '9:00 AM - 6:00 PM',
    rating DECIMAL(3,2) DEFAULT 5.0, -- Average rating out of 5
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_delivery_boys_phone ON public.delivery_boys(phone);
CREATE INDEX IF NOT EXISTS idx_delivery_boys_status ON public.delivery_boys(status);
CREATE INDEX IF NOT EXISTS idx_delivery_boys_name ON public.delivery_boys(name);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.delivery_boys ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON public.delivery_boys
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow read access for anon users (optional - remove if you want stricter security)
CREATE POLICY "Allow read for anon users" ON public.delivery_boys
    FOR SELECT
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_delivery_boys_updated_at BEFORE UPDATE
    ON public.delivery_boys FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample delivery boys (optional - for testing)
INSERT INTO public.delivery_boys (name, phone, vehicle_type, vehicle_number, status, salary, incentive_per_delivery) VALUES
('Rahul Kumar', '9876543210', 'bike', 'MH-12-AB-1234', 'active', 15000, 10),
('Amit Sharma', '9876543211', 'scooter', 'MH-12-CD-5678', 'active', 14000, 10),
('Vijay Singh', '9876543212', 'bike', 'MH-12-EF-9012', 'on-leave', 15000, 10)
ON CONFLICT (phone) DO NOTHING;

-- Success message
SELECT 'Delivery Boys table created successfully! ✅' as message;

