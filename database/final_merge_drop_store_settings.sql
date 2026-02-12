-- =====================================================
-- FINAL MIGRATION: MERGE & DROP STORE_SETTINGS TABLE
-- =====================================================
-- This script:
-- 1. Adds all store columns to users table
-- 2. Migrates data from store_settings to users
-- 3. Drops store_settings table
-- =====================================================

-- Step 1: Add ALL store-related columns to users table
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

-- Step 2: Migrate data from store_settings to admin user
-- Check if store_settings table exists
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = DATABASE() 
                     AND table_name = 'store_settings');

-- Migrate if table exists
UPDATE users u
LEFT JOIN store_settings s ON 1=1
SET 
    u.store_name = COALESCE(s.store_name, u.store_name, 'FootWear Pro'),
    u.store_address = COALESCE(s.address, u.store_address),
    u.store_mobile = COALESCE(s.mobile, s.phone, u.store_mobile),
    u.gst_percent = COALESCE(s.gst_percent, u.gst_percent, 18.00),
    u.gst_number = COALESCE(s.gst_number, s.tax_number, u.gst_number),
    u.logo_url = COALESCE(s.logo_url, u.logo_url),
    u.theme = COALESCE(s.theme, u.theme, 'light'),
    u.theme_color = COALESCE(s.theme_color, u.theme_color, 'blue'),
    u.language = COALESCE(s.language, u.language, 'en')
WHERE u.role = 'ADMIN' AND @table_exists > 0
ORDER BY u.created_at ASC
LIMIT 1;

-- Step 3: Set defaults for all users without store info
UPDATE users
SET 
    store_name = COALESCE(store_name, 'FootWear Pro'),
    gst_percent = COALESCE(gst_percent, 18.00),
    theme = COALESCE(theme, 'light'),
    theme_color = COALESCE(theme_color, 'blue'),
    language = COALESCE(language, 'en')
WHERE store_name IS NULL OR store_name = '';

-- Step 4: Verify migration before dropping table
SELECT 
    '=== VERIFICATION: Check migrated data ===' as message;
    
SELECT 
    id, email, name as owner_name,
    store_name, store_address, store_mobile,
    gst_percent, gst_number, 
    CASE WHEN logo_url IS NOT NULL THEN 'Yes' ELSE 'No' END as has_logo,
    theme, theme_color, language
FROM users 
WHERE role = 'ADMIN';

-- Step 5: Drop store_settings table
-- IMPORTANT: Only run if data looks correct above!
DROP TABLE IF EXISTS store_settings;

SELECT 
    '=== MIGRATION COMPLETE ===' as message,
    'Store settings merged into users table' as status,
    'store_settings table dropped' as cleanup;

-- Step 6: Verify final structure
DESCRIBE users;
