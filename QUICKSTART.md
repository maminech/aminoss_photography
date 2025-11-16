# 🚀 Quick Start Guide - Innov8 Production

Follow these steps to get your portfolio running in **5 minutes**!

## ✅ Step 1: Install Dependencies (1 min)

Open PowerShell in this folder and run:

```powershell
npm install
```

This will install all required packages.

## ✅ Step 2: Set Up Environment Variables (2 mins)

1. Create a file named `.env.local` in the root folder
2. Copy this template:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=your_key_here
CLOUDINARY_API_SECRET=your_secret_here

# Email Configuration
EMAIL_USER=innov8.tn@gmail.com
EMAIL_PASS=your_app_password_here
```

3. For now, use `demo` values to see sample images
4. Later, replace with your real Cloudinary credentials

## ✅ Step 3: Run Development Server (30 seconds)

```powershell
npm run dev
```

## ✅ Step 4: Open in Browser (30 seconds)

Go to: **http://localhost:3000**

You should see the portfolio with sample images!

---

## 🎯 Next Steps

### To Use Your Own Photos

1. **Create Cloudinary Account** (Free)
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up (takes 2 minutes)
   - Get your credentials from dashboard

2. **Upload Your Photos**
   - Create folders: `Innov8_photography/weddings`, `Innov8_photography/portraits`, etc.
   - Upload your best photos
   - See detailed guide: `CLOUDINARY_SETUP.md`

3. **Update `.env.local`**
   - Replace `demo` values with your real Cloudinary credentials
   - Restart dev server (`Ctrl+C`, then `npm run dev`)

### To Enable Contact Form

1. **Get Gmail App Password**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Factor Authentication
   - Create App Password for "Mail"
   - Add to `.env.local` as `EMAIL_PASS`

2. **Test Contact Form**
   - Go to Contact page
   - Fill and submit form
   - Check email delivery

---

## 📁 Project Structure

```
src/
├── app/              → All pages (Home, Gallery, Videos, About, Contact)
├── components/       → Reusable components (Navbar, Footer, etc.)
├── lib/              → Utilities (Cloudinary, sample data)
├── types/            → TypeScript type definitions
└── styles/           → Global CSS styles
```

---

## 🎨 Customize Your Portfolio

### Update Personal Info

1. **About Page** (`src/app/about/page.tsx`)
   - Change biography
   - Update awards
   - Modify equipment list

2. **Footer** (`src/components/Footer.tsx`)
   - Update social media links
   - Change location

3. **Metadata** (`src/app/layout.tsx`)
   - Update site title
   - Change description
   - Modify keywords

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    600: '#your-color', // Change main color
  }
}
```

### Change Fonts

Edit `src/app/layout.tsx`:

```typescript
import { YourFont } from 'next/font/google';
```

---

## 🚀 Deploy to Vercel (5 mins)

1. **Push to GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables
   - Click "Deploy"

See detailed guide: `DEPLOYMENT.md`

---

## 📚 Documentation

- **README.md** - Full project documentation
- **DEPLOYMENT.md** - Deployment guide
- **CLOUDINARY_SETUP.md** - Cloudinary setup guide
- **package.json** - Project dependencies

---

## 🐛 Common Issues

### Port 3000 Already in Use

```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use different port
npm run dev -- -p 3001
```

### TypeScript Errors

These will resolve after `npm install`. If not:
```powershell
npm install --save-dev @types/node @types/react
```

### Images Not Loading

1. Check `.env.local` exists
2. Check Cloudinary credentials
3. Use `demo` for testing
4. Restart dev server

---

## ✨ Features Included

✅ Home page with hero section  
✅ Gallery with category filters  
✅ Lightbox modal  
✅ Videos page  
✅ About page  
✅ Contact form with email  
✅ Responsive design  
✅ Smooth animations  
✅ SEO optimized  
✅ Cloudinary integration  

---

## 📞 Need Help?

- Check documentation files
- Open issue on GitHub
- Email: innov8.tn@gmail.com

---

## 🎉 You're All Set!

Your portfolio is ready to go. Just add your photos and deploy!

**Happy showcasing! 📸**

