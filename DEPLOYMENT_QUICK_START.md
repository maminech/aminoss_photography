# 🚀 QUICK DEPLOYMENT CHECKLIST

## ⚡ Fast Track Migration (2-3 hours)

### BEFORE YOU START
**Get from client:**
- [ ] FTP Host: `____________________`
- [ ] FTP User: `____________________`  
- [ ] FTP Pass: `____________________`
- [ ] Domain: `____________________`
- [ ] cPanel URL: `____________________`

---

## PHASE 1: BACKUP (30 min)

### Using FileZilla:
1. Connect to FTP
2. Download `/public_html/` → `backup_innov8_old_website/`
3. Verify download complete

```powershell
# Create backup directory
mkdir "E:\aminoss photography\backup_innov8_old_website"
```

**✅ Backup complete when folder size > 0 MB**

---

## PHASE 2: CONFIGURE (10 min)

### Update Domain:
Edit `.env.production` - Replace `innov8production.com` with actual domain:
```bash
NEXT_PUBLIC_SITE_URL=https://[ACTUAL-DOMAIN].com
NEXTAUTH_URL=https://[ACTUAL-DOMAIN].com
INSTAGRAM_REDIRECT_URI=https://[ACTUAL-DOMAIN].com/admin/dashboard/photos
```

---

## PHASE 3: BUILD (15 min)

```powershell
cd "E:\aminoss photography"

# Clean install
rm -r node_modules -Force -ErrorAction SilentlyContinue
npm install

# Generate Prisma
npx prisma generate

# Build production
$env:NODE_ENV="production"
npm run build
```

**✅ Look for: "✓ Compiled successfully"**

---

## PHASE 4: TEST LOCALLY (5 min)

```powershell
npm run start
```

Open: `http://localhost:3000`

**Quick Tests:**
- [ ] Homepage loads
- [ ] `/gallery` works
- [ ] `/admin/login` accessible
- [ ] Images load

Press `Ctrl+C` when done

---

## PHASE 5: DEPLOY (30-60 min)

### Option A: Node.js Hosting (BEST)

**Upload via FTP:**
```
Upload these folders/files:
/.next/           (entire folder - 50-200 MB)
/public/          (entire folder)
/prisma/          (schema.prisma)
/node_modules/    (optional - can install on server)
package.json
package-lock.json
next.config.js
.env.production   (rename to .env on server)
```

**Start App via cPanel:**
1. cPanel → Setup Node.js App
2. Node Version: 18+
3. Application Root: `/public_html/`
4. Startup: `node_modules/next/dist/bin/next start`
5. Click "Create"

---

### Option B: Static + Vercel API (FALLBACK)

**In Vercel Dashboard:**
1. Settings → Domains
2. Add: `[client-domain].com`
3. Update environment variables
4. Redeploy

**In Client's DNS:**
```
A Record:    @ → 76.76.21.21
CNAME:       www → cname.vercel-dns.com
```

**✅ Easiest - no file uploads needed!**

---

## PHASE 6: DNS & SSL (15-60 min)

### Update DNS (at domain registrar):
```
Type: A
Name: @
Value: [Server IP from hosting]
TTL: 3600
```

### Enable SSL (in cPanel):
1. SSL/TLS Status
2. Select domain
3. "Install SSL" (Let's Encrypt)
4. Wait 5-10 minutes

**✅ Check**: Visit `https://[domain].com`

---

## PHASE 7: SECURITY (10 min)

**Client Actions:**
1. Change cPanel password
2. Change/create new FTP account
3. Delete old FTP accounts
4. Save new credentials securely

**Your Actions:**
```bash
# On server via SSH (if available)
chmod 600 .env
chmod 600 .env.production
```

---

## PHASE 8: VALIDATE (20 min)

### Critical Tests:
- [ ] `https://[domain].com` → Homepage loads
- [ ] `/gallery` → Gallery works
- [ ] `/admin/login` → Admin can login
- [ ] `/client/login` → Client can login
- [ ] Contact form → Email received
- [ ] Create test booking → Saved to DB
- [ ] Upload test image → Cloudinary works
- [ ] Mobile view → Responsive

### Database Test:
```powershell
# Test MongoDB connection
node -e "const {MongoClient}=require('mongodb');new MongoClient(process.env.DATABASE_URL).connect().then(()=>console.log('✅ DB OK')).catch(e=>console.error('❌',e))"
```

---

## 🎉 SUCCESS CRITERIA

✅ All checkboxes above marked
✅ Domain loads with HTTPS
✅ No console errors in browser
✅ Admin can login and access dashboard
✅ Database operations work
✅ Email notifications sending
✅ Mobile responsive

---

## 🚨 TROUBLESHOOTING

### "503 Service Unavailable"
→ App not running. Restart via cPanel Node.js manager

### "Database connection failed"  
→ Check MongoDB Atlas IP whitelist includes server IP

### "Images not loading"
→ Verify Cloudinary credentials in `.env`

### "Can't login to admin"
→ Check `NEXTAUTH_URL` matches actual domain

### "Email not sending"
→ Test Gmail App Password, check port 587 open

---

## 📞 NEED HELP?

**MongoDB Atlas**: https://cloud.mongodb.com
**Cloudinary**: https://cloudinary.com/console  
**Let's Encrypt SSL**: https://letsencrypt.org
**FileZilla**: https://filezilla-project.org

---

## 📋 POST-DEPLOYMENT

- [ ] Save backup in safe location
- [ ] Document new FTP credentials
- [ ] Set up automated backups
- [ ] Configure Google Analytics
- [ ] Submit sitemap to Google
- [ ] Train client on admin dashboard
- [ ] Monitor for 48 hours

---

**Time Estimate: 2-3 hours total**
**Difficulty: Medium**
**Requirements: FTP access + Node.js hosting OR Vercel domain connection**

---

**QUICK TIP**: If stuck or hosting doesn't support Node.js, use Option B (Vercel + Custom Domain) - it's 10 minutes and works perfectly! 🚀
