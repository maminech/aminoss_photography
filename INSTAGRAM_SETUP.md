# Instagram Integration Setup Guide

## 🚀 Quick Start (5 Minutes)

**Need the credentials fast? Here's the TL;DR:**

1. **Go to**: https://developers.facebook.com/
2. **Create App** → Choose "Consumer" type
3. **Add Product** → "Instagram Basic Display"
4. **Get Credentials**:
   - Instagram App ID (visible on page)
   - Instagram App Secret (click "Show")
5. **Add Redirect URI**: `https://your-vercel-url.vercel.app/admin/dashboard/photos`
6. **Add yourself as Instagram Tester** → Accept on Instagram app
7. **Add to .env**:
   ```env
   INSTAGRAM_APP_ID="your_id_here"
   INSTAGRAM_APP_SECRET="your_secret_here"
   INSTAGRAM_REDIRECT_URI="https://your-url.com/admin/dashboard/photos"
   ```
8. **Deploy & Test!**

📖 **Need detailed steps?** Continue reading below ⬇️

---

## 📊 How It Works (Visual Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSTAGRAM SYNC PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

1. SETUP (One Time)
   ┌──────────────┐
   │ Facebook Dev │ → Create App → Add Instagram Basic Display
   │   Console    │ → Get App ID & Secret
   └──────────────┘ → Add Redirect URI
         │           → Add Yourself as Tester
         ↓
   ┌──────────────┐
   │  .env File   │ → INSTAGRAM_APP_ID="..."
   │              │ → INSTAGRAM_APP_SECRET="..."
   └──────────────┘ → INSTAGRAM_REDIRECT_URI="..."

2. IMPORT WORKFLOW (Each Time)
   ┌────────────────┐
   │ Admin Clicks   │ → "Sync from Instagram" button
   │ Sync Button    │
   └────────────────┘
         │
         ↓
   ┌────────────────┐
   │ OAuth Window   │ → Instagram login page opens
   │    Opens       │ → User authorizes access
   └────────────────┘
         │
         ↓
   ┌────────────────┐
   │ Fetch Photos   │ → API call to Instagram
   │ from Instagram │ → Returns array of media items
   └────────────────┘
         │
         ↓
   ┌────────────────┐
   │ Display Grid   │ → Show photos in modal
   │ with Selection │ → User selects which to import
   └────────────────┘
         │
         ↓
   ┌────────────────┐
   │ Click Import   │ → Start import process
   │    Button      │
   └────────────────┘
         │
         ↓
   ┌────────────────┐
   │ For Each Photo │ → Download from Instagram URL
   │   Selected:    │ → Upload to Cloudinary
   └────────────────┘ → Save to MongoDB
         │
         ↓
   ┌────────────────┐
   │ Success! ✅    │ → Show import summary
   │                │ → Auto-refresh page
   └────────────────┘ → Photos now in portfolio

3. PHOTO DATA FLOW
   Instagram Post → Your Portfolio
   ├─ Image URL    → Cloudinary URL
   ├─ Caption      → Title & Description
   ├─ Timestamp    → Created At
   ├─ Media Type   → Image (videos skipped)
   └─ Metadata     → Category: Travel, Tags: [instagram, import]
