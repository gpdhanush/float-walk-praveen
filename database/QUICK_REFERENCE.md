# Quick Reference - Merged Users Table

## Complete Field List for Login & Store Management

### 🔐 Authentication Fields
| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `id` | CHAR(36) | UUID | ✅ |
| `email` | VARCHAR(255) | Login username | ✅ |
| `password_hash` | VARCHAR(255) | Encrypted password | ✅ |
| `role` | ENUM | ADMIN/EMPLOYEE | ✅ |
| `status` | ENUM | ACTIVE/INACTIVE | ✅ |

### 👤 Owner Information
| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `name` | VARCHAR(255) | Owner name | ✅ |

### 🏪 Store Information
| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `store_name` | VARCHAR(255) | Business name | ✅ |
| `store_address` | TEXT | Store address | ❌ |
| `store_mobile` | VARCHAR(20) | Office mobile | ✅ |
| `store_phone` | VARCHAR(20) | Office phone | ❌ |
| `store_email` | VARCHAR(255) | Office email | ❌ |

### 💰 Tax Information
| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `tax_number` | VARCHAR(50) | Tax ID | ❌ |
| `gst_percent` | DECIMAL(5,2) | Default GST % | ✅ |
| `gst_number` | VARCHAR(50) | GST registration | ❌ |

### 🎨 Branding
| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `logo_url` | TEXT | Store logo (base64/URL) | ❌ |

### ⚙️ UI Preferences
| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `theme` | ENUM('light','dark') | Light/Dark mode | ✅ |
| `theme_color` | VARCHAR(50) | Primary color | ✅ |
| `language` | ENUM('en','ta') | Language | ✅ |

### 📅 Timestamps
| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| `created_at` | DATETIME(3) | Creation date | ✅ |
| `updated_at` | DATETIME(3) | Last update | ✅ |
| `deleted_at` | DATETIME(3) | Soft delete | ❌ |

## Sample Data

```sql
-- Example of complete user record with store settings
INSERT INTO users (
    id, email, password_hash, name, role, status,
    store_name, store_address, store_mobile, store_phone, store_email,
    tax_number, gst_percent, gst_number, logo_url,
    theme, theme_color, language
) VALUES (
    UUID(), 
    'praveen@footwearpro.com',
    '$2a$10$...hashed_password...',
    'Praveen Kumar',
    'ADMIN',
    'ACTIVE',
    'FootWear Pro',
    '123 Main Street, Chennai, TN 600001',
    '+91 98765 43210',
    '+91 44 1234 5678',
    'info@footwearpro.com',
    '33XXXXX1234X1ZX',
    18.00,
    '33XXXXX1234X1ZX',
    'data:image/png;base64,...',
    'light',
    'blue',
    'en'
);
```

## Quick Update Queries

### Update Owner/Store Name
```sql
UPDATE users 
SET name = 'Praveen Kumar',
    store_name = 'FootWear Pro'
WHERE email = 'your@email.com';
```

### Update Store Address & Contacts
```sql
UPDATE users 
SET store_address = '123 Main Street, Chennai',
    store_mobile = '+91 98765 43210',
    store_phone = '+91 44 1234 5678',
    store_email = 'info@footwearpro.com'
WHERE email = 'your@email.com';
```

### Update GST Details
```sql
UPDATE users 
SET gst_percent = 18.00,
    gst_number = '33XXXXX1234X1ZX',
    tax_number = '33XXXXX1234X1ZX'
WHERE email = 'your@email.com';
```

### Update Logo
```sql
UPDATE users 
SET logo_url = 'data:image/png;base64,...'
WHERE email = 'your@email.com';
```

### Update Theme Preferences
```sql
UPDATE users 
SET theme = 'dark',
    theme_color = 'purple',
    language = 'ta'
WHERE email = 'your@email.com';
```

## Verification Queries

### Check Your User Data
```sql
SELECT 
    email, name as owner_name,
    store_name, store_mobile, gst_percent,
    theme, theme_color, language
FROM users 
WHERE email = 'your@email.com';
```

### List All Admin Users with Store Info
```sql
SELECT 
    id, email, name, role,
    store_name, store_mobile, store_email,
    gst_percent, gst_number
FROM users 
WHERE role = 'ADMIN'
ORDER BY created_at;
```

### Check If Migration Completed
```sql
-- Should show store-related columns
DESCRIBE users;

-- Should show data in new columns
SELECT store_name, store_mobile, gst_percent 
FROM users 
WHERE role = 'ADMIN';
```

## Field Defaults

```sql
gst_percent = 18.00
theme = 'light'
theme_color = 'blue'
language = 'en'
status = 'ACTIVE'
role = 'EMPLOYEE' (change to ADMIN for owner)
```

## API Endpoints After Merge

### Get User Profile (includes store settings)
```
GET /api/users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "praveen@example.com",
    "name": "Praveen Kumar",
    "role": "admin",
    "storeName": "FootWear Pro",
    "storeAddress": "123 Main Street",
    "storeMobile": "+91 98765 43210",
    "storePhone": "+91 44 1234 5678",
    "storeEmail": "info@footwearpro.com",
    "taxNumber": "33XXXXX1234X1ZX",
    "gstPercent": 18,
    "gstNumber": "33XXXXX1234X1ZX",
    "logoUrl": "data:image/png;base64,...",
    "theme": "light",
    "themeColor": "blue",
    "language": "en"
  }
}
```

### Update Profile (includes store settings)
```
PATCH /api/users/profile
```

**Request Body:**
```json
{
  "name": "Praveen Kumar",
  "storeName": "FootWear Pro",
  "storeAddress": "123 Main Street",
  "storeMobile": "+91 98765 43210",
  "gstPercent": 18,
  "gstNumber": "33XXXXX1234X1ZX",
  "logoUrl": "data:image/png;base64,..."
}
```

## Summary

**Before Merge:**
- Login: Users table
- Store: Store_settings table
- Need 2 API calls to get all info

**After Merge:**
- Login: Users table
- Store: Users table (same)
- Need 1 API call to get all info

**Result:** Simpler, faster, more logical structure for single-store business!
