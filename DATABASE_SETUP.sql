-- Tiffin Service Management System - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items Table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('veg', 'non-veg', 'special')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'weekly', 'monthly')),
    meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner', 'both')),
    price DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner', 'both')),
    items JSONB NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    profit DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
    source TEXT NOT NULL CHECK (source IN ('whatsapp', 'manual', 'subscription')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_date ON orders(date);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Insert default menu items
INSERT INTO menu_items (name, price, cost, category) VALUES
    ('Standard Thali', 100, 60, 'veg'),
    ('Special Thali', 150, 90, 'special'),
    ('Non-Veg Thali', 180, 110, 'non-veg');

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since using anon key)
-- Note: In production, you should implement proper authentication

CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON customers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON menu_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON subscriptions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON subscriptions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON orders FOR DELETE USING (true);

