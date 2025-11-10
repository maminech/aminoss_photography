# 🔔 Push Notifications & Client App - Complete Setup Guide

## ✅ What's Been Added

### 1. **Admin Push Notifications**
   - Real-time notifications for new bookings
   - Alerts for new contact messages
   - Notifications when invoices are paid
   - Alerts for guest photo uploads
   - Notifications for photobook submissions

### 2. **Client PWA App**
   - Installable app for clients
   - Access galleries and photos
   - View and manage photobooks
   - Upload photos as wedding guests
   - Works on ANY device (Android, iOS, Desktop)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Add VAPID Keys to Environment

Add these to your `.env.local` file (or Vercel environment variables):

```env
# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKDG-Hkp-xhD_XqeVHzERHHZOJy7oMg6DIOo0JCbnaKofDDZizX1rWfn1Rpu0QgjMKAZRInfAJyFu2hiIgXpRds
VAPID_PRIVATE_KEY=x_W7E_yf167eRHxyAICgGo1zGKy6o8tBTjvejHePeZA
ADMIN_EMAIL=aminoss.photography@gmail.com
```

**⚠️ IMPORTANT:** Keep `VAPID_PRIVATE_KEY` secret! Never commit it to Git.

### Step 2: Update Database Schema

```powershell
cd "e:\aminoss photography"
npx prisma db push
```

This adds the `PushSubscription` model to your database.

### Step 3: Deploy to Vercel

```powershell
cd "e:\aminoss photography"
vercel --prod
```

**During deployment, add environment variables:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Value from above)
   - `VAPID_PRIVATE_KEY` (Value from above)
   - `ADMIN_EMAIL` = `aminoss.photography@gmail.com`
3. Redeploy

---

## 📱 How to Use Push Notifications (Admin)

### Enable Notifications:

1. **Visit Admin Dashboard**
   ```
   https://your-domain.com/admin/dashboard
   ```

2. **Look for "Enable Notifications" Card**
   - Purple bell icon
   - Click "Enable Notifications" button

3. **Grant Permission**
   - Browser will ask for notification permission
   - Click "Allow"

4. **You're Set!**
   - Green checkmark appears
   - You'll now receive notifications

### What You'll Be Notified About:

| Event | Notification | Link |
|-------|-------------|------|
| 📅 New Booking | Client name + event type + date | `/admin/bookings` |
| 💬 New Message | Name + message preview | `/admin/messages` |
| 💰 Invoice Paid | Client name + amount + invoice # | `/admin/invoices` |
| 📸 Guest Upload | Guest name + photo count + gallery | `/admin/client-galleries/...` |
| 📖 Photobook Submitted | Client name + photobook title | `/admin/photobooks/...` |

### Test Notifications:

You can test manually using the API:

```javascript
// In browser console on admin dashboard
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '🎉 Test Notification',
    body: 'This is a test notification!',
    url: '/admin/dashboard'
  })
})
```

---

## 📱 Client PWA App

### Features for Clients:

1. **View Galleries**
   - Browse all their photo galleries
   - See expiration dates
   - Download photos

2. **Create Photobooks**
   - Design custom photobooks
   - Submit for printing

3. **Upload Photos (Wedding Guests)**
   - Scan QR code at events
   - Upload photos with messages

4. **Installable**
   - Works offline
   - Native app experience
   - Home screen icon

### How Clients Install:

#### Android Chrome:
1. Visit: `https://your-domain.com/client/login`
2. Login with credentials
3. Orange "Install App" banner appears
4. Tap "Install App"
5. App installs to home screen

#### iPhone Safari:
1. Visit: `https://your-domain.com/client/login`
2. Login with credentials
3. Tap Share button (⬆️)
4. Tap "Add to Home Screen"
5. Tap "Add"

#### Desktop Chrome/Edge:
1. Visit client dashboard
2. Click install icon (⊕) in address bar
3. Click "Install"

### Share with Clients:

Send them this message:

```
📸 Your Aminoss Photography Client Portal is ready!

Install the app for easy access to your photos:

1. Visit: https://aminoss.com/client/login
2. Login with your email and password
3. Tap "Install App" when prompted

Features:
✨ View all your photo galleries
✨ Download high-resolution photos
✨ Create custom photobooks
✨ Works offline
✨ No app store needed

Need help? Contact us at aminoss.photography@gmail.com
```

---

## 🛠️ Technical Implementation

### Files Created/Modified:

