-- =========================
-- DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS floatwalk_billing;
USE floatwalk_billing;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role ENUM('ADMIN','EMPLOYEE') NOT NULL,
  name VARCHAR(120),
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  password_hash TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- STORE SETTINGS
-- =========================
CREATE TABLE store_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  store_name VARCHAR(150),
  logo_url TEXT,
  address TEXT,
  email VARCHAR(150),
  phone VARCHAR(20),
  owner_name VARCHAR(120),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- CUSTOMERS
-- =========================
CREATE TABLE customers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(120) NOT NULL,
  mobile VARCHAR(20) UNIQUE,
  whatsapp VARCHAR(20),
  alt_contact VARCHAR(20),
  email VARCHAR(150),
  gender VARCHAR(20),
  address TEXT,
  notes TEXT,
  followup_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FOOT MEASUREMENTS (MEA0001)
-- =========================
CREATE TABLE foot_measurements (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  measurement_code VARCHAR(20) UNIQUE,
  customer_id CHAR(36),
  left_size DECIMAL(5,2),
  right_size DECIMAL(5,2),
  notes TEXT,
  report_file TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE products (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(150),
  category VARCHAR(80),
  price DECIMAL(10,2),
  stock INT DEFAULT 0,
  low_stock_limit INT DEFAULT 5,
  status BOOLEAN DEFAULT TRUE
);

-- =========================
-- STOCK LOGS (STK0001)
-- =========================
CREATE TABLE stock_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  stock_code VARCHAR(20) UNIQUE,
  product_id CHAR(36),
  change_qty INT,
  type ENUM('IN','OUT'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================
-- PURCHASES
-- =========================
CREATE TABLE purchases (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  supplier VARCHAR(150),
  product_id CHAR(36),
  qty INT,
  cost DECIMAL(10,2),
  purchase_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================
-- INVOICES (INV0001)
-- =========================
CREATE TABLE invoices (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  invoice_code VARCHAR(20) UNIQUE,
  customer_id CHAR(36),
  total DECIMAL(10,2),
  advance_paid DECIMAL(10,2),
  balance DECIMAL(10,2),
  status ENUM('DRAFT','ADVANCE','READY','COMPLETED'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- =========================
-- INVOICE ITEMS
-- =========================
CREATE TABLE invoice_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  invoice_id CHAR(36),
  product_id CHAR(36),
  qty INT,
  price DECIMAL(10,2),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================
-- DAILY EXPENSES (EXP0001)
-- =========================
CREATE TABLE expenses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  expense_code VARCHAR(20) UNIQUE,
  title VARCHAR(150),
  amount DECIMAL(10,2),
  expense_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- DEFAULT ADMIN USER
-- password = admin123 (bcrypt hash)
-- =========================
INSERT INTO users (
  id, role, name, email, phone, password_hash
) VALUES (
  UUID(),
  'ADMIN',
  'System Admin',
  'admin@floatwalk.com',
  '9999999999',
  '$2b$10$lP8ECJJFGPgohtJSTh2I5uQtf7mFi1NFsVQkGAEWO9XZtDMuwAyt2'
);

-- =========================
-- DEFAULT STORE SETTINGS
-- =========================
INSERT INTO store_settings (
  id, store_name, address, email, phone, owner_name
) VALUES (
  UUID(),
  'Float Walk Footwear',
  'No.1, Main Road, Chennai',
  'support@floatwalk.com',
  '9000000000',
  'Store Owner'
);