```

---

## Overview
The Instagram Sync feature allows you to import photos from your Instagram account directly into your photography portfolio.

## Prerequisites
- Instagram account (personal or business)
- Facebook Developer account
- Valid redirect URI (your deployed website URL)

## Setup Steps

### 1. Create a Facebook App

**Step-by-step with screenshots locations:**

1. **Go to Facebook Developers Portal**
   - Visit: https://developers.facebook.com/
   - Click the **"Login"** button (top right)
   - Log in with your Facebook account (same account linked to your Instagram)

2. **Access My Apps**
   - After login, click **"My Apps"** in top navigation
   - Click the green **"Create App"** button

3. **Choose App Type**
   - Select **"Consumer"** (for personal/business use)
   - Click **"Next"**

4. **Fill App Details**
   - **Display Name**: `Innov8 Production Portfolio` (or your business name)
   - **App Contact Email**: Your email (e.g., `aminech990000@gmail.com`)
   - **Business Account** (optional): Skip for now
   - Click **"Create App"**
   - Complete security check (if prompted)

5. **App Created Successfully!**
   - You'll be redirected to your app dashboard
   - Note your **App ID** at the top of the page (save this for later)

---

### 2. Add Instagram Basic Display Product

**From your App Dashboard:**

1. **Find Products Section**
   - Scroll down to **"Add Products to Your App"** section
   - Look for **"Instagram"** product card
   - Find **"Instagram Basic Display"** (NOT "Instagram Graph API")

2. **Set Up Instagram Basic Display**
   - Click the **"Set Up"** button under "Instagram Basic Display"
   - You'll see Instagram Basic Display in your left sidebar now

3. **Create Instagram App**
   - Click **"Basic Display"** in the left sidebar
   - Scroll down to find **"Create New App"** button
   - Click **"Create New App"**
   - A popup will appear with Instagram Platform Terms
   - Click **"Create App"** to accept

---

### 3. Configure Basic Display Settings

**Still on the Basic Display page:**

1. **Find Your Instagram App ID and Secret**
   - Look for the **"Instagram App ID"** field
   - **COPY THIS** → This is your `INSTAGRAM_APP_ID`
   - Look for **"Instagram App Secret"** field
   - Click **"Show"** button next to it
   - **COPY THIS** → This is your `INSTAGRAM_APP_SECRET`
   
   ```env
   INSTAGRAM_APP_ID="1234567890123456"  ← Your copied App ID
   INSTAGRAM_APP_SECRET="abc123def456..."  ← Your copied App Secret
   ```

2. **Configure OAuth Redirect URIs**
   - Scroll down to **"Client OAuth Settings"** section
   - Find **"Valid OAuth Redirect URIs"** field
   - Click **"Add URI"**
   
   **For Production (after deploying):**
   ```
   https://Innov8photography-de89ue40o-aminech990000-6355s-projects.vercel.app/admin/dashboard/photos
   ```
   
   **For Local Development:**
   ```
   http://localhost:3000/admin/dashboard/photos
   ```
   
   > **Important**: Replace with YOUR actual Vercel URL or custom domain!
   
   - Click **"Add URI"** again for the second URL
   - **COPY YOUR PRODUCTION URL** → This is your `INSTAGRAM_REDIRECT_URI`

3. **Configure Callback URLs** (Required by Instagram)
   - Find **"Deauthorize Callback URL"**:
     ```
     https://your-domain.com/api/admin/instagram-deauth
     ```
   
   - Find **"Data Deletion Request URL"**:
     ```
     https://your-domain.com/api/admin/instagram-delete
     ```
   
   > **Note**: These endpoints don't need to exist yet, Instagram just requires them

4. **Save All Changes**
   - Scroll to bottom
   - Click **"Save Changes"** button
   - You'll see "Changes saved" confirmation

---

### 4. Add Instagram Tester Account

**This is REQUIRED to test before app review:**

1. **Go to Roles Section**
   - In left sidebar, click **"Roles"** under Instagram Basic Display
   - Click **"Instagram Testers"** tab

2. **Add Your Instagram Account**
   - Click **"Add Instagram Testers"** button
   - A popup will appear
   - Type your Instagram username (e.g., `Innov8_photography`)
   - Click on your username when it appears
   - Click **"Submit"**

3. **Accept Tester Invitation (ON YOUR PHONE)**
   - Open **Instagram app** on your phone
   - Go to **Settings** (☰ menu → Settings)
   - Tap **"Apps and Websites"**
   - Look for **"Tester Invites"** section
   - You'll see an invitation from your app
   - Tap **"Accept"**
   
   > **Alternative**: Check Instagram email for invitation link

---

### 5. Get Your Final Configuration

**Now you have everything! Create your .env configuration:**

```env
# Instagram Basic Display API
INSTAGRAM_APP_ID="1234567890123456"
INSTAGRAM_APP_SECRET="abc123def456ghi789jkl012mno345pqr678stu901"
INSTAGRAM_REDIRECT_URI="https://Innov8photography-de89ue40o-aminech990000-6355s-projects.vercel.app/admin/dashboard/photos"
```

**Where to find each value:**

| Variable | Where to Find It |
|----------|-----------------|
| `INSTAGRAM_APP_ID` | Facebook App Dashboard → Products → Instagram Basic Display → Instagram App ID |
| `INSTAGRAM_APP_SECRET` | Same place → Instagram App Secret (click "Show") |
| `INSTAGRAM_REDIRECT_URI` | Your Vercel deployment URL + `/admin/dashboard/photos` |

---

### 6. Add to Your Project

**Option A: Local Development (.env.local)**

1. Open your project in VS Code
2. Find or create `.env.local` file in root directory
3. Add the three variables:
   ```env
   INSTAGRAM_APP_ID="your_app_id_here"
   INSTAGRAM_APP_SECRET="your_secret_here"
   INSTAGRAM_REDIRECT_URI="http://localhost:3000/admin/dashboard/photos"
   ```
4. Save the file
5. Restart your dev server: `npm run dev`

**Option B: Production (Vercel)**

1. Go to your Vercel dashboard: https://vercel.com/
2. Select your project: "Innov8 Production"
3. Go to **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Add each variable:
   - **Key**: `INSTAGRAM_APP_ID`
   - **Value**: Your Instagram App ID
   - **Environments**: Check "Production", "Preview", "Development"
   - Click **Save**
6. Repeat for `INSTAGRAM_APP_SECRET` and `INSTAGRAM_REDIRECT_URI`
7. Redeploy your site: `vercel --prod`

---

### 7. Test It!

1. **Deploy your code** (if not already):
   ```bash
   git add .
   git commit -m "Add Instagram sync feature"
   git push
   vercel --prod
   ```

2. **Go to your admin dashboard**:
   - Visit: `https://your-domain.com/admin/login`
   - Log in with admin credentials

