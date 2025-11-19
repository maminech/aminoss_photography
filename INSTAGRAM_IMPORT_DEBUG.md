# 🔧 Instagram Import Troubleshooting Guide

**Issue**: Import shows "0 photos and 0 videos" even though Instagram shows 13 feed posts

**Date**: November 19, 2025  
**Account**: @najoua_couturee  
**Status**: 🔍 Debugging

---

## 🎯 Problem Analysis

### Current Status
- ✅ Instagram Connected: @najoua_couturee
- ✅ Feed Posts Detected: 13
- ❌ Database Records: 0 (posts not saving)
- ❌ Import Result: 0 photos, 0 videos

### Root Cause
The Instagram sync is fetching posts from Instagram API but they're **not being saved to the database** (`instagramPost` table). When you click "Import videos from Instagram", it finds 0 posts in the database, so it imports 0.

---

## 📋 Step-by-Step Fix

### Step 1: Verify Instagram Connection
1. Go to `/admin/dashboard/instagram`
2. Check "Connection Status" shows:
   - ✅ Connected
   - ✅ Username: @najoua_couturee
   - ✅ Feed Posts: 13

### Step 2: Sync Instagram (with new logging)
1. Click **"Sync Now"** button
2. Wait for sync to complete
3. Check Vercel logs for errors:
   ```
   Go to: https://vercel.com/aminech990000-6355s-projects/aminoss.photography/logs
   ```

### Step 3: Check Database
After syncing, verify posts are saved:

**Option A - Via Prisma Studio:**
```powershell
npx prisma studio
```
- Go to `InstagramPost` model
- Should see 13 records

**Option B - Via API:**
```powershell
# Check how many posts are in database
curl https://aminossphotography-fjqxid31u-aminech990000-6355s-projects.vercel.app/api/admin/instagram/sync
```

### Step 4: Import to Photos/Videos
Once posts are in database:
1. Click **"Import Photos from Instagram"** → Should import IMAGE posts
2. Click **"Import Videos from Instagram"** → Should import VIDEO posts
3. Check `/admin/dashboard/photos` and `/admin/dashboard/videos`

---

## 🔍 Debug Logs to Check

### What to Look For in Vercel Logs:

#### ✅ **Good Signs:**
```
📡 Fetching media for user ID: 123456789
📡 Media API response status: 200
📸 Found 13 Instagram posts from API
📋 Sample post IDs: 17901234567890123, 17901234567890124, ...
📤 Uploading IMAGE 17901234567890123 to Cloudinary...
✅ Uploaded to Cloudinary: https://res.cloudinary.com/dm22wlmpx/...
✅ Saved post 17901234567890123 to database (DB ID: clxyz123...)
💾 Database sync complete: 13 posts saved to instagramPost table
```

#### ❌ **Bad Signs:**
```
❌ Error syncing post 17901234567890123: [error details]
Instagram Media API Error: {"error": {...}}
Failed to upload to Cloudinary: [error]
Database sync complete: 0 posts saved
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Instagram Business Account Required"
**Error**: API returns 400 with business account message

**Solution**:
1. Convert Instagram to **Business Account**:
   - Open Instagram app
   - Go to Settings → Account
   - Switch to Professional Account → Business
2. Connect to **Facebook Page**:
   - Settings → Account → Linked Accounts → Facebook
3. Regenerate Access Token:
   - Go to: https://developers.facebook.com/tools/explorer
   - Select your app
   - Get Token → Instagram Business → Select permissions

### Issue 2: "Invalid Access Token"
**Error**: 190 error code

**Solution**:
1. Token expired (Instagram tokens expire after 60 days)
2. Go to `/admin/dashboard/instagram`
3. Click "Disconnect"
4. Generate new token and reconnect

### Issue 3: Cloudinary Upload Fails
**Error**: Upload fails with 4xx/5xx error

**Solution**:
1. Check Cloudinary credentials in Vercel:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = `dm22wlmpx`
   - `CLOUDINARY_API_KEY` = `816775898924348`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` = `innov8_portfolio`
2. Verify upload preset exists:
   - Go to: https://cloudinary.com/console/settings/upload
   - Find `innov8_portfolio` preset
   - Make sure it's **Unsigned**

### Issue 4: Database Connection Error
**Error**: Prisma errors in logs

**Solution**:
1. Check `DATABASE_URL` in Vercel environment variables
2. Verify MongoDB Atlas is accessible
3. Check IP whitelist in MongoDB (allow all: `0.0.0.0/0`)

