-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 13, 2026 at 02:54 PM
-- Server version: 10.11.15-MariaDB-cll-lve
-- PHP Version: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prasowla_floatwalk_billing`
--

-- --------------------------------------------------------

--
-- Table structure for table `code_sequences`
--

CREATE TABLE `code_sequences` (
  `prefix` varchar(10) NOT NULL,
  `last_value` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `code_sequences`
--

INSERT INTO `code_sequences` (`prefix`, `last_value`, `updated_at`) VALUES
('ADV', 2, '2026-02-12 21:23:26.409'),
('EXP', 0, '2026-02-12 17:07:24.468'),
('INV', 11, '2026-02-13 14:54:34.202'),
('PUR', 0, '2026-02-12 17:07:24.468'),
('QUO', 1, '2026-02-12 21:18:17.740');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `alt_contact` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `mobile`, `whatsapp`, `alt_contact`, `email`, `gender`, `address`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
('fc7ffe39-b251-4541-87b9-b4261cd9ec34', 'Gnana Prakasam', '7845456609', '7845456609', NULL, 'agprakash406@gmail.com', 'male', 'Murugabavanam, DIndigul', '', '2026-02-13 14:48:44.941', '2026-02-13 14:48:44.941', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` char(36) NOT NULL,
  `code` varchar(20) NOT NULL,
  `category` varchar(100) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `description` text DEFAULT NULL,
  `expense_date` date NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` char(36) NOT NULL,
  `code` varchar(20) NOT NULL,
  `type` varchar(50) DEFAULT 'Invoice',
  `customer_id` char(36) NOT NULL,
  `status` enum('paid','pending','partial','hold') NOT NULL DEFAULT 'pending',
  `total_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(14,2) DEFAULT NULL,
  `gst_percent` decimal(5,2) DEFAULT NULL,
  `gst_amount` decimal(14,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` char(36) NOT NULL,
  `invoice_id` char(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `total_price` decimal(14,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('ADMIN','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `store_name` varchar(255) DEFAULT 'FootWear Pro',
  `store_address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `gst_percent` decimal(5,2) DEFAULT 18.00,
  `gst_number` varchar(50) DEFAULT NULL,
  `logo_url` mediumtext DEFAULT NULL,
  `theme` enum('light','dark') DEFAULT 'light',
  `theme_color` varchar(50) DEFAULT 'blue',
  `language` varchar(10) DEFAULT 'en',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `store_name`, `store_address`, `phone`, `gst_percent`, `gst_number`, `logo_url`, `theme`, `theme_color`, `language`, `created_at`, `updated_at`, `deleted_at`) VALUES
('admin-default-uuid-0001', 'admin@floatwalk.com', '$2b$12$blcv5RyjIBBiU7wMVHMHze4KguQQ4A/GxhiTNiqbeHXQjYtOGvNvO', 'Praveen', 'ADMIN', 'ACTIVE', 'FootWear Pro', NULL, NULL, 18.00, NULL, NULL, 'light', 'blue', 'en', '2026-02-13 14:43:28.523', '2026-02-13 14:54:12.019', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `code_sequences`
--
ALTER TABLE `code_sequences`
  ADD PRIMARY KEY (`prefix`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_customers_mobile` (`mobile`),
  ADD KEY `idx_customers_deleted` (`deleted_at`),
  ADD KEY `idx_customers_name` (`name`),
  ADD KEY `idx_customers_email` (`email`),
  ADD KEY `idx_customers_created_at` (`created_at`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_expenses_date` (`expense_date`),
  ADD KEY `idx_expenses_deleted` (`deleted_at`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_invoices_customer` (`customer_id`),
  ADD KEY `idx_invoices_status` (`status`),
  ADD KEY `idx_invoices_created` (`created_at`),
  ADD KEY `idx_invoices_deleted` (`deleted_at`),
  ADD KEY `idx_invoices_created_by` (`created_by`),
  ADD KEY `idx_invoices_updated_at` (`updated_at`),
  ADD KEY `idx_invoices_customer_status` (`customer_id`,`status`),
  ADD KEY `idx_invoices_status_created` (`status`,`created_at`),
  ADD KEY `idx_invoices_customer_created` (`customer_id`,`created_at`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_items_invoice` (`invoice_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_deleted` (`deleted_at`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
