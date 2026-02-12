-- ⚠️ URGENT: Run this SQL to fix the "Unknown column 'i.type'" error
-- This combines all necessary migrations

-- 1. Add missing invoice columns (FIXES THE ERROR!)
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(14,2) NULL AFTER paid_amount,
ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) NULL AFTER subtotal,
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(14,2) NULL AFTER gst_percent,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) NULL DEFAULT 'Invoice' AFTER code;

-- 2. Update existing invoices with default type
UPDATE invoices SET type = 'Invoice' WHERE type IS NULL OR type = '';

-- 3. Add email and phone columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL AFTER password_hash,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER store_address;

-- 4. Migrate data from old columns to new ones (if they exist)
UPDATE users 
SET phone = store_mobile 
WHERE store_mobile IS NOT NULL AND (phone IS NULL OR phone = '');

-- 5. Remove old columns
ALTER TABLE users
DROP COLUMN IF EXISTS store_mobile,
DROP COLUMN IF EXISTS store_email;

-- 6. Verify changes
SELECT '✅ Invoice columns added' AS Step1;
DESCRIBE invoices;

SELECT '✅ User columns updated' AS Step2;
DESCRIBE users;

SELECT '✅ ALL MIGRATIONS COMPLETE - Restart your backend server now!' AS Status;
