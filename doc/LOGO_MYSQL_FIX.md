# Logo Upload MySQL Packet Size Fix

## Error
```
[UserRepository] Update failed: Got a packet bigger than 'max_allowed_packet' bytes
[UserRepository] Error code: ER_NET_PACKET_TOO_LARGE
```

## Root Cause

MySQL has a default `max_allowed_packet` setting (usually 1MB or 4MB) which limits the size of data that can be sent in a single query. Base64-encoded images can easily exceed this:

- Your logo: **1104KB** compressed
- MySQL limit: ~1MB or 4MB (varies by installation)
- Result: ❌ Packet too large error

## Solution

### Quick Fix (Immediate)

Run this SQL in phpMyAdmin:

```sql
-- File: database/fix_mysql_packet_size.sql

-- Increase max_allowed_packet to 16MB
SET GLOBAL max_allowed_packet = 16777216;

-- Check it worked
SHOW VARIABLES LIKE 'max_allowed_packet';
```

**After running this:**
1. **Restart backend server** (Ctrl+C, then `npm run dev`)
2. The new connection will use the 16MB limit
3. Try uploading logo again

### Permanent Fix

The SQL command above is **temporary** - it resets when MySQL restarts.

To make it permanent, edit your MySQL configuration file:

#### For MAMP (macOS):
```bash
# Edit file:
/Applications/MAMP/conf/my.cnf

# Add under [mysqld] section:
[mysqld]
max_allowed_packet = 16M

# Restart MySQL from MAMP control panel
```

#### For XAMPP (Windows):
```bash
# Edit file:
C:\xampp\mysql\bin\my.ini

# Add under [mysqld] section:
[mysqld]
max_allowed_packet = 16M

# Restart MySQL from XAMPP control panel
```

#### For XAMPP (macOS):
```bash
# Edit file:
/Applications/XAMPP/xamppfiles/etc/my.cnf

# Add under [mysqld] section:
[mysqld]
max_allowed_packet = 16M

# Restart MySQL from XAMPP manager
```

#### For Homebrew MySQL (macOS):
```bash
# Edit file:
/usr/local/etc/my.cnf
# or
/opt/homebrew/etc/my.cnf

# Add under [mysqld] section:
[mysqld]
max_allowed_packet = 16M

# Restart MySQL:
brew services restart mysql
```

#### For Linux:
```bash
# Edit file:
sudo nano /etc/mysql/my.cnf
# or
sudo nano /etc/my.cnf

# Add under [mysqld] section:
[mysqld]
max_allowed_packet = 16M

# Restart MySQL:
sudo systemctl restart mysql
```

## Better Compression

I've also improved the image compression:

### Changes Made:
1. **Automatic resizing** - Logos are now resized to max 800x800px
2. **Better quality settings** - High-quality smoothing enabled
3. **Aggressive compression** - Iteratively reduces quality to hit 300KB target

### Expected Results:

| Before | After |
|--------|-------|
| 1104KB | ~250-350KB |
| No resize | Max 800x800px |
| Original dimensions | Optimized dimensions |

## Testing Steps

### 1. Run SQL Fix
```sql
-- In phpMyAdmin SQL tab:
SET GLOBAL max_allowed_packet = 16777216;
SHOW VARIABLES LIKE 'max_allowed_packet';
```

Expected output:
```
max_allowed_packet: 16777216
```

### 2. Restart Backend
```bash
# In backend terminal
Ctrl+C
npm run dev
```

### 3. Upload Logo
1. Go to Settings
2. Upload an image
3. Crop and save
4. Click "Save Store Details"

### 4. Check Logs

**Browser Console:**
```
[imageUtils] Resizing from 2000x2000 to 800x800
[imageUtils] Compression attempt 1, quality: 0.9
[imageUtils] Compressed size: 450KB, target: 300KB
[imageUtils] Compression attempt 2, quality: 0.8
[imageUtils] Compressed size: 320KB, target: 300KB
[imageUtils] Compression attempt 3, quality: 0.7
[imageUtils] Compressed size: 280KB, target: 300KB
[imageUtils] Final base64 size: 374KB
```

**Backend Terminal:**
```
[UserRepository] logoUrl size in update: 374KB  ← Much smaller!
[UserRepository] Update successful, affected rows: 1  ← Success!
[UserController] Profile updated successfully
```

## Why This Happens

### Base64 Encoding Overhead
Base64 encoding increases file size by ~33%:

| Image Size | Base64 Size | Total Payload |
|------------|-------------|---------------|
| 300 KB | ~400 KB | ~450 KB |
| 800 KB | ~1066 KB | ~1150 KB ❌ |
| 1104 KB | ~1472 KB | ~1500 KB ❌❌ |

### MySQL Default Limits
- **1MB** - Common default
- **4MB** - MAMP/XAMPP default
- **16MB** - Recommended for images
- **64MB** - Maximum practical limit

## Verification

After applying fix:

```sql
-- Check packet size
SHOW VARIABLES LIKE 'max_allowed_packet';
-- Should show: 16777216 (16MB)

-- Check if logo saved
SELECT 
    id,
    name,
    LENGTH(logo_url) as bytes,
    ROUND(LENGTH(logo_url) / 1024, 0) as kb
FROM users 
WHERE logo_url IS NOT NULL;
-- Should show your logo with size < 1000 KB
```

## Alternative: Cloud Storage

For production, consider storing images externally:

### Option 1: Cloudinary
```typescript
const response = await cloudinary.uploader.upload(file);
await updateProfile({ logoUrl: response.secure_url });
```

**Pros:**
- No MySQL packet issues
- Automatic optimization
- CDN delivery
- Image transformations

### Option 2: AWS S3
```typescript
const url = await s3.upload(file);
await updateProfile({ logoUrl: url });
```

**Pros:**
- Scalable storage
- No database bloat
- Faster queries

### Option 3: Local File System
```typescript
const filename = await saveFile(file, './uploads/logos/');
await updateProfile({ logoUrl: `/uploads/logos/${filename}` });
```

**Pros:**
- No external dependencies
- Full control
- No recurring costs

## Summary

✅ **Immediate fix:** Run SQL to increase packet size  
✅ **Long-term fix:** Update MySQL config file  
✅ **Better compression:** Images now resize to 800x800 max  
✅ **Target size:** ~300KB (base64: ~400KB)  
✅ **Within limits:** 400KB << 16MB ✓  

**After applying the SQL fix and restarting backend, try uploading again!**
