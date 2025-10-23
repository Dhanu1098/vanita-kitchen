-- Fix Supabase RLS Policies for Orders Table
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable read for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON orders;

-- Create new policies (without IF NOT EXISTS)
CREATE POLICY "Enable insert for all users" 
ON orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable read for all users" 
ON orders FOR SELECT 
USING (true);

CREATE POLICY "Enable update for all users" 
ON orders FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON orders FOR DELETE 
USING (true);

-- Verify
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'orders';