3. **Navigate to Photos**:
   - Click **"Photos"** in sidebar
   - You should see **"Sync from Instagram"** button

4. **Test the sync**:
   - Click **"Sync from Instagram"**
   - Click **"Connect Instagram"**
   - Instagram OAuth window opens
   - Log in (if needed)
   - Click **"Allow"** to authorize
   - Your photos appear in the grid!
   - Select photos to import
   - Click **"Import X Photos"**
   - Wait for success message
   - Your photos are now in your portfolio! 🎉

## Usage

### Importing Photos

1. Click **"Sync from Instagram"** button in Photos dashboard
2. Click **"Connect Instagram"**
3. Log in to Instagram (if not already logged in)
4. Authorize the app to access your media
5. Select photos you want to import
6. Click **"Import X Photos"**
7. Photos will be uploaded to Cloudinary and saved to your database

### What Gets Imported

- ✅ **Images**: All image posts
- ❌ **Videos**: Skipped (can be added later if needed)
- ❌ **Carousels**: Only first image imported
- ✅ **Captions**: Used as photo title and description
- ✅ **Timestamp**: Preserved from Instagram

### Default Settings for Imported Photos

- **Category**: Travel (can be changed after import)
- **Tags**: `["instagram", "import"]`
- **Featured**: No
- **Show on Homepage**: No
- **Show in Gallery**: Yes
- **Folder**: `instagram-imports/`

## API Limitations

### Rate Limits
- **200 requests per hour** per user
- **User Token**: Valid for 60 days

### Permissions
The app requests these permissions:
- `user_profile`: Basic account info
- `user_media`: Access to photos and videos

### Data Access
- Access to **public posts only**
- Cannot access:
  - Stories
  - Direct messages
  - Private account data (unless tester)
  - Deleted posts

## Troubleshooting

### Common Issues & Solutions

#### ❌ "Instagram API not configured" Error

**What you see:**
- Red alert in the sync modal
- Message: "Please add INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, and INSTAGRAM_REDIRECT_URI to your .env file"

**Solution:**
1. Check if `.env.local` exists in your project root
2. Verify all three variables are present:
   ```env
   INSTAGRAM_APP_ID="..."
   INSTAGRAM_APP_SECRET="..."
   INSTAGRAM_REDIRECT_URI="..."
   ```
3. Restart your dev server: Stop (Ctrl+C) and run `npm run dev`
4. For Vercel: Check Environment Variables in project settings
5. Make sure variable names match EXACTLY (case-sensitive)

---

#### ❌ "Failed to get access token" Error

**What you see:**
- Error after authorizing Instagram
- Redirect happens but no photos appear

**Possible causes & fixes:**

**1. Redirect URI Mismatch**
- **Check**: Your `.env` redirect URI must EXACTLY match Facebook app settings
- **Fix**: 
  ```
  Facebook App: https://yoursite.com/admin/dashboard/photos
  .env file:    https://yoursite.com/admin/dashboard/photos
  ✅ Must be identical (including https vs http)
  ```

