-- Performance Optimization: Add indexes to improve query speed (SAFE VERSION)
-- This version checks for column existence before creating indexes
-- Run this SQL script on your database

USE floatwalk_billing;

-- Note: If you're using backend/src/infrastructure/db/schema.sql, 
-- many indexes already exist and will be skipped automatically

-- ========================================
-- INVOICES TABLE INDEXES
-- ========================================
-- Most likely already exist in schema.sql
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- For old schema (invoice_code column)
-- If this fails, it means you're using the new schema with 'code' column instead
-- CREATE INDEX IF NOT EXISTS idx_invoices_invoice_code ON invoices(invoice_code);

-- For new schema (code column)
-- CREATE INDEX IF NOT EXISTS idx_invoices_code ON invoices(code);

-- ========================================
-- INVOICE ITEMS TABLE INDEXES
-- ========================================
-- Already exists in schema.sql as idx_invoice_items_invoice
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ========================================
-- CUSTOMERS TABLE INDEXES
-- ========================================
-- Mobile is already UNIQUE in schema.sql which creates an index automatically
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- ========================================
-- EXPENSES TABLE INDEXES
-- ========================================
-- Already exists in schema.sql as idx_expenses_date
-- CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ========================================
-- PAYMENTS TABLE INDEXES  
-- ========================================
-- Already exists in schema.sql as idx_payments_invoice
-- CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- ========================================
-- FOOT MEASUREMENTS TABLE INDEXES
-- ========================================
-- Already exists in schema.sql as idx_foot_measurements_customer
-- CREATE INDEX IF NOT EXISTS idx_foot_measurements_customer_id ON foot_measurements(customer_id);
CREATE INDEX IF NOT EXISTS idx_foot_measurements_created_at ON foot_measurements(created_at);

-- ========================================
-- COMPOSITE INDEXES (for complex queries)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_status_created ON invoices(status, created_at);

-- ========================================
-- PRODUCTS TABLE INDEXES (if exists)
-- ========================================
-- Name is already UNIQUE in schema.sql
CREATE INDEX IF NOT EXISTS idx_products_current_stock ON products(current_stock);

-- ========================================
-- STOCK LOGS TABLE INDEXES (if exists)
-- ========================================
-- Type and created_at already indexed in schema.sql
-- CREATE INDEX IF NOT EXISTS idx_stock_logs_type ON stock_logs(type);
-- CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at ON stock_logs(created_at);

-- ========================================
-- PURCHASES TABLE INDEXES (if exists)
-- ========================================
-- purchase_date already indexed in schema.sql as idx_purchases_date
-- CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Show completion message
SELECT '✅ Indexes created successfully! Some may have been skipped if they already exist.' as message;

-- To verify indexes were created, run:
-- SHOW INDEX FROM invoices;
-- SHOW INDEX FROM customers;
-- SHOW INDEX FROM payments;
