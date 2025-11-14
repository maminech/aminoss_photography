# 🔔 Push Notifications Setup Verification Guide

## ✅ Current Status

### 1. Service Worker - ✓ CONFIGURED
- **Location**: `/public/sw.js`
- **Features**: Push notifications, offline support, caching
- **Registration**: Automatic via PWAInstallPrompt component

### 2. VAPID Keys - ⚠️ NEEDS VERIFICATION
```
Public Key: BKDG-Hkp-xhD_XqeVHzERHHZOJy7oMg6DIOo0JCbnaKofDDZizX1rWfn1Rpu0QgjMKAZRInfAJyFu2hiIgXpRds
```

### 3. Components - ✓ CONFIGURED
- `NotificationManager.tsx` - Enable/disable UI
- `PWAInstallPrompt.tsx` - Service worker registration
- APIs: `/api/notifications/subscribe` & `/api/notifications/unsubscribe`

---

## 🚀 Production Deployment Steps

### Step 1: Verify Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKDG-Hkp-xhD_XqeVHzERHHZOJy7oMg6DIOo0JCbnaKofDDZizX1rWfn1Rpu0QgjMKAZRInfAJyFu2hiIgXpRds

VAPID_PRIVATE_KEY=<Your private key>
```

⚠️ **IMPORTANT**: Both keys must be set in Vercel for notifications to work!

### Step 2: Verify Service Worker in Browser

1. Open your admin dashboard in production
2. Open DevTools (F12) → Application tab
3. Check "Service Workers" section
4. You should see: `sw.js` - Status: Activated

### Step 3: Test Notification Flow

1. Go to `/admin/dashboard`
2. Look for "Enable Notifications" card
3. Click "Enable Notifications"
4. Browser will prompt for permission - click "Allow"
5. Card should change to "Notifications Enabled" ✅

### Step 4: Verify Browser Permissions

**Chrome/Edge:**
- Click lock icon in address bar → Site settings
- Ensure "Notifications" is set to "Allow"

**Firefox:**
- Click lock icon → Permissions → Notifications → Allow

**Safari (iOS 16.4+):**
- Settings → Safari → Website Settings → Notifications → Allow

---

## 🔧 Troubleshooting

### Issue 1: "Push notifications are not configured"
**Cause**: VAPID public key missing or empty

**Fix**:
```bash
# Check if key is set locally
echo $env:NEXT_PUBLIC_VAPID_PUBLIC_KEY

# If empty, add to .env.local:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKDG-Hkp-xhD_XqeVHzERHHZOJy7oMg6DIOo0JCbnaKofDDZizX1rWfn1Rpu0QgjMKAZRInfAJyFu2hiIgXpRds

# Redeploy to Vercel
vercel --prod
```

### Issue 2: Service Worker Not Registering
**Cause**: HTTPS required (or localhost)

**Fix**: Ensure you're on:
- Production: `https://aminossphotography.vercel.app`
- Local: `http://localhost:3000`

### Issue 3: "Failed to save subscription"
**Cause**: Database schema mismatch or API error

**Fix**: Check browser console for specific error. Subscription should be saved to `PushSubscription` model in database.

### Issue 4: Notifications Not Appearing
**Cause**: Browser permissions denied or notification blocked

**Fix**:
1. Reset site permissions in browser
2. Clear cache
3. Try re-enabling notifications
4. Check if "Do Not Disturb" is off

---

## 📱 Testing Push Notifications

### Option 1: Manual Test via API
```bash
# Send test notification
curl -X POST https://aminossphotography.vercel.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test from admin dashboard",
    "type": "general"
  }'
```

### Option 2: Trigger via Admin Actions
Notifications are automatically sent when:
- ✅ New booking submitted
- ✅ New message received  
- ✅ Payment received
- ✅ Guest uploads photos

---

## 🎯 Current Implementation

### Automatic Triggers
1. **New Booking**: `src/app/api/bookings/route.ts`
2. **New Message**: `src/app/api/messages/route.ts`
3. **Payment Received**: `src/app/api/payments/route.ts`
4. **Guest Upload**: `src/app/api/guest-upload/route.ts`

### Notification Manager Location
- Dashboard: `/admin/dashboard` (top section)
- Always visible for quick enable/disable

---

## ✨ Features

### Professional Notification Display
- Custom icons per type (📅 bookings, 💬 messages, 💰 payments)
- Vibration pattern: 200ms-100ms-200ms-100ms-200ms
- Actions: "View" and "Dismiss"
- Click to open relevant admin page

### Offline Support
- Notifications queued if offline
- Delivered when connection restored
- Cache API responses for offline viewing

---

## 🔐 Security

- VAPID keys for authenticated push
- User-specific subscriptions
- Endpoint validation
- HTTPS required in production

---

## 📊 Monitoring

### Check Active Subscriptions
Query database for `PushSubscription` records:
```prisma
model PushSubscription {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @default("admin")
  endpoint  String   @unique
  keys      Json
  createdAt DateTime @default(now())
}
```

### View in Database
All subscriptions stored with:
- Endpoint URL (unique per browser/device)
- Encryption keys (p256dh, auth)
- User ID
- Creation timestamp

---

## 🎉 Success Checklist

- [ ] VAPID keys added to Vercel environment variables
- [ ] Service worker registered (check DevTools)
- [ ] Notification Manager shows on dashboard
- [ ] "Enable Notifications" button clickable
- [ ] Browser prompts for permission
- [ ] Subscription saved to database
- [ ] Test notification received
- [ ] Click opens correct admin page

---

## 📝 Next Steps After Verification

1. **Deploy to production**: `vercel --prod`
2. **Test on multiple browsers**: Chrome, Firefox, Safari
3. **Test on mobile**: Android Chrome, iOS Safari 16.4+
4. **Verify real triggers**: Submit test booking, send test message
5. **Monitor subscription growth** in database

---

**Last Updated**: Ready for production verification
**Support**: Check browser console for detailed error messages
