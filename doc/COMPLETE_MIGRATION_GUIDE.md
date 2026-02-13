# Complete Migration Guide - Store Settings Merged into Users Table

## 🎯 What Was Done

### Backend Changes ✅
1. **User Entity** - Added store settings fields
2. **UserRepository** - Updated create/update to handle store fields
3. **UserController** - Updated profile endpoint to include store fields
4. **UserUseCases** - Added store settings parameters

### Frontend Changes ✅
1. **userService** - Updated to include store fields in profile
2. **settingsStore** - Changed to use user profile API instead of settings API
3. **Settings pages** - Now work with user profile endpoint

### Database Changes (To Apply) ⏳
1. Add store columns to users table
2. Migrate data from store_settings to users
3. Drop store_settings table

## 📋 **Migration Steps**

### Step 1: Backup Your Database
```bash
# Using mysqldump
mysqldump -u root floatwalk_billing > backup_before_final_merge.sql

# OR using phpMyAdmin
# Export → Quick export → Go
```

### Step 2: Run the Migration SQL

**Using phpMyAdmin:**
1. Open phpMyAdmin
2. Select `floatwalk_billing` database
3. Go to **SQL** tab
4. Open file: `database/final_merge_drop_store_settings.sql`
5. Copy all contents
6. Paste into SQL window
7. Click **Go**

**Expected Output:**
```
=== VERIFICATION: Check migrated data ===
(Shows your admin user with all store fields populated)

=== MIGRATION COMPLETE ===
Store settings merged into users table
store_settings table dropped
```

### Step 3: Verify Migration

Run this query to check:
```sql
SELECT 
    email, name, store_name, store_mobile,
    gst_percent, gst_number, 
    CASE WHEN logo_url IS NOT NULL THEN 'Yes' ELSE 'No' END as has_logo
FROM users 
WHERE role = 'ADMIN';
```

**Check that:**
- ✅ All store fields are populated
- ✅ Logo is migrated (if you had one)
- ✅ GST details are present

### Step 4: Check New Table Structure
```sql
DESCRIBE users;
```

**Should show these columns:**
```
id, email, password_hash, name, role, status,
store_name, store_address, store_mobile,
gst_percent, gst_number, logo_url,
theme, theme_color, language,
created_at, updated_at, deleted_at
```

### Step 5: Verify store_settings is Dropped
```sql
SHOW TABLES;
```

**Should NOT show** `store_settings` table.

### Step 6: Restart Backend Server

```bash
# In Terminal 2 (backend terminal)
Ctrl+C  # Stop server
npm run dev  # Restart
```

### Step 7: Test the Application

#### Test Checklist:
- [ ] Login works
- [ ] User name displays correctly in header
- [ ] Store name shows in sidebar
- [ ] Logo displays (if you uploaded one)
- [ ] Settings page loads
- [ ] Can update profile name
- [ ] Can update store details
- [ ] Can change password
- [ ] Theme toggle works
- [ ] Language switch works
- [ ] Invoice creation works

## 🔍 **What Changed**

### Database Structure

**Before:**
```
users: id, email, password_hash, name, role, status

store_settings: id, store_name, logo_url, address, phone,
                mobile, email, tax_number, gst_percent,
                gst_number, theme, theme_color, language
```

**After:**
```
users: id, email, password_hash, name, role, status,
       store_name, store_address, store_mobile,
       gst_percent, gst_number, logo_url,
       theme, theme_color, language
```

### API Endpoints

**Before:**
```
GET  /api/settings          (get store settings)
PATCH /api/settings         (update store settings)
GET  /api/users/profile     (get user profile)
PATCH /api/users/profile    (update user profile)
```

**After:**
```
GET  /api/users/profile     (get profile + store settings)
PATCH /api/users/profile    (update profile + store settings)
```

**Removed:**
- `/api/settings` endpoints (no longer needed)

### Frontend Changes

**Settings Store:**
- Now calls `userService.getProfile()` instead of `settingsService.getSettings()`
- Updates via `userService.updateProfile()` instead of `settingsService.updateSettings()`

**Settings Page:**
- Both profile and store info saved via single API call
- Simpler, faster updates

## 🎯 **Benefits**

1. **Simpler Architecture** - One table instead of two
2. **Faster Queries** - No JOINs needed
3. **Single API Call** - Get everything at once
4. **Logical Structure** - User IS the store owner
5. **Easier Maintenance** - Update everything in one place

## 🔧 **Troubleshooting**

### Issue: Migration fails with "table doesn't exist"
**Solution:** You may have already dropped store_settings or never had it. This is fine - the migration script handles it.

### Issue: Some fields are NULL after migration
**Solution:** Update manually:
```sql
UPDATE users 
SET store_name = 'Your Store Name',
    store_mobile = '+91 XXXXXXXXXX',
    gst_percent = 18.00
WHERE email = 'your@email.com';
```

### Issue: Settings page shows errors
**Solution:**
1. Check browser console for specific error
2. Verify backend is rebuilt: `cd backend && npm run build`
3. Verify backend is restarted: `npm run dev`
4. Clear browser cache and refresh

### Issue: Can't save settings
**Solution:**
1. Check that `/api/users/profile` endpoint works
2. Test with curl:
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: Logo not showing
**Solution:**
1. Check if logo_url has data: `SELECT logo_url FROM users WHERE role='ADMIN'`
2. Re-upload logo in settings page
3. Check that logo_url is saved after upload

## 📊 **Quick Reference**

### Get All Settings
```sql
SELECT * FROM users WHERE email = 'your@email.com';
```

### Update Store Name
```sql
UPDATE users SET store_name = 'New Name' WHERE email = 'your@email.com';
```

### Update Contact Info
```sql
UPDATE users 
SET store_address = 'New Address',
    store_mobile = '+91 XXXXXXXXXX'
WHERE email = 'your@email.com';
```

### Update GST Details
```sql
UPDATE users 
SET gst_percent = 18.00,
    gst_number = 'YOUR_GST_NUMBER'
WHERE email = 'your@email.com';
```

## ✅ **Success Criteria**

After migration, you should have:

1. ✅ No `store_settings` table
2. ✅ Users table with store columns
3. ✅ All store data in admin user record
4. ✅ Settings page working
5. ✅ Profile updates working
6. ✅ Logo displaying (if uploaded)
7. ✅ Theme/language working
8. ✅ Invoices creating successfully

## 🆘 **Rollback (If Needed)**

If something goes wrong:

```bash
# Restore from backup
mysql -u root floatwalk_billing < backup_before_final_merge.sql

# Restart backend
cd backend
npm run dev
```

## 📝 **Files Modified**

### Backend:
- `src/domain/entities/User.ts`
- `src/infrastructure/db/repositories/UserRepository.ts`
- `src/interfaces/controllers/UserController.ts`
- `src/application/use-cases/UserUseCases.ts`

### Frontend:
- `src/services/userService.ts`
- `src/stores/settingsStore.ts`
- `src/pages/SettingsNew.tsx` (already uses user profile)

### Database:
- `database/final_merge_drop_store_settings.sql` (migration script)

## 🎉 **You're Done!**

After successful migration:
- Store settings are in users table
- Single source of truth for all user/store data
- Simpler, faster, more maintainable code
- One less table to manage

**Note:** The old `settingsService.ts` file can be deleted after migration is confirmed working.