**2. Invalid App Secret**
- **Check**: Copy-paste error in `INSTAGRAM_APP_SECRET`
- **Fix**: Go back to Facebook Developer Console → Instagram Basic Display → Click "Show" → Copy again

**3. Not Added as Tester**
- **Check**: Did you accept the tester invitation on Instagram?
- **Fix**: 
  1. Instagram app → Settings → Apps and Websites
  2. Look for "Tester Invites"
  3. Accept the invitation
  4. Wait 5 minutes and try again

**4. App in Development Mode**
- **Check**: App not yet live (only affects non-testers)
- **Fix**: For testing, just add yourself as tester (step 4 above)

---

#### ❌ "Failed to fetch Instagram media" Error

**What you see:**
- Connected successfully but can't load photos

**Possible causes:**

**1. No Public Posts**
- **Check**: Your Instagram account needs public posts
- **Fix**: Make sure you have at least 1 public photo post

**2. Business Account Not Connected**
- **Check**: If using Instagram Business account
- **Fix**: Use Instagram Personal account for Basic Display API

**3. API Rate Limit**
- **Check**: Made too many requests (200/hour limit)
- **Fix**: Wait 1 hour and try again

**4. Token Expired**
- **Check**: OAuth token expired (happens after 60 days)
- **Fix**: Just reconnect - tokens aren't stored anyway

---

#### ❌ Photos Not Appearing After Import

**What you see:**
- Import says "Success" but photos aren't in gallery

**Possible causes:**

**1. Cloudinary Upload Failed**
- **Check**: Browser console (F12) for errors
- **Fix**: Verify Cloudinary credentials in `.env`:
  ```env
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="Innov8"
  CLOUDINARY_API_KEY="your_key"
  CLOUDINARY_API_SECRET="your_secret"
  ```

**2. Database Connection Issue**
- **Check**: MongoDB connection string valid?
- **Fix**: Test connection: `npx prisma studio`

**3. Photos Filtered Out**
- **Check**: Import settings (category, visibility)
- **Fix**: Photos import with:
  - `showInGallery: true` ✅
  - `showOnHomepage: false` ❌
  - Go to Admin → Photos → Edit imported photos to show on homepage

**4. Page Needs Refresh**
- **Check**: Cached data
- **Fix**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

#### ❌ "This authorization code has been used"

**What you see:**
- Error on second authorization attempt

**Cause:**
- Instagram OAuth codes are single-use only

**Fix:**
- Close the Instagram Sync modal
- Click "Sync from Instagram" again
- Get a fresh authorization code

---

#### ⚠️ Redirect URI Not Working on Vercel

**What you see:**
- Local works, production doesn't

**Fix:**
1. Update Vercel environment variables:
   ```env
   INSTAGRAM_REDIRECT_URI="https://your-actual-vercel-url.vercel.app/admin/dashboard/photos"
   ```
   
2. Update Facebook app settings with same URL

3. Make sure both use `https://` (not `http://`)

4. Redeploy: `vercel --prod`

---

### Debug Checklist

**Before asking for help, verify:**

- [ ] Facebook app created and Instagram Basic Display added
- [ ] Instagram App ID copied correctly (no spaces)
- [ ] Instagram App Secret revealed and copied (not the hidden one)
- [ ] Redirect URI matches EXACTLY in both places
- [ ] You're added as Instagram Tester
- [ ] Tester invitation accepted on Instagram app
- [ ] Environment variables saved (local: `.env.local`, Vercel: Settings)
- [ ] Dev server restarted after changing `.env`
- [ ] Vercel redeployed after changing environment variables
- [ ] Using Personal Instagram account (not Business)
- [ ] Account has public posts
- [ ] Cloudinary credentials valid

---

### Still Not Working?

**Check these logs:**

1. **Browser Console** (F12):
   ```
   Look for: "Instagram sync error:", "Failed to fetch"
   ```

2. **Vercel Logs** (if deployed):
   ```
   Dashboard → Your Project → Deployments → Click latest → View Function Logs
   ```

3. **Facebook Developer Console**:
   ```
   Your App → Dashboard → Check for error alerts
   ```

**Get your URLs:**
```bash
# Local
echo "INSTAGRAM_REDIRECT_URI=\"http://localhost:3000/admin/dashboard/photos\""

# Production (replace with your URL)
echo "INSTAGRAM_REDIRECT_URI=\"https://Innov8photography-de89ue40o-aminech990000-6355s-projects.vercel.app/admin/dashboard/photos\""
```

