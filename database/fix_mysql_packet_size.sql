-- Fix MySQL max_allowed_packet for large logo uploads
-- The error "Got a packet bigger than 'max_allowed_packet' bytes" occurs when
-- trying to save base64 images that exceed MySQL's default packet size (usually 1MB or 4MB)

-- Check current max_allowed_packet size
SHOW VARIABLES LIKE 'max_allowed_packet';

-- Set max_allowed_packet to 16MB (temporary - for current session)
-- This is enough for base64-encoded images
SET GLOBAL max_allowed_packet = 16777216;  -- 16MB in bytes

-- Verify the change
SHOW VARIABLES LIKE 'max_allowed_packet';

SELECT '✅ max_allowed_packet updated to 16MB' AS Status;
SELECT 'You may need to reconnect your MySQL client for changes to take effect' AS Note;
SELECT 'Backend server will automatically use new setting on next connection' AS Info;

-- IMPORTANT: This change is temporary and will reset when MySQL restarts
-- To make it permanent, add this to your MySQL configuration file:
-- 
-- For macOS (MAMP/XAMPP): /Applications/MAMP/conf/my.cnf or /Applications/XAMPP/xamppfiles/etc/my.cnf
-- For Windows (XAMPP): C:\xampp\mysql\bin\my.ini
-- For Linux: /etc/mysql/my.cnf or /etc/my.cnf
--
-- Add under [mysqld] section:
-- max_allowed_packet = 16M
--
-- Then restart MySQL service
