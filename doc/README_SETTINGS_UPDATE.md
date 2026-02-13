# Store Settings Update - Database Integration

## Overview
Updated the store settings to be saved in the database instead of only in localStorage. Now all settings persist across devices and users can update them from the Settings page.

## Changes Made

### 1. Database Schema Updates
Added new columns to `store_settings` table:
- `owner_name` - Store owner name
- `mobile` - Mobile number
- `gst_percent` - Default GST percentage
- `gst_number` - GST registration number
- `theme` - UI theme (light/dark)
- `theme_color` - Primary theme color
- `language` - UI language (en/ta)

### 2. Backend Updates
- Updated `StoreSettings` entity with new fields
- Updated `StoreSettingsRepository` to handle all new fields
- Updated validation schema to validate new fields
- All settings now saved/retrieved from database

### 3. Frontend Updates
- Created `settingsService` API service
- Updated `settingsStore` to fetch from and save to database
- Settings automatically fetched on login
- Theme and language changes automatically saved to database
- Updated Settings page with proper API integration

## How to Apply

### Step 1: Update Database Schema
Run the SQL migration:

```bash
# From project root
mysql -u [username] -p [database_name] < database/update_store_settings.sql
```

Or manually execute the SQL in your MySQL client/phpMyAdmin.

### Step 2: Rebuild Backend
```bash
cd backend
npm run build
```

### Step 3: Restart Backend Server
Stop the current backend server (Ctrl+C) and restart:
```bash
npm run dev
```

## Features

### Automatic Synchronization
- Settings fetch automatically when user logs in
- All settings changes saved to database immediately
- Theme and language changes persist across sessions
- Works across multiple devices/browsers

### Settings Available
1. **Store Information**
   - Store Name
   - Owner Name
   - Address
   - Phone
   - Mobile
   - Email

2. **Tax Information**
   - Tax Number (for official documents)
   - GST Percent (default rate)
   - GST Number

3. **UI Preferences**
   - Theme (light/dark) - auto-saved
   - Theme Color
   - Language (English/Tamil) - auto-saved
   - Logo (base64 or URL)

### Usage in App
Settings are globally available via `useSettingsStore()`:

```typescript
import { useSettingsStore } from '@/stores/settingsStore';

function MyComponent() {
  const storeName = useSettingsStore(s => s.storeName);
  const ownerName = useSettingsStore(s => s.ownerName);
  const gstPercent = useSettingsStore(s => s.gstPercent);
  
  return <div>{storeName} - Owner: {ownerName}</div>;
}
```

## Benefits

1. **Centralized Configuration** - All store settings in one place
2. **Database Persistence** - Settings saved permanently
3. **Cross-Device Sync** - Same settings on all devices
4. **Dynamic Updates** - No code changes needed to update store info
5. **Professional Invoices** - Owner name, address, GST info automatically included
6. **User Preferences** - Theme and language preferences saved

## Notes

- Default values inserted automatically if no settings exist
- Logo can be base64 (file upload) or URL
- Theme changes apply immediately across app
- Language changes affect all translated text
- Settings require admin role to modify
