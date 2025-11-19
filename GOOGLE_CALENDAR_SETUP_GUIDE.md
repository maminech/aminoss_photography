# Google Calendar Integration Setup Guide

## 🎯 Overview
This guide will help you set up Google Calendar integration for automatic event synchronization when bookings are approved.

## 📋 Prerequisites
- Google Cloud Platform account (free)
- Admin access to the photography platform

---

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account (use aminoss.photography@gmail.com)

2. **Create a New Project**
   - Click "Select a project" at the top
   - Click "NEW PROJECT"
   - Project name: `Aminoss Photography Calendar`
   - Click "CREATE"

### Step 2: Enable Google Calendar API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"
   - Or visit: https://console.cloud.google.com/apis/library

2. **Enable Calendar API**
   - Search for "Google Calendar API"
   - Click on it
   - Click "ENABLE"
   - Wait for it to be enabled (takes a few seconds)

### Step 3: Create OAuth 2.0 Credentials

1. **Go to Credentials Page**
   - Click "APIs & Services" → "Credentials"
   - Or visit: https://console.cloud.google.com/apis/credentials

2. **Configure OAuth Consent Screen** (First Time Only)
   - Click "CONFIGURE CONSENT SCREEN"
   - Choose "External" (unless you have Google Workspace)
   - Click "CREATE"
   
   **Fill in the required fields:**
   - App name: `Aminoss Photography Platform`
   - User support email: `aminoss.photography@gmail.com`
   - Developer contact email: `aminoss.photography@gmail.com`
   - Click "SAVE AND CONTINUE"
   
   **Scopes:**
   - Click "ADD OR REMOVE SCOPES"
   - Search and add:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Click "UPDATE" then "SAVE AND CONTINUE"
   
   **Test users:** (during development)
   - Click "ADD USERS"
   - Add: `aminoss.photography@gmail.com`
   - Click "SAVE AND CONTINUE"
   
   - Click "BACK TO DASHBOARD"

3. **Create OAuth Client ID**
   - Click "CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `Aminoss Photography Web Client`
   
   **Authorized JavaScript origins:**
   - Development: `http://localhost:3000`
   - Production: ``
   - Also add: `https://innov8.tn`https://aminossphotography.vercel.app (if using custom domain)
   
   **Authorized redirect URIs:**
   - Development: `http://localhost:3000/api/admin/google-calendar/callback`
   - Production: `https://aminossphotography.vercel.app/api/admin/google-calendar/callback`
   - Also add: `https://innov8.tn/api/admin/google-calendar/callback`
   
   - Click "CREATE"

4. **Copy Your Credentials**
   - You'll see a popup with:
     - **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
     - **Client Secret** (looks like: `GOCSPX-abc123xyz`)
   - **⚠️ IMPORTANT:** Copy both immediately!
   - Click "DOWNLOAD JSON" for backup

### Step 4: Add Environment Variables

#### For Local Development (`.env.local`):

```bash
# Google Calendar OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/admin/google-calendar/callback
```

#### For Production (Vercel):

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/aminech990000-6355s-projects/aminoss.photography/settings/environment-variables

2. **Add the following environment variables:**

| Key | Value | Environment |
|-----|-------|-------------|
| `GOOGLE_CLIENT_ID` | Your Client ID | Production |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret | Production |
| `GOOGLE_REDIRECT_URI` | `https://aminossphotography.vercel.app/api/admin/google-calendar/callback` | Production |

3. **Redeploy** your application after adding variables

### Step 5: Test the Integration

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   - Visit: http://localhost:3000/admin/dashboard/calendar-integration
   - Click "Connecter Google Calendar"
   - Authorize the app
   - Should redirect back with "Connected" status

2. **Production Testing:**
   - Visit: https://aminossphotography.vercel.app/admin/dashboard/calendar-integration
   - Click "Connecter Google Calendar"
   - Authorize the app
   - Verify connection successful

---

## 🔧 Troubleshooting

### Error: "400 Bad Request" from Google

**Cause:** Redirect URI mismatch

