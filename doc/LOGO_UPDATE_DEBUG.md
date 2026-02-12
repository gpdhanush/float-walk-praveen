# Logo Update Debugging Guide

## Issue
Logo is not updating after changing it in the Settings page.

## Changes Made for Debugging

### 1. Backend Logging Enhanced
File: `backend/src/interfaces/controllers/UserController.ts`

Added detailed logging to track:
- What fields are in the request body
- Whether logoUrl is present
- Length of logoUrl (to verify base64 data)
- Updates being applied
- Result after update

**Look for these logs in backend terminal:**
```
[UserController] Request body fields: { hasLogoUrl: true, logoUrlLength: 123456 }
[UserController] Setting logoUrl, length: 123456
[UserController] Updates to apply: ['name', 'storeName', 'logoUrl', ...]
[UserController] Profile updated successfully, logoUrl length: 123456
```

### 2. Frontend Logging Enhanced
File: `src/stores/settingsStore.ts`

Added logging to track:
- When updateSettings is called
- Length of logoUrl being sent
- Response from backend
- State update confirmation

**Look for these logs in browser console:**
```
[settingsStore] updateSettings called with logoUrl length: 123456
[settingsStore] updateProfile response, logoUrl length: 123456
[settingsStore] State updated with logoUrl length: 123456
```

## Testing Steps

### Step 1: Restart Backend
The backend has been rebuilt with new logging. **You must restart it:**

```bash
# In backend terminal (Terminal 2)
Ctrl+C  # Stop current server
npm run dev  # Restart
```

### Step 2: Open Browser DevTools
1. Open browser (F12)
2. Go to Console tab
3. Clear console (Ctrl+L)

### Step 3: Upload Logo
1. Go to Settings page
2. Click "Choose File" under Store Logo
3. Select an image
4. Crop and adjust
5. Click "Save" in crop dialog
6. **Check browser console** - Should see image cropped message
7. Click "Save Store Details"
8. **Watch both consoles:**
   - Browser Console: Frontend logs
   - Backend Terminal: Backend logs

### Step 4: Analyze Logs

#### Expected Flow:

**Browser Console (Frontend):**
```
[settingsStore] updateSettings called with logoUrl length: 54321
Calling PATCH /users/profile with data: {...}
Update profile response: {...}
[settingsStore] updateProfile response, logoUrl length: 54321
[settingsStore] State updated with logoUrl length: 54321
```

**Backend Terminal:**
```
[Auth Middleware] PATCH /profile
[Auth Middleware] Token verified for user: xxx
[UserController] updateProfile called for userId: xxx
[UserController] Request body fields: { hasLogoUrl: true, logoUrlLength: 54321 }
[UserController] Setting logoUrl, length: 54321
[UserController] Updates to apply: ['name', 'storeName', 'logoUrl', ...]
[UserController] Profile updated successfully, logoUrl length: 54321
```

## Common Issues & Solutions

### Issue 1: logoUrl Not in Request Body
**Symptoms:**
```
[UserController] Request body fields: { hasLogoUrl: false, logoUrlLength: 0 }
```

**Cause:** Form state not including logoUrl

**Solution:** Check `SettingsNew.tsx` - ensure `storeForm.logoUrl` has value

### Issue 2: logoUrl Too Large
**Symptoms:**
```
PayloadTooLargeError: request entity too large
```

**Cause:** Image compression didn't work or file too large

**Solution:** 
- Image should compress to ~300KB
- Check compression is working in crop dialog
- Try smaller original image

### Issue 3: logoUrl Saved but Not Displayed
**Symptoms:**
```
[settingsStore] State updated with logoUrl length: 54321
```
But logo doesn't show in sidebar

**Cause:** Component not re-rendering or caching issue

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check sidebar is using `useSettingsStore(s => s.logoUrl)`
3. Clear browser cache

### Issue 4: Empty logoUrl After Save
**Symptoms:**
```
[UserController] Profile updated successfully, logoUrl length: 0
```

**Cause:** Database issue or backend not saving

**Solution:**
1. Check database directly:
   ```sql
   SELECT id, name, logo_url FROM users WHERE id = 'your-user-id';
   ```
2. Verify `logo_url` column exists:
   ```sql
   DESCRIBE users;
   ```
3. Check UserRepository mapping includes `logoUrl: 'logo_url'`

### Issue 5: Logo Shows After Refresh Only
**Symptoms:** Logo appears after F5 but not immediately after save

**Cause:** State update not triggering re-render

