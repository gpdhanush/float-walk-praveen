-- Complete Migration: Add missing columns and create admin user
-- Run this in phpMyAdmin or your database tool

-- Step 1: Add missing columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS store_name VARCHAR(255) NULL DEFAULT 'FootWear Pro',
ADD COLUMN IF NOT EXISTS store_address TEXT NULL,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) NULL DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS logo_url MEDIUMTEXT NULL,
ADD COLUMN IF NOT EXISTS theme ENUM('light', 'dark') NULL DEFAULT 'light',
ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) NULL DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS language VARCHAR(10) NULL DEFAULT 'en';

-- Step 2: Insert default admin user
-- Email: admin@floatwalk.com
-- Password: admin123
INSERT IGNORE INTO users (
  id, 
  email, 
  password_hash, 
  name, 
  role, 
  status,
  store_name,
  gst_percent,
  theme,
  theme_color,
  language
) VALUES (
  'admin-default-uuid-0001',
  'admin@floatwalk.com',
  '$2b$12$blcv5RyjIBBiU7wMVHMHze4KguQQ4A/GxhiTNiqbeHXQjYtOGvNvO',
  'Praveen',
  'ADMIN',
  'ACTIVE',
  'FootWear Pro',
  18.00,
  'light',
  'blue',
  'en'
);
