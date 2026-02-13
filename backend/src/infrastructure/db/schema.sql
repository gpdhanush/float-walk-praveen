-- StyleFlow Retail - MySQL Schema
-- UUID primary keys, soft delete, indexed FKs

CREATE TABLE IF NOT EXISTS code_sequences (
  prefix VARCHAR(10) PRIMARY KEY,
  last_value INT NOT NULL DEFAULT 0,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

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

CREATE TABLE IF NOT EXISTS customers (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  address TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  UNIQUE INDEX idx_customers_mobile (mobile),
  INDEX idx_customers_deleted (deleted_at)
);

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

CREATE TABLE IF NOT EXISTS invoices (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  customer_id CHAR(36) NOT NULL,
  status ENUM('paid', 'pending', 'partial', 'hold') NOT NULL DEFAULT 'pending',
  type VARCHAR(50) NULL DEFAULT 'Invoice',
  total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(14,2) NULL DEFAULT 0,
  gst_percent DECIMAL(5,2) NULL DEFAULT 0,
  gst_amount DECIMAL(14,2) NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS invoice_items (
  id CHAR(36) PRIMARY KEY,
  invoice_id CHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  product_id CHAR(36) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_invoice_items_invoice (invoice_id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY,
  invoice_id CHAR(36) NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  reference VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_payments_invoice (invoice_id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) NULL,
  current_stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  UNIQUE INDEX idx_products_name (name),
  INDEX idx_products_deleted (deleted_at)
);

CREATE TABLE IF NOT EXISTS foot_measurements (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  customer_id CHAR(36) NOT NULL,
  left_length DECIMAL(8,2) NULL,
  left_width DECIMAL(8,2) NULL,
  right_length DECIMAL(8,2) NULL,
  right_width DECIMAL(8,2) NULL,
  notes TEXT NULL,
  file_url VARCHAR(500) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_foot_measurements_customer (customer_id),
  INDEX idx_foot_measurements_deleted (deleted_at),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

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

CREATE TABLE IF NOT EXISTS stock_logs (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  type ENUM('IN', 'OUT') NOT NULL,
  quantity INT NOT NULL,
  reference_id CHAR(36) NULL,
  reference_type VARCHAR(50) NULL,
  notes TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_stock_logs_type (type),
  INDEX idx_stock_logs_created (created_at),
  INDEX idx_stock_logs_deleted (deleted_at)
);

INSERT IGNORE INTO code_sequences (prefix, last_value) VALUES ('INV', 0), ('EXP', 0), ('MEA', 0), ('STK', 0), ('PUR', 0);