### Issue 5: Posts Sync But Don't Import
**Error**: Sync shows success but import finds 0 posts

**Possible Causes**:
- Posts saved with `active: false`
- Database query filtering out posts
- Different database in dev vs production

**Solution**:
```sql
-- Check if posts exist but are inactive
SELECT COUNT(*) FROM InstagramPost WHERE active = false;

-- Activate all posts
UPDATE InstagramPost SET active = true;
```

---

## 🧪 Testing Checklist

### Before Deploying:
- [ ] Cloudinary credentials correct (new account `dm22wlmpx`)
- [ ] Upload preset `innov8_portfolio` exists
- [ ] MongoDB connection working
- [ ] Instagram access token valid

### After Sync:
- [ ] Check Vercel logs for errors
- [ ] Verify posts count in database
- [ ] Check Cloudinary for uploaded images
- [ ] Test import to Photos
- [ ] Test import to Videos
- [ ] Verify images display on website

---

## 📊 Expected Workflow

```
1. User: Click "Sync Now"
   ↓
2. API: Fetch posts from Instagram Graph API
   ↓
3. API: Upload each post thumbnail to Cloudinary
   ↓
4. API: Save post to instagramPost table
   ↓
5. Response: "Synced 13 posts"
   ↓
6. User: Click "Import Videos from Instagram"
   ↓
7. API: Query instagramPost table
   ↓
8. API: Filter VIDEO type posts
   ↓
9. API: Create records in Video table
   ↓
10. Response: "Imported X videos"
```

**Current Issue**: Step 4 is failing (posts not saving to database)

---

## 🔧 Quick Fixes to Try

### Fix 1: Clear and Re-sync
```powershell
# In admin dashboard
1. Click "Clear Instagram Posts"
2. Wait for confirmation
3. Click "Sync Now" again
4. Check logs
```

### Fix 2: Manual Database Check
```powershell
# Connect to database
npx prisma studio

# Check InstagramPost table
# Should see records with:
# - instagramId (Instagram post ID)
# - mediaType (IMAGE or VIDEO)
# - mediaUrl (Cloudinary URL)
# - active (true)
```

### Fix 3: Test Cloudinary Upload
```powershell
# Test if Cloudinary upload works
curl -X POST "https://api.cloudinary.com/v1_1/dm22wlmpx/image/upload" \
  -F "upload_preset=innov8_portfolio" \
  -F "folder=innov8_portfolio/instagram" \
  -F "file=https://picsum.photos/800"
```

### Fix 4: Check Environment Variables
```powershell
# Verify Vercel has correct variables
vercel env pull
cat .env.vercel.production | grep CLOUDINARY
```

---

## 📞 Get Help

### Check Logs:
- **Vercel**: https://vercel.com/aminech990000-6355s-projects/aminoss.photography/logs
- **Cloudinary**: https://cloudinary.com/console/logs
- **Instagram**: https://developers.facebook.com/tools/debug/accesstoken/

### Useful Commands:
```powershell
# View Vercel logs in terminal
vercel logs --prod

# Check database connection
npx prisma db push

# Test API endpoint
curl https://aminossphotography-fjqxid31u-aminech990000-6355s-projects.vercel.app/api/admin/instagram/sync
```

---

## ✅ Success Indicators

When everything works correctly, you should see:

1. **Sync Response**:
   ```
   ✅ Synced 13 posts, 0 highlights, 0 stories
   ```

2. **Database Count**:
   - InstagramPost: 13 records
   - All with `active: true`
   - Mix of IMAGE and VIDEO types

3. **Import Response**:
   ```
   ✅ Imported 8 photos and 5 videos, skipped 0
   Total imported: 13, Skipped: 0
   ```

4. **Website Display**:
   - Photos appear in `/gallery`
   - Videos appear in `/videos`
   - Instagram tag visible on imported items

---

## 🎯 Next Steps

1. **Immediate**: Check Vercel logs after clicking "Sync Now"
2. **If posts save**: Try import again
3. **If posts don't save**: Check database connection and Prisma logs
4. **If import still fails**: Check that posts have correct `mediaType` values

**Latest Deployment**: https://aminossphotography-fjqxid31u-aminech990000-6355s-projects.vercel.app  
**Build ID**: VYVyoRBKQYFFQn7o3wJ4Kn3f1ace

---

**Status**: 🚀 Deployed with enhanced logging  
**Action Required**: Try sync again and check logs
