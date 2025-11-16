# 🎨 Admin CMS Setup Guide

## 🚀 What You Just Got

Your portfolio now has a **professional admin dashboard** where you can:

✅ **Auto-sync photos** from Cloudinary (upload once, appears automatically)  
✅ **Manage everything** - photos, design, content, settings  
✅ **Upload multiple photos** at once to Cloudinary  
✅ **Categorize & organize** your portfolio  
✅ **Customize design** - colors, fonts, layout  
✅ **Edit all content** - about page, services, contact info  
✅ **Set featured photos** for homepage  
✅ **Professional admin panel** with authentication  

---

## 📋 Step-by-Step Setup

### Step 1: Setup MongoDB Database (FREE)

1. **Go to MongoDB Atlas:**  
   👉 https://www.mongodb.com/cloud/atlas/register

2. **Create FREE account** (no credit card needed)

3. **Create a FREE cluster:**
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select region closest to you
   - Click "Create"

4. **Create Database User:**
   - Go to "Database Access" → "Add New Database User"
   - Username: `Innov8`
   - Password: Create a strong password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

5. **Allow Network Access:**
   - Go to "Network Access" → "Add IP Address"
   - Click "ALLOW ACCESS FROM ANYWHERE" (for development)
   - Click "Confirm"

6. **Get Connection String:**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://Innov8:<password>@cluster0.xxxxx.mongodb.net/...`

7. **Update `.env.local`:**
   - Replace `<password>` with your database password
   - Replace the entire `DATABASE_URL` line in `.env.local`

Example:
```env
DATABASE_URL="mongodb+srv://Innov8:MyPassword123@cluster0.abc123.mongodb.net/Innov8-portfolio?retryWrites=true&w=majority"
```

---

### Step 2: Generate NextAuth Secret

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it in `.env.local` as `NEXTAUTH_SECRET`

---

### Step 3: Initialize Prisma Database

Run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema to MongoDB
npx prisma db push
```

---

### Step 4: Create Your Admin Account

1. **Go to setup page:**  
   👉 http://localhost:3002/admin/setup

2. **Fill in your details:**
   - Name: Your name
   - Email: Your email
   - Password: Create a strong password (min 8 characters)
   - Confirm Password

3. **Click "Create Admin Account"**

4. **You'll be redirected to login page**

---

### Step 5: Login to Admin Dashboard

1. **Go to admin login:**  
   👉 http://localhost:3002/admin/login

2. **Enter your credentials**

3. **You're in! 🎉**

---

## 🖼️ How to Use the Admin Dashboard

### Upload & Sync Photos

#### Method 1: Upload to Cloudinary (Recommended)

1. **Go to Cloudinary Console:**  
   👉 https://cloudinary.com/console

2. **Click "Media Library" → "Upload"**

3. **Upload multiple photos at once** (drag & drop or select files)

4. **Go to Admin Dashboard → Photos:**  
   👉 http://localhost:3002/admin/dashboard/photos

5. **Click "Sync from Cloudinary"**

6. **All photos appear automatically! ✨**

---

### Manage Photos

- **Edit Photo:** Click the edit icon on any photo
  - Change title, description
  - Assign category (weddings, portraits, travel, fashion, events)
  - Set as featured photo

- **Delete Photo:** Click the trash icon

- **Filter by Category:** Use the category buttons at the top

---

### Customize Design

Go to **Design** section to change:
- Primary & secondary colors
- Fonts (heading & body)
- Layout preferences
- Logo & branding

---

### Edit Content

Go to **Content** section to edit:
- Homepage hero section
- About page text & images
- Services offered
- Contact information
- Social media links

---

### Site Settings

Go to **Settings** to manage:
- Site name & tagline
- Location & contact details
- Social media URLs
- SEO metadata

---

## 🎯 Your New Workflow

### Before (Manual):
1. Upload to Cloudinary
2. Copy URL
3. Send to developer
4. Developer updates code
5. Wait for changes

### Now (Automatic):
1. **Upload to Cloudinary** (multiple at once)
2. **Click "Sync"** in admin dashboard
3. **Done!** Photos appear instantly 🚀

---

## 🔐 Security

- ✅ **Password protected** admin area
- ✅ **Secure authentication** with NextAuth.js
- ✅ **Database encrypted** with MongoDB Atlas
- ✅ **No public access** to admin routes

**Important:** Change your `NEXTAUTH_SECRET` before deploying to production!

---

## 🌐 Deployment

When ready to deploy to Vercel:

1. **Add environment variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
   - All Cloudinary variables

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Add admin dashboard"
   git push
   ```

3. **Run Prisma migration** in Vercel:
   - Go to Vercel dashboard → Your project
   - Settings → General → Build Command
   - Add: `npx prisma generate && npm run build`

---

## 📱 Admin Dashboard URLs

- **Setup:** http://localhost:3002/admin/setup (first time only)
- **Login:** http://localhost:3002/admin/login
- **Dashboard:** http://localhost:3002/admin/dashboard
- **Photos:** http://localhost:3002/admin/dashboard/photos
- **Design:** http://localhost:3002/admin/dashboard/design
- **Content:** http://localhost:3002/admin/dashboard/content
- **Settings:** http://localhost:3002/admin/dashboard/settings

---

## 🆘 Need Help?

### Issue: Can't connect to database
**Solution:** Double-check your `DATABASE_URL` in `.env.local`. Make sure:
- Password is correct (no `<>` brackets)
- IP address is whitelisted in MongoDB Atlas
- Database name is correct

### Issue: Sync not working
**Solution:** Make sure:
- Photos are in the correct Cloudinary folder: `Innov8-portfolio`
- Cloudinary credentials are correct in `.env.local`
- You're logged in to admin dashboard

### Issue: Can't login
**Solution:** 
- Make sure you completed Step 3 (Prisma setup)
- Try the setup page again if database wasn't initialized
- Check MongoDB connection

---

## 🎉 You're All Set!

Your photography portfolio is now a **fully-functional CMS** with:
- ✅ Automatic Cloudinary sync
- ✅ Professional admin dashboard
- ✅ Complete control over design & content
- ✅ Secure authentication
- ✅ Database-driven content

**No more manual updates! Upload → Sync → Done! 🚀**

