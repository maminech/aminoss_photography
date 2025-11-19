# ❌ Cloudinary Upload Error - SOLUTION

## Error
```
Failed to upload photo-7.jpg: Invalid api_key 816775898924348
```

## Root Cause
**Vercel doesn't have the Cloudinary environment variables configured.** The app is using hardcoded fallback credentials which are invalid.

---

## ✅ SOLUTION: Add Environment Variables to Vercel

### Step 1: Open Vercel Dashboard
I've opened it for you, or go to:
https://vercel.com/aminech990000-6355s-projects/aminoss.photography/settings/environment-variables

### Step 2: Add These 3 Environment Variables

Click **"Add New"** for each:

#### 1️⃣ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- **Key:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **Value:** `dm22wlmpx`
- **Environment:** Production, Preview, Development (select all)

#### 2️⃣ CLOUDINARY_API_KEY
- **Key:** `CLOUDINARY_API_KEY`
- **Value:** `816775898924348`
- **Environment:** Production, Preview, Development (select all)

#### 3️⃣ CLOUDINARY_API_SECRET
- **Key:** `CLOUDINARY_API_SECRET`
- **Value:** `mbU--NngMju5dzFgvO_LExO7nnc`
- **Environment:** Production, Preview, Development (select all)

### Step 3: Verify Cloudinary Credentials

**⚠️ IMPORTANT:** The credentials might be invalid. Let's verify:

1. **Login to Cloudinary:**
   - Go to: https://cloudinary.com/console
   - Login with your account

2. **Get Correct Credentials:**
   - Go to Dashboard → Account Settings
   - Look for:
     * **Cloud Name:** Should be `dm22wlmpx` or similar
     * **API Key:** Should be a number (not `816775898924348` if that's invalid)
     * **API Secret:** Should be a string

3. **Update .env.local & Vercel:**
   - If credentials are different, update both:
     * Local: `E:\aminoss photography\.env.local`
     * Vercel: Environment Variables page

### Step 4: Redeploy

After adding variables to Vercel:

```powershell
vercel --prod
```

Or just trigger a redeploy in Vercel dashboard.

---

## 🔍 How to Get Cloudinary Credentials

### If You Don't Have a Cloudinary Account:

1. **Sign Up:**
   - Go to: https://cloudinary.com/users/register/free
   - Sign up for free account

2. **Get Credentials:**
   - After signup, go to Dashboard
   - Copy:
     * Cloud Name
     * API Key
     * API Secret

3. **Update Everywhere:**
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### If You Have Account But Lost Credentials:

1. **Login:**
   - https://cloudinary.com/console

2. **Dashboard → Settings → Account:**
   - Find API Keys section
   - Copy Cloud Name, API Key, API Secret

3. **Regenerate if Needed:**
   - If API Key is invalid, you can regenerate it
   - Click "Regenerate" next to API Secret

---

## 🎯 Quick Fix Commands

### Add to Vercel (via CLI):
```powershell
# Set cloud name
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production
# When prompted, enter: dm22wlmpx

# Set API key
vercel env add CLOUDINARY_API_KEY production
# When prompted, enter: your_api_key

# Set API secret
vercel env add CLOUDINARY_API_SECRET production
# When prompted, enter: your_api_secret
```

### Then redeploy:
```powershell
vercel --prod
```

---

## ✅ Verification

After adding credentials and redeploying:

1. **Try Guest Upload Again:**
   - Go to: https://aminossphotography.vercel.app/events/690ebcfd0c024baae65cf690/guest-upload
   - Fill form and upload a photo

2. **Check Vercel Logs:**
   - Should see: `✅ Cloudinary upload success: photo_name`
   - No more: `❌ Invalid api_key` error

3. **Check Cloudinary Dashboard:**
   - Photos should appear in: `events/690ebcfd0c024baae65cf690/guest-uploads/`

---

## 📋 Checklist

- [ ] Login to Cloudinary dashboard
- [ ] Verify credentials are correct
- [ ] Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to Vercel
- [ ] Add CLOUDINARY_API_KEY to Vercel
- [ ] Add CLOUDINARY_API_SECRET to Vercel
- [ ] Redeploy to production
- [ ] Test guest upload
- [ ] Verify photos appear in Cloudinary

---

## 🆘 Still Not Working?

### Check Cloudinary Upload Preset

The upload preset `innov8_portfolio` must exist in Cloudinary:

1. **Cloudinary Dashboard → Settings → Upload**
2. **Look for preset:** `innov8_portfolio`
3. **If missing, create it:**
   - Click "Add upload preset"
   - **Preset name:** `innov8_portfolio`
   - **Signing mode:** Unsigned
   - **Folder:** (leave empty or set to `events`)
   - Save

### Check Cloudinary Quota

Free tier limits:
- **Storage:** 25GB
- **Bandwidth:** 25GB/month
- **Transformations:** 25,000/month

If exceeded, upgrade plan or clean up old files.

---

## 📞 Need Help?

If still having issues:

1. **Share Cloudinary Dashboard Screenshot:**
   - Show Cloud Name, API Key (first few digits only)

2. **Share Vercel Error Logs:**
   - Go to: https://vercel.com/aminech990000-6355s-projects/aminoss.photography
   - Click latest deployment → Logs
   - Copy error messages

3. **Test Cloudinary Connection:**
   ```powershell
   # In project directory
   node
   ```
   ```javascript
   const cloudinary = require('cloudinary').v2;
   cloudinary.config({
     cloud_name: 'dm22wlmpx',
     api_key: '816775898924348',
     api_secret: 'mbU--NngMju5dzFgvO_LExO7nnc'
   });
   cloudinary.api.ping((error, result) => {
     console.log(error || result);
   });
   ```

---

## 🎉 Success Indicators

When fixed, you'll see:
- ✅ Photos upload without errors
- ✅ Photos appear in upload preview
- ✅ Photos saved to Cloudinary (`events/...` folder)
- ✅ Photos saved to database
- ✅ Guest can select photos for photobooth print

**Status:** 🔧 AWAITING CLOUDINARY CREDENTIALS UPDATE
