-- Migration: Add scan_price column to invoice_items table
-- This stores the "Scan" amount per line item; total_price should include scan_price + unit_price

ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS scan_price DECIMAL(14,2) NULL DEFAULT 0;

