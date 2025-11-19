# ✅ Google Calendar Integration - Setup Required

**Date:** November 17, 2025  
**Status:** ⚠️ Configuration Needed  
**Priority:** Medium

---

## 🎯 What Happened

You tried to connect Google Calendar but received a **400 Bad Request error** from Google. This is because the **Google Calendar OAuth credentials are not yet configured** in your environment variables.

---

## 📋 What Was Fixed

### 1. ✅ Added Configuration Guide
- Created `GOOGLE_CALENDAR_SETUP_GUIDE.md` - Complete step-by-step setup instructions
- Covers Google Cloud Console setup, OAuth credentials, and troubleshooting

### 2. ✅ Added Environment Variable Placeholders
- Updated `.env.local` with Google Calendar variables
- Updated `.env.example` for future reference

### 3. ✅ Created Configuration Checker
- Added `check-google-calendar-config.js` - Script to verify credentials are set correctly
- Run with: `node check-google-calendar-config.js`

### 4. ✅ Improved Error Handling
- Enhanced error messages in calendar integration component
- Added URL parameter handling for OAuth callback
- Shows helpful messages based on error type

---

## 🚀 How to Set Up Google Calendar

### Quick Start (5 minutes):

1. **Follow the guide:**
   ```bash
   # Open the setup guide
   code GOOGLE_CALENDAR_SETUP_GUIDE.md
   ```

2. **Get credentials from Google:**
   - Go to https://console.cloud.google.com/
   - Create project → Enable Calendar API → Create OAuth credentials
   - Copy Client ID and Client Secret

3. **Update `.env.local`:**
   ```bash
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/admin/google-calendar/callback
   ```

4. **Test configuration:**
   ```bash
   node check-google-calendar-config.js
   ```

5. **Start dev server and test:**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/admin/dashboard/calendar-integration
   ```

---

## 🌐 For Production (Vercel)

After local setup works, add to Vercel:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/aminech990000-6355s-projects/aminoss.photography/settings/environment-variables

2. **Add these variables:**
   - `GOOGLE_CLIENT_ID` = (your client ID)
   - `GOOGLE_CLIENT_SECRET` = (your client secret)
   - `GOOGLE_REDIRECT_URI` = `https://aminossphotography.vercel.app/api/admin/google-calendar/callback`

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

4. **Test on production:**
   - Visit: https://aminossphotography.vercel.app/admin/dashboard/calendar-integration
   - Click "Connecter Google Calendar"
   - Should work!

---

## 📊 How It Will Work Once Configured

### Automatic Event Sync:
1. Client submits booking request
2. Admin approves booking in dashboard
3. ✨ **Event automatically created in Google Calendar**
4. Event includes:
   - Client name
   - Booking type (wedding, portrait, etc.)
   - Date and time
   - Duration
   - Location (if provided)
   - Client contact info

### Features:
- ✅ Auto-create events on approval
- ✅ Update events when booking modified
- ✅ Delete events when booking cancelled
- ✅ Conflict detection
- ✅ Email notifications
- ✅ Sync across all devices (phone, tablet, computer)

---

## 🔍 Files Changed

### New Files:
1. `GOOGLE_CALENDAR_SETUP_GUIDE.md` - Comprehensive setup guide
2. `check-google-calendar-config.js` - Configuration verification script

### Modified Files:
1. `.env.local` - Added Google Calendar environment variables
2. `.env.example` - Added complete example for all env vars
3. `src/modules/admin/GoogleCalendarIntegration.tsx` - Improved error handling

---

## 🎨 Current State

### Calendar Integration Page:
- **URL:** http://localhost:3000/admin/dashboard/calendar-integration
- **Status:** Shows "Non connecté" (Not connected)
- **Error Handling:** ✅ Now shows helpful messages
- **Features:** Connect, disconnect, sync buttons ready
- **Design:** Glass card with dark mode support

### What You'll See:
- ⚠️ "Google Calendar non configuré" if credentials missing
- ✅ "Connected" status once configured
- 📧 Shows connected email
- 🕐 Shows last sync time
- 🔄 Sync button to refresh
- 🔗 Disconnect button

---

## 🧪 Testing Checklist

