# Clean User Table Structure - Essential Fields Only

## 📋 Final Table Structure

### Complete `users` Table (After Clean Merge)

```sql
users (
  -- Authentication & Identity
  id                CHAR(36)         PRIMARY KEY
  email             VARCHAR(255)     UNIQUE (for login)
  password_hash     VARCHAR(255)     (encrypted)
  name              VARCHAR(255)     (owner name)
  role              ENUM             ADMIN/EMPLOYEE
  status            ENUM             ACTIVE/INACTIVE
  
  -- Store Information
  store_name        VARCHAR(255)     (business name)
  store_address     TEXT             (store location)
  store_mobile      VARCHAR(20)      (contact number)
  
  -- Tax & Billing
  gst_percent       DECIMAL(5,2)     (default GST %)
  gst_number        VARCHAR(50)      (GST registration)
  
  -- Branding
  logo_url          TEXT             (store logo)
  
  -- UI Preferences
  theme             ENUM             light/dark
  theme_color       VARCHAR(50)      primary color
  language          ENUM             en/ta
  
  -- Timestamps
  created_at        DATETIME(3)
  updated_at        DATETIME(3)
  deleted_at        DATETIME(3)
)
```

## ✂️ Removed Redundant Columns

### What Was Removed and Why

| Removed Column | Reason | Use Instead |
|----------------|--------|-------------|
| `store_phone` | Redundant with mobile | Use `store_mobile` only |
| `store_email` | Redundant with login email | Use `email` field |
| `tax_number` | Same as GST number | Use `gst_number` only |

## 📊 Field Count Comparison

**Full Version:** 12 new columns
```
store_name, store_address, store_mobile, store_phone, store_email,
tax_number, gst_percent, gst_number, logo_url,
theme, theme_color, language
```

**Clean Version:** 9 new columns ✅
```
store_name, store_address, store_mobile,
gst_percent, gst_number, logo_url,
theme, theme_color, language
```

**Savings:** 3 fewer columns, simpler structure!

## 🎯 Essential Fields for Your Needs

### For Login
- ✅ `email` - Login username
- ✅ `password_hash` - Encrypted password
- ✅ `role` - Admin/Employee

### For Owner
- ✅ `name` - Owner name (Praveen)

### For Store
- ✅ `store_name` - Business name (FootWear Pro)
- ✅ `store_address` - Store location
- ✅ `store_mobile` - Contact number (one is enough!)

### For Tax/Billing
- ✅ `gst_percent` - Default GST % (18%)
- ✅ `gst_number` - GST registration (one ID is enough!)

### For Branding
- ✅ `logo_url` - Store logo

### For UI
- ✅ `theme` - Light/Dark mode
- ✅ `theme_color` - Primary color
- ✅ `language` - English/Tamil

## 💾 Sample Data (Clean Version)

```sql
INSERT INTO users (
    id, email, password_hash, name, role, status,
    store_name, store_address, store_mobile,
    gst_percent, gst_number, logo_url,
    theme, theme_color, language
) VALUES (
    UUID(), 
    'praveen@footwearpro.com',         -- Login email (also for contact)
    '$2a$10$...hashed...',               -- Password
    'Praveen Kumar',                     -- Owner name
    'ADMIN',
    'ACTIVE',
    'FootWear Pro',                      -- Store name
    '123 Main St, Chennai',              -- Address
    '+91 98765 43210',                   -- Mobile (only one needed)
    18.00,                               -- Default GST %
    '33XXXXX1234X1ZX',                   -- GST number (covers tax ID too)
    'data:image/png;base64,...',         -- Logo
    'light',
    'blue',
    'en'
);
```

## 🔄 Quick Update Examples

### Update Owner/Store
```sql
UPDATE users 
SET name = 'Praveen Kumar',
    store_name = 'FootWear Pro'
WHERE email = 'praveen@example.com';
```

### Update Store Details
```sql
UPDATE users 
SET store_address = '123 Main Street, Chennai',
    store_mobile = '+91 98765 43210'
WHERE email = 'praveen@example.com';
```

### Update GST Info
```sql
UPDATE users 
SET gst_percent = 18.00,
    gst_number = '33XXXXX1234X1ZX'
WHERE email = 'praveen@example.com';
```

## ✅ Advantages of Clean Structure

1. **Simpler** - Fewer columns to manage
2. **No Redundancy** - Each piece of info stored once
3. **Clearer** - Obvious which field to use
4. **Faster** - Less data to store/retrieve
5. **Easier** - Simpler queries and updates

## 📝 Field Usage Guide

### For Contact Info
- **Login email** → `email` field
- **Contact mobile** → `store_mobile` field
- **Store address** → `store_address` field

### For Tax Documents
- **Tax/GST number** → `gst_number` field (one field for both!)
- **GST percentage** → `gst_percent` field

### For Display
- **Owner name** → `name` field (shows in header, invoices)
- **Store name** → `store_name` field (shows in sidebar, invoices)
- **Logo** → `logo_url` field (shows in sidebar, invoices)

## 🚀 Migration Command

Use the clean migration:
```bash
# In phpMyAdmin:
# Use: database/merge_user_store_clean.sql
```

This gives you exactly what you need - nothing more, nothing less!

## 📞 Contact Information Mapping

**Before (scattered):**
- Login email in users.email
- Office email in store_settings.email
- Office phone in store_settings.phone
- Mobile in store_settings.mobile

**After (consolidated):**
- Email: users.email (one for login + contact)
- Mobile: users.store_mobile (one contact number)
- Address: users.store_address

**Result:** Clean, simple, no confusion!
