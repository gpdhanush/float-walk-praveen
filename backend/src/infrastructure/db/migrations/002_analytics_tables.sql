CREATE TABLE IF NOT EXISTS `page_daily_analytics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_path` VARCHAR(512) NOT NULL,
  `analytics_date` DATE NOT NULL,
  `total_views` INT UNSIGNED NOT NULL DEFAULT 0,
  `unique_views` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  UNIQUE KEY `page_daily_analytics_path_date_unique`
    (`page_path`, `analytics_date`),

  KEY `page_daily_analytics_date_idx`
    (`analytics_date`),

  KEY `page_daily_analytics_path_idx`
    (`page_path`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `analytics_visitor_dedup` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `visitor_id` CHAR(36) NOT NULL,
  `page_path` VARCHAR(512) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  UNIQUE KEY `analytics_visitor_dedup_visitor_page_unique`
    (`visitor_id`, `page_path`),

  KEY `analytics_visitor_dedup_expires_idx`
    (`expires_at`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `analytics_cache` (
  `cache_key` VARCHAR(255) NOT NULL,
  `cache_data` JSON NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`cache_key`),

  KEY `analytics_cache_expires_idx`
    (`expires_at`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;