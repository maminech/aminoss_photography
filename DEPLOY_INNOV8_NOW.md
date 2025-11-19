# 🚀 INNOV8.TN DEPLOYMENT - QUICK START

**Date:** November 12, 2025  
**Domain:** https://innov8.tn  
**Status:** ✅ Ready to Deploy

---

## ⚡ FASTEST DEPLOYMENT (15-30 minutes) - RECOMMENDED

### Step 1: Add Custom Domain to Vercel (5 minutes)

Your application is already live on Vercel. Now connect your domain:

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Select Your Project:**
   - Find: `Innov8_photography` or `Innov8photography`

3. **Add Domain:**
   - Settings → Domains → Add Domain
   - Enter: `innov8.tn`
   - Click "Add"

4. **Note DNS Records:**
   Vercel will show you DNS records to add. Typically:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Step 2: Update DNS Records (5 minutes)

1. **Log into Domain Registrar:**
   - Where you bought innov8.tn (GoDaddy, Namecheap, etc.)

2. **Find DNS Management:**
   - Usually under "Domain Settings" or "DNS Management"

3. **Add/Update Records:**
   - Delete any existing A or CNAME records for @ and www
   - Add the records shown by Vercel (from Step 1)

4. **Save Changes**

### Step 3: Update Environment Variables in Vercel (5 minutes)

1. **In Vercel Dashboard:**
   - Project Settings → Environment Variables

2. **Update These Variables:**
   ```
   NEXT_PUBLIC_SITE_URL = https://innov8.tn
   NEXTAUTH_URL = https://innov8.tn
   INSTAGRAM_REDIRECT_URI = https://innov8.tn/admin/dashboard/photos
   ```

3. **Redeploy:**
   - Click "Redeploy" button
   - Or run: `npx vercel --prod`

### Step 4: Wait for SSL (5-10 minutes)

- Vercel automatically provisions SSL certificate
- Check status in Vercel dashboard
- Once SSL is ready, your site will be live at https://innov8.tn

### Step 5: Test Deployment (5 minutes)

Run these tests:

```powershell
# Test homepage
start https://innov8.tn

# Test admin login
start https://innov8.tn/admin

# Test gallery
start https://innov8.tn/portfolio

# Test booking
start https://innov8.tn/booking

# Test contact form
start https://innov8.tn/contact
```

**If all pages load correctly → DEPLOYMENT COMPLETE! 🎉**

---

## 🔒 POST-DEPLOYMENT SECURITY (10 minutes)

### 1. Change FTP Password
```
Current: aymen2025++
New: [Generate strong password]
```

### 2. Update Instagram Redirect URI
1. Go to Facebook Developers Console
2. Find your app: 1087830722704597
3. Update redirect URI to: `https://innov8.tn/admin/dashboard/photos`

### 3. Test SSL Certificate
```powershell
start https://www.ssllabs.com/ssltest/analyze.html?d=innov8.tn
```
Target: A or A+ rating

### 4. Verify Email Notifications
- Test contact form
- Test booking notifications
- Check spam folders if not received

---

## 📋 COMPLETE TESTING CHECKLIST

### Public Pages ✅
- [ ] Homepage loads
- [ ] Portfolio/Gallery works
- [ ] Services page displays
- [ ] About page loads
- [ ] Contact form sends email
- [ ] Booking form works
- [ ] Testimonials display
- [ ] Images load from Cloudinary
- [ ] Videos play correctly
- [ ] Mobile responsive

### Admin Pages ✅
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Photo management works
- [ ] Client management works
- [ ] Booking management works
- [ ] Photobook system works
- [ ] Invoice generation works (PDF)
- [ ] Settings update correctly
- [ ] Image upload to Cloudinary works
- [ ] Video upload works

### Client Pages ✅
- [ ] Client gallery access works
- [ ] Photo selection works
- [ ] Photobook creation works
- [ ] Download functionality works

---

## 🆘 TROUBLESHOOTING

### Issue: DNS not propagating
**Solution:** Wait 1-24 hours. Check status:
```powershell
nslookup innov8.tn
```

### Issue: SSL certificate pending
**Solution:** Wait 5-10 minutes. Vercel auto-provisions SSL.

### Issue: 404 errors on refresh
**Solution:** Already configured in `next.config.js` with `trailingSlash: true`

### Issue: Images not loading
**Solution:** 
1. Check Cloudinary credentials in Vercel environment variables
2. Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dm22wlmpx`

### Issue: Admin login fails
**Solution:**
1. Check `NEXTAUTH_URL=https://innov8.tn` in Vercel env vars
2. Check `NEXTAUTH_SECRET` is set
3. Clear browser cookies and try again

### Issue: Email not sending
**Solution:**
1. Verify Gmail SMTP settings in Vercel env vars
2. Check if "Less secure app access" is enabled (or use App Password)
3. Test with different email address

---

## 🎯 SUCCESS CRITERIA

✅ **Deployment is successful when:**
1. https://innov8.tn loads without errors
2. All public pages accessible
3. Admin login works
4. Client galleries accessible
5. Contact form sends emails
6. Booking system works
7. Images/videos load correctly
8. Mobile version works properly
9. SSL certificate is active (green lock icon)
10. No console errors in browser

---

## 📞 NEED HELP?

**Refer to these guides:**
- `DEPLOYMENT_GUIDE_COMPLETE.md` - Detailed 30+ page guide
- `DEPLOYMENT_QUICK_START.md` - Fast-track checklist
- `SECURITY_CHECKLIST.md` - 20-point security guide
- `deployment-credentials-INNOV8.txt` - Your credentials file

**Common Commands:**
```powershell
# Redeploy to Vercel
npx vercel --prod

# Check deployment logs
npx vercel logs

# Check build locally
npm run build

# Test locally
npm run dev
```

---

## ⏱️ TIMELINE ESTIMATE

| Task | Time | Status |
|------|------|--------|
| Add domain to Vercel | 5 min | ⏳ Pending |
| Update DNS records | 5 min | ⏳ Pending |
| Update env variables | 5 min | ⏳ Pending |
| Wait for SSL | 5-10 min | ⏳ Pending |
| Test deployment | 5 min | ⏳ Pending |
| Security hardening | 10 min | ⏳ Pending |
| **TOTAL** | **35-40 min** | ⏳ **Ready** |

---

## ✅ DEPLOYMENT COMPLETE!

Once all tests pass:

1. ✅ Update this file with completion date
2. ✅ Document any issues encountered
3. ✅ Save backup of old website
4. ✅ Schedule client training session
5. ✅ Set up monitoring (optional)

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Issues Encountered:** _______________  
**Status:** ⏳ Ready to Deploy

---

## 🎉 CONGRATULATIONS!

Your Innov8 Production Platform is now live at:
# 🌐 https://innov8.tn

**Features Now Live:**
- Professional photography portfolio
- Client gallery management
- Online booking system with calendar
- Photobook creation & approval
- Invoice generation
- Admin dashboard
- Mobile-responsive design
- Instagram integration
- Contact form with notifications
- Guest upload system
- Testimonials showcase
- Service catalog
- About page

**Next Steps:**
1. Monitor for 48 hours
2. Collect user feedback
3. Schedule regular backups
4. Plan content updates
5. Consider analytics setup (Google Analytics)

---

**🚀 Happy Deploying!**

