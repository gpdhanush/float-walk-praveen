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