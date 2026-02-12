# User and Store Settings Merge Analysis

## Current Structure

### Users Table
```sql
users (
  id, email, password_hash, name, role, status,
  created_at, updated_at, deleted_at
)
```

### Store Settings Table
```sql
store_settings (
  id, store_name, owner_name, logo_url, address,
  phone, mobile, email, tax_number, gst_percent,
  gst_number, theme, theme_color, language
)
```

## Problem
- Two separate tables for related information
- Store settings disconnected from user
- Redundant owner_name and email fields
- Complex to manage both separately

## Solution: Merge into Enhanced Users Table

For a single-store business like yours, it makes more sense to have all information in the users table.

### Benefits
1. **Simpler Structure** - One table for authentication and store info
2. **Better Relationship** - Owner directly linked to store details
3. **Easier Management** - Update everything in one place
4. **Performance** - Fewer JOINs, faster queries
5. **Logical** - User IS the store owner

### Recommended Approach

Add store-related fields directly to the `users` table:

```sql
users (
  -- Authentication (existing)
  id, email, password_hash, name, role, status,
  
  -- Store Information (new)
  store_name, store_address, store_mobile, store_phone,
  tax_number, gst_percent, gst_number, logo_url,
  
  -- UI Preferences (new)
  theme, theme_color, language,
  
  -- Timestamps
  created_at, updated_at, deleted_at
)
```

### Field Mapping

| Purpose | Field Name | Type | Notes |
|---------|------------|------|-------|
| **Login** | email | VARCHAR(255) | Login username |
| **Login** | password_hash | VARCHAR(255) | Encrypted password |
| **Owner** | name | VARCHAR(255) | Owner name |
| **Store** | store_name | VARCHAR(255) | Business name |
| **Store** | store_address | TEXT | Store address |
| **Contact** | store_mobile | VARCHAR(20) | Primary contact |
| **Contact** | store_phone | VARCHAR(20) | Office phone |
| **Tax** | tax_number | VARCHAR(50) | Tax ID |
| **Tax** | gst_percent | DECIMAL(5,2) | Default GST % |
| **Tax** | gst_number | VARCHAR(50) | GST registration |
| **Branding** | logo_url | TEXT | Store logo |
| **UI** | theme | ENUM | light/dark |
| **UI** | theme_color | VARCHAR(50) | Primary color |
| **UI** | language | ENUM | en/ta |

## Migration Strategy

1. **Add new columns** to users table
2. **Copy data** from store_settings to users
3. **Update backend** to use users table only
4. **Update frontend** to fetch from user profile
5. **Drop store_settings** table (optional, for cleanup)

## Multi-User Consideration

If you ever need multiple employees with different stores:
- Add `is_owner` flag to users
- Only owners can edit store settings
- Each user inherits store settings from their linked owner

For now, the simple merged approach works best.
