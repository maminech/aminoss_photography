# 🔒 SECURITY HARDENING CHECKLIST

## ⚠️ CRITICAL: Complete ALL items before going live

---

## 📋 PRE-DEPLOYMENT SECURITY

### 1. Environment Variables
- [ ] `.env.production` created with correct domain
- [ ] All sensitive keys present (MongoDB, Cloudinary, Email)
- [ ] No test/development URLs in production env
- [ ] `.env.production` added to `.gitignore`
- [ ] No environment variables committed to Git

### 2. Credentials Review
- [ ] MongoDB password is strong (16+ characters)
- [ ] NEXTAUTH_SECRET is cryptographically secure
- [ ] Email App Password is valid and restricted
- [ ] Cloudinary API secret not exposed
- [ ] Instagram API secret secured
- [ ] All passwords unique (no reuse)

### 3. Database Security
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Server IP added to MongoDB whitelist
- [ ] Database user has minimum required permissions
- [ ] Connection string uses SSL/TLS
- [ ] No public database access enabled

---

## 🚀 DURING DEPLOYMENT SECURITY

### 4. File Permissions (Linux/Unix hosting)
```bash
# Set via SSH or cPanel File Manager
chmod 600 .env                    # Only owner can read/write
chmod 600 .env.production          # Only owner can read/write
chmod 755 -R .next/                # Standard for application files
chmod 755 -R public/               # Public files readable
chmod 644 package.json             # Configuration readable
```

### 5. FTP Security
- [ ] Use SFTP (port 22) instead of FTP (port 21) if available
- [ ] FTP connection uses encryption (FTPs/SFTP)
- [ ] FTP password changed immediately after deployment
- [ ] Old FTP accounts deleted/disabled
- [ ] FTP access restricted to specific IP (if possible)

### 6. Sensitive Files Protection
- [ ] `.env` file NOT in public_html web root (or protected)
- [ ] `.git` folder removed from server (or protected)
- [ ] `node_modules` not accessible via HTTP
- [ ] `package.json` not accessible via HTTP
- [ ] `prisma/schema.prisma` not accessible via HTTP

### 7. Apache/Nginx Configuration
```apache
# .htaccess (Apache)
<FilesMatch "^\.env|\.git|package\.json|next\.config\.js|prisma">
  Order allow,deny
  Deny from all
</FilesMatch>

# Disable directory listing
Options -Indexes

# Block access to hidden files
<FilesMatch "^\.">
  Order allow,deny
  Deny from all
</FilesMatch>
```

---

## 🔐 POST-DEPLOYMENT SECURITY

### 8. Hosting Panel Access
- [ ] cPanel password changed
- [ ] Strong password (16+ characters, mixed case, numbers, symbols)
- [ ] Two-factor authentication (2FA) enabled on cPanel
- [ ] Email notifications enabled for login attempts
- [ ] Session timeout configured (30 minutes recommended)

### 9. Remove Old Developer Access
- [ ] Old developer removed from FTP accounts
- [ ] Old developer removed from cPanel users
- [ ] Old developer removed from email forwards
- [ ] Old developer removed from Git collaborators
- [ ] Old developer removed from Cloudinary team
- [ ] Old developer removed from MongoDB Atlas project
- [ ] Old developer removed from Vercel team (if applicable)
- [ ] All shared passwords changed

### 10. SSL/TLS Certificate
- [ ] SSL certificate installed and active
- [ ] HTTPS redirect configured (HTTP → HTTPS)
- [ ] SSL certificate auto-renewal enabled
- [ ] Certificate covers www and non-www domains
- [ ] Test: https://www.ssllabs.com/ssltest/

### 11. Domain & DNS Security
- [ ] Domain registrar account password changed
- [ ] Domain registrar 2FA enabled
- [ ] Domain locked/transfer protection enabled
- [ ] DNSSEC enabled (if supported)
- [ ] Auto-renewal enabled to prevent expiration
- [ ] Whois privacy protection enabled

### 12. Application Security Headers
Add to Next.js configuration or `.htaccess`:

```apache
# Security Headers (.htaccess)
<IfModule mod_headers.c>
  # Prevent clickjacking
  Header always set X-Frame-Options "SAMEORIGIN"
  
  # XSS Protection
  Header always set X-XSS-Protection "1; mode=block"
  
  # Prevent MIME sniffing
  Header always set X-Content-Type-Options "nosniff"
  
  # Referrer Policy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  
  # Content Security Policy (adjust as needed)
  Header always set Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://res.cloudinary.com; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data:; font-src 'self' https: data:;"
</IfModule>
```

### 13. MongoDB Atlas Security
- [ ] IP Whitelist includes only necessary IPs
- [ ] Database user password rotated (change from default)
- [ ] Audit logs enabled (if on paid tier)
- [ ] Encryption at rest enabled
- [ ] TLS/SSL enforced for connections
- [ ] Database backups configured

### 14. Cloudinary Security
- [ ] Upload preset restricted (not open to public)
- [ ] Signed upload URLs enabled for sensitive operations
- [ ] Access control set on media folders
- [ ] Transformation limits configured
- [ ] Usage alerts enabled
- [ ] API rate limiting enabled

### 15. Email Security
- [ ] Gmail App Password used (not account password)
- [ ] 2FA enabled on Gmail account
- [ ] Less secure app access disabled
- [ ] SMTP over TLS (port 587) configured
- [ ] SPF record configured for domain
- [ ] DKIM signature configured
- [ ] DMARC policy configured

