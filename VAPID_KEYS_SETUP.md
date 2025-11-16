# 🔑 VAPID Keys Quick Setup

## Copy These to Vercel Environment Variables

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKDG-Hkp-xhD_XqeVHzERHHZOJy7oMg6DIOo0JCbnaKofDDZizX1rWfn1Rpu0QgjMKAZRInfAJyFu2hiIgXpRds
```

⚠️ **Also need VAPID_PRIVATE_KEY** - Check your secure notes or `QUICK_REFERENCE.md`

## Where to Add in Vercel

1. Go to: https://vercel.com/aminech990000-6355s-projects/innov8.tn/settings/environment-variables

2. Click "Add New"

3. Add **both** variables:
   - Name: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - Value: `BKDG-Hkp-xhD_XqeVHzERHHZOJy7oMg6DIOo0JCbnaKofDDZizX1rWfn1Rpu0QgjMKAZRInfAJyFu2hiIgXpRds`
   
   - Name: `VAPID_PRIVATE_KEY`
   - Value: (Your private key)

4. Save and redeploy

## Verify It Works

After adding keys and redeploying:

1. Go to your admin dashboard
2. Look for "Enable Notifications" card
3. Click the button
4. Browser should prompt for permission
5. After allowing, should say "Notifications Enabled" ✅

If you see error: "Push notifications are not configured" → Keys not set correctly

## Test Notification

After enabling, trigger a notification by:
- Having someone submit a booking
- Receiving a message
- Guest uploads photos

You should get a push notification with custom icon and sound!

