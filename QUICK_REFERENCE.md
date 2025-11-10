# 📱 QUICK REFERENCE - Push Notifications & Client App

## 🎯 TLDR (Too Long; Didn't Read)

**What's new:**
- Admin gets push notifications for bookings, messages, payments
- Clients get installable mobile app for viewing photos

**Status:** ✅ Deployed (needs VAPID keys in Vercel)

---

## ⚡ Quick Actions

### For You (Admin):

**Enable Notifications (30 seconds):**
1. Go to: https://your-domain.com/admin/dashboard
2. Click "Enable Notifications" (purple bell icon)
3. Click "Allow" when browser asks
4. Done! ✅

**What You'll Get Notified About:**
- 📅 New bookings
- 💬 New messages
- 💰 Payments received
- 📸 Guest uploads
- 📖 Photobook submissions

---

### For Your Clients:

**Share This Message:**

```
📸 Your photos are ready!

Install our app for easy access:

Android/Desktop:
→ Visit: https://aminoss.com/client/login
→ Login with your email
→ Tap "Install App" (orange button)

iPhone:
→ Visit: https://aminoss.com/client/login
→ Login
→ Tap Share (⬆️) → "Add to Home Screen"

Features: View galleries • Download photos • Create photobooks
```

---

## ⚠️ IMPORTANT: Complete Setup

**Add to Vercel (5 minutes):**

1. Go to: https://vercel.com/[your-project]/settings/environment-variables

2. Add these 3 variables:

   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY = BKDG-Hkp-xhD_XqeVHzERHHZOJy7oMg6DIOo0JCbnaKofDDZizX1rWfn1Rpu0QgjMKAZRInfAJyFu2hiIgXpRds
   
   VAPID_PRIVATE_KEY = x_W7E_yf167eRHxyAICgGo1zGKy6o8tBTjvejHePeZA
   
   ADMIN_EMAIL = aminoss.photography@gmail.com
   ```

3. Redeploy:
   ```powershell
   cd "e:\aminoss photography"
   vercel --prod
   ```

4. Update database:
   ```powershell
   npx prisma db push
   ```

**That's it!** Notifications will work.

---

## 🧪 Test It

**Test Admin Notifications:**
1. Visit admin dashboard
2. Open browser console (F12)
3. Run:
   ```javascript
   fetch('/api/notifications/send', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       title: '🎉 Test',
       body: 'It works!',
       url: '/admin/dashboard'
     })
   })
   ```
4. Should see notification pop up! 🎉

**Test Client App:**
1. Visit `/client/login` on phone
2. Login with any client credentials
3. See orange "Install App" banner
4. Tap to install
5. Check home screen for app icon

---

## 📊 What Each Feature Does

### Admin Notifications:
| When | You Get |
|------|---------|
| Someone books | "📅 New Booking: John Doe - Wedding on Jan 15" |
| New message | "💬 New Message: Jane - Can you do fashion shoot?" |
| Invoice paid | "💰 Invoice Paid: John Doe paid 500 TND" |
| Guest uploads | "📸 New Guest Photos: 5 photos uploaded" |

**Click notification** → Goes to relevant page

### Client App:
| Feature | What It Does |
|---------|--------------|
| View Galleries | See all their photo collections |
| Download | Save high-res photos to device |
| Photobooks | Create custom photo books |
| Guest Upload | Upload photos at weddings (QR code) |
| Offline | Works without internet |
| Install | Lives on home screen like native app |

---

## 🔧 Quick Troubleshooting

**Notifications not working?**
- ✅ Check VAPID keys in Vercel
- ✅ Redeploy after adding keys
- ✅ Try different browser (Chrome/Edge)
- ✅ Check permission: Notification.permission
- ❌ Won't work on iOS Safari (not supported by Apple)

**Client app not installing?**
- ✅ Make sure logged in first
- ✅ Hard refresh page (Ctrl+Shift+R)
- ✅ Try incognito mode
- ✅ Check if already installed

---

## 📁 Key Files

**Admin Notifications:**
- `src/components/NotificationManager.tsx` - UI
- `src/lib/notifications.ts` - Send functions
- `public/sw.js` - Service worker

**Client App:**
- `src/components/ClientPWAInstallPrompt.tsx` - Install UI
- `public/client-manifest.json` - App config
- `public/client-sw.js` - Service worker

---

## 🎉 Benefits

### For You:
- ⚡ Instant alerts (no need to check dashboard)
- 📱 Mobile access from anywhere
- 🔔 Never miss a booking
- ⏰ Real-time updates

### For Clients:
- 📸 Easy photo access
- 📱 App on their phone
- 📴 Works offline
- ⬇️ Quick downloads

---

## 📞 Need Help?

**Full Documentation:**
- `PUSH_NOTIFICATIONS_AND_CLIENT_APP_GUIDE.md` - Complete guide
- `DEPLOYMENT_PUSH_NOTIFICATIONS_COMPLETE.md` - Setup instructions
- `NEW_FEATURES_SUMMARY.md` - Feature overview

**Contact:**
- Email: aminoss.photography@gmail.com

---

## ✅ Quick Checklist

**Setup (Do once):**
- [ ] Add 3 VAPID keys to Vercel
- [ ] Redeploy to production
- [ ] Run `npx prisma db push`
- [ ] Enable notifications on dashboard
- [ ] Test with a booking

**Daily Use:**
- [ ] Receive notifications automatically
- [ ] Click to view details
- [ ] Share client app link with new clients

---

## 🚀 URLs

**Admin:**
- Dashboard: `/admin/dashboard`
- Enable notifications: Click purple bell card

**Client:**
- Login: `/client/login`
- Dashboard: `/client/dashboard`
- Install: Click orange banner

---

**Status:** ✅ DEPLOYED  
**Last Updated:** November 9, 2025  
**Version:** 1.0

🎉 **Enjoy your new push notifications and client app!**
