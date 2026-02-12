-- Add missing columns to invoices table for proper GST calculation and invoice type

-- 1. Check current structure
DESCRIBE invoices;

-- 2. Add missing columns
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(14,2) NULL AFTER paid_amount,
ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) NULL AFTER subtotal,
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(14,2) NULL AFTER gst_percent,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) NULL DEFAULT 'Invoice' AFTER code;

-- 3. Update existing records to have default type
UPDATE invoices SET type = 'Invoice' WHERE type IS NULL;

-- 4. Recalculate subtotal and GST for existing records
-- Assuming 18% GST for existing records (you can adjust)
UPDATE invoices 
SET 
  subtotal = total_amount / 1.18,
  gst_percent = 18,
  gst_amount = total_amount - (total_amount / 1.18)
WHERE subtotal IS NULL AND total_amount > 0;

-- 5. Verify structure
DESCRIBE invoices;

-- 6. Check sample data
SELECT 
  id,
  code,
  type,
  total_amount,
  subtotal,
  gst_percent,
  gst_amount,
  paid_amount,
  status
FROM invoices 
LIMIT 5;

SELECT '✅ Invoice columns updated successfully' AS Status;
