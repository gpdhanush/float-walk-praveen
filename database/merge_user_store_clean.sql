-- =====================================================
-- CLEAN MERGE: USER AND STORE SETTINGS (ESSENTIAL FIELDS ONLY)
-- =====================================================
-- Removes redundant columns and keeps only essential fields
-- =====================================================

-- Add only essential store-related columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS store_name VARCHAR(255) NULL AFTER name,
ADD COLUMN IF NOT EXISTS store_address TEXT NULL AFTER store_name,
ADD COLUMN IF NOT EXISTS store_mobile VARCHAR(20) NULL AFTER store_address,
ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) NOT NULL DEFAULT 18.00 AFTER store_mobile,
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50) NULL AFTER gst_percent,
ADD COLUMN IF NOT EXISTS logo_url TEXT NULL AFTER gst_number,
ADD COLUMN IF NOT EXISTS theme ENUM('light', 'dark') NOT NULL DEFAULT 'light' AFTER logo_url,
ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) NOT NULL DEFAULT 'blue' AFTER theme,
ADD COLUMN IF NOT EXISTS language ENUM('en', 'ta') NOT NULL DEFAULT 'en' AFTER theme_color;

-- Migrate data from store_settings to the first admin user
UPDATE users u
INNER JOIN store_settings s ON 1=1
SET 
    u.store_name = COALESCE(s.store_name, u.store_name),
    u.store_address = COALESCE(s.address, u.store_address),
    u.store_mobile = COALESCE(s.mobile, s.phone, u.store_mobile),
    u.gst_percent = COALESCE(s.gst_percent, u.gst_percent),
    u.gst_number = COALESCE(s.gst_number, s.tax_number, u.gst_number),
    u.logo_url = COALESCE(s.logo_url, u.logo_url),
    u.theme = COALESCE(s.theme, u.theme),
    u.theme_color = COALESCE(s.theme_color, u.theme_color),
    u.language = COALESCE(s.language, u.language)
WHERE u.role = 'ADMIN'
ORDER BY u.created_at ASC
LIMIT 1;

-- Set default values for users without store info
UPDATE users
SET 
    store_name = COALESCE(store_name, 'FootWear Pro'),
    gst_percent = COALESCE(gst_percent, 18.00),
    theme = COALESCE(theme, 'light'),
    theme_color = COALESCE(theme_color, 'blue'),
    language = COALESCE(language, 'en')
WHERE store_name IS NULL OR store_name = '';

-- Verify the migration
SELECT 
    id, email, name as owner_name,
    store_name, store_address, store_mobile,
    gst_percent, gst_number, logo_url,
    theme, theme_color, language
FROM users 
WHERE role = 'ADMIN';

-- =====================================================
-- FIELDS SUMMARY
-- =====================================================
-- LOGIN:        email, password_hash (existing)
-- OWNER:        name (existing)
-- STORE:        store_name, store_address, store_mobile
-- TAX:          gst_percent, gst_number
-- BRANDING:     logo_url
-- UI:           theme, theme_color, language
-- =====================================================
-- REMOVED REDUNDANT COLUMNS:
-- - store_phone (use store_mobile only)
-- - store_email (use email only)
-- - tax_number (use gst_number only)
-- =====================================================

-- (OPTIONAL) Drop store_settings table after verification
-- DROP TABLE IF EXISTS store_settings;
