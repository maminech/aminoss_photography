# Deployment Guide - Aminoss Photography

## 🚀 Quick Deploy to Vercel

### Step 1: Prepare Your Project

1. Make sure all files are saved
2. Create a GitHub repository (if not already done)
3. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Aminoss Photography Portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aminoss-photography.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Import your repository
5. Vercel will auto-detect Next.js settings
6. Add environment variables (see below)
7. Click **"Deploy"**

### Step 3: Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=aminoss.photography@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Step 4: Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `aminoss-photography.com`)
3. Update DNS records:
   - **A Record**: Point to Vercel's IP
   - **CNAME**: Point `www` to `cname.vercel-dns.com`

---

## 🌐 Alternative: Deploy to Netlify

### 1. Build Settings

- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Framework**: Next.js

### 2. Environment Variables

Add the same environment variables as Vercel.

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Cloudinary account set up with images
- [ ] Gmail App Password created
- [ ] Test contact form locally
- [ ] Check all pages work
- [ ] Mobile responsiveness tested
- [ ] Images loading correctly
- [ ] SEO metadata updated

---

## 🔒 Security

### Environment Variables
- Never commit `.env.local` to Git
- Use Vercel's environment variables UI
- Rotate API keys regularly

### Gmail Security
- Use App Passwords (not your main password)
- Enable 2FA on your Google account
- Monitor for suspicious activity

---

## 📊 Post-Deployment

### 1. Test Your Site

- [ ] Homepage loads
- [ ] Gallery filtering works
- [ ] Lightbox opens
- [ ] Videos play
- [ ] Contact form sends emails
- [ ] Mobile view works
- [ ] All links work

### 2. SEO Setup

**Google Search Console**
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your property
3. Verify ownership
4. Submit sitemap

**Google Analytics**
1. Create GA4 property
2. Get tracking ID
3. Add to `.env.local`: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

### 3. Social Media

Update these files with your real social links:
- `src/components/Footer.tsx`
- `src/components/Navbar.tsx`
- `src/app/contact/page.tsx`

---

## 🔄 Updates & Maintenance

### Updating Content

**Option 1: Cloudinary** (Recommended)
- Upload new images to Cloudinary
- They'll automatically appear on your site

**Option 2: Code Changes**
1. Make changes locally
2. Push to GitHub
3. Vercel auto-deploys

### Updating Code

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push

# Vercel will auto-deploy
```

---

## 🐛 Troubleshooting

### Build Fails

**Error**: Missing environment variables
- **Fix**: Add all required env vars in Vercel dashboard

**Error**: Module not found
- **Fix**: Run `npm install` and push `package-lock.json`

### Contact Form Not Working

**Error**: Email not sending
- **Fix**: Check Gmail App Password is correct
- **Fix**: Enable "Less secure app access" (not recommended)
- **Fix**: Use App Passwords with 2FA instead

### Images Not Loading

**Error**: 404 on images
- **Fix**: Check Cloudinary credentials
- **Fix**: Make sure folder structure is correct
- **Fix**: Images must be in `aminoss_photography/` folder

### Slow Loading

- Enable Cloudinary auto-format and auto-quality
- Check image sizes (should be <500KB)
- Use WebP format
- Enable Next.js Image optimization

---

## 📞 Support

If you encounter issues:

1. Check the [Next.js docs](https://nextjs.org/docs)
2. Check [Vercel docs](https://vercel.com/docs)
3. Check [Cloudinary docs](https://cloudinary.com/documentation)
4. Open an issue in the repository

---

## 🎉 Success!

Your portfolio is now live! Share it:
- Instagram
- Facebook
- LinkedIn
- Business cards
- Email signature

**Don't forget to**:
- [ ] Update your portfolio regularly
- [ ] Respond to contact form submissions
- [ ] Monitor analytics
- [ ] Share your work on social media
- [ ] Ask for client testimonials

---

**Good luck with your photography business! 📸**
