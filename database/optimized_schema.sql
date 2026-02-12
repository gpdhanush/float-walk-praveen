-- ============================================================================
-- OPTIMIZED CLEAN SCHEMA (After Cleanup)
-- ============================================================================
-- This is the cleaned-up version with only used tables and columns
-- All unused tables, columns, and indexes have been removed

CREATE DATABASE IF NOT EXISTS floatwalk_billing;
USE floatwalk_billing;

-- ============================================================================
-- CODE SEQUENCES (System table for auto-incrementing codes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS code_sequences (
  prefix VARCHAR(10) PRIMARY KEY,
  last_value INT NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- ============================================================================
-- USERS (Authentication & Authorization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_deleted (deleted_at)
);

-- ============================================================================
-- CUSTOMERS (Core customer data with all fields used in frontend)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NULL,
  alt_contact VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  gender VARCHAR(20) NULL,
  address TEXT NULL,
  notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  UNIQUE INDEX idx_customers_mobile (mobile),
  INDEX idx_customers_deleted (deleted_at)
);

-- ============================================================================
-- STORE SETTINGS (Single-row configuration table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS store_settings (
  id CHAR(36) PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL DEFAULT 'My Store',
  logo_url VARCHAR(500) NULL,
  address TEXT NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  tax_number VARCHAR(50) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- ============================================================================
-- INVOICES (Sales invoices/quotations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  customer_id CHAR(36) NOT NULL,
  status ENUM('paid', 'pending', 'partial', 'hold') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_invoices_customer (customer_id),
  INDEX idx_invoices_status (status),
  INDEX idx_invoices_created (created_at),
  INDEX idx_invoices_deleted (deleted_at),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================================
-- INVOICE ITEMS (Line items for each invoice)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id CHAR(36) PRIMARY KEY,
  invoice_id CHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_invoice_items_invoice (invoice_id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ============================================================================
-- PAYMENTS (Payment records for invoices)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY,
  invoice_id CHAR(36) NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_payments_invoice (invoice_id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ============================================================================
-- EXPENSES (Daily business expenses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  description TEXT NULL,
  expense_date DATE NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_expenses_date (expense_date),
  INDEX idx_expenses_deleted (deleted_at)
);

-- ============================================================================
-- OPTIONAL: PURCHASES TABLE
-- ============================================================================
-- Keep this only if you need purchase tracking and reports
-- Currently used only in ReportUseCases.purchasesReport()

CREATE TABLE IF NOT EXISTS purchases (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  supplier VARCHAR(255) NULL,
  purchase_date DATE NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_purchases_date (purchase_date),
  INDEX idx_purchases_deleted (deleted_at)
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert code sequences (only for implemented features)
INSERT IGNORE INTO code_sequences (prefix, last_value) VALUES 
  ('INV', 0),  -- Invoices
  ('EXP', 0),  -- Expenses
  ('PUR', 0);  -- Purchases (remove this line if dropping purchases table)

-- ============================================================================
-- TABLE SUMMARY
-- ============================================================================
-- 
-- Core Tables (8):
--   1. code_sequences    - Auto-increment code generator
--   2. users            - Authentication & user management
--   3. customers        - Customer data (with all fields)
--   4. store_settings   - Store configuration
--   5. invoices         - Sales invoices/quotations
--   6. invoice_items    - Invoice line items
--   7. payments         - Payment records
--   8. expenses         - Business expenses
--
-- Optional Tables (1):
--   9. purchases        - Purchase tracking (if needed)
--
-- Removed Tables:
--   ❌ products          - No implementation
--   ❌ foot_measurements - No implementation
--   ❌ stock_logs        - No implementation
--
-- ============================================================================
