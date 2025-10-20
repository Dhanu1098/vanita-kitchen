-- Settings Table for Tiffin Service Management System

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL DEFAULT 'My Tiffin Service',
  contact_number VARCHAR(20),
  business_address TEXT,
  email VARCHAR(255),
  
  -- Notification Settings
  new_order_notifications BOOLEAN DEFAULT true,
  daily_summary_email BOOLEAN DEFAULT false,
  subscription_expiry_alerts BOOLEAN DEFAULT true,
  notification_email VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if not exists
INSERT INTO settings (business_name, contact_number, business_address, email)
VALUES ('My Tiffin Service', '', '', '')
ON CONFLICT DO NOTHING;

-- Only keep one settings row
CREATE UNIQUE INDEX IF NOT EXISTS settings_single_row ON settings ((true));

