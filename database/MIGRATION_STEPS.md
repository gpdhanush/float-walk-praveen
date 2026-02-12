# User & Store Settings Merge - Migration Guide

## Overview
This migration consolidates user authentication and store settings into a single `users` table for easier management.

## 📋 Pre-Migration Checklist

- [ ] Backup your database
- [ ] Note current admin user email
- [ ] Take screenshot of current store settings
- [ ] Stop the backend server
- [ ] Verify you have admin access to MySQL/phpMyAdmin

## 🚀 Migration Steps

### Step 1: Backup Current Data
```bash
# Using phpMyAdmin:
# 1. Select floatwalk_billing database
# 2. Click Export
# 3. Select "Quick" export method
# 4. Click "Go" to download backup

# OR using command line:
mysqldump -u root floatwalk_billing > backup_before_merge.sql
```

### Step 2: Run Migration SQL

**Option A - Using phpMyAdmin:**
1. Open phpMyAdmin
2. Select `floatwalk_billing` database
3. Click **SQL** tab
4. Copy contents from `database/merge_user_store_settings.sql`
5. Paste into SQL window
6. Click **Go**

**Option B - Using Command Line:**
```bash
mysql -u root floatwalk_billing < database/merge_user_store_settings.sql
```

### Step 3: Verify Data Migration

Run this query to verify:
```sql
SELECT 
    id, email, name, 
    store_name, store_address, store_mobile,
    gst_percent, gst_number, logo_url,
    theme, theme_color, language
FROM users 
WHERE role = 'ADMIN';
```

**Check that:**
- ✅ Store name is populated
- ✅ Address, mobile, GST details are present
- ✅ Logo URL is copied (if you had one)
- ✅ Theme preferences are set

### Step 4: Update Backend Code

#### A. Update User Entity
**File:** `backend/src/domain/entities/User.ts`

```typescript
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  
  // Store Information
  storeName?: string;
  storeAddress?: string;
  storeMobile?: string;
  storePhone?: string;
  storeEmail?: string;
  taxNumber?: string;
  gstPercent: number;
  gstNumber?: string;
  logoUrl?: string;
  
  // UI Preferences
  theme: 'light' | 'dark';
  themeColor: string;
  language: 'en' | 'ta';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

#### B. Update User Repository
Add field mapping in `backend/src/infrastructure/db/repositories/UserRepository.ts`

#### C. Remove Store Settings Routes
Comment out or remove store settings endpoints since they're now in user profile.

### Step 5: Update Frontend Code

#### A. Update Settings Store
**File:** `src/stores/settingsStore.ts`

Fetch settings from user profile instead of separate API:
```typescript
fetchSettings: async () => {
  try {
    // Get user profile which now includes store settings
    const userProfile = await userService.getProfile();
    set({
      storeName: userProfile.storeName || 'FootWear Pro',
      address: userProfile.storeAddress || '',
      mobile: userProfile.storeMobile || '',
      phone: userProfile.storePhone || '',
      email: userProfile.storeEmail || '',
      ownerName: userProfile.name,
      gstPercent: userProfile.gstPercent || 18,
      gstNumber: userProfile.gstNumber || '',
      taxNumber: userProfile.taxNumber || '',
      logoUrl: userProfile.logoUrl || '',
      theme: userProfile.theme || 'light',
      themeColor: userProfile.themeColor || 'blue',
      language: userProfile.language || 'en',
      isLoaded: true,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    set({ isLoaded: true });
  }
}
```

#### B. Update Settings Page
Settings page now updates both profile and store info in one call to `/users/profile`.

### Step 6: Rebuild and Test

```bash
# Rebuild backend
cd backend
npm run build

# Restart backend server
npm run dev
```

```bash
# Frontend will auto-reload
# Just refresh the browser
```

### Step 7: Test Everything

- [ ] Login works
- [ ] User name displays correctly
- [ ] Store name shows in sidebar
- [ ] Logo displays (if uploaded)
- [ ] Settings page loads both profile and store info
- [ ] Can update name (reflects in header after re-login)
- [ ] Can update store details
- [ ] Can change password
- [ ] Theme and language preferences work
- [ ] Invoice creation works

### Step 8: Cleanup (Optional)

After verifying everything works for a few days, you can drop the old `store_settings` table:

```sql
-- Run this in phpMyAdmin SQL tab
DROP TABLE IF EXISTS store_settings;
```

## 🔄 Rollback (If Needed)

If something goes wrong, you can rollback:

1. **Restore from backup:**
```bash
mysql -u root floatwalk_billing < backup_before_merge.sql
```

2. **Or manually drop columns:**
```sql
-- See rollback section in merge_user_store_settings.sql
```

## 📊 New Table Structure

### Before (2 tables):
```
users: id, email, password_hash, name, role, status
store_settings: id, store_name, address, phone, mobile, email, gst_percent, gst_number, logo_url, theme
```

### After (1 table):
```
users: id, email, password_hash, name, role, status,
       store_name, store_address, store_mobile, store_phone, store_email,
       tax_number, gst_percent, gst_number, logo_url,
       theme, theme_color, language
```

## 🎯 Benefits

1. **Simpler Architecture** - One table instead of two
2. **Better Performance** - No JOINs needed
3. **Logical Structure** - User IS the store owner
4. **Easier Management** - Update everything in settings page
5. **Single Source of Truth** - All user/store data in one place

## ⚠️ Important Notes

- The migration copies store_settings data to the **first admin user**
- Other users get default values
- Logo URLs are migrated if they exist
- The old `store_settings` table is NOT automatically dropped for safety
- You can manually drop it after verifying data migration

## 🆘 Troubleshooting

### Issue: No store data after migration
**Solution:** 
- Check if store_settings table had data
- Manually copy values to your admin user:
```sql
UPDATE users 
SET store_name = 'Your Store Name',
    store_address = 'Your Address',
    store_mobile = 'Your Mobile'
WHERE email = 'your@email.com';
```

### Issue: Settings page errors
**Solution:**
- Check browser console for API errors
- Verify backend is rebuilt and restarted
- Check user profile endpoint returns all fields

### Issue: Logo not displaying
**Solution:**
- Verify logo_url is copied: `SELECT logo_url FROM users WHERE role='ADMIN'`
- Re-upload logo in settings page if needed

## 📞 Support

If you encounter issues:
1. Check the console for specific errors
2. Verify database structure: `DESCRIBE users;`
3. Check that all new columns exist
4. Ensure backend is rebuilt with updated code