Once you configure:

- [ ] Run `node check-google-calendar-config.js` - Should show all green
- [ ] Visit `/admin/dashboard/calendar-integration` - Should load
- [ ] Click "Connecter Google Calendar" - Should redirect to Google
- [ ] Authorize the app - Should redirect back
- [ ] See "Connected" status with email - Success!
- [ ] Try syncing - Should work
- [ ] Approve a test booking - Should create calendar event
- [ ] Check Google Calendar - Event should appear

---

## 📞 Need Help?

### Common Issues:

**"400 Bad Request"**
- ❌ Redirect URI mismatch in Google Console
- ✅ Make sure it exactly matches: `http://localhost:3000/api/admin/google-calendar/callback`

**"redirect_uri_mismatch"**
- ❌ Redirect URI not added to authorized list
- ✅ Add it in Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs

**"Google Calendar not configured"**
- ❌ Environment variables not set
- ✅ Update `.env.local` with real credentials

**"Access blocked: This app's request is invalid"**
- ❌ OAuth consent screen incomplete
- ✅ Configure consent screen in Google Cloud Console

### Resources:
- 📚 Full Guide: `GOOGLE_CALENDAR_SETUP_GUIDE.md`
- 🔧 Config Checker: `node check-google-calendar-config.js`
- 🌐 Google Console: https://console.cloud.google.com/
- 📖 OAuth Docs: https://developers.google.com/identity/protocols/oauth2

---

## 🎯 Next Steps

### Right Now:
1. ⏰ **5 min** - Read `GOOGLE_CALENDAR_SETUP_GUIDE.md`
2. ⏰ **10 min** - Create Google Cloud Project and get credentials
3. ⏰ **2 min** - Update `.env.local` with credentials
4. ⏰ **1 min** - Run config checker
5. ⏰ **3 min** - Test locally

### For Production:
1. ⏰ **5 min** - Add credentials to Vercel
2. ⏰ **2 min** - Redeploy
3. ⏰ **3 min** - Test on production

**Total Time: ~30 minutes** to full setup

---

## 🎉 Benefits Once Set Up

### For You (Admin):
- 📅 Never miss a booking
- 📱 Syncs to phone, tablet, computer automatically
- ⏰ Set reminders for upcoming shoots
- 🔍 See your schedule at a glance
- 🎯 No manual calendar entry needed

### For Clients:
- ⚡ Instant booking confirmation
- 📧 Automatic calendar invite emails
- 🔄 Updates if booking changes
- ❌ Cancellation reflected immediately

---

## 💡 Pro Tips

1. **Use the same Google account** for:
   - Google Cloud Console
   - Gmail integration (EMAIL_USER in .env)
   - Calendar connection

2. **Add authorized domains** in Google Console:
   - localhost:3000 (development)
   - Your Vercel domain (production)
   - Custom domain if you have one

3. **Keep credentials secure:**
   - Never commit `.env.local` to git
   - Use Vercel's encrypted environment variables
   - Rotate secrets if exposed

4. **Test in development first:**
   - Always test OAuth flow locally before production
   - Verify events create correctly
   - Check sync works both ways

---

**Status:** ⚠️ Ready for configuration  
**Action Required:** Follow setup guide to add credentials  
**Expected Result:** Full Google Calendar integration in ~30 minutes

---

## 📸 Visual Reference

### Before (Current):
```
┌─────────────────────────────────────┐
│ Calendar Integration                │
├─────────────────────────────────────┤
│ 📅 Status: Not Connected            │
│                                     │
│ [Connect Google Calendar] ───→ ❌  │
│     └─ 400 Bad Request              │
└─────────────────────────────────────┘
```

### After (Once Configured):
```
┌─────────────────────────────────────┐
│ Calendar Integration                │
├─────────────────────────────────────┤
│ ✅ Status: Connected                │
│ 📧 aminoss.photography@gmail.com    │
│ 🕐 Last sync: 2 minutes ago         │
│                                     │
│ [Sync] [Disconnect]                 │
│                                     │
│ ✨ Events auto-sync on approval     │
└─────────────────────────────────────┘
```

---

**Let me know once you've followed the setup guide and I can help test the integration! 🚀**
