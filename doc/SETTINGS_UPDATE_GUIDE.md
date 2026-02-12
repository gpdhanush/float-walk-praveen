# Settings Page Update - Complete Guide

## Overview
Updated the Settings page to include both **Store Settings** and **User Profile** management in a single, comprehensive interface with tabs.

## What Was Fixed

### 1. Invoice Update Error ✅
**Error**: `Unknown column 'gstPercent' in 'field list'`

**Root Cause**: The `InvoiceForm` was trying to save fields (`gstPercent`, `gstAmount`, `subtotal`) that don't exist in the simplified `invoices` table schema.

**Solution**: Updated `InvoiceForm.tsx` to only send fields that exist in the database:
- `totalAmount` (instead of grandTotal)
- `paidAmount` (instead of advancePaid)
- `status`
- `notes`

The frontend still calculates GST for display purposes, but doesn't store it separately in the database.

### 2. Comprehensive Settings Page ✅
Created a new tabbed settings page with two sections:

#### **Store Settings Tab**
- Store Name
- Owner Name
- Address
- Mobile & Email
- Phone & Tax Number
- GST Percent & GST Number
- Store Logo (upload/remove)

All changes saved to database immediately.

#### **User Profile Tab**
Two cards:

**Profile Information:**
- Full Name (editable)
- Email (editable)
- Role (read-only)

**Change Password:**
- Current Password
- New Password
- Confirm New Password
- Minimum 6 characters validation
- Password match validation

## Backend Updates

### New API Endpoints

```
GET    /api/users/profile          - Get current user profile
PATCH  /api/users/profile          - Update profile (name, email)
POST   /api/users/change-password  - Change user password
```

### Files Created/Modified

**Backend:**
- `backend/src/interfaces/controllers/UserController.ts` - User profile controller
- `backend/src/interfaces/routes/user.routes.ts` - User API routes

**Frontend:**
- `src/pages/SettingsNew.tsx` - New comprehensive settings page
- `src/services/userService.ts` - User API service
- `src/pages/InvoiceForm.tsx` - Fixed to use correct fields

## How to Use

### Step 1: Restart Backend Server
```bash
# In backend terminal (Terminal 2)
Ctrl+C  # Stop the server
npm run dev  # Restart
```

### Step 2: Access Settings Page
1. Login to the application
2. Go to **Settings** (admin only)
3. You'll see two tabs:
   - **Store Settings** - Manage store information
   - **User Profile** - Manage your account

### Step 3: Update Store Settings
1. Click **Store Settings** tab
2. Fill in all store information
3. Upload logo (optional)
4. Click **Save Store Settings**
5. Settings are saved to database

### Step 4: Update User Profile
1. Click **User Profile** tab
2. Update your name (will fix the "system admin" display issue)
3. Click **Update Profile**
4. Logout and login again to see the change in header

### Step 5: Change Password
1. In **User Profile** tab, scroll to "Change Password" section
2. Enter current password
3. Enter new password (min 6 characters)
4. Confirm new password
5. Click **Change Password**

## Important Notes

### Store Settings
- **Logo** is stored as base64 in the database
- **GST Percent** is used as default for new invoices
- All fields except Store Name are optional
- Changes apply immediately across the application

### User Profile
- **Name** change requires logout/login to reflect in header
- **Email** change updates login credentials
- **Role** cannot be changed from the UI (security)
- Password changes require current password verification

### Invoice Updates
- Invoices now store only `total_amount` and `paid_amount`
- GST calculations happen in the frontend for display
- Old invoices with GST data will still display correctly
- New invoices work correctly with simplified schema

## Database Schema

### Store Settings Table
```sql
store_settings (
  id, store_name, owner_name, logo_url,
  address, phone, mobile, email,
  tax_number, gst_percent, gst_number,
  theme, theme_color, language
)
```

### Users Table
```sql
users (
  id, email, password_hash, name,
  role, status, created_at, updated_at
)
```

### Invoices Table (Simplified)
```sql
invoices (
  id, code, customer_id, status,
  total_amount, paid_amount, notes,
  created_by, created_at, updated_at
)
```

## Security Features

1. **Password Verification** - Current password required to change
2. **Password Hashing** - Passwords securely hashed with bcrypt
3. **Authentication** - All endpoints require valid JWT token
4. **Role-Based Access** - Settings page restricted to admin role

## Troubleshooting

### Issue: "system admin" still shows after update
**Solution**: You must logout and login again for the name change to take effect

### Issue: Password change fails
**Solution**: Make sure:
- Current password is correct
- New password is at least 6 characters
- Both new password fields match

### Issue: Store settings not saving
**Solution**: 
- Check browser console for errors
- Ensure backend server is running
- Check that you ran the `update_store_settings.sql` migration

### Issue: Invoice update still shows gstPercent error
**Solution**: Make sure backend is rebuilt and restarted after the fixes

## Benefits

1. **Centralized Management** - All settings in one place
2. **User Self-Service** - Users can update their own profile
3. **Secure Password Management** - Change password without admin
4. **Database Persistence** - All changes saved permanently
5. **Better UX** - Tabbed interface, clear sections, loading states
6. **Validation** - Form validation prevents errors
7. **Feedback** - Toast notifications for all actions

## Next Steps

1. Apply the database migration (`update_store_settings.sql`)
2. Restart the backend server
3. Test store settings updates
4. Update user profiles
5. Test password changes
6. Verify invoice creation/editing works without errors
