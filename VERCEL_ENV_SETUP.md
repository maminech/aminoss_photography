# Vercel Environment Variables Setup

## Instagram Credentials for Production

Add these to your Vercel dashboard:

### Step 1: Go to Vercel
1. Visit: https://vercel.com/
2. Select project: "aminoss photography"
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Variables

**Variable 1:**
- **Key**: `INSTAGRAM_APP_ID`
- **Value**: `4225588444434408`
- **Environments**: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- **Key**: `INSTAGRAM_APP_SECRET`
- **Value**: `d382cdc77447c4e74e6d0c5ec24d6af0`
- **Environments**: ✅ Production ✅ Preview ✅ Development

**Variable 3:**
- **Key**: `INSTAGRAM_REDIRECT_URI`
- **Value**: `https://aminossphotography-de89ue40o-aminech990000-6355s-projects.vercel.app/admin/dashboard/photos`
- **Environments**: ✅ Production ✅ Preview

**Variable 4 (for local development):**
- **Key**: `INSTAGRAM_REDIRECT_URI`
- **Value**: `http://localhost:3000/admin/dashboard/photos`
- **Environments**: ✅ Development only

### Step 3: Add Redirect URI to Facebook App

**Important!** You must also add the redirect URI to your Facebook app:

1. Go to: https://developers.facebook.com/apps/1078938860859241/
2. Click **"Instagram"** in left sidebar → **"API setup with Instagram login"**
3. Scroll to **"OAuth Redirect URIs"** section
4. Click **"Add URI"**
5. Add: `https://aminossphotography-de89ue40o-aminech990000-6355s-projects.vercel.app/admin/dashboard/photos`
6. Also add for local testing: `http://localhost:3001/admin/dashboard/photos`
7. Click **"Save Changes"**

### Step 4: Connect Instagram Account

1. In Facebook Developer Console, under Instagram setup
2. Click **"Add account"** button
3. Log in to your Instagram Creator account
4. Authorize the connection

### Step 5: Deploy

After adding environment variables to Vercel, redeploy:

```bash
git add .
git commit -m "Add Instagram Graph API integration"
git push
```

Vercel will auto-deploy, or you can trigger manually in the dashboard.

---

## Testing Checklist

- [ ] Environment variables added to Vercel
- [ ] Redirect URI added to Facebook app settings
- [ ] Instagram account connected in Facebook Developer Console
- [ ] Code deployed to Vercel
- [ ] Test: Go to your-site.com/admin/dashboard/photos
- [ ] Click "Sync from Instagram"
- [ ] Should see Instagram OAuth popup
- [ ] Authorize → Photos appear!

---

## Current Status

✅ Code is ready (uses Instagram Graph API)
✅ Local credentials configured (.env.local)
⏳ Need to add credentials to Vercel
⏳ Need to add redirect URI to Facebook app
⏳ Need to connect Instagram account in Facebook Console

---

## Quick Commands

```bash
# Test locally
npm run dev
# Visit: http://localhost:3001/admin/dashboard/photos

# Deploy to production
git add .
git commit -m "Instagram sync ready"
git push
```
