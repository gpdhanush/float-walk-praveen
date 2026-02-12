-- Remove store_mobile and store_email columns, use email and phone instead

-- 1. Check current structure
DESCRIBE users;

-- 2. Add email and phone columns if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL AFTER password,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER store_address;

-- 3. Migrate data from store_mobile to phone (if store_mobile exists)
UPDATE users 
SET phone = store_mobile 
WHERE store_mobile IS NOT NULL AND (phone IS NULL OR phone = '');

-- 4. Drop store_mobile and store_email columns if they exist
ALTER TABLE users
DROP COLUMN IF EXISTS store_mobile,
DROP COLUMN IF EXISTS store_email;

-- 5. Verify structure
DESCRIBE users;

-- 6. Check sample data
SELECT 
  id,
  name,
  email,
  store_name,
  store_address,
  phone,
  gst_number,
  gst_percent
FROM users 
LIMIT 5;

SELECT '✅ Store mobile and email columns removed, using email and phone' AS Status;
