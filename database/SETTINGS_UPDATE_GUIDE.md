# Settings Page Update Guide

## Overview
This update simplifies the settings page to focus on Store Details only, removing the separate User Profile section and the tax_number field.

## Changes Made

### Frontend Changes

1. **SettingsNew.tsx**
   - Renamed "Store Information" to "Update Store Details"
   - Combined Owner Name and Full Name into one field
   - Email is now read-only (shows logged-in user's email)
   - Added "Office Mobile Number" field (previously just "Phone")
   - Added Role field (read-only)
   - **Removed**: User Profile section entirely
   - **Removed**: Tax Number field
   - Simplified to single "Save Store Details" button

2. **settingsStore.ts**
   - Removed `taxNumber` from interface and state
   - Cleaned up all references to taxNumber

### Backend Changes

No backend changes needed - the backend already:
- Uses `userId` correctly in token payload
- Doesn't reference tax_number anywhere
- Has proper User entity structure

### Database Changes

**File**: `database/remove_tax_number.sql`

This migration removes the `tax_number` column from the `users` table if it exists.

## How to Apply Changes

### Step 1: Apply Database Migration

Run the SQL migration to remove tax_number:

```bash
# In phpMyAdmin or MySQL client
mysql -u root -p footwear_retail < database/remove_tax_number.sql
```

Or in phpMyAdmin:
1. Open phpMyAdmin
2. Select `footwear_retail` database
3. Go to SQL tab
4. Copy and paste contents of `database/remove_tax_number.sql`
5. Click "Go"

### Step 2: Restart Backend

The backend server needs to be restarted to load the updated code:

```bash
# Stop current backend (Ctrl+C in terminal 2)
# Then restart:
cd backend
npm run dev
```

### Step 3: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click on the refresh button
3. Select "Empty Cache and Hard Reload"

Or simply:
- Chrome/Edge: Ctrl+Shift+Delete → Clear browsing data
- Firefox: Ctrl+Shift+Delete → Clear Recent History

## Current Structure

### Store Details Fields:
1. **Store Name** - Editable
2. **Owner Name / Full Name** - Editable (same field for both)
3. **Address** - Editable
4. **Mobile** - Editable
5. **Office Mobile Number** - Editable
6. **Email** - Read-only (logged-in user's email)
7. **Role** - Read-only (user's role: ADMIN/EMPLOYEE)
8. **Default GST %** - Editable
9. **GST Number** - Editable
10. **Store Logo** - Editable (file upload with preview)

### Password Change Section:
- Current Password
- New Password
- Confirm New Password
- Separate "Change Password" button

## Database Schema

### Users Table (after migration):
```
- id (uuid)
- email (varchar)
- password_hash (varchar)
- name (varchar) - Owner name / Full name
- role (enum: ADMIN, EMPLOYEE)
- status (enum: ACTIVE, INACTIVE)
- store_name (varchar)
- store_address (text)
- store_mobile (varchar)
- gst_percent (decimal)
- gst_number (varchar)
- logo_url (text)
- theme (enum: light, dark)
- theme_color (varchar)
- language (enum: en, ta)
- created_at (datetime)
- updated_at (datetime)
- deleted_at (datetime) - nullable
```

**Removed column**: `tax_number`

## API Endpoints

### GET /api/users/profile
Returns current user profile with all store settings.

### PATCH /api/users/profile
Updates user profile and store settings together.

**Body**:
```json
{
  "name": "Owner Name",
  "storeName": "Store Name",
  "storeAddress": "Full Address",
  "storeMobile": "Mobile Number",
  "gstPercent": 18,
  "gstNumber": "GST Number",
  "logoUrl": "base64 or URL",
  "theme": "light",
  "themeColor": "blue",
  "language": "en"
}
```

### POST /api/users/change-password
Changes user password.

**Body**:
```json
{
  "currentPassword": "current",
  "newPassword": "new"
}
```

## Verification

After applying changes:

1. **Login** - Should work normally
2. **Navigate to Settings** - Should show "Update Store Details"
3. **Check Fields**:
   - Email should be read-only showing your login email
   - Role should be read-only showing ADMIN or EMPLOYEE
   - No Tax Number field visible
   - No separate User Profile section
4. **Update Store Details** - Should save successfully
5. **Change Password** - Should work independently

## Troubleshooting

### Issue: "Access token required" error

**Solution**: Backend needs to be restarted with the updated code that uses `userId` instead of `id` in the token payload.

```bash
# In backend terminal
Ctrl+C  # Stop server
npm run dev  # Restart
```

### Issue: "Unknown column 'tax_number'" error

**Solution**: Run the database migration `database/remove_tax_number.sql`

### Issue: Settings not saving

**Checklist**:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify you're logged in (check localStorage for auth-store)
4. Check network tab in DevTools for 401 errors

### Issue: Logo not uploading

**Note**: Current implementation uses base64 encoding which:
- Works for small images (<1MB)
- May need optimization for larger files
- Consider implementing proper file upload endpoint later

## Future Improvements

1. **File Upload Service**: Implement proper file upload endpoint instead of base64
2. **Image Optimization**: Add image compression before upload
3. **Multi-language**: Complete translations for Tamil language
4. **Role Management**: Add ability for ADMIN to change employee roles
5. **Audit Log**: Track changes to store settings

## Summary

This update simplifies the settings interface by:
- ✅ Combining user and store settings into one section
- ✅ Removing redundant fields (tax_number)
- ✅ Making email read-only (linked to login)
- ✅ Clarifying field names (Office Mobile Number)
- ✅ Fixing token authentication issues
- ✅ Streamlining the save process
