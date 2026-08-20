CREATE TABLE IF NOT EXISTS `web_store_status` (
    `id` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `closed` TINYINT(1) NOT NULL DEFAULT 0,
    `reason` VARCHAR(500) NOT NULL DEFAULT '',
    `updated_at` DATETIME(3) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


INSERT INTO `web_store_status`
    (`id`, `closed`, `reason`)
VALUES
    (1, 0, 'We are closed today. Please call us for urgent help.')
ON DUPLICATE KEY UPDATE
    `closed` = VALUES(`closed`),
    `reason` = VALUES(`reason`);


CREATE TABLE IF NOT EXISTS `web_business_hours` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `day` VARCHAR(9) NOT NULL,
    `is_closed` TINYINT(1) NOT NULL DEFAULT 0,
    `open_time` TIME DEFAULT NULL,
    `close_time` TIME DEFAULT NULL,
    `sort_order` TINYINT UNSIGNED NOT NULL,

    `updated_at` DATETIME(3) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),

    UNIQUE KEY `uk_web_business_hours_day` (`day`)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


INSERT INTO `web_business_hours`
    (`day`, `is_closed`, `open_time`, `close_time`, `sort_order`)
VALUES
    ('MONDAY',    0, '09:00:00', '18:00:00', 1),
    ('TUESDAY',   0, '09:00:00', '18:00:00', 2),
    ('WEDNESDAY', 0, '09:00:00', '18:00:00', 3),
    ('THURSDAY',  0, '10:00:00', '20:00:00', 4),
    ('FRIDAY',    0, '09:00:00', '18:00:00', 5),
    ('SATURDAY',  0, '09:00:00', '18:00:00', 6),
    ('SUNDAY',    1, NULL, NULL, 7)
ON DUPLICATE KEY UPDATE
    `is_closed` = VALUES(`is_closed`),
    `open_time` = VALUES(`open_time`),
    `close_time` = VALUES(`close_time`),
    `sort_order` = VALUES(`sort_order`);