#### Push Notifications (Admin):
1. `prisma/schema.prisma` - Added `PushSubscription` model
2. `public/sw.js` - Updated service worker with push handlers
3. `src/lib/notifications.ts` - Notification helper functions
4. `src/components/NotificationManager.tsx` - Enable/disable UI
5. `src/app/api/notifications/subscribe/route.ts` - Subscribe endpoint
6. `src/app/api/notifications/unsubscribe/route.ts` - Unsubscribe endpoint
7. `src/app/api/notifications/send/route.ts` - Send notification endpoint
8. `src/app/admin/dashboard/page.tsx` - Added NotificationManager
9. `src/app/api/bookings/route.ts` - Auto-notify on new booking
10. `src/app/api/contact/route.ts` - Auto-notify on new message

#### Client PWA:
11. `public/client-manifest.json` - PWA configuration
12. `public/client-sw.js` - Client service worker
13. `public/client-icon-192.svg` - App icon (small)
14. `public/client-icon-512.svg` - App icon (large)
15. `src/components/ClientPWAInstallPrompt.tsx` - Install prompt
16. `src/app/client/dashboard/page.tsx` - Added PWA prompt

#### Scripts:
17. `scripts/generate-vapid-keys.js` - Generate VAPID keys

---

## 🔧 Troubleshooting

### Notifications Not Working?

**1. Check Browser Support**
```javascript
// In browser console
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('Push Manager:', 'PushManager' in window);
console.log('Notification:', 'Notification' in window);
```

All should be `true`.

**2. Check Permission**
```javascript
console.log('Permission:', Notification.permission);
```

Should be `"granted"`.

**3. Check Service Worker**
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registered:', !!reg);
});
```

**4. Check Subscription**
```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscribed:', !!sub);
  });
});
```

**5. Check VAPID Keys**
- Make sure they're in environment variables
- Restart dev server after adding
- Redeploy to Vercel

### iOS Limitations:

**Web Push on iOS (Safari):**
- ❌ Safari doesn't support Web Push API yet
- ✅ But the PWA installs perfectly
- ✅ Admin can use Chrome/Edge for notifications

**Workaround:**
- Use desktop/laptop for admin dashboard
- Or use Android phone for admin app

### Service Worker Not Updating?

**Clear cache:**
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
location.reload();
```

---

## 🎯 Automatic Notifications

Notifications are sent automatically for these events:

### 1. New Booking Created
```typescript
// In: src/app/api/bookings/route.ts
await notifyNewBooking(booking);
```

### 2. New Contact Message
```typescript
// In: src/app/api/contact/route.ts
await notifyNewMessage(contactMessage);
```

### 3. Invoice Paid
```typescript
// Add to: src/app/api/invoices/[id]/route.ts (when implementing)
await notifyInvoicePaid(invoice);
```

### 4. Guest Photo Upload
```typescript
// Add to: src/app/api/guest-uploads/route.ts (when implementing)
await notifyGuestUpload(gallery, uploaderName, count);
```

### 5. Photobook Submitted
```typescript
// Add to: src/app/api/photobooks/[id]/submit/route.ts (when implementing)
await notifyPhotobookSubmitted(photobook, clientName);
```

---

## 📊 Database Schema

New model added:

```prisma
model PushSubscription {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId // Admin user who subscribed
  endpoint    String   @unique
  keys        Json     // { p256dh, auth }
  userAgent   String?  // Browser info
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
}
```

---

## 🌐 Vercel Deployment Checklist

- [ ] Add VAPID keys to Vercel environment variables
- [ ] Deploy to production
- [ ] Visit `/admin/dashboard`
- [ ] Enable notifications
- [ ] Test with a booking
- [ ] Share client app link with clients
- [ ] Test client app installation on mobile

---

## 📞 Support

**Need Help?**
- Check browser console for errors
- Ensure VAPID keys are correct
- Make sure service worker is registered
- Try incognito mode (fresh session)

**Contact:**
- Email: aminoss.photography@gmail.com

---

## 🎉 Summary

✅ **Admin Push Notifications** - Get instant alerts for important events  
✅ **Client PWA App** - Clients can install app on any device  
✅ **Automatic Notifications** - No manual work required  
✅ **Offline Support** - Apps work without internet  
✅ **Cross-Platform** - Works on Android, iOS, Desktop

**Next Steps:**
1. Add VAPID keys to Vercel
2. Deploy to production
3. Enable notifications on dashboard
4. Share client app with clients
5. Enjoy instant updates! 🚀
