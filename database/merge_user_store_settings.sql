-- =====================================================
-- MERGE USER AND STORE SETTINGS INTO SINGLE TABLE
-- =====================================================
-- This migration adds store-related fields to users table
-- and migrates data from store_settings table
-- =====================================================

-- Step 1: Add store-related columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS store_name VARCHAR(255) NULL AFTER name,
ADD COLUMN IF NOT EXISTS store_address TEXT NULL AFTER store_name,
ADD COLUMN IF NOT EXISTS store_mobile VARCHAR(20) NULL AFTER store_address,
ADD COLUMN IF NOT EXISTS store_phone VARCHAR(20) NULL AFTER store_mobile,
ADD COLUMN IF NOT EXISTS store_email VARCHAR(255) NULL AFTER store_phone,
ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50) NULL AFTER store_email,
ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) NOT NULL DEFAULT 18.00 AFTER tax_number,
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50) NULL AFTER gst_percent,
ADD COLUMN IF NOT EXISTS logo_url TEXT NULL AFTER gst_number,
ADD COLUMN IF NOT EXISTS theme ENUM('light', 'dark') NOT NULL DEFAULT 'light' AFTER logo_url,
ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) NOT NULL DEFAULT 'blue' AFTER theme,
ADD COLUMN IF NOT EXISTS language ENUM('en', 'ta') NOT NULL DEFAULT 'en' AFTER theme_color;

-- Step 2: Migrate data from store_settings to the first admin user
-- This assumes you have at least one admin user
UPDATE users u
INNER JOIN store_settings s ON 1=1  -- Cross join to get store_settings data
SET 
    u.store_name = COALESCE(s.store_name, u.store_name),
    u.store_address = COALESCE(s.address, u.store_address),
    u.store_mobile = COALESCE(s.mobile, u.store_mobile),
    u.store_phone = COALESCE(s.phone, u.store_phone),
    u.store_email = COALESCE(s.email, u.store_email),
    u.tax_number = COALESCE(s.tax_number, u.tax_number),
    u.gst_percent = COALESCE(s.gst_percent, u.gst_percent),
    u.gst_number = COALESCE(s.gst_number, u.gst_number),
    u.logo_url = COALESCE(s.logo_url, u.logo_url),
    u.theme = COALESCE(s.theme, u.theme),
    u.theme_color = COALESCE(s.theme_color, u.theme_color),
    u.language = COALESCE(s.language, u.language)
WHERE u.role = 'ADMIN'
ORDER BY u.created_at ASC
LIMIT 1;

-- Step 3: Set default values for users without store info
UPDATE users
SET 
    store_name = COALESCE(store_name, 'FootWear Pro'),
    gst_percent = COALESCE(gst_percent, 18.00),
    theme = COALESCE(theme, 'light'),
    theme_color = COALESCE(theme_color, 'blue'),
    language = COALESCE(language, 'en')
WHERE store_name IS NULL OR store_name = '';

-- Step 4: (OPTIONAL) Drop store_settings table after verifying data migration
-- IMPORTANT: Only run this after confirming data is migrated correctly
-- Uncomment the line below when ready:
-- DROP TABLE IF EXISTS store_settings;

-- Step 5: Verify the migration
-- Run this to check the migrated data:
-- SELECT id, email, name, store_name, store_address, store_mobile, gst_percent, logo_url, theme FROM users WHERE role = 'ADMIN';

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================
-- If you need to rollback, uncomment and run these:
/*
ALTER TABLE users
DROP COLUMN IF EXISTS store_name,
DROP COLUMN IF EXISTS store_address,
DROP COLUMN IF EXISTS store_mobile,
DROP COLUMN IF EXISTS store_phone,
DROP COLUMN IF EXISTS store_email,
DROP COLUMN IF EXISTS tax_number,
DROP COLUMN IF EXISTS gst_percent,
DROP COLUMN IF EXISTS gst_number,
DROP COLUMN IF EXISTS logo_url,
DROP COLUMN IF EXISTS theme,
DROP COLUMN IF EXISTS theme_color,
DROP COLUMN IF EXISTS language;
*/