**Solution:**
1. Check SimpleSidebar uses store properly:
   ```typescript
   const logoUrl = useSettingsStore(s => s.logoUrl);
   ```
2. Ensure no memo/cache blocking updates
3. Check component is not wrapped in React.memo incorrectly

## Verification Checklist

After uploading logo:

- [ ] Browser console shows `[settingsStore] updateSettings called`
- [ ] Browser console shows logoUrl length > 0
- [ ] Backend terminal shows `[UserController] Request body fields`
- [ ] Backend terminal shows `hasLogoUrl: true`
- [ ] Backend terminal shows `logoUrlLength: xxxxx` (should be > 50000)
- [ ] Backend terminal shows `Profile updated successfully`
- [ ] Browser console shows `State updated with logoUrl length: xxxxx`
- [ ] Logo appears in sidebar immediately
- [ ] Logo persists after page refresh

## Database Verification

Check if logo is actually saved:

```sql
-- Connect to database
USE footwear_retail;

-- Check users table structure
DESCRIBE users;
-- Should see: logo_url | text | YES

-- Check your user's logo
SELECT 
    id, 
    name, 
    LENGTH(logo_url) as logo_size,
    LEFT(logo_url, 50) as logo_preview
FROM users 
WHERE id = 'your-user-id';
-- logo_size should be > 0
-- logo_preview should show "data:image/jpeg;base64,..."
```

## Component Flow

```
SettingsNew.tsx
   ↓ (user uploads file)
handleFileSelect()
   ↓ (validate and show crop dialog)
ImageCropDialog
   ↓ (crop and compress to ~300KB)
handleCropComplete()
   ↓ (update form state)
storeForm.logoUrl = croppedImage
   ↓ (user clicks "Save Store Details")
handleSaveStore()
   ↓ (call settings store)
settingsStore.updateSettings({ logoUrl: ... })
   ↓ (call API)
userService.updateProfile({ logoUrl: ... })
   ↓ (HTTP PATCH request)
Backend: UserController.updateProfile()
   ↓ (update database)
UserRepository.update()
   ↓ (response back)
Frontend: settingsStore.set({ logoUrl: ... })
   ↓ (Zustand notifies subscribers)
SimpleSidebar re-renders with new logoUrl
   ↓ ✅ Logo displayed!
```

## Quick Fix Attempts

If logo still doesn't update after debugging:

### 1. Force State Update
In browser console:
```javascript
// Check current logoUrl
useSettingsStore.getState().logoUrl

// Force update (paste your base64 here)
useSettingsStore.setState({ logoUrl: 'data:image/jpeg;base64,...' })
```

### 2. Check Database Direct
```sql
UPDATE users 
SET logo_url = 'data:image/jpeg;base64,...' 
WHERE id = 'your-user-id';
```
Then refresh browser.

### 3. Clear All Caches
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then refresh (Ctrl+Shift+R)
```

### 4. Check for Errors
```javascript
// In browser console - watch for errors
window.addEventListener('error', (e) => {
  console.error('Global error:', e);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e);
});
```

## Success Indicators

You'll know it's working when:

1. ✅ Upload image → Crop dialog opens
2. ✅ Crop and save → "Image cropped and compressed successfully" toast
3. ✅ Click "Save Store Details" → "Store details saved successfully" toast
4. ✅ Logo appears in sidebar top (circular)
5. ✅ Logo appears as fallback background if no image
6. ✅ Refresh page → Logo still there
7. ✅ Logout and login → Logo still there
8. ✅ Both browser and backend console show successful operations

## Next Steps After Testing

Once you test with the new logging:

1. **Share the logs** - Copy console output from both:
   - Browser console (frontend logs)
   - Backend terminal (backend logs)

2. **What to look for:**
   - Does logoUrl have content? (length > 0)
   - Is it being sent to backend?
   - Is backend saving it?
   - Is frontend getting it back?
   - Is state updating?

3. **Based on logs, we can:**
   - Identify exactly where the issue is
   - Fix the specific problem
   - Remove debug logging once working

## Important Notes

- **Base64 size:** A 300KB compressed image becomes ~400KB in base64
- **Backend limit:** Set to 10MB, should be plenty
- **Frontend compression:** Targets 300KB, actual varies by image
- **Storage:** Saved directly in `logo_url` TEXT column
- **Performance:** Consider moving to file storage later for production

---

**Status:** Debug logging added, backend rebuilt  
**Action Required:** Restart backend, test upload, share logs  
**Goal:** Identify exactly where logo update is failing
