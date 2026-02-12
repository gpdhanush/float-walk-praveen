-- Remove tax_number column from users table
-- This migration removes the tax_number field as it's no longer needed

-- Check if tax_number column exists and drop it
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'tax_number';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname, ';'),
  'SELECT 1;'
));

PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Verification: Show current users table structure
SELECT 'Users table structure after removing tax_number:' AS Status;
DESCRIBE users;

-- Show sample data
SELECT 'Sample user data:' AS Status;
SELECT 
    id,
    email,
    name,
    role,
    store_name,
    store_address,
    store_mobile,
    gst_percent,
    gst_number,
    logo_url,
    theme,
    theme_color,
    language
FROM users
LIMIT 1;
