-- Add delivery_charge column to orders table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 0 NOT NULL;

-- Update existing orders to have 0 delivery charge
UPDATE orders 
SET delivery_charge = 0 
WHERE delivery_charge IS NULL;

