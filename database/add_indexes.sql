-- Performance Optimization: Add indexes to improve query speed
-- Run this SQL script on your database to add missing indexes
-- Note: Some indexes may already exist in the backend schema.sql

USE floatwalk_billing;

-- Indexes for invoices table (check if using old or new schema)
-- If using backend/src/infrastructure/db/schema.sql, most indexes already exist
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Indexes for invoice_items table
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
-- Product ID may not exist in all schemas (optional in backend schema)

-- Indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- Indexes for payments table (already has idx_payments_invoice in schema)
-- CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);  -- Already exists as idx_payments_invoice
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Indexes for foot_measurements table
CREATE INDEX IF NOT EXISTS idx_foot_measurements_customer_id ON foot_measurements(customer_id);
CREATE INDEX IF NOT EXISTS idx_foot_measurements_created_at ON foot_measurements(created_at);

-- Indexes for stock_logs table
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id ON stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at ON stock_logs(created_at);

-- Indexes for purchases table
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date ON purchases(purchase_date);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_status_created ON invoices(status, created_at);

SELECT 'Indexes created successfully!' as message;
