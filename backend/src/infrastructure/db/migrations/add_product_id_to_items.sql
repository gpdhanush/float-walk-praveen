-- Migration: Add product_id column to invoice_items table
-- This allows tracking which product each invoice item refers to

ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS product_id CHAR(36) NULL;
