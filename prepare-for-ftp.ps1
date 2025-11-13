# INNOV8.TN - Deployment Package Preparation Script
# This script prepares all necessary files for FTP upload to innov8.tn

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  INNOV8.TN - DEPLOYMENT PACKAGE PREPARATION" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Set variables
$projectPath = "e:\aminoss photography"
$deploymentPath = "$projectPath\deployment_package"
$buildPath = "$projectPath\.next"

# Check if build exists
if (-not (Test-Path $buildPath)) {
    Write-Host "ERROR: Build not found!" -ForegroundColor Red
    Write-Host "Please run: npm run build" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Build found" -ForegroundColor Green

# Create deployment folder structure
Write-Host ""
Write-Host "Creating deployment folder structure..." -ForegroundColor Cyan

$folders = @(
    "$deploymentPath\server_upload",
    "$deploymentPath\server_upload\.next",
    "$deploymentPath\server_upload\public",
    "$deploymentPath\server_upload\prisma",
    "$deploymentPath\server_upload\node_modules",
    "$deploymentPath\instructions"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "  Created: $folder" -ForegroundColor Gray
    }
}

Write-Host "Folder structure created" -ForegroundColor Green

# Copy essential files
Write-Host ""
Write-Host "Copying essential files..." -ForegroundColor Cyan

$essentialFiles = @(
    "package.json",
    "next.config.js",
    ".env.production"
)

foreach ($file in $essentialFiles) {
    if (Test-Path "$projectPath\$file") {
        Copy-Item "$projectPath\$file" "$deploymentPath\server_upload\" -Force
        Write-Host "  Copied: $file" -ForegroundColor Gray
    } else {
        Write-Host "  Missing: $file" -ForegroundColor Yellow
    }
}

Write-Host "Essential files copied" -ForegroundColor Green

# Copy build output
Write-Host ""
Write-Host "Copying build output (.next folder)..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

Copy-Item "$projectPath\.next\*" "$deploymentPath\server_upload\.next\" -Recurse -Force

Write-Host "Build output copied" -ForegroundColor Green

# Copy public folder
Write-Host ""
Write-Host "Copying public assets..." -ForegroundColor Cyan

Copy-Item "$projectPath\public\*" "$deploymentPath\server_upload\public\" -Recurse -Force

Write-Host "Public assets copied" -ForegroundColor Green

# Copy prisma folder
Write-Host ""
Write-Host "Copying Prisma schema..." -ForegroundColor Cyan

Copy-Item "$projectPath\prisma\*" "$deploymentPath\server_upload\prisma\" -Recurse -Force

Write-Host "Prisma schema copied" -ForegroundColor Green

# Copy Prisma client
Write-Host ""
Write-Host "Copying Prisma client..." -ForegroundColor Cyan

if (Test-Path "$projectPath\node_modules\@prisma") {
    $prismaPath = "$deploymentPath\server_upload\node_modules\@prisma"
    New-Item -ItemType Directory -Force -Path $prismaPath | Out-Null
    Copy-Item "$projectPath\node_modules\@prisma\*" $prismaPath -Recurse -Force
    Write-Host "Prisma client copied" -ForegroundColor Green
} else {
    Write-Host "Prisma client not found - will be installed on server" -ForegroundColor Yellow
}

# Copy .prisma folder
if (Test-Path "$projectPath\node_modules\.prisma") {
    $prismaGeneratedPath = "$deploymentPath\server_upload\node_modules\.prisma"
    New-Item -ItemType Directory -Force -Path $prismaGeneratedPath | Out-Null
    Copy-Item "$projectPath\node_modules\.prisma\*" $prismaGeneratedPath -Recurse -Force
    Write-Host "Generated Prisma client copied" -ForegroundColor Green
}

# Rename .env.production to .env
Write-Host ""
Write-Host "Preparing environment file..." -ForegroundColor Cyan

if (Test-Path "$deploymentPath\server_upload\.env.production") {
    Move-Item "$deploymentPath\server_upload\.env.production" "$deploymentPath\server_upload\.env" -Force
    Write-Host ".env.production renamed to .env" -ForegroundColor Green
}

# Copy package-lock.json
if (Test-Path "$projectPath\package-lock.json") {
    Copy-Item "$projectPath\package-lock.json" "$deploymentPath\server_upload\" -Force
    Write-Host "package-lock.json copied" -ForegroundColor Green
}

# Calculate package size
Write-Host ""
Write-Host "Calculating package size..." -ForegroundColor Cyan

$packageSize = (Get-ChildItem "$deploymentPath\server_upload" -Recurse | Measure-Object -Property Length -Sum).Sum
$packageSizeMB = [math]::Round($packageSize / 1MB, 2)

Write-Host "Package size: $packageSizeMB MB" -ForegroundColor Green

# Count files
$fileCount = (Get-ChildItem "$deploymentPath\server_upload" -Recurse -File).Count

Write-Host "Total files: $fileCount" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT PACKAGE READY!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

Write-Host "PACKAGE LOCATION:" -ForegroundColor Cyan
Write-Host "  $deploymentPath\server_upload\" -ForegroundColor White
Write-Host ""

Write-Host "PACKAGE STATISTICS:" -ForegroundColor Cyan
Write-Host "  Size: $packageSizeMB MB" -ForegroundColor White
Write-Host "  Files: $fileCount" -ForegroundColor White
Write-Host ""

Write-Host "WHAT'S INCLUDED:" -ForegroundColor Cyan
Write-Host "  + .next/                 (Build output)" -ForegroundColor White
Write-Host "  + public/                (Static assets)" -ForegroundColor White
Write-Host "  + prisma/                (Database schema)" -ForegroundColor White
Write-Host "  + node_modules/@prisma/  (Prisma client)" -ForegroundColor White
Write-Host "  + package.json           (Dependencies)" -ForegroundColor White
Write-Host "  + next.config.js         (Configuration)" -ForegroundColor White
Write-Host "  + .env                   (Environment)" -ForegroundColor White
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Read: deployment_package\UPLOAD_INSTRUCTIONS.txt" -ForegroundColor White
Write-Host "  2. Backup your existing WordPress site via FTP" -ForegroundColor White
Write-Host "  3. Upload server_upload\ folder to your server" -ForegroundColor White
Write-Host "  4. SSH into server and run: npm install --production" -ForegroundColor White
Write-Host "  5. Run: npx prisma generate" -ForegroundColor White
Write-Host "  6. Run: npm start (or use PM2)" -ForegroundColor White
Write-Host "  7. Configure web server reverse proxy" -ForegroundColor White
Write-Host "  8. Setup SSL certificate" -ForegroundColor White
Write-Host "  9. Test: https://innov8.tn" -ForegroundColor White
Write-Host ""

Write-Host "IMPORTANT REMINDERS:" -ForegroundColor Yellow
Write-Host "  - Verify hosting supports Node.js v18+" -ForegroundColor White
Write-Host "  - Backup WordPress before uploading" -ForegroundColor White
Write-Host "  - Upload to separate folder (e.g., /aminoss_app/)" -ForegroundColor White
Write-Host "  - Install dependencies on server" -ForegroundColor White
Write-Host "  - Configure reverse proxy for port 3000" -ForegroundColor White
Write-Host ""

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "  Need help? Check UPLOAD_INSTRUCTIONS.txt" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""
