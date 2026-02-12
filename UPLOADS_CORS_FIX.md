# Uploads Image Display Fix

## Problem
Uploaded logo images were not displaying in the frontend even though:
- ✅ Files were uploaded successfully to `backend/uploads/logos/`
- ✅ Backend was serving the files at `http://localhost:3001/uploads/logos/xxx.jpg`
- ✅ Frontend was constructing the correct URL

**Root Cause:** Helmet security middleware was setting `Cross-Origin-Resource-Policy: same-origin` which blocked the browser from loading images from the backend (different port = different origin).

## Solution
Updated backend to allow cross-origin image loading by:
1. Disabling Helmet's `crossOriginResourcePolicy` restriction
2. Adding explicit CORS headers for `/uploads` route

## Changes Made

### Backend - app.ts
**File:** `backend/src/app.ts`

#### 1. Updated Helmet Configuration
```typescript
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false, // Allow images to be loaded from frontend
}));
```

#### 2. Added CORS Headers for Uploads Route
```typescript
// Serve uploaded files statically with CORS headers
app.use('/uploads', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(process.cwd(), 'uploads')));
```

### Frontend - Added Debug Logging
**File:** `src/lib/utils/logoUtils.ts`

Added console logging to debug URL construction:
```typescript
console.log('[getLogoUrl] Input logoUrl:', logoUrl);
console.log('[getLogoUrl] Constructed URL:', fullUrl);
```

## How It Works Now

### URL Construction Flow
1. **Database stores:** `/uploads/logos/abc123.jpg` (relative path)
2. **Frontend constructs:** `http://localhost:3001/uploads/logos/abc123.jpg`
3. **Backend serves with CORS headers:**
   ```
   Access-Control-Allow-Origin: *
   Cross-Origin-Resource-Policy: cross-origin
   ```
4. **Browser loads image successfully** ✅

### Example Request/Response
```bash
GET http://localhost:3001/uploads/logos/abc123.jpg

Response Headers:
HTTP/1.1 200 OK
Content-Type: image/jpeg
Access-Control-Allow-Origin: *
Cross-Origin-Resource-Policy: cross-origin
Content-Length: 74276
```

## Testing

### 1. Restart Backend Server
```bash
cd backend
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Check Logo Display
Open Settings page and verify:
- Logo preview shows in settings
- Logo shows in sidebar
- No broken image icons
- No CORS errors in browser console

### 3. Test with Browser DevTools
Open browser console (F12) and check:
```
[getLogoUrl] Input logoUrl: /uploads/logos/xxx.jpg
[getLogoUrl] Constructed URL: http://localhost:3001/uploads/logos/xxx.jpg
```

### 4. Verify Image Loads
In Network tab:
- Look for `/uploads/logos/xxx.jpg` request
- Status should be `200 OK`
- Response headers should include:
  - `Access-Control-Allow-Origin: *`
  - `Cross-Origin-Resource-Policy: cross-origin`

### 5. Test Direct URL
Open in browser:
```
http://localhost:3001/uploads/logos/cb38e277-705c-417a-9c6f-bc319850a321.jpg
```
Should display the image directly.

## Why This Happened

### CORS Basics
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:3001` (Express API)
- Different ports = Different origins
- Images are considered "resources" and need CORS permission

### Helmet's Default Behavior
Helmet's `crossOriginResourcePolicy` defaults to `same-origin`, which means:
- ❌ Frontend at `localhost:5173` cannot load images from `localhost:3001`
- ✅ Backend at `localhost:3001` can load its own images

### The Fix
By setting:
```typescript
crossOriginResourcePolicy: false  // In helmet config
```
And adding:
```typescript
res.header('Cross-Origin-Resource-Policy', 'cross-origin')  // For uploads route
```
We allow the frontend to load images from the backend.

## Production Considerations

In production, you should:

1. **Restrict CORS origin** instead of using `*`:
```typescript
res.header('Access-Control-Allow-Origin', 'https://yourdomain.com');
```

2. **Use CDN or separate static server** for uploads:
```typescript
const logoUrl = process.env.CDN_URL 
  ? `${process.env.CDN_URL}${path}` 
  : `${backendUrl}${path}`;
```

3. **Set proper cache headers:**
```typescript
res.setHeader('Cache-Control', 'public, max-age=31536000');
```

## Files Modified
- ✅ `backend/src/app.ts` - Added CORS headers for uploads
- ✅ `src/lib/utils/logoUtils.ts` - Added debug logging

## Common Issues

### Issue: Image still not loading after fix
**Solution:** 
1. Clear browser cache (Ctrl+Shift+R)
2. Restart backend server
3. Check browser console for errors

### Issue: 404 Not Found
**Solution:** 
- Verify file exists in `backend/uploads/logos/`
- Check database has correct relative path (`/uploads/logos/xxx.jpg`)

### Issue: CORS error in console
**Solution:**
- Verify backend is running
- Check backend logs for startup errors
- Ensure `crossOriginResourcePolicy: false` is set

## Status
✅ Fixed - Ready to test after backend restart
