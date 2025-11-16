# Instagram Highlights Auto-Sync Setup Guide

This guide will help you connect your Instagram account to automatically sync highlights (stories) to your photography portfolio.

## Prerequisites

- An Instagram Business or Creator account
- A Facebook Developer account
- A Facebook Page connected to your Instagram account

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** as the app type
4. Fill in the app details:
   - **App Name**: "Innov8 Production Portfolio"
   - **App Contact Email**: Your email
5. Click **"Create App"**

## Step 2: Add Instagram Basic Display

1. In your Facebook App dashboard, click **"Add Product"**
2. Find **"Instagram Basic Display"** and click **"Set Up"**
3. Click **"Create New App"** under Instagram Basic Display
4. Click **"Basic Display"** in the left sidebar
5. Scroll down to **"User Token Generator"**
6. Click **"Add or Remove Instagram Testers"**
7. Add your Instagram account as a tester
8. Accept the tester invite on Instagram (check your Instagram notifications)

## Step 3: Generate Access Token

### Method 1: Using User Token Generator (Quick Start)

1. In **Instagram Basic Display** settings, scroll to **"User Token Generator"**
2. Click **"Generate Token"** next to your Instagram account
3. Click **"Authorize"** when prompted
4. Copy the generated **User Access Token**
5. **Important**: This token expires in 60 days

### Method 2: Using Graph API Explorer (Long-Lived Token)

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. Select your app from the dropdown
3. Click **"Generate Access Token"**
4. Grant permissions:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`
5. Copy the **Short-Lived Token**
6. Exchange it for a Long-Lived Token using this endpoint:
   ```
   GET https://graph.facebook.com/v18.0/oauth/access_token?
     grant_type=fb_exchange_token&
     client_id={your-app-id}&
     client_secret={your-app-secret}&
     fb_exchange_token={short-lived-token}
   ```
7. The response will contain a **Long-Lived Token** (60 days)

## Step 4: Connect Instagram to Your Portfolio

1. Log in to your admin dashboard
2. Navigate to **Admin Panel** → **Instagram**
3. Paste your **Access Token** in the input field
4. Click **"Connect Instagram"**
5. You should see a success message with your Instagram username

## Step 5: Sync Your Highlights

1. Once connected, click the **"Sync Now"** button
2. Wait for the sync to complete (usually takes 10-30 seconds)
3. You'll see the number of highlights and stories synced
4. Go to your homepage to view the synced highlights!

## Understanding Highlights vs Stories

- **Highlights**: Collections of stories you've saved to your profile (the circles below your bio)
- **Stories**: Individual photos/videos within each highlight
- Your portfolio will sync ALL active highlights and their stories

## Synced Data Structure

```
Highlight 1 (e.g., "Portfolio")
  ├── Story 1 (Image)
  ├── Story 2 (Video)
  └── Story 3 (Image)

Highlight 2 (e.g., "Behind the Scenes")
  ├── Story 1 (Image)
  └── Story 2 (Image)
```

## Managing Your Highlights

### To Update Highlights:

1. Make changes on your Instagram app (add/remove/reorder highlights)
2. Go to Admin → Instagram
3. Click **"Sync Now"** to update your portfolio
4. New highlights will be added, deleted ones removed

### To Hide Specific Highlights:

Currently, all active highlights are shown. To hide specific ones:
- Either delete them from Instagram
- Or remove them from Instagram's highlight section

## Troubleshooting

### Error: "Invalid access token"

**Solution:**
- Your token may have expired (they last 60 days)
- Generate a new token following Step 3
- Reconnect your account

### Error: "Failed to fetch Instagram highlights"

**Possible causes:**
1. Your Instagram account isn't Business/Creator
   - **Fix**: Convert to Business account in Instagram settings
2. No highlights on your profile
   - **Fix**: Create at least one highlight on Instagram
3. Token doesn't have required permissions
   - **Fix**: Regenerate token with correct permissions

### Highlights not showing on homepage

**Checks:**
1. Verify sync was successful (see count in Instagram page)
2. Make sure you have at least one highlight
3. Clear browser cache and refresh homepage
4. Check browser console for errors (F12 → Console)

### Token Expired

Instagram tokens expire after 60 days. When expired:
1. Generate a new token (Step 3)
2. Go to Admin → Instagram
3. Disconnect current account
4. Reconnect with new token

## API Rate Limits

Instagram API has rate limits:
- **200 calls per hour** per user
- Each sync uses 1 + (number of highlights) calls
- Recommended: Manual sync when you update Instagram
- Future: Automatic sync every 24 hours (configurable)

## Security Best Practices

1. **Never share your access token** with anyone
2. **Keep your Facebook App** settings private
3. **Use environment variables** for production tokens
4. **Regenerate tokens** if compromised
5. **Only grant necessary permissions**

## Features

✅ **Automatic Highlight Sync**
- Syncs all your Instagram highlights
- Downloads cover images
- Fetches all stories within each highlight
- Maintains order from Instagram

✅ **Story Viewer**
- Tap highlights on homepage to view stories
- Swipe between stories
- Auto-progression (5 seconds per story)
- Mobile-optimized gestures

✅ **Real-time Updates**
- Manual sync button in admin
- Last sync timestamp displayed
- Sync status indicators

## Coming Soon

🚧 **Automatic Scheduled Sync**
- Daily auto-sync at configured time
- Webhook support for instant updates
- Email notifications on sync failures

🚧 **Advanced Features**
- Select specific highlights to display
- Reorder highlights manually
- Add custom highlights (not from Instagram)
- Analytics on story views

## Support

Having issues? Here's what to check:

1. **Instagram Account Type**: Must be Business or Creator
2. **Facebook Page**: Must be connected to Instagram
3. **App Permissions**: Must include Instagram Basic Display
4. **Token Validity**: Check expiration date
5. **Highlights Exist**: Make sure you have active highlights

## API Documentation

- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Access Tokens](https://developers.facebook.com/docs/facebook-login/access-tokens)

---

**Need Help?**

If you encounter issues not covered here, check the browser console (F12) for detailed error messages, or contact support.

**Happy Syncing! 📸✨**