---

## 🛡️ ONGOING SECURITY

### 16. Access Monitoring
- [ ] Enable cPanel login notifications
- [ ] Review FTP access logs weekly
- [ ] Monitor MongoDB Atlas activity logs
- [ ] Check Cloudinary usage reports
- [ ] Review email sending logs
- [ ] Set up uptime monitoring (UptimeRobot, etc.)

### 17. Regular Updates
- [ ] Update npm dependencies monthly: `npm update`
- [ ] Update Prisma: `npm update @prisma/client prisma`
- [ ] Update Next.js: `npm update next react react-dom`
- [ ] Monitor security advisories: `npm audit`
- [ ] Apply security patches promptly

### 18. Backup Strategy
```bash
# Automated daily backup script
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/username/backups"
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz /public_html/ --exclude=node_modules

# Backup database (MongoDB export)
mongodump --uri="$DATABASE_URL" --out=$BACKUP_DIR/db_$TIMESTAMP

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
```

**Set Cron Job** (daily at 2 AM):
```bash
crontab -e
# Add:
0 2 * * * /home/username/backup.sh >> /home/username/backup.log 2>&1
```

### 19. Incident Response Plan
**If breach suspected:**
1. ✅ Immediately change ALL passwords
2. ✅ Rotate all API keys (MongoDB, Cloudinary, etc.)
3. ✅ Review access logs for unauthorized activity
4. ✅ Restore from clean backup if compromised
5. ✅ Generate new NEXTAUTH_SECRET
6. ✅ Force logout all users
7. ✅ Notify affected users if data exposed
8. ✅ Document incident and response

### 20. Security Audit Schedule

**Weekly**:
- [ ] Review server error logs
- [ ] Check for failed login attempts
- [ ] Monitor disk space usage
- [ ] Verify SSL certificate validity

**Monthly**:
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review user access permissions
- [ ] Check for outdated dependencies
- [ ] Test backup restoration

**Quarterly**:
- [ ] Full security penetration test
- [ ] Password rotation for all services
- [ ] Review and update firewall rules
- [ ] Security training for admin users

**Annually**:
- [ ] Major dependency updates (Next.js, React, etc.)
- [ ] Third-party security audit (recommended)
- [ ] Review and update security policies
- [ ] Disaster recovery drill

---

## 🧪 SECURITY TESTING TOOLS

### Automated Scanning:
```bash
# Check for npm vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Security headers test
curl -I https://innov8production.com | grep -i "x-frame\|x-xss\|x-content"
```

### Online Tools:
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **Security Headers**: https://securityheaders.com
- **Observatory**: https://observatory.mozilla.org
- **OWASP ZAP**: https://www.zaproxy.org (penetration testing)
- **Snyk**: https://snyk.io (dependency scanning)

---

## ✅ SECURITY VERIFICATION CHECKLIST

### Final Pre-Launch Check:
- [ ] All items above completed
- [ ] Security scan shows no critical issues
- [ ] SSL test passes with A or A+ rating
- [ ] No sensitive data in Git repository
- [ ] All credentials documented securely
- [ ] Incident response plan documented
- [ ] Client trained on security best practices
- [ ] Emergency contact information shared

### Post-Launch Monitoring (First 48 Hours):
- [ ] No unauthorized access attempts
- [ ] All authentication working correctly
- [ ] No database connection errors
- [ ] Email notifications sending
- [ ] No security warnings in browser console
- [ ] Uptime monitoring active
- [ ] Backup system tested and working

---

## 🚨 RED FLAGS - IMMEDIATE ACTION REQUIRED

**Stop deployment if you see:**
- ❌ `.env` file accessible via HTTP (test: `https://domain.com/.env`)
- ❌ Git repository exposed (test: `https://domain.com/.git/config`)
- ❌ Directory listing enabled (test: `https://domain.com/public/`)
- ❌ Sensitive files readable (test: `https://domain.com/package.json`)
- ❌ HTTP connections allowed (no HTTPS redirect)
- ❌ Database credentials in client-side code
- ❌ API keys visible in browser network tab
- ❌ Default/weak passwords still in use

**Fix immediately before continuing!**

---

## 📞 SECURITY INCIDENT CONTACTS

**Hosting Provider Security**: [support@hosting.com]
**MongoDB Atlas Support**: https://support.mongodb.com
**Cloudinary Support**: https://support.cloudinary.com
**Let's Encrypt Support**: https://community.letsencrypt.org

**Developer Contact (You)**:
- Email: [your-email]
- Phone: [your-phone]
- Emergency: [emergency-contact]

---

## 📚 SECURITY RESOURCES

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- MongoDB Security Checklist: https://www.mongodb.com/docs/manual/administration/security-checklist/
- SSL Best Practices: https://cheatsheetseries.owasp.org/cheatsheets/TLS_Cipher_String_Cheat_Sheet.html

---

## ✍️ SIGN-OFF

**Deployment Security Review Completed By**:
- Name: _______________________
- Date: _______________________
- Signature: _______________________

**Reviewed By Client**:
- Name: _______________________
- Date: _______________________
- Signature: _______________________

---

**REMEMBER**: Security is not a one-time task, it's an ongoing process. 
Regular monitoring and updates are essential to maintain a secure platform.

---

**Document Version**: 1.0
**Last Updated**: November 12, 2025
**Next Review**: [3 months from deployment]
