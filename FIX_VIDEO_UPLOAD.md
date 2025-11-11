# ✅ Video Upload Fix

## Problem Identified
The video upload was failing because the **upload preset environment variable** was missing.

## What I Fixed

### 1. ✅ Added Missing Environment Variable
Added `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=aminoss_portfolio` to:
- `.env.local` (for local development)
- `.env.production` (for production builds)

### 2. 🔧 Cloudinary Upload Preset Configuration
You need to verify your Cloudinary upload preset supports videos:

#### Steps to Configure:
1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Navigate to **Settings** → **Upload** → **Upload presets**
3. Find or create preset: `aminoss_portfolio`
4. Configure these settings:

```
✅ Unsigned: YES (required for client-side uploads)
✅ Folder: videos (or leave empty for auto-detection)
✅ Resource type: Auto (allows both images and videos)
✅ Max file size: 500000000 (500MB)
✅ Allowed formats: mp4, mov, avi, webm, mkv, flv, wmv
```

### 3. 🚀 Add to Vercel Environment Variables
You need to add this to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `aminoss-photography`
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
   - **Value**: `aminoss_portfolio`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### 4. 🔄 Redeploy
After adding to Vercel, redeploy:
```bash
git add .
git commit -m "fix: add missing cloudinary upload preset"
git push
```

## Testing Locally

1. **Restart your dev server** (important!):
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

2. **Test video upload**:
   - Go to: http://localhost:3000/admin/login
   - Login with: `admin@admin.com` / `admin123`
   - Navigate to Videos dashboard
   - Click "Upload Video"
   - Select a video file (MP4, MOV, etc.)
   - Should upload successfully! ✅

## What Each Component Does

### Frontend (videos/page.tsx)
```typescript
<CldUploadWidget
  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} // ← Now defined!
  options={{
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    resourceType: 'video',
    maxFileSize: 500000000, // 500MB
    clientAllowedFormats: ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'],
    folder: 'videos'
  }}
/>
```

### API Route (/api/admin/videos/route.ts)
- Syncs videos from Cloudinary to database
- Updates video metadata
- Handles delete operations

## Troubleshooting

### If upload still fails:

1. **Check browser console** for detailed error:
   - Open DevTools (F12)
   - Go to Console tab
   - Try upload again
   - Look for error message

2. **Verify environment variables loaded**:
   - Add this to your videos page temporarily:
   ```typescript
   console.log('Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
   console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
   ```
   - Check console - both should show values

3. **Check upload preset in Cloudinary**:
   - Must be marked as "Unsigned"
   - Must allow video resource type
   - Must not have restrictive size limits

4. **File size/format issues**:
   - Max size: 500MB
   - Supported formats: MP4, MOV, AVI, WebM, MKV, FLV, WMV
   - Try a small test video first (<10MB)

### Common Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| "Upload preset required" | Env var not set | Add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET |
| "Unsigned upload not allowed" | Preset not unsigned | Enable unsigned in Cloudinary |
| "Invalid resource type" | Preset doesn't allow videos | Set resource type to "Auto" |
| "File too large" | Exceeds size limit | Check file size < 500MB |
| "Invalid file format" | Unsupported format | Use MP4, MOV, etc. |

## Next Steps

1. ✅ Environment variables updated locally
2. ⏳ **RESTART dev server** (npm run dev)
3. ⏳ **Add to Vercel** (see step 3 above)
4. ⏳ **Redeploy** (git push)
5. ⏳ **Test upload** locally and in production

---

**Status**: ✅ Local fix applied - Needs Vercel update + restart
