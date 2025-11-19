# 🎯 Google Calendar - Quick Visual Setup (5 Minutes)

## ⚡ Super Quick Setup

### Step 1️⃣: Go to Google Cloud Console
**Link:** https://console.cloud.google.com/

```
┌──────────────────────────────────────┐
│  Google Cloud Console                │
├──────────────────────────────────────┤
│  [Select a project ▼]                │
│                                      │
│  Click here → [NEW PROJECT]          │
└──────────────────────────────────────┘
```

**Fill in:**
- Project name: `Aminoss Photography Calendar`
- Click [CREATE]

---

### Step 2️⃣: Enable Calendar API
**Link:** https://console.cloud.google.com/apis/library

```
┌──────────────────────────────────────┐
│  API Library                         │
├──────────────────────────────────────┤
│  [Search: Google Calendar API]       │
│                                      │
│  ┌────────────────────────┐          │
│  │ 📅 Google Calendar API │          │
│  │ [ENABLE]               │ ← Click  │
│  └────────────────────────┘          │
└──────────────────────────────────────┘
```

---

### Step 3️⃣: Create OAuth Credentials

#### 3A. Configure Consent Screen (First Time Only)
**Link:** https://console.cloud.google.com/apis/credentials/consent

```
┌──────────────────────────────────────┐
│  OAuth Consent Screen                │
├──────────────────────────────────────┤
│  User Type:                          │
│  ○ Internal                          │
│  ● External  ← Select                │
│                                      │
│  [CREATE]                            │
└──────────────────────────────────────┘

Then fill in:
┌──────────────────────────────────────┐
│  App Information                     │
├──────────────────────────────────────┤
│  App name:                           │
│  Aminoss Photography Platform        │
│                                      │
│  User support email:                 │
│  aminoss.photography@gmail.com       │
│                                      │
│  Developer email:                    │
│  aminoss.photography@gmail.com       │
│                                      │
│  [SAVE AND CONTINUE]                 │
└──────────────────────────────────────┘

Scopes page:
┌──────────────────────────────────────┐
│  [ADD OR REMOVE SCOPES]              │
│                                      │
│  Search and add:                     │
│  ✓ .../auth/calendar                 │
│  ✓ .../auth/calendar.events          │
│                                      │
│  [UPDATE] → [SAVE AND CONTINUE]      │
└──────────────────────────────────────┘

Test users page:
┌──────────────────────────────────────┐
│  [ADD USERS]                         │
│  aminoss.photography@gmail.com       │
│  [ADD] → [SAVE AND CONTINUE]         │
└──────────────────────────────────────┘
```

#### 3B. Create Credentials
**Link:** https://console.cloud.google.com/apis/credentials

```
┌──────────────────────────────────────┐
│  Credentials                         │
├──────────────────────────────────────┤
│  [+ CREATE CREDENTIALS ▼]            │
│    │                                 │
│    ├─ API key                        │
│    ├─ OAuth client ID    ← Click     │
│    └─ Service account                │
└──────────────────────────────────────┘

Then:
┌──────────────────────────────────────┐
│  Create OAuth client ID              │
├──────────────────────────────────────┤
│  Application type:                   │
│  [Web application ▼]                 │
│                                      │
│  Name:                               │
│  Aminoss Photography Web Client      │
│                                      │
│  Authorized JavaScript origins:      │
│  + http://localhost:3000             │
│  + https://aminossphotography.vercel.app
│                                      │
│  Authorized redirect URIs:           │
│  + http://localhost:3000/api/admin/google-calendar/callback
│  + https://aminossphotography.vercel.app/api/admin/google-calendar/callback
│                                      │
│  [CREATE]                            │
└──────────────────────────────────────┘
```

**IMPORTANT:** You'll get a popup:

```
┌──────────────────────────────────────┐
│  OAuth client created                │
├──────────────────────────────────────┤
│  Your Client ID:                     │
│  123456789-abc.apps.googleusercontent.com
│  [Copy] ← Copy this!                 │
│                                      │
│  Your Client Secret:                 │
│  GOCSPX-xxxxxxxxxxxxxxxx             │
│  [Copy] ← Copy this!                 │
│                                      │
│  [DOWNLOAD JSON] (for backup)        │
│  [OK]                                │
└──────────────────────────────────────┘
```

