-- Fix logo_url column to handle large base64 images
-- MEDIUMTEXT can store up to 16MB (plenty for base64 images)

-- Check current column type
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'footwear_retail'
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'logo_url';

-- Alter column to MEDIUMTEXT if it's not already
ALTER TABLE users 
MODIFY COLUMN logo_url MEDIUMTEXT NULL;

-- Verify the change
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'footwear_retail'
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'logo_url';

SELECT 'logo_url column updated to MEDIUMTEXT successfully' AS Status;
