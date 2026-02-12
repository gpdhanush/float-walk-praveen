-- Fix Logo URLs - Convert full URLs to relative paths
-- Run this in phpMyAdmin to fix existing logo URLs

-- 1. Check current logo URLs
SELECT 
    id,
    name,
    email,
    logo_url,
    CASE 
        WHEN logo_url LIKE 'http://localhost:3001%' THEN 'NEEDS FIX'
        WHEN logo_url LIKE 'http://%' THEN 'NEEDS FIX'
        WHEN logo_url LIKE 'https://%' THEN 'NEEDS FIX'
        WHEN logo_url LIKE '/uploads/%' THEN 'OK (relative)'
        WHEN logo_url LIKE 'data:image/%' THEN 'OK (base64)'
        ELSE 'UNKNOWN'
    END AS status
FROM users 
WHERE logo_url IS NOT NULL AND logo_url != '';

-- 2. Convert localhost URLs to relative paths
UPDATE users 
SET logo_url = REPLACE(logo_url, 'http://localhost:3001', '')
WHERE logo_url LIKE 'http://localhost:3001%';

-- 3. Convert any other http URLs to relative paths
-- (This assumes your backend serves files from /uploads/)
UPDATE users 
SET logo_url = CONCAT('/', SUBSTRING_INDEX(logo_url, '/uploads/', -1))
WHERE logo_url LIKE '%/uploads/%' 
  AND logo_url LIKE 'http%'
  AND logo_url NOT LIKE '/uploads/%';

-- 4. Verify the changes
SELECT 
    id,
    name,
    email,
    logo_url,
    CASE 
        WHEN logo_url LIKE '/uploads/%' THEN '✅ FIXED'
        WHEN logo_url LIKE 'data:image/%' THEN '✅ OK (base64)'
        ELSE '⚠️ CHECK'
    END AS status
FROM users 
WHERE logo_url IS NOT NULL AND logo_url != '';

-- 5. Summary
SELECT 
    '✅ Logo URLs updated to relative paths' AS Status,
    'Logo URLs now start with /uploads/ for portability' AS Info;
