-- Check logo_url column type and size limits
DESCRIBE users;

-- Show the specific logo_url column details
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'footwear_retail'
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'logo_url';

-- Check current logo_url size
SELECT 
    id,
    name,
    LENGTH(logo_url) as logo_size_bytes,
    ROUND(LENGTH(logo_url) / 1024, 2) as logo_size_kb,
    LEFT(logo_url, 30) as logo_preview
FROM users
WHERE logo_url IS NOT NULL AND logo_url != '';