**Solution:**
1. Check that redirect URI in Google Cloud Console **exactly matches** your environment variable
2. No trailing slashes
3. Use `https://` for production (not `http://`)
4. Clear browser cache and try again

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI you're using isn't in the authorized list

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Click your OAuth client ID
3. Add the exact redirect URI you're using:
   - Development: `http://localhost:3000/api/admin/google-calendar/callback`
   - Production: `https://aminossphotography.vercel.app/api/admin/google-calendar/callback`
4. Save and try again (may take a few minutes to propagate)

### Error: "Google Calendar not configured"

**Cause:** Environment variables not set

**Solution:**
1. Check `.env.local` has all three variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
2. Restart your development server
3. For Vercel, check environment variables in dashboard and redeploy

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured or incomplete

**Solution:**
1. Go to Google Cloud Console → "OAuth consent screen"
2. Make sure app is in "Testing" mode (or "Production" if published)
3. Add test users (your email)
4. Complete all required fields
5. Try again

### Error: "Token exchange failed"

**Cause:** Invalid client secret or expired code

**Solution:**
1. Verify `GOOGLE_CLIENT_SECRET` is correct
2. Make sure you're not reusing an old authorization code
3. Check that API is enabled in Google Cloud Console
4. Try the OAuth flow again from the beginning

---

## 📊 How It Works

1. **Admin clicks "Connect"** → Redirects to Google OAuth
2. **User authorizes** → Google redirects back with authorization code
3. **Backend exchanges code** → Gets access token & refresh token
4. **Tokens stored** → In database (encrypted)
5. **Sync on approval** → When booking approved, creates Google Calendar event
6. **Auto-refresh** → Tokens automatically refreshed when expired

---

## 🔐 Security Notes

- ✅ OAuth 2.0 secure authentication
- ✅ No passwords stored
- ✅ Tokens encrypted in database
- ✅ Scoped access (only calendar)
- ✅ User can revoke access anytime
- ✅ Refresh tokens prevent re-authentication

---

## 📱 Features Once Connected

- ✅ **Auto-create events** when booking approved
- ✅ **Sync event details** (client name, type, date, time)
- ✅ **Update events** when booking modified
- ✅ **Delete events** when booking cancelled
- ✅ **Conflict detection** to prevent double-booking
- ✅ **Email notifications** for new calendar events

---

## 🎨 User Experience Flow

### Admin Side:
1. Go to "Calendar Integration" in admin dashboard
2. Click "Connecter Google Calendar"
3. Authorize with Google (one-time)
4. See "Connected" status with email
5. Bookings now auto-sync to calendar

### Booking Approval Flow:
1. Client submits booking request
2. Admin reviews in dashboard
3. Admin clicks "Approve"
4. ✨ **Event automatically created in Google Calendar**
5. Admin receives email confirmation
6. Event visible in Google Calendar app

---

## 🔄 Maintenance

### Reconnecting Calendar
If connection lost:
1. Go to Calendar Integration page
2. Click "Disconnect" (if showing connected)
3. Click "Connect" again
4. Re-authorize

### Revoking Access
To disconnect completely:
1. Platform: Click "Disconnect" button
2. Google: Visit https://myaccount.google.com/permissions
3. Find "Aminoss Photography Platform"
4. Click "Remove Access"

---

## 📞 Support

If you encounter any issues:
1. Check this guide's troubleshooting section
2. Verify all environment variables are set
3. Check Vercel deployment logs for errors
4. Test in development environment first

---

## 🎯 Quick Reference

**Google Cloud Console:** https://console.cloud.google.com/  
**OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent  
**Credentials:** https://console.cloud.google.com/apis/credentials  
**Calendar API:** https://console.cloud.google.com/apis/library/calendar-json.googleapis.com  

**Vercel Dashboard:** https://vercel.com/aminech990000-6355s-projects/aminoss.photography/settings/environment-variables

**Integration Page (Production):** https://aminossphotography.vercel.app/admin/dashboard/calendar-integration

---

## ✅ Checklist

Before going live, make sure:

- [ ] Google Cloud Project created
- [ ] Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] Redirect URIs added (dev + production)
- [ ] Environment variables set locally
- [ ] Environment variables set in Vercel
- [ ] Local testing successful
- [ ] Production deployment successful
- [ ] Production testing successful
- [ ] Calendar events syncing correctly

---

**Last Updated:** November 2025  
**Status:** Ready for setup
