# 🚀 DEPLOYMENT INSTRUCTIONS

## Step 1: Prepare Environment Variables

You'll need to add these environment variables to Vercel:

### Required Variables:
```
DATABASE_URL=mongodb+srv://Innov8:Innov82001@innov8.lyu8e0q.mongodb.net/Innov8-portfolio
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
CLOUDINARY_CLOUD_NAME=dm22wlmpx
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_USER=innov8.tn@gmail.com
EMAIL_PASS=rkspmzpugjmijvad
```

## Step 2: Deploy to Vercel

Run this command:
```bash
vercel
```

Follow the prompts:
1. Set up and deploy? **Yes**
2. Which scope? Select your account
3. Link to existing project? **No**
4. Project name? **Innov8-photography** (or your preferred name)
5. Directory? **./** (press Enter)
6. Override settings? **No**

## Step 3: Add Environment Variables

After deployment, you need to add environment variables:

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from above

**Option B: Via CLI**
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

## Step 4: Update NEXTAUTH_URL

After your first deployment, update NEXTAUTH_URL:
1. Note your deployment URL (e.g., https://Innov8-photography.vercel.app)
2. Go to Settings → Environment Variables
3. Update NEXTAUTH_URL to your actual domain
4. Redeploy: `vercel --prod`

## Step 5: Whitelist Vercel IP in MongoDB

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Network Access → Add IP Address
3. Add: **0.0.0.0/0** (allow from anywhere) for Vercel serverless functions
4. Or use Vercel's static IPs if you have Pro plan

## Step 6: Production Deployment

Once everything is tested:
```bash
vercel --prod
```

This will deploy to your production domain!

## Step 7: Add Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., innov8.tn)
3. Update DNS records as instructed by Vercel
4. Update NEXTAUTH_URL to your custom domain

---

## 🎯 Quick Deployment Command

For immediate deployment, run:
```bash
vercel --prod
```

---

## ✅ Post-Deployment Checklist

After deployment, test these:
- [ ] Homepage loads
- [ ] Gallery works
- [ ] Packages page loads
- [ ] Admin login works
- [ ] Client login works
- [ ] Contact form sends emails
- [ ] Photo upload works
- [ ] Mobile swipe gestures work

---

## 🐛 Troubleshooting

**Issue: "Error connecting to database"**
- Check DATABASE_URL is correct
- Whitelist 0.0.0.0/0 in MongoDB Atlas

**Issue: "NextAuth configuration error"**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain

**Issue: "Cloudinary upload failed"**
- Verify all Cloudinary env vars are set
- Check upload preset is unsigned

**Issue: "Email not sending"**
- Verify EMAIL_USER and EMAIL_PASS
- Check Gmail app password is correct

---

## 📞 Support

If you encounter issues:
1. Check Vercel logs: `vercel logs`
2. Check environment variables: `vercel env ls`
3. Redeploy: `vercel --prod`

---

**Ready to deploy? Run: `vercel`**

