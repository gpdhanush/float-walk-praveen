-- ============================================================================
-- DATABASE CLEANUP SCRIPT
-- ============================================================================
-- This script removes unused tables, columns, and indexes
-- BACKUP YOUR DATABASE BEFORE RUNNING THIS!
-- 
-- mysqldump -u root -p floatwalk_billing > backup_before_cleanup_$(date +%Y%m%d).sql
-- ============================================================================

USE floatwalk_billing;

-- ============================================================================
-- STEP 1: ADD MISSING COLUMNS TO CUSTOMERS TABLE (CRITICAL!)
-- ============================================================================
-- These columns are used in code but missing from schema

ALTER TABLE customers 
  ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20) NULL AFTER mobile,
  ADD COLUMN IF NOT EXISTS alt_contact VARCHAR(20) NULL AFTER whatsapp,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NULL AFTER email,
  ADD COLUMN IF NOT EXISTS notes TEXT NULL AFTER address;

SELECT '✅ Step 1 Complete: Added missing customer columns' as Status;

-- ============================================================================
-- STEP 2: REMOVE UNUSED TABLES
-- ============================================================================
-- These tables have NO repository, NO entity, NO frontend usage

-- Drop foot_measurements (no implementation)
DROP TABLE IF EXISTS foot_measurements;
SELECT '✅ Dropped table: foot_measurements' as Status;

-- Drop stock_logs (no implementation)
DROP TABLE IF EXISTS stock_logs;
SELECT '✅ Dropped table: stock_logs' as Status;

-- Drop products (no implementation, invoice_items.product_id is nullable and never used)
DROP TABLE IF EXISTS products;
SELECT '✅ Dropped table: products' as Status;

-- ============================================================================
-- OPTIONAL: Drop purchases table if you don't need purchase tracking
-- ============================================================================
-- UNCOMMENT the lines below ONLY if you don't need the purchases feature
-- Note: This table is used in /api/reports endpoint

-- DROP TABLE IF EXISTS purchases;
-- SELECT '✅ Dropped table: purchases' as Status;

-- ============================================================================
-- STEP 3: CLEAN UP CODE_SEQUENCES
-- ============================================================================
-- Remove sequences for dropped tables

DELETE FROM code_sequences WHERE prefix IN ('MEA', 'STK');
SELECT '✅ Removed unused code sequences (MEA, STK)' as Status;

-- OPTIONAL: Remove PUR sequence if you dropped purchases table
-- DELETE FROM code_sequences WHERE prefix = 'PUR';

-- ============================================================================
-- STEP 4: REMOVE UNUSED COLUMNS
-- ============================================================================
-- These columns exist but are never used in code

-- Remove product_id from invoice_items (never populated or used)
ALTER TABLE invoice_items DROP COLUMN IF EXISTS product_id;
SELECT '✅ Removed invoice_items.product_id' as Status;

-- Remove unused deleted_at columns (soft delete not implemented)
ALTER TABLE invoice_items DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE payments DROP COLUMN IF EXISTS deleted_at;
SELECT '✅ Removed unused deleted_at columns' as Status;

-- Remove unused reference column from payments
ALTER TABLE payments DROP COLUMN IF EXISTS reference;
SELECT '✅ Removed payments.reference' as Status;

-- ============================================================================
-- STEP 5: VERIFY CLEANUP
-- ============================================================================

-- Show remaining tables
SELECT '📊 Remaining Tables:' as Info;
SHOW TABLES;

-- Show table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'floatwalk_billing'
ORDER BY (data_length + index_length) DESC;

-- Show customer table structure (verify new columns)
SELECT '📋 Customer Table Structure:' as Info;
DESCRIBE customers;

-- Show invoice_items structure (verify removed columns)
SELECT '📋 Invoice Items Table Structure:' as Info;
DESCRIBE invoice_items;

-- Show remaining code sequences
SELECT '📋 Remaining Code Sequences:' as Info;
SELECT * FROM code_sequences;

-- ============================================================================
-- COMPLETION SUMMARY
-- ============================================================================

SELECT '
✅ CLEANUP COMPLETE!

✅ Added to customers:
   - whatsapp
   - alt_contact
   - gender
   - notes

❌ Removed tables:
   - products
   - foot_measurements
   - stock_logs

❌ Removed columns:
   - invoice_items.product_id
   - invoice_items.deleted_at
   - payments.deleted_at
   - payments.reference

❌ Removed sequences:
   - MEA (measurements)
   - STK (stock logs)

📊 Final table count: 8 tables (down from 11)

🔍 Run these to verify:
   SHOW TABLES;
   DESCRIBE customers;
   SELECT * FROM code_sequences;
' as Summary;

-- ============================================================================
-- END OF CLEANUP SCRIPT
-- ============================================================================