---

## Security Notes

### Token Storage
- Access tokens are **not stored** in the database
- Each sync requires fresh authorization
- Tokens expire after 60 days

### Data Privacy
- Only public media is accessible
- No personal data is stored
- User can revoke access anytime

### Best Practices
1. **Don't share** App Secret publicly
2. **Use HTTPS** for redirect URIs
3. **Rotate credentials** periodically
4. **Monitor API usage** in Facebook Analytics

## Advanced Configuration

### Custom Import Settings

Edit `src/app/api/admin/instagram-sync/route.ts` to customize:

```typescript
// Change default category
category: 'portfolio', // instead of 'travel'

// Change folder structure
folder: 'social-media/instagram',

// Auto-feature imports
featured: true,

// Show on homepage by default
showOnHomepage: true,
```

### Filtering Imports

Add filters before import:

```typescript
// Only import photos with specific hashtags
if (!item.caption?.includes('#portfolio')) {
  skipped++;
  continue;
}

// Only import recent posts (last 30 days)
const postDate = new Date(item.timestamp);
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
if (postDate < thirtyDaysAgo) {
  skipped++;
  continue;
}
```

### Webhook Setup (Optional)

For automatic imports when you post on Instagram:

1. Add webhook endpoint in Facebook app settings
2. Subscribe to `media` events
3. Implement `/api/webhooks/instagram` route
4. Auto-import new posts

---

## 💡 Example Configuration

**Here's what your actual values will look like:**

```env
# ❌ WRONG (placeholders)
INSTAGRAM_APP_ID="your_app_id"
INSTAGRAM_APP_SECRET="your_secret"
INSTAGRAM_REDIRECT_URI="https://your-domain.com/..."

# ✅ CORRECT (real values)
INSTAGRAM_APP_ID="123456789012345"
INSTAGRAM_APP_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
INSTAGRAM_REDIRECT_URI="https://Innov8photography-de89ue40o-aminech990000-6355s-projects.vercel.app/admin/dashboard/photos"
```

**Key Points:**
- App ID: 15-digit number
- App Secret: 32-character alphanumeric string
- Redirect URI: FULL URL including protocol (https://)

---

## 📚 Quick Reference Card

| What You Need | Where to Find It | Looks Like |
|---------------|------------------|------------|
| **App ID** | Facebook Dev Console<br>→ Instagram Basic Display<br>→ Instagram App ID | `123456789012345` |
| **App Secret** | Same place<br>→ Click "Show" button | `a1b2c3d4e5f6g7h8...` (32 chars) |
| **Redirect URI** | Your Vercel deployment URL<br>+ `/admin/dashboard/photos` | `https://yoursite.vercel.app/admin/dashboard/photos` |
| **Tester Status** | Instagram app<br>→ Settings → Apps and Websites<br>→ Tester Invites | Accept invitation |

---

## 🎯 Testing Checklist

Before using Instagram Sync, verify:

- [ ] ✅ Facebook app created
- [ ] ✅ Instagram Basic Display added to app
- [ ] ✅ Instagram App ID copied
- [ ] ✅ Instagram App Secret copied (revealed, not hidden)
- [ ] ✅ Redirect URI added to Facebook app settings
- [ ] ✅ Your Instagram username added as tester
- [ ] ✅ Tester invitation accepted on Instagram app
- [ ] ✅ All 3 environment variables added to `.env.local`
- [ ] ✅ Dev server restarted
- [ ] ✅ For production: Variables added to Vercel
- [ ] ✅ For production: Site redeployed

**Then test:**
1. Go to Admin → Photos
2. Click "Sync from Instagram"
3. Should see "Connect Instagram" button (not error message)
4. Click connect → Instagram OAuth window opens
5. Authorize → Photos appear in grid
6. Select and import → Success! ✅

---

## Resources

- [Instagram Basic Display API Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook App Review Process](https://developers.facebook.com/docs/app-review)
- [Instagram Platform Terms](https://developers.facebook.com/terms/instagram_platform_terms)

## Support

If you encounter issues:
1. Check the [troubleshooting](#troubleshooting) section
2. Review Facebook Developer Console logs
3. Check browser console for errors
4. Verify all environment variables are set

---

**Last Updated**: November 6, 2025  
**Version**: 1.0

