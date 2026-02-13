-- Migration: Add missing columns to invoices table
-- These columns are required for invoice types, GST calculations, and subtotals

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS type VARCHAR(50) NULL DEFAULT 'Invoice',
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(14,2) NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(14,2) NULL DEFAULT 0;
