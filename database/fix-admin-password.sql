-- Run this if you already created the DB with the old seed and login fails with "Invalid email or password".
-- Sets admin password to: admin123 (for user admin@floatwalk.com)
USE floatwalk_billing;
UPDATE users SET password_hash = '$2b$10$lP8ECJJFGPgohtJSTh2I5uQtf7mFi1NFsVQkGAEWO9XZtDMuwAyt2' WHERE email = 'admin@floatwalk.com';
