# 🚀 Innov8 Production - Complete Deployment & Migration Guide

## 📋 Table of Contents
1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Migration Process](#step-by-step-migration-process)
4. [Post-Deployment Validation](#post-deployment-validation)
5. [Security Hardening](#security-hardening)
6. [Troubleshooting](#troubleshooting)
7. [Future Updates](#future-updates)

---

## 🎯 Pre-Migration Checklist

### Required Information from Client:
- [ ] **Domain Name**: innov8production.com (or actual domain)
- [ ] **FTP/SFTP Credentials**:
  - Host/Server IP: `___________________`
  - Username: `___________________`
  - Password: `___________________`
  - Port: `21` (FTP) or `22` (SFTP)
  - Root Directory: `/public_html/` or `___________________`
  
- [ ] **cPanel/Hosting Panel Access**:
  - URL: `___________________`
  - Username: `___________________`
  - Password: `___________________`

- [ ] **DNS Management Access**: (if DNS changes needed)
- [ ] **SSL Certificate**: Active HTTPS (Let's Encrypt recommended)
- [ ] **Node.js Support**: Version 18+ required (check with hosting provider)

### Backup Checklist:
- [ ] Download all existing website files
- [ ] Export current database (if any)
- [ ] Save FTP credentials securely
- [ ] Take screenshots of current site
- [ ] Document current DNS settings

---

## 🏗️ Architecture Overview

### Current Stack:
```
┌─────────────────────────────────────┐
│   Next.js 14 App (TypeScript)       │
│   - App Router                      │
│   - Server Components               │
│   - API Routes                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   MongoDB Atlas (Cloud Database)    │
│   - Client data                     │
│   - Bookings & galleries            │
│   - Photobooks & invoices           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Cloudinary (Media Storage)        │
│   - Images & videos                 │
│   - Optimized delivery              │
└─────────────────────────────────────┘
```

### Deployment Options:

#### **Option A: Node.js Hosting (RECOMMENDED)**
✅ Full functionality (API routes, SSR, ISR)
✅ Real-time features
✅ Database operations
❌ Requires Node.js hosting support

**Best for**: VPS, dedicated servers, or Node.js-enabled shared hosting

#### **Option B: Static Export + Separate API Server**
⚠️ Limited functionality
✅ Works on any hosting
✅ CDN-friendly
❌ No API routes (need separate backend)

**Best for**: Traditional shared hosting without Node.js

#### **Option C: Hybrid (Vercel + Custom Domain)**
✅ Easiest migration
✅ Keep full functionality
✅ Client's domain points to Vercel
❌ Still on Vercel infrastructure

---

## 📦 Step-by-Step Migration Process

### **PHASE 1: Preparation & Backup (30 minutes)**

#### 1.1 Connect to Existing Site via FTP

**Using FileZilla (Free FTP Client)**:
1. Download FileZilla: https://filezilla-project.org/
2. Open FileZilla → File → Site Manager
3. Create new site with credentials:
   ```
   Host: [client's server IP/hostname]
   Port: 21 (FTP) or 22 (SFTP)
   Protocol: FTP or SFTP
   Logon Type: Normal
   User: [provided username]
   Password: [provided password]
   ```
4. Click "Connect"

**Using CoreFTP (Windows)**:
1. Download CoreFTP: http://www.coreftp.com/
2. Site Manager → New Site
3. Enter credentials
4. Connect

#### 1.2 Backup Existing Website

```powershell
# Create backup directory locally
mkdir "E:\Innov8 Production\backup_innov8_old_website"
cd "E:\Innov8 Production\backup_innov8_old_website"
```

**Via FTP Client**:
1. Navigate to `/public_html/` (or root directory)
2. Select all files
3. Right-click → Download
4. Save to: `E:\Innov8 Production\backup_innov8_old_website\`
5. Wait for completion (may take 10-30 minutes)

**Verify Backup**:
```powershell
# List downloaded files
Get-ChildItem "E:\Innov8 Production\backup_innov8_old_website" -Recurse
```

#### 1.3 Document Current Configuration

Create file: `backup_innov8_old_website\BACKUP_INFO.txt`
```
Backup Date: [Current Date]
Original Domain: innov8production.com
Backup Size: [Size in MB]
File Count: [Number of files]
Previous Developer: [Name if known]
Notes: [Any important observations]
```

---

### **PHASE 2: Environment Configuration (15 minutes)**

#### 2.1 Verify Production Environment File

File: `.env.production` (already created)

✅ Check all values:
```bash
NEXT_PUBLIC_SITE_URL=https://innov8production.com  # ← UPDATE WITH ACTUAL DOMAIN
NEXTAUTH_URL=https://innov8production.com           # ← UPDATE WITH ACTUAL DOMAIN
INSTAGRAM_REDIRECT_URI=https://innov8production.com/admin/dashboard/photos  # ← UPDATE
```

#### 2.2 Update Next.js Configuration

No changes needed - `next.config.js` is already production-ready.

#### 2.3 Test MongoDB Connection

```powershell
cd "E:\Innov8 Production"

# Test database connection
node -e "const { MongoClient } = require('mongodb'); const client = new MongoClient(process.env.DATABASE_URL); client.connect().then(() => { console.log('✅ MongoDB Connected'); client.close(); }).catch(err => console.error('❌ Error:', err));"
```

---

### **PHASE 3: Build Production Application (10 minutes)**

#### 3.1 Install Dependencies

```powershell
cd "E:\Innov8 Production"

# Clean install
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

#### 3.2 Generate Prisma Client

```powershell
npx prisma generate
```

#### 3.3 Build for Production

```powershell
# Build with production environment
$env:NODE_ENV="production"
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (126/126)
✓ Finalizing page optimization
```

#### 3.4 Test Build Locally

```powershell
# Start production server locally
npm run start
```

Open browser: `http://localhost:3000`

**Verify**:
- [ ] Homepage loads
- [ ] Gallery works
- [ ] Admin login (`/admin/login`)
- [ ] Client login (`/client/login`)
- [ ] Contact form sends email
- [ ] Image uploads work

Press `Ctrl+C` to stop server after testing.

---

### **PHASE 4: Deploy to Client's Hosting**

#### 4.1 Determine Hosting Type

**Check with client**: Does your hosting support Node.js applications?

**YES (Node.js Hosting)** → Follow Section 4.2
**NO (Static Hosting)** → Follow Section 4.3
**UNSURE** → Contact hosting provider or check cPanel for "Node.js" option

---

#### 4.2 Deploy to Node.js Hosting (RECOMMENDED)

**Upload Files via FTP**:

1. **Connect to FTP**
2. **Navigate to root directory** (usually `/public_html/` or `/home/username/`)
3. **Delete old website files** (only if backup is confirmed)
4. **Upload these files/folders**:
   ```
   /.next/                    (entire folder)
   /node_modules/             (entire folder - or install on server)
   /public/                   (entire folder)
   /prisma/                   (schema.prisma file)
   .env.production            (rename to .env on server)
   package.json
   package-lock.json
   next.config.js
   ```

**Alternative: Install node_modules on server**:
```bash
# SSH into server
ssh username@server-ip

# Navigate to site directory
cd /public_html/

# Install dependencies
npm install --production

# Generate Prisma Client
npx prisma generate
```

**Start Application**:

Via cPanel Node.js Manager:
1. Log into cPanel
2. Find "Setup Node.js App" or "Node.js Selector"
3. Create new application:
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: `/public_html/`
   - **Application URL**: `innov8production.com`
   - **Application Startup File**: `node_modules/next/dist/bin/next start`
4. Click "Create"

Via PM2 (if SSH access):
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "innov8-production" -- start

# Save PM2 process
pm2 save
pm2 startup
```

---

#### 4.3 Deploy to Static Hosting (FALLBACK)

⚠️ **Note**: This requires separate backend for API routes.

**Generate Static Export**:
```powershell
# Update next.config.js
# Add: output: 'export'

npm run build
```

This will fail because we have API routes. You'll need to either:
1. Keep Vercel for API routes (backend)
2. Deploy API routes to separate Node.js hosting (Railway, Render, etc.)
3. Convert to full Node.js hosting

**Recommended**: Use Node.js hosting (Option 4.2) or Hybrid approach (Option 4.4)

---

#### 4.4 Deploy Hybrid (Custom Domain → Vercel)

**Easiest Migration Path**:

1. **Keep Vercel deployment** (already done)
2. **Point client's domain to Vercel**:

**In Client's DNS Settings** (GoDaddy, Namecheap, etc.):
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

3. **Add Domain in Vercel Dashboard**:
   - Go to vercel.com → Project Settings → Domains
   - Add `innov8production.com`
   - Add `www.innov8production.com`
   - Verify DNS propagation (15 minutes - 24 hours)

4. **Update Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Update:
     ```
     NEXT_PUBLIC_SITE_URL=https://innov8production.com
     NEXTAUTH_URL=https://innov8production.com
     INSTAGRAM_REDIRECT_URI=https://innov8production.com/admin/dashboard/photos
     ```
   - Redeploy

**Advantages**:
- ✅ Zero downtime
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Full functionality
- ✅ Easy updates

**Disadvantages**:
- ❌ Still on Vercel (client might want full control)
- ❌ Monthly bandwidth limits (generous on free tier)

---

### **PHASE 5: Domain & SSL Configuration**

#### 5.1 DNS Configuration

**If using Node.js hosting**, point domain to server:

```
Type: A
Name: @
Value: [Your Server IP]
TTL: 3600

Type: A
Name: www
Value: [Your Server IP]
TTL: 3600
```

#### 5.2 SSL Certificate Setup

**Via cPanel Let's Encrypt**:
1. Log into cPanel
2. Find "SSL/TLS Status" or "Let's Encrypt SSL"
3. Select domain: `innov8production.com`
4. Click "Install SSL"
5. Wait 5-10 minutes for activation

**Verify HTTPS**:
```powershell
Invoke-WebRequest -Uri "https://innov8production.com" -UseBasicParsing
```

#### 5.3 Force HTTPS Redirect

Create/Update `.htaccess` in `/public_html/`:
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Force WWW (optional)
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [L,R=301]
```

---

### **PHASE 6: Post-Deployment Testing (20 minutes)**

#### 6.1 Homepage & Navigation
- [ ] Load `https://innov8production.com`
- [ ] All navigation links work
- [ ] Images load correctly
- [ ] Videos play
- [ ] Animations smooth

#### 6.2 Public Pages
- [ ] `/gallery` - Gallery loads
- [ ] `/videos` - Video showcase works
- [ ] `/packs` - Packages display
- [ ] `/testimonials` - Testimonials show
- [ ] `/booking` - Booking form accessible
- [ ] `/contact` - Contact form works

#### 6.3 Admin Dashboard
- [ ] `/admin/login` - Login page loads
- [ ] Login with credentials works
- [ ] Dashboard statistics load
- [ ] Gallery management works
- [ ] Client management accessible
- [ ] Booking system functional
- [ ] Photobook system works
- [ ] Instagram sync operational

#### 6.4 Client Portal
- [ ] `/client/login` - Client login works
- [ ] Client dashboard loads
- [ ] Gallery access functional
- [ ] Photo selection works
- [ ] Photobook creation successful
- [ ] Download features work

#### 6.5 Email Notifications
- [ ] Contact form sends email
- [ ] Booking confirmations sent
- [ ] Client notifications working

#### 6.6 Database Operations
- [ ] New booking creates DB entry
- [ ] Photo selection saves
- [ ] Photobook drafts save/update
- [ ] Admin edits persist

#### 6.7 Mobile Responsiveness
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] PWA installation works
- [ ] Touch gestures functional

---

### **PHASE 7: Security Hardening**

#### 7.1 Change FTP Credentials

**Action Required from Client**:
1. Log into hosting cPanel
2. Find "FTP Accounts"
3. Delete old FTP account (previous developer)
4. Create new FTP account with strong password
5. Share new credentials ONLY with trusted parties

#### 7.2 Change Hosting Panel Password

**Client Action**:
1. cPanel → Password & Security
2. Change Password
3. Use strong password (16+ characters)
4. Enable 2FA if available

#### 7.3 Secure Environment Variables

**On Server**:
```bash
# Set proper file permissions
chmod 600 .env.production
chmod 600 .env

# Verify ownership
chown username:username .env.production
```

#### 7.4 Disable Directory Listing

Add to `.htaccess`:
```apache
# Disable directory browsing
Options -Indexes
```

#### 7.5 Protect Sensitive Files

Add to `.htaccess`:
```apache
# Block access to sensitive files
<FilesMatch "^\.env|\.git|package\.json|next\.config\.js">
  Order allow,deny
  Deny from all
</FilesMatch>
```

#### 7.6 MongoDB Atlas Security

**Verify**:
1. Log into MongoDB Atlas
2. Network Access → Check IP Whitelist
3. Add server IP if needed
4. Remove old/unused IPs
5. Database Access → Verify user permissions

#### 7.7 Cloudinary Security

**Verify**:
1. Log into Cloudinary
2. Settings → Security
3. Check upload presets (restrict if needed)
4. Enable signed URLs for sensitive media
5. Review access logs

---

### **PHASE 8: Performance Optimization**

#### 8.1 Enable Compression

Add to `.htaccess`:
```apache
# Enable Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

#### 8.2 Browser Caching

```apache
# Leverage browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

#### 8.3 CDN Setup (Optional)

**Cloudflare Free CDN**:
1. Sign up at cloudflare.com
2. Add domain
3. Update nameservers at domain registrar
4. Enable "Auto Minify" for JS/CSS/HTML
5. Enable "Brotli" compression
6. Set caching rules

---

## 🔧 Troubleshooting

### Issue: "503 Service Unavailable"

**Cause**: Application not running
**Solution**:
```bash
# Check if Node.js app is running
pm2 status

# Restart application
pm2 restart innov8-production

# Check logs
pm2 logs
```

### Issue: "502 Bad Gateway"

**Cause**: Application crashed or wrong port
**Solution**:
1. Check application logs
2. Verify environment variables
3. Restart Node.js app
4. Check server resources (RAM/CPU)

### Issue: Database Connection Failed

**Error**: `MongooseError: Could not connect to MongoDB`
**Solution**:
1. Verify `DATABASE_URL` in `.env`
2. Check MongoDB Atlas IP whitelist
3. Test connection:
   ```bash
   node -e "require('mongodb').MongoClient.connect(process.env.DATABASE_URL).then(() => console.log('OK')).catch(console.error)"
   ```

### Issue: Images Not Loading

**Cause**: Cloudinary configuration
**Solution**:
1. Check `.env` has correct Cloudinary credentials
2. Verify `next.config.js` has image domains
3. Test Cloudinary API:
   ```bash
   curl https://res.cloudinary.com/dm22wlmpx/image/list.json
   ```

### Issue: Admin Login Fails

**Cause**: `NEXTAUTH_URL` mismatch or wrong credentials
**Solution**:
1. Verify `.env` has: `NEXTAUTH_URL=https://innov8production.com`
2. Check `NEXTAUTH_SECRET` is set
3. Clear browser cookies
4. Reset admin password if needed:
   ```bash
   node create-admin.js
   ```

### Issue: Email Not Sending

**Cause**: Gmail App Password or SMTP config
**Solution**:
1. Verify `EMAIL_USER` and `EMAIL_PASS`
2. Generate new Gmail App Password
3. Check server allows outbound SMTP (port 587)
4. Test email:
   ```bash
   node -e "const nodemailer=require('nodemailer');const t=nodemailer.createTransport({host:'smtp.gmail.com',port:587,secure:false,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS}});t.sendMail({from:process.env.EMAIL_USER,to:'test@example.com',subject:'Test',text:'OK'},(e,i)=>console.log(e||'Sent!'))"
   ```

---

## 🔄 Future Updates & Maintenance

### How to Deploy Updates

#### Method 1: FTP Upload (Simple Changes)
1. Make changes locally
2. Test with `npm run dev`
3. Build: `npm run build`
4. Upload changed files via FTP:
   - `.next/` folder
   - Updated files in `public/`
   - If dependencies changed: upload `node_modules/`
5. Restart Node.js app (if needed)

#### Method 2: Git + SSH (Recommended)
```bash
# On server via SSH
cd /public_html/
git pull origin main
npm install
npm run build
pm2 restart innov8-production
```

#### Method 3: Automated CI/CD (Advanced)
Set up GitHub Actions to auto-deploy on push to `main` branch.

### Regular Maintenance Tasks

**Weekly**:
- [ ] Check error logs
- [ ] Monitor database size
- [ ] Review security logs
- [ ] Test backup restoration

**Monthly**:
- [ ] Update dependencies: `npm update`
- [ ] Check SSL certificate expiry
- [ ] Review Cloudinary storage usage
- [ ] Test all critical user flows

**Quarterly**:
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Database cleanup/optimization
- [ ] Update Node.js version (if needed)

### Backup Strategy

**Automated Backups**:
```bash
# Create backup script: backup.sh
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/username/backups"
mkdir -p $BACKUP_DIR

# Backup files
tar -czf $BACKUP_DIR/innov8_$TIMESTAMP.tar.gz /public_html/

# Backup MongoDB (export to JSON)
mongodump --uri="$DATABASE_URL" --out=$BACKUP_DIR/mongo_$TIMESTAMP

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
```

**Set Cron Job** (run daily at 2 AM):
```bash
crontab -e
# Add:
0 2 * * * /home/username/backup.sh
```

---

## 📞 Support & Contacts

### Hosting Support
- **Provider**: [Hosting Company Name]
- **Support Email**: support@hostingprovider.com
- **Support Phone**: +XX XXX XXX XXX
- **Panel**: https://cpanel.innov8production.com

### Service Accounts
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Cloudinary**: https://cloudinary.com/console
- **Gmail (SMTP)**: innov8.tn@gmail.com
- **Instagram Business**: [Account Name]

### Emergency Contacts
- **Developer**: [Your Name/Company]
- **Email**: [Your Email]
- **Phone**: [Your Phone]
- **Available**: [Your Hours]

---

## 📊 Deployment Summary Template

Copy this after successful deployment:

```
================================
DEPLOYMENT SUMMARY - Innov8 Production
================================

Date: [Deployment Date]
Time: [Deployment Time]
Deployed By: [Your Name]

DOMAIN INFORMATION:
- Primary Domain: https://innov8production.com
- WWW Redirect: [Yes/No]
- SSL Status: [Active/Pending]
- DNS Provider: [Provider Name]

HOSTING INFORMATION:
- Provider: [Hosting Company]
- Server Type: [Shared/VPS/Dedicated/Node.js]
- Server IP: [IP Address]
- cPanel URL: [URL]
- PHP Version: [Version]
- Node.js Version: [Version]

DEPLOYMENT MODE:
- [X] Node.js Hosting (Full App)
- [ ] Static Export + API Server
- [ ] Hybrid (Vercel Backend)

BACKUP STATUS:
- Old Site Backup: ✅ Completed
- Backup Location: E:\Innov8 Production\backup_innov8_old_website\
- Backup Size: [Size] MB
- Backup Date: [Date]

DATABASE STATUS:
- MongoDB Atlas: ✅ Connected
- Connection String: [Hidden - Secured]
- Database Size: [Size] MB
- Last Backup: [Date]

SECURITY STATUS:
- FTP Password: ✅ Changed
- cPanel Password: ✅ Changed
- Old Developer Access: ✅ Revoked
- SSL Certificate: ✅ Active
- .env Security: ✅ Secured (chmod 600)
- MongoDB IP Whitelist: ✅ Updated

VERIFICATION CHECKLIST:
✅ Homepage loads
✅ Gallery functional
✅ Admin dashboard working
✅ Client portal accessible
✅ Booking system operational
✅ Email notifications sending
✅ Database operations successful
✅ Mobile responsive
✅ HTTPS enforced
✅ All routes tested

PERFORMANCE:
- Page Load Time: [X] seconds
- Lighthouse Score: [Score]/100
- Mobile Score: [Score]/100

NOTES:
[Any additional notes or observations]

NEXT STEPS:
1. Monitor for 48 hours
2. Submit to Google Search Console
3. Set up Google Analytics
4. Configure automated backups
5. Train client on admin dashboard

================================
Deployment Status: ✅ SUCCESS
================================
```

---

## 🎓 Training for Client

### Admin Dashboard Overview

**Login**: `https://innov8production.com/admin/login`
- **Email**: [Admin Email]
- **Password**: [Provided Separately]

**Key Features**:
1. **Dashboard**: Overview of bookings, clients, revenue
2. **Galleries**: Upload and manage client galleries
3. **Bookings**: View and manage event bookings
4. **Clients**: Manage client accounts
5. **Photobooks**: Review and approve client photobooks
6. **Messages**: Client communication
7. **Settings**: Site configuration

**Video Tutorial**: [Link to screen recording]

---

## ✅ Migration Completion Checklist

Print this and check off as you complete each step:

### Pre-Migration
- [ ] FTP credentials received
- [ ] cPanel access confirmed
- [ ] Domain details verified
- [ ] Current site backed up
- [ ] Backup integrity verified
- [ ] Documentation reviewed

### Configuration
- [ ] `.env.production` updated with actual domain
- [ ] MongoDB connection tested
- [ ] Cloudinary credentials verified
- [ ] Email configuration tested
- [ ] All secrets secured

### Build & Deploy
- [ ] Dependencies installed
- [ ] Prisma client generated
- [ ] Production build successful
- [ ] Build tested locally
- [ ] Files uploaded to server
- [ ] Node.js app started
- [ ] Application accessible

### Domain & SSL
- [ ] DNS configured correctly
- [ ] SSL certificate installed
- [ ] HTTPS redirect active
- [ ] www redirect configured
- [ ] DNS propagation complete

### Testing
- [ ] All public pages tested
- [ ] Admin dashboard functional
- [ ] Client portal working
- [ ] Database operations verified
- [ ] Email notifications working
- [ ] Mobile responsiveness confirmed
- [ ] Performance acceptable
- [ ] No console errors

### Security
- [ ] FTP credentials changed
- [ ] cPanel password updated
- [ ] Old developer access revoked
- [ ] File permissions set correctly
- [ ] Sensitive files protected
- [ ] MongoDB IP whitelist updated
- [ ] Environment variables secured

### Handover
- [ ] Client trained on admin dashboard
- [ ] Documentation provided
- [ ] Credentials shared securely
- [ ] Backup strategy explained
- [ ] Support contacts provided
- [ ] Future update process explained

### Post-Launch
- [ ] Google Analytics configured
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] Monitoring tools set up
- [ ] 48-hour monitoring completed
- [ ] Performance optimized
- [ ] Client feedback collected

---

## 📝 Notes

- This platform uses **Next.js 14** with **App Router** - it requires Node.js hosting
- **MongoDB Atlas** is cloud-hosted - connection string stays the same
- **Cloudinary** handles all images/videos - no local storage needed
- **Email** uses Gmail SMTP - ensure port 587 is open on server
- **PWA features** require HTTPS to work properly
- **Instagram sync** requires business account and valid redirect URI

---

**Document Version**: 1.0
**Last Updated**: November 12, 2025
**Maintained By**: Innov8 Production Development Team

---

**END OF DEPLOYMENT GUIDE**

