# Logo URL Fix - Relative Path Storage

## Problem
The logo upload system was saving full localhost URLs (e.g., `http://localhost:3001/uploads/logos/xxx.jpg`) to the database, which:
- Breaks when deploying to production (hardcoded localhost)
- Not portable across different environments
- Causes logo display issues

## Solution
Store only the **relative path** (e.g., `/uploads/logos/xxx.jpg`) in the database and construct the full URL dynamically when needed.

## Changes Made

### 1. Backend - Upload Controller
**File:** `backend/src/interfaces/controllers/UploadController.ts`
- Returns relative path: `/uploads/logos/xxx.jpg`
- No change needed (already returning relative path)

### 2. Frontend - Upload Service
**File:** `src/services/uploadService.ts`
- **Before:** Returned full URL `http://localhost:3001/uploads/logos/xxx.jpg`
- **After:** Returns only relative path `/uploads/logos/xxx.jpg`
- Database now stores only the relative path

### 3. Logo URL Utility Helper
**File:** `src/lib/utils/logoUtils.ts` *(NEW)*
- Created `getLogoUrl()` helper function
- Constructs full URL from backend URL + relative path
- Handles:
  - Relative paths: `/uploads/logos/xxx.jpg` → `http://localhost:3001/uploads/logos/xxx.jpg`
  - Full URLs: `http://...` → returned as-is (backward compatibility)
  - Base64: `data:image/...` → returned as-is (backward compatibility)

### 4. Updated Components
**Files Updated:**
- `src/components/layout/SimpleSidebar.tsx` - Logo in sidebar
- `src/pages/SettingsNew.tsx` - Logo preview in settings

Both now use `getLogoUrl(logoUrl)` to construct the full URL.

## How It Works

### Database Storage
```sql
-- Old (WRONG)
UPDATE users SET logo_url = 'http://localhost:3001/uploads/logos/abc123.jpg';

-- New (CORRECT)
UPDATE users SET logo_url = '/uploads/logos/abc123.jpg';
```

### Frontend Display
```tsx
// Component code
const logoUrl = useSettingsStore(s => s.logoUrl); // "/uploads/logos/abc123.jpg"
const fullLogoUrl = getLogoUrl(logoUrl); // "http://localhost:3001/uploads/logos/abc123.jpg"

<img src={fullLogoUrl} alt="Logo" />
```

### Environment Flexibility
```javascript
// Development
VITE_API_URL=http://localhost:3001/api
Logo URL: http://localhost:3001/uploads/logos/abc123.jpg

// Production
VITE_API_URL=https://api.yourdomain.com/api
Logo URL: https://api.yourdomain.com/uploads/logos/abc123.jpg
```

## Benefits

1. ✅ **Portable** - Works in any environment (dev, staging, production)
2. ✅ **No hardcoded URLs** - Backend URL comes from `.env`
3. ✅ **Backward compatible** - Handles existing full URLs and base64 data
4. ✅ **Smaller database size** - Stores shorter relative paths

## Testing

### Test New Upload
1. Open Settings page
2. Upload a new logo
3. Check database - should see `/uploads/logos/xxx.jpg`
4. Logo should display correctly

### Check Backend Response
Look for this in backend logs:
```
[UploadController] Logo uploaded: {
  filename: 'xxx.jpg',
  size: '45KB',
  url: '/uploads/logos/xxx.jpg'  ← Should be relative path
}
```

### Check Frontend
Look for this in browser console:
```
[uploadService] Upload successful, relative URL: /uploads/logos/xxx.jpg
```

## Migration for Existing Data

If you have existing logos with full localhost URLs in the database, run this SQL:

```sql
-- Convert full URLs to relative paths
UPDATE users 
SET logo_url = REPLACE(logo_url, 'http://localhost:3001', '')
WHERE logo_url LIKE 'http://localhost:3001%';

-- Verify
SELECT id, name, logo_url FROM users WHERE logo_url IS NOT NULL;
```

## Files Modified
- ✅ `src/services/uploadService.ts` - Return relative path
- ✅ `src/lib/utils/logoUtils.ts` - New helper function
- ✅ `src/components/layout/SimpleSidebar.tsx` - Use helper
- ✅ `src/pages/SettingsNew.tsx` - Use helper

## Status
✅ Fixed and ready to test
