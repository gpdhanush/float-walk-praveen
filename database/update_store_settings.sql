-- Add missing columns to store_settings table one by one
-- Add tax_number if it doesn't exist
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50) NULL;

-- Add owner_name after store_name
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255) NULL;

-- Add mobile
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20) NULL;

-- Add gst_percent
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) NOT NULL DEFAULT 18.00;

-- Add gst_number
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50) NULL;

-- Add theme
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS theme ENUM('light', 'dark') NOT NULL DEFAULT 'light';

-- Add theme_color
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) NOT NULL DEFAULT 'blue';

-- Add language
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS language ENUM('en', 'ta') NOT NULL DEFAULT 'en';

-- Insert default settings if table is empty
INSERT INTO store_settings (id, store_name, owner_name, address, phone, mobile, email, tax_number, gst_percent, gst_number, theme, theme_color, language)
SELECT * FROM (SELECT 
    UUID() as id,
    'FootWear Pro' as store_name,
    'John Doe' as owner_name,
    '123 Main Street, Chennai, TN 600001' as address,
    '+91 98765 43210' as phone,
    '+91 98765 43210' as mobile,
    'info@footwearpro.com' as email,
    '33XXXXX1234X1ZX' as tax_number,
    18.00 as gst_percent,
    '33XXXXX1234X1ZX' as gst_number,
    'light' as theme,
    'blue' as theme_color,
    'en' as language
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM store_settings LIMIT 1);