---

### Step 4️⃣: Update .env.local

Open `.env.local` and replace:

```bash
# Before:
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# After:
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com  # Paste your Client ID
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx               # Paste your Client Secret
```

**Don't change:** `GOOGLE_REDIRECT_URI` (already correct)

---

### Step 5️⃣: Test It!

```bash
# 1. Verify config
node check-google-calendar-config.js

# Should show:
✅ GOOGLE_CLIENT_ID: 123456789-abc.apps...
✅ GOOGLE_CLIENT_SECRET: GOCSPX-xxx...
✅ GOOGLE_REDIRECT_URI: http://localhost...
🎉 Configuration looks good!

# 2. Start dev server
npm run dev

# 3. Visit in browser:
http://localhost:3000/admin/dashboard/calendar-integration

# 4. Click [Connecter Google Calendar]

# 5. You'll see Google's authorization page:
```

```
┌──────────────────────────────────────┐
│  Google                              │
├──────────────────────────────────────┤
│  Aminoss Photography Platform wants  │
│  to access your Google Account       │
│                                      │
│  This will allow the app to:         │
│  ✓ See and edit your calendar        │
│                                      │
│  [Cancel] [Allow] ← Click Allow      │
└──────────────────────────────────────┘
```

**Success!** You'll be redirected back and see:
```
✅ Google Calendar connecté avec succès!
Connected: aminoss.photography@gmail.com
```

---

## 🌐 For Production (Vercel)

After local works, add to Vercel:

**Link:** https://vercel.com/aminech990000-6355s-projects/aminoss.photography/settings/environment-variables

```
┌──────────────────────────────────────┐
│  Environment Variables               │
├──────────────────────────────────────┤
│  [+ Add New]                         │
│                                      │
│  1. Name: GOOGLE_CLIENT_ID           │
│     Value: [paste your client ID]    │
│     Environment: [✓] Production      │
│     [Save]                           │
│                                      │
│  2. Name: GOOGLE_CLIENT_SECRET       │
│     Value: [paste your secret]       │
│     Environment: [✓] Production      │
│     [Save]                           │
│                                      │
│  3. Name: GOOGLE_REDIRECT_URI        │
│     Value: https://aminossphotography.vercel.app/api/admin/google-calendar/callback
│     Environment: [✓] Production      │
│     [Save]                           │
└──────────────────────────────────────┘
```

Then deploy:
```bash
vercel --prod
```

---

## ✅ Checklist

Copy this and check off as you go:

```
Setup Checklist:
[ ] Created Google Cloud Project
[ ] Enabled Google Calendar API
[ ] Configured OAuth consent screen
[ ] Created OAuth client ID
[ ] Copied Client ID
[ ] Copied Client Secret
[ ] Updated .env.local
[ ] Ran check-google-calendar-config.js (all green)
[ ] Started npm run dev
[ ] Visited calendar integration page
[ ] Clicked "Connect"
[ ] Authorized on Google
[ ] Saw "Connected" status
[ ] For production: Added to Vercel env vars
[ ] For production: Redeployed
[ ] For production: Tested on live site
```

---

## 🚨 Common Mistakes to Avoid

❌ **Using wrong redirect URI**
✅ Must exactly match: `http://localhost:3000/api/admin/google-calendar/callback`

❌ **Forgetting to enable API**
✅ Enable "Google Calendar API" in API Library

❌ **Not adding test users**
✅ Add your email in OAuth consent screen → Test users

❌ **Copy/paste errors**
✅ Don't add spaces or extra characters when pasting

❌ **Using Instagram app credentials**
✅ Create NEW OAuth client specifically for Calendar

---

## 🎯 Time Estimates

- Read this guide: **2 minutes**
- Google Cloud setup: **10 minutes**
- Update .env.local: **1 minute**
- Test locally: **2 minutes**
- Add to Vercel: **3 minutes**
- Deploy & test production: **5 minutes**

**Total: ~25 minutes**

---

## 📞 Help

If stuck:
1. Check `GOOGLE_CALENDAR_SETUP_GUIDE.md` for detailed troubleshooting
2. Run `node check-google-calendar-config.js` to verify config
3. Check browser console for errors

---

**Ready to start? Open your first link: https://console.cloud.google.com/** 🚀
