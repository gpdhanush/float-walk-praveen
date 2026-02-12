-- Fix logo_url column to handle file URLs and base64 data
-- Change from VARCHAR to TEXT to support longer URLs and potential base64 fallback

-- Check current column type
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'footwear_retail'
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'logo_url';

-- Change column to TEXT type (supports up to 65KB)
-- This is enough for file URLs (~100 chars) and small base64 images
ALTER TABLE users 
MODIFY COLUMN logo_url TEXT NULL;

-- Verify the change
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'footwear_retail'
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'logo_url';

SELECT '✅ logo_url column updated to TEXT' AS Status;
SELECT 'Column now supports file URLs and base64 data' AS Info;

-- Optional: Show current logo data
SELECT 
    id,
    name,
    CASE 
        WHEN logo_url LIKE 'data:image%' THEN 'Base64 Image'
        WHEN logo_url LIKE '/uploads/%' THEN 'File Upload'
        WHEN logo_url IS NULL THEN 'No Logo'
        ELSE 'Other'
    END as logo_type,
    LENGTH(logo_url) as size_bytes,
    ROUND(LENGTH(logo_url) / 1024, 2) as size_kb
FROM users
WHERE id IS NOT NULL;
