# ============================================
# INNOV8 PRODUCTION - DEPLOYMENT AUTOMATION
# ============================================
# PowerShell Script for Windows
# Run with: .\deploy-to-production.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " INNOV8 PRODUCTION DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ROOT = "E:\aminoss photography"
$BUILD_DIR = "$PROJECT_ROOT\.next"
$DEPLOYMENT_PACKAGE = "$PROJECT_ROOT\deployment_package"

# Step 1: Pre-flight Checks
Write-Host "[1/8] Running Pre-flight Checks..." -ForegroundColor Yellow

# Check if in correct directory
if (-Not (Test-Path "$PROJECT_ROOT\package.json")) {
    Write-Host "ERROR: Not in project directory!" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Red
    Write-Host "Expected: $PROJECT_ROOT" -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersion = node -v
if ($nodeVersion -match "v(\d+)") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -lt 18) {
        Write-Host "ERROR: Node.js version $nodeVersion is too old!" -ForegroundColor Red
        Write-Host "Required: Node.js 18 or higher" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
}

# Check if .env.production exists
if (-Not (Test-Path "$PROJECT_ROOT\.env.production")) {
    Write-Host "ERROR: .env.production file not found!" -ForegroundColor Red
    Write-Host "Please create .env.production with production variables" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Environment file found" -ForegroundColor Green

# Check MongoDB connection (optional - requires manual test)
Write-Host "⚠ Remember to verify MongoDB Atlas IP whitelist includes server IP" -ForegroundColor Yellow

Write-Host ""

# Step 2: Clean Previous Builds
Write-Host "[2/8] Cleaning Previous Builds..." -ForegroundColor Yellow

if (Test-Path "$BUILD_DIR") {
    Remove-Item "$BUILD_DIR" -Recurse -Force
    Write-Host "✓ Cleaned .next directory" -ForegroundColor Green
}

if (Test-Path "$PROJECT_ROOT\out") {
    Remove-Item "$PROJECT_ROOT\out" -Recurse -Force
    Write-Host "✓ Cleaned out directory" -ForegroundColor Green
}

Write-Host ""

# Step 3: Install Dependencies
Write-Host "[3/8] Installing Dependencies..." -ForegroundColor Yellow

$installStart = Get-Date
npm install --production=false
$installEnd = Get-Date
$installDuration = ($installEnd - $installStart).TotalSeconds

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed ($([math]::Round($installDuration, 2))s)" -ForegroundColor Green
Write-Host ""

# Step 4: Generate Prisma Client
Write-Host "[4/8] Generating Prisma Client..." -ForegroundColor Yellow

npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma generate failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Step 5: Build Production
Write-Host "[5/8] Building Production Application..." -ForegroundColor Yellow
Write-Host "This may take 2-5 minutes..." -ForegroundColor Cyan

$env:NODE_ENV = "production"
$buildStart = Get-Date
npm run build
$buildEnd = Get-Date
$buildDuration = ($buildEnd - $buildStart).TotalSeconds

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build completed successfully ($([math]::Round($buildDuration, 2))s)" -ForegroundColor Green
Write-Host ""

# Step 6: Create Deployment Package
Write-Host "[6/8] Creating Deployment Package..." -ForegroundColor Yellow

# Remove old deployment package
if (Test-Path "$DEPLOYMENT_PACKAGE") {
    Remove-Item "$DEPLOYMENT_PACKAGE" -Recurse -Force
}

# Create deployment directory
New-Item -ItemType Directory -Path "$DEPLOYMENT_PACKAGE" -Force | Out-Null

# Copy necessary files
Write-Host "Copying files to deployment package..." -ForegroundColor Cyan

# Core files
Copy-Item "$BUILD_DIR" "$DEPLOYMENT_PACKAGE\.next" -Recurse -Force
Copy-Item "$PROJECT_ROOT\public" "$DEPLOYMENT_PACKAGE\public" -Recurse -Force
Copy-Item "$PROJECT_ROOT\prisma" "$DEPLOYMENT_PACKAGE\prisma" -Recurse -Force
Copy-Item "$PROJECT_ROOT\package.json" "$DEPLOYMENT_PACKAGE\package.json" -Force
Copy-Item "$PROJECT_ROOT\package-lock.json" "$DEPLOYMENT_PACKAGE\package-lock.json" -Force
Copy-Item "$PROJECT_ROOT\next.config.js" "$DEPLOYMENT_PACKAGE\next.config.js" -Force
Copy-Item "$PROJECT_ROOT\.env.production" "$DEPLOYMENT_PACKAGE\.env" -Force

# Create .htaccess for Apache servers
$htaccessContent = @"
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Disable directory browsing
Options -Indexes

# Block access to sensitive files
<FilesMatch "^\.env|\.git|package\.json|next\.config\.js|prisma">
  Order allow,deny
  Deny from all
</FilesMatch>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
"@

Set-Content -Path "$DEPLOYMENT_PACKAGE\.htaccess" -Value $htaccessContent

# Calculate package size
$packageSize = (Get-ChildItem "$DEPLOYMENT_PACKAGE" -Recurse | Measure-Object -Property Length -Sum).Sum
$packageSizeMB = [math]::Round($packageSize / 1MB, 2)

Write-Host "✓ Deployment package created: $packageSizeMB MB" -ForegroundColor Green
Write-Host ""

# Step 7: Create Deployment Instructions
Write-Host "[7/8] Generating Deployment Instructions..." -ForegroundColor Yellow

$deployInstructions = @"
============================================
DEPLOYMENT PACKAGE READY
============================================

Package Location: $DEPLOYMENT_PACKAGE
Package Size: $packageSizeMB MB
Build Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

============================================
UPLOAD INSTRUCTIONS
============================================

1. CONNECT TO FTP:
   - Host: [Your FTP Host]
   - Username: [Your FTP Username]
   - Password: [Your FTP Password]
   - Port: 21 (FTP) or 22 (SFTP)

2. BACKUP EXISTING SITE:
   - Download all files from /public_html/ to local backup
   - Verify backup is complete before proceeding

3. UPLOAD DEPLOYMENT PACKAGE:
   
   Upload these files from "$DEPLOYMENT_PACKAGE":
   
   Required:
   /.next/              (entire folder - largest, ~50-200 MB)
   /public/             (entire folder)
   /prisma/             (schema.prisma file)
   package.json
   package-lock.json
   next.config.js
   .env                 (IMPORTANT: renamed from .env.production)
   .htaccess            (for Apache servers)
   
   Optional (if NOT installing on server):
   /node_modules/       (entire folder - very large, ~200+ MB)

4. INSTALL DEPENDENCIES ON SERVER:
   
   If you did NOT upload node_modules:
   
   Via SSH:
   cd /public_html/
   npm install --production
   npx prisma generate
   
   OR via cPanel Terminal

5. START APPLICATION:
   
   Method A: cPanel Node.js Manager
   - Setup Node.js App → Create Application
   - Node Version: 18+
   - Application Root: /public_html/
   - Startup File: node_modules/next/dist/bin/next start
   - Click "Create"
   
   Method B: PM2 (via SSH)
   pm2 start npm --name "innov8-production" -- start
   pm2 save
   pm2 startup

6. VERIFY DEPLOYMENT:
   - Visit: https://[YOUR-DOMAIN].com
   - Test all pages
   - Check admin login
   - Test database operations
   - Verify SSL (HTTPS)

============================================
SECURITY CHECKLIST
============================================

[ ] Change FTP password after deployment
[ ] Set file permissions: chmod 600 .env
[ ] Verify MongoDB IP whitelist updated
[ ] Enable SSL certificate
[ ] Test all authentication flows
[ ] Verify email notifications work

============================================
TROUBLESHOOTING
============================================

Issue: 503 Service Unavailable
→ Check if Node.js app is running in cPanel

Issue: Database connection failed
→ Verify MongoDB Atlas IP whitelist

Issue: Images not loading
→ Check Cloudinary credentials in .env

Issue: Can't login
→ Verify NEXTAUTH_URL in .env matches domain

============================================
SUPPORT
============================================

MongoDB Atlas: https://cloud.mongodb.com
Cloudinary: https://cloudinary.com/console
Deployment Guide: DEPLOYMENT_GUIDE_COMPLETE.md

============================================
"@

Set-Content -Path "$DEPLOYMENT_PACKAGE\DEPLOYMENT_INSTRUCTIONS.txt" -Value $deployInstructions

Write-Host "✓ Instructions created: $DEPLOYMENT_PACKAGE\DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Green
Write-Host ""

# Step 8: Summary
Write-Host "[8/8] Deployment Package Summary" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Package Location: $DEPLOYMENT_PACKAGE" -ForegroundColor White
Write-Host "Package Size: $packageSizeMB MB" -ForegroundColor White
Write-Host "Files to Upload: ~$((Get-ChildItem "$DEPLOYMENT_PACKAGE" -Recurse | Measure-Object).Count) files/folders" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Read: $DEPLOYMENT_PACKAGE\DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor White
Write-Host "2. Connect to FTP and backup existing site" -ForegroundColor White
Write-Host "3. Upload deployment package files" -ForegroundColor White
Write-Host "4. Install dependencies on server (if needed)" -ForegroundColor White
Write-Host "5. Start Node.js application" -ForegroundColor White
Write-Host "6. Verify deployment and test all features" -ForegroundColor White
Write-Host ""
Write-Host "Full Guide: DEPLOYMENT_GUIDE_COMPLETE.md" -ForegroundColor Cyan
Write-Host "Quick Start: DEPLOYMENT_QUICK_START.md" -ForegroundColor Cyan
Write-Host ""

# Optional: Open deployment package folder
$openFolder = Read-Host "Open deployment package folder? (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Invoke-Item "$DEPLOYMENT_PACKAGE"
}

# Optional: Create ZIP file
$createZip = Read-Host "Create ZIP archive for easy upload? (Y/N)"
if ($createZip -eq "Y" -or $createZip -eq "y") {
    Write-Host ""
    Write-Host "Creating ZIP archive..." -ForegroundColor Yellow
    
    $zipPath = "$PROJECT_ROOT\innov8-production-deployment.zip"
    
    # Remove old zip if exists
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }
    
    # Create ZIP
    Compress-Archive -Path "$DEPLOYMENT_PACKAGE\*" -DestinationPath $zipPath -Force
    
    $zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    
    Write-Host "✓ ZIP created: $zipPath ($zipSize MB)" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now upload this single ZIP file and extract on server" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DEPLOYMENT SCRIPT COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# End of script
