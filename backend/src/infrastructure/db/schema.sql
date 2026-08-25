
--
-- Table structure for table `code_sequences`
--

CREATE TABLE `code_sequences` (
  `prefix` varchar(10) NOT NULL,
  `last_value` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `code_sequences`
--

INSERT INTO `code_sequences` (`prefix`, `last_value`, `updated_at`) VALUES
('ADV', 2, '2026-02-12 21:23:26.409'),
('EXP', 0, '2026-02-12 17:07:24.468'),
('INV', 25, '2026-02-13 15:18:24.694'),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `code`, `type`, `customer_id`, `status`, `total_amount`, `paid_amount`, `subtotal`, `gst_percent`, `gst_amount`, `notes`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
('5600b982-e44f-4f0b-bb02-439296ad0392', 'INV-025', 'Invoice', 'fc7ffe39-b251-4541-87b9-b4261cd9ec34', 'paid', 59.00, 0.00, 0.00, 18.00, 9.00, '', '113a558c-076f-11f1-8f59-6605f9942941', '2026-02-13 15:18:24.797', '2026-02-13 15:20:34.667', NULL);

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
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `product_id` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_name`, `quantity`, `unit_price`, `total_price`, `created_at`, `updated_at`, `product_id`) VALUES
('0c6781f8-a3fe-4464-999a-67d2e62f7184', '5600b982-e44f-4f0b-bb02-439296ad0392', 'test', 1, 50.00, 50.00, '2026-02-13 15:20:34.673', '2026-02-13 15:20:34.673', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `invoice_id` char(36) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_items`
--

CREATE TABLE `stock_items` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_logs`
--

CREATE TABLE `stock_logs` (
  `id` char(36) NOT NULL,
  `stock_item_id` char(36) NOT NULL,
  `type` enum('IN','OUT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference_id` char(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Website operations settings
CREATE TABLE `web_store_status` (
  `id` tinyint unsigned NOT NULL DEFAULT 1,
  `closed` tinyint(1) NOT NULL DEFAULT 0,
  `reason` varchar(500) NOT NULL DEFAULT '',
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_store_status` (`id`, `closed`, `reason`) VALUES (1, 0, 'We are closed today. Please call us for urgent help.');

CREATE TABLE `web_business_hours` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `day` varchar(9) NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT 0,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `sort_order` tinyint unsigned NOT NULL,
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_web_business_hours_day` (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `web_business_hours` (`day`, `is_closed`, `open_time`, `close_time`, `sort_order`) VALUES
('MONDAY', 0, '09:00:00', '18:00:00', 1), ('TUESDAY', 0, '09:00:00', '18:00:00', 2),
('WEDNESDAY', 0, '09:00:00', '18:00:00', 3), ('THURSDAY', 0, '10:00:00', '20:00:00', 4),
('FRIDAY', 0, '09:00:00', '18:00:00', 5), ('SATURDAY', 0, '09:00:00', '18:00:00', 6),
('SUNDAY', 1, NULL, NULL, 7);

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
  `store_address` mediumtext DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `gst_percent` decimal(5,2) DEFAULT 18.00,
  `gst_number` varchar(50) DEFAULT NULL,
  `logo_url` longtext DEFAULT NULL,
  `theme` enum('light','dark') DEFAULT 'light',
  `theme_color` varchar(50) DEFAULT 'blue',
  `language` varchar(10) DEFAULT 'en',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `deleted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `status`, `store_name`, `store_address`, `phone`, `gst_percent`, `gst_number`, `logo_url`, `theme`, `theme_color`, `language`, `created_at`, `updated_at`, `deleted_at`) VALUES
('113a558c-076f-11f1-8f59-6605f9942941', 'floatwalktiruppur@gmail.com', '$2b$12$blcv5RyjIBBiU7wMVHMHze4KguQQ4A/GxhiTNiqbeHXQjYtOGvNvO', 'Praveen', 'ADMIN', 'ACTIVE', 'Float Walk', 'SKD’s Meenachi Complex, Old LG Showroom Opposite , 60 Feet Road, Kumar Nagar(East), Tiruppur - 641 603.', '8438030401', 18.00, '', '/uploads/logos/f7c0e9c8-88e2-40a2-9958-d0f5d70ed32a.jpg', 'light', 'blue', 'en', '2026-02-13 14:43:28.523', '2026-02-13 15:22:46.491', NULL);

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
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_ibfk_1` (`invoice_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_products_name` (`name`),
  ADD KEY `idx_products_created_at` (`created_at`);

--
-- Indexes for table `stock_items`
--
ALTER TABLE `stock_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`);

--
-- Indexes for table `stock_logs`
--
ALTER TABLE `stock_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_item_id` (`stock_item_id`);

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

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_logs`
--
ALTER TABLE `stock_logs`
  ADD CONSTRAINT `stock_logs_ibfk_1` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items` (`id`) ON DELETE CASCADE;

-- =====================================================
-- Analytics Tables
-- =====================================================

--
-- Table structure for table `page_daily_analytics`
--
CREATE TABLE IF NOT EXISTS `page_daily_analytics` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `page_path` VARCHAR(512) NOT NULL COMMENT 'URL path (e.g. /services, /)',
  `analytics_date` DATE NOT NULL COMMENT 'Date of analytics record (UTC)',
  `total_views` INT NOT NULL DEFAULT 0 COMMENT 'Total page views for this page on this date',
  `unique_views` INT NOT NULL DEFAULT 0 COMMENT 'Unique visitor count for this page on this date',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `page_daily_analytics_path_date_unique` (page_path, analytics_date),
  KEY `page_daily_analytics_date_idx` (analytics_date),
  KEY `page_daily_analytics_path_idx` (page_path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `analytics_visitor_dedup`
--
CREATE TABLE IF NOT EXISTS `analytics_visitor_dedup` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `visitor_id` CHAR(36) NOT NULL COMMENT 'Anonymous visitor UUID (no PII)',
  `page_path` VARCHAR(512) NOT NULL COMMENT 'URL path',
  `expires_at` DATETIME NOT NULL COMMENT 'Dedup record expiration time (UTC)',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY `analytics_visitor_dedup_visitor_page_unique` (visitor_id, page_path),
  KEY `analytics_visitor_dedup_expires_idx` (expires_at),
  KEY `analytics_visitor_dedup_visitor_idx` (visitor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `analytics_cache`
--
CREATE TABLE IF NOT EXISTS `analytics_cache` (
  `cache_key` VARCHAR(255) PRIMARY KEY COMMENT 'Cache key',
  `cache_data` JSON NOT NULL COMMENT 'Cached data as JSON',
  `expires_at` DATETIME NOT NULL COMMENT 'Cache expiration time (UTC)',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY `analytics_cache_expires_idx` (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Google Business Profile connection
-- =====================================================

CREATE TABLE IF NOT EXISTS `google_business_connections` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `google_account_id` VARCHAR(255) DEFAULT NULL,
  `google_location_id` VARCHAR(255) DEFAULT NULL,
  `access_token` TEXT NOT NULL,
  `refresh_token` TEXT NOT NULL,
  `token_expires_at` DATETIME NOT NULL,
  `is_connected` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_business_connections_singleton` (`is_connected`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
