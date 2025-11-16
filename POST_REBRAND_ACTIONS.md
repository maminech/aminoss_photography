# 🚀 INNOV8 PRODUCTION - POST-REBRAND ACTION CHECKLIST

## ⚡ CRITICAL ACTIONS REQUIRED BEFORE DEPLOYMENT

### 1. Cloudinary Configuration ⚠️ REQUIRED
**Status:** ❌ NOT DONE

Go to Cloudinary dashboard and create new upload preset:
- **Preset Name:** `innov8_portfolio`
- **Mode:** Unsigned
- **Folder:** `innov8_production`
- **Keep old preset** `aminoss_portfolio` active until new preset is confirmed working

**Steps:**
1. Login to cloudinary.com
2. Settings → Upload
3. Add upload preset
4. Name: `innov8_portfolio`
5. Signing Mode: Unsigned
6. Folder: `innov8_production`
7. Save

---

### 2. Email Configuration 📧
**Status:** ❌ NOT DONE

Setup the new email: **contact@innov8.tn**

**Update in:**
- [ ] Domain provider (email forwarding or mailbox)
- [ ] Vercel environment variables
- [ ] Test contact form sends to new address

---

### 3. Instagram Verification 📱
**Status:** ⚠️ VERIFY

Confirm Instagram handle exists:
- **Expected:** @innov8.tn
- **Current links point to:** @innov8.tn

**Actions:**
- [ ] Verify @innov8.tn exists and is accessible
- [ ] Update Instagram bio if needed
- [ ] Test all Instagram links from website

---

### 4. Build & Deploy 🔨
**Status:** ❌ PENDING

```powershell
# Clean build
npm run build

# Test locally
npm run dev
# Visit http://localhost:3000
# Check: Logo, Footer, Instagram links

# Deploy to Vercel
git add .
git commit -m "Complete rebrand: Aminoss → Innov8"
git push origin main
```

---

### 5. Vercel Environment Variables 🔧
**Status:** ❌ UPDATE REQUIRED

Update in Vercel dashboard:
```bash
EMAIL_USER="contact@innov8.tn"
NEXTAUTH_URL="https://innov8.tn"  # Or your actual domain
```

---

### 6. Domain Configuration 🌐
**Status:** ❌ PENDING

If using custom domain `innov8.tn`:
- [ ] Add domain to Vercel project
- [ ] Update DNS A/CNAME records
- [ ] Wait for SSL certificate
- [ ] Update NEXTAUTH_URL

---

## ✅ OPTIONAL ACTIONS (Can be done later)

### 7. Rebuild Mobile Apps 📱
**Flutter App:**
```bash
cd flutter-app
flutter clean
flutter pub get
flutter build apk --release
```

**React Native Admin:**
```bash
cd mobile-admin-app
npm install
npm run android  # or ios
```

---

### 8. Rename Folder 📁
**Current:** `e:\aminoss photography`
**Suggested:** `e:\innov8 production`

```powershell
# Close VS Code first
cd e:\
Rename-Item "aminoss photography" "innov8 production"
# Reopen folder in VS Code
```

⚠️ **Note:** If you rename the folder, update any absolute paths in:
- build-mobile-app.ps1
- deploy-to-production.ps1
- flutter-app/build-and-deploy.ps1
- prepare-for-ftp.ps1

---

### 9. Update MongoDB (Optional)
Current database names contain "aminoss":
- Cluster: aminoss
- Database: aminoss-portfolio

**Not critical** - these are backend only and don't affect users.

If you want to rename:
1. Create new database `innov8-portfolio`
2. Migrate data
3. Update DATABASE_URL

---

### 10. GitHub Actions (Optional)
Update workflow name:
```yaml
name: Innov8 Production App v1.0.${{ github.run_number }}
```

File: `.github/workflows/build-flutter-apk.yml`

---

## 🧪 TESTING CHECKLIST

After deployment, test these pages:

### Public Website
- [ ] Homepage (Instagram links)
- [ ] Footer (social media, email)
- [ ] Contact page (email)
- [ ] About page
- [ ] Logo displays correctly

### Client Portal
- [ ] Login page
- [ ] Dashboard
- [ ] Gallery viewer
- [ ] Photobook creator

### Admin Dashboard
- [ ] Logo in navigation
- [ ] Upload functionality (Cloudinary preset)
- [ ] Email notifications

### Mobile Apps
- [ ] Flutter app splash screen
- [ ] App name in device
- [ ] Notifications channel name

---

## 🎯 PRIORITY ORDER

**Must Do Before Going Live:**
1. ✅ Cloudinary preset `innov8_portfolio`
2. ✅ Email `contact@innov8.tn` 
3. ✅ Verify Instagram handle
4. ✅ Build and test locally
5. ✅ Deploy to Vercel
6. ✅ Test all critical paths

**Can Do Later:**
7. Rebuild mobile apps
8. Rename local folder
9. Rename MongoDB database
10. Update GitHub Actions

---

## 📊 ROLLBACK PLAN

If something breaks:

1. **Cloudinary Issues:**
   - Keep old preset `aminoss_portfolio` active
   - Temporarily revert preset name in code
   
2. **Email Issues:**
   - Old email still works in .env
   - Can forward to new email

3. **Full Rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 🆘 TROUBLESHOOTING

**"Upload preset not found"**
→ Create `innov8_portfolio` in Cloudinary

**"Email not sending"**
→ Check EMAIL_USER in Vercel env vars

**"Instagram link broken"**
→ Verify @innov8.tn exists and is public

**"Logo not showing"**
→ Clear browser cache (logo.svg changed)

**"Service worker errors"**
→ Clear cache, unregister old service worker

---

## ✅ COMPLETION CHECKLIST

- [ ] Cloudinary preset created
- [ ] Email configured and tested
- [ ] Instagram handle verified
- [ ] Build completed successfully
- [ ] Deployed to production
- [ ] All links tested
- [ ] Logo displays correctly
- [ ] Contact form works
- [ ] Mobile testing complete

---

**When all critical items are checked:** ✨ YOU'RE LIVE WITH INNOV8! ✨

---

**Need Help?**
- Check REBRAND_COMPLETE.md for detailed changes
- Review build logs for any errors
- Test in incognito/private mode to avoid cache issues
