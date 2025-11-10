# Aminoss Admin App - Build Script
# This script builds the Android APK and provides download link

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Aminoss Admin Mobile App Builder    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile app directory
Set-Location "e:\aminoss photography\mobile-admin-app"

# Check if EAS CLI is installed
Write-Host "🔍 Checking EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue
if (-not $easInstalled) {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
    Write-Host "✅ EAS CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ EAS CLI found!" -ForegroundColor Green
}

Write-Host ""

# Check if logged in
Write-Host "🔍 Checking Expo login status..." -ForegroundColor Yellow
$loginCheck = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Expo" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 You need to login first:" -ForegroundColor Yellow
    Write-Host "   1. Run: eas login" -ForegroundColor Cyan
    Write-Host "   2. Or create account at: https://expo.dev/signup" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
} else {
    Write-Host "✅ Logged in as: $loginCheck" -ForegroundColor Green
}

Write-Host ""

# Confirm build
Write-Host "🚀 Ready to build Android APK" -ForegroundColor Green
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  • Upload your app to Expo servers" -ForegroundColor White
Write-Host "  • Build Android APK (~25 MB)" -ForegroundColor White
Write-Host "  • Provide download link (valid 30 days)" -ForegroundColor White
Write-Host "  • Take approximately 5-10 minutes" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ Build cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔨 Starting build..." -ForegroundColor Cyan
Write-Host "⏳ This will take 5-10 minutes. Please wait..." -ForegroundColor Yellow
Write-Host ""

# Build APK
eas build --platform android --profile preview

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ BUILD COMPLETE!                   " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📥 Download link is shown above" -ForegroundColor Cyan
    Write-Host "📱 Share this link with admins" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Copy the download link from output above" -ForegroundColor White
    Write-Host "  2. Share with admins or host on your server" -ForegroundColor White
    Write-Host "  3. Update download page at /admin/mobile-app" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ❌ BUILD FAILED                      " -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  • Check internet connection" -ForegroundColor White
    Write-Host "  • Verify Expo account is active" -ForegroundColor White
    Write-Host "  • Check build logs: eas build:list" -ForegroundColor White
    Write-Host "  • Try running: eas build --platform android --profile preview" -ForegroundColor White
    Write-Host ""
}

pause
