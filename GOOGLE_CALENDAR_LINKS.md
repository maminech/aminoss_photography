# 🔗 Google Calendar Setup - Direct Links

**Quick access to all the pages you need** 👇

---

## 🎯 Google Cloud Console Links

### Main Setup Pages:
1. **Google Cloud Console (Home)**  
   https://console.cloud.google.com/

2. **Create New Project**  
   https://console.cloud.google.com/projectcreate

3. **API Library**  
   https://console.cloud.google.com/apis/library

4. **Google Calendar API**  
   https://console.cloud.google.com/apis/library/calendar-json.googleapis.com

5. **Credentials Page**  
   https://console.cloud.google.com/apis/credentials

6. **OAuth Consent Screen**  
   https://console.cloud.google.com/apis/credentials/consent

---

## 📱 Your Platform Links

### Development (Localhost):
- **Calendar Integration Page:**  
  http://localhost:3000/admin/dashboard/calendar-integration

- **Admin Dashboard:**  
  http://localhost:3000/admin/dashboard

- **OAuth Callback URL (for Google Console):**  
  ```
  http://localhost:3000/api/admin/google-calendar/callback
  ```

### Production (Vercel):
- **Calendar Integration Page:**  
  https://aminossphotography.vercel.app/admin/dashboard/calendar-integration

- **Vercel Project Settings:**  
  https://vercel.com/aminech990000-6355s-projects/aminoss.photography/settings

- **Vercel Environment Variables:**  
  https://vercel.com/aminech990000-6355s-projects/aminoss.photography/settings/environment-variables

- **OAuth Callback URL (for Google Console):**  
  ```
  https://aminossphotography.vercel.app/api/admin/google-calendar/callback
  ```

---

## 📚 Documentation Links

### Google Documentation:
- **OAuth 2.0 Setup Guide:**  
  https://developers.google.com/identity/protocols/oauth2

- **Calendar API Reference:**  
  https://developers.google.com/calendar/api/v3/reference

- **OAuth Consent Screen Guide:**  
  https://support.google.com/cloud/answer/10311615

- **Authorized Redirect URIs:**  
  https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation

### Your Guides:
- **Complete Setup Guide:** `GOOGLE_CALENDAR_SETUP_GUIDE.md`
- **Quick Visual Guide:** `GOOGLE_CALENDAR_QUICK_START.md`
- **Status & Summary:** `GOOGLE_CALENDAR_INTEGRATION_STATUS.md`

---

## 🔐 Your Google Account

**Important:** Use this account for everything:
- Email: `aminoss.photography@gmail.com`
- Use for: Google Cloud Console, OAuth, Calendar integration

**Security Settings:**
- https://myaccount.google.com/security
- https://myaccount.google.com/permissions (to manage app access)
- https://myaccount.google.com/apppasswords (if needed)

---

## ⚡ Quick Copy-Paste Values

### Scopes for OAuth (when setting up):
```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
```

### Authorized JavaScript Origins:
```
http://localhost:3000
https://aminossphotography.vercel.app
```

### Authorized Redirect URIs:
```
http://localhost:3000/api/admin/google-calendar/callback
https://aminossphotography.vercel.app/api/admin/google-calendar/callback
```

### Test User Email:
```
aminoss.photography@gmail.com
```

---

## 🧪 Testing Commands

### Check Configuration:
```bash
node check-google-calendar-config.js
```

### Start Development Server:
```bash
npm run dev
```

### Deploy to Production:
```bash
vercel --prod
```

---

## 📋 Environment Variables

### Local (.env.local):
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/admin/google-calendar/callback
```

### Production (Vercel):
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=https://aminossphotography.vercel.app/api/admin/google-calendar/callback
```

---

## 🎯 Step-by-Step Workflow

### Initial Setup:
1. [Create Project](https://console.cloud.google.com/projectcreate) → "Aminoss Photography Calendar"
2. [Enable API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) → Click "ENABLE"
3. [OAuth Consent](https://console.cloud.google.com/apis/credentials/consent) → Configure
4. [Create Credentials](https://console.cloud.google.com/apis/credentials) → OAuth client ID
5. Copy Client ID & Secret
6. Update `.env.local`
7. Run `node check-google-calendar-config.js`
8. Start `npm run dev`
9. Visit [Calendar Integration](http://localhost:3000/admin/dashboard/calendar-integration)
10. Click "Connect" and authorize

### Production Deployment:
1. [Vercel Env Vars](https://vercel.com/aminech990000-6355s-projects/aminoss.photography/settings/environment-variables)
2. Add: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
3. Run `vercel --prod`
4. Visit [Production Calendar](https://aminossphotography.vercel.app/admin/dashboard/calendar-integration)
5. Test connection

---

## 🆘 Troubleshooting Links

### If You See Error:

**"400 Bad Request"**  
→ Check: [Credentials Page](https://console.cloud.google.com/apis/credentials)  
→ Verify redirect URIs match exactly

**"redirect_uri_mismatch"**  
→ Fix: [Edit OAuth Client](https://console.cloud.google.com/apis/credentials)  
→ Add correct redirect URI

**"Access blocked"**  
→ Fix: [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)  
→ Add test users

**"API not enabled"**  
→ Fix: [Enable Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)  
→ Click "ENABLE"

**"Invalid credentials"**  
→ Fix: Double-check `.env.local`  
→ Run `node check-google-calendar-config.js`

---

## 📞 Support Resources

### Google Support:
- **Cloud Console Support:** https://support.google.com/cloud
- **OAuth Help:** https://support.google.com/cloud/answer/6158849
- **API Help:** https://support.google.com/googleapi

### Vercel Support:
- **Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Deployment Issues:** https://vercel.com/docs/deployments/troubleshoot

---

## 🎉 Success Indicators

You'll know it's working when you see:

### In Terminal:
```
✅ GOOGLE_CLIENT_ID: 123456789-abc...
✅ GOOGLE_CLIENT_SECRET: GOCSPX-xxx...
✅ GOOGLE_REDIRECT_URI: http://localhost...
🎉 Configuration looks good!
```

### In Browser:
```
Calendar Integration
✅ Status: Connected
📧 aminoss.photography@gmail.com
🕐 Last sync: Just now
```

### In Google Calendar:
```
📅 New event created automatically when you approve a booking
```

---

**Start Here:** https://console.cloud.google.com/projectcreate 🚀

**Questions?** Check `GOOGLE_CALENDAR_SETUP_GUIDE.md` for detailed help!
