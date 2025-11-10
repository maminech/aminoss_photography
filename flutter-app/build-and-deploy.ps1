# 🚀 Flutter App - One-Click Build & Deploy

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   AMINOSS PHOTOGRAPHY - FLUTTER APP   ║" -ForegroundColor Cyan
Write-Host "║        BUILD & DEPLOY SCRIPT          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Check if Flutter is installed
Write-Host "🔍 Checking Flutter installation..." -ForegroundColor Yellow
try {
    $flutterVersion = flutter --version 2>&1 | Select-String "Flutter"
    if ($flutterVersion) {
        Write-Host "✅ Flutter is installed!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Flutter is not installed!" -ForegroundColor Red
    Write-Host "`nPlease install Flutter first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://docs.flutter.dev/get-started/install/windows" -ForegroundColor White
    Write-Host "2. Extract to C:\flutter" -ForegroundColor White
    Write-Host "3. Add C:\flutter\bin to PATH" -ForegroundColor White
    Write-Host "4. Restart PowerShell and run this script again`n" -ForegroundColor White
    exit 1
}

# Navigate to Flutter app directory
Write-Host "`n📂 Navigating to Flutter app directory..." -ForegroundColor Yellow
Set-Location "E:\aminoss photography\flutter-app"

# Install dependencies
Write-Host "`n📦 Installing Flutter dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes...`n" -ForegroundColor Gray
flutter pub get

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed!" -ForegroundColor Green

# Build APK
Write-Host "`n🔨 Building Android APK (Release)..." -ForegroundColor Yellow
Write-Host "This will take 3-5 minutes...`n" -ForegroundColor Gray
flutter build apk --release

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "1. Run: flutter clean" -ForegroundColor White
    Write-Host "2. Run: flutter pub get" -ForegroundColor White
    Write-Host "3. Try building again`n" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ Build successful!" -ForegroundColor Green

# Copy APK to public folder
Write-Host "`n📋 Copying APK to website downloads folder..." -ForegroundColor Yellow
$apkSource = "E:\aminoss photography\flutter-app\build\app\outputs\flutter-apk\app-release.apk"
$apkDest = "E:\aminoss photography\public\downloads\aminoss-photography.apk"

if (Test-Path $apkSource) {
    Copy-Item $apkSource -Destination $apkDest -Force
    Write-Host "✅ APK copied successfully!" -ForegroundColor Green
    
    # Get file size
    $fileSize = (Get-Item $apkDest).Length / 1MB
    Write-Host ("   Size: {0:N2} MB" -f $fileSize) -ForegroundColor Gray
} else {
    Write-Host "❌ APK not found at expected location!" -ForegroundColor Red
    exit 1
}

# Ask if user wants to deploy
Write-Host "`n🚀 Do you want to deploy to Vercel now?" -ForegroundColor Yellow
Write-Host "   This will make the app downloadable from your website." -ForegroundColor Gray
$deploy = Read-Host "Deploy? (y/n)"

if ($deploy -eq 'y' -or $deploy -eq 'Y') {
    Write-Host "`n🌐 Deploying to Vercel Production..." -ForegroundColor Yellow
    Set-Location "E:\aminoss photography"
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`nℹ️  Skipping deployment. You can deploy later with:" -ForegroundColor Yellow
    Write-Host "   cd 'E:\aminoss photography'" -ForegroundColor White
    Write-Host "   vercel --prod`n" -ForegroundColor White
}

# Success summary
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          BUILD SUCCESSFUL!             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📱 APK Location:" -ForegroundColor Cyan
Write-Host "   $apkDest`n" -ForegroundColor White

Write-Host "🌐 Download Page:" -ForegroundColor Cyan
Write-Host "   https://aminossphotography-...vercel.app/download-app`n" -ForegroundColor White

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test the APK on your Android phone" -ForegroundColor White
Write-Host "   2. Share the download page link with users" -ForegroundColor White
Write-Host "   3. Users can download and install directly`n" -ForegroundColor White

Write-Host "🎉 Your app is ready to distribute!" -ForegroundColor Green
Write-Host ""
