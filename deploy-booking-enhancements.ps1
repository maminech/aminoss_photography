# Deployment Script for Booking Enhancements
# Run this script to deploy the new booking features

Write-Host "🚀 Booking System Enhancements - Deployment Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Regenerate Prisma Client
Write-Host "Step 1: Regenerating Prisma Client..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure your dev server is stopped!" -ForegroundColor Red
Read-Host "Press Enter to continue or Ctrl+C to cancel" | Out-Null

try {
    npx prisma generate
    Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    Write-Host "Make sure to stop the dev server first!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Push schema changes to database
Write-Host "Step 2: Pushing schema changes to database..." -ForegroundColor Yellow
try {
    npx prisma db push
    Write-Host "✅ Database schema updated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push schema changes" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Build and deploy to Vercel
Write-Host "Step 3: Deploying to Vercel..." -ForegroundColor Yellow
$deploy = Read-Host "Deploy to production now? (y/n)"

if ($deploy -eq "y" -or $deploy -eq "Y") {
    try {
        vercel --prod
        Write-Host "✅ Deployed to production successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  Skipped deployment" -ForegroundColor Blue
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✨ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's New:" -ForegroundColor Cyan
Write-Host "  • Email field is now optional in booking form" -ForegroundColor White
Write-Host "  • Clients can submit multiple bookings" -ForegroundColor White
Write-Host "  • Admin panel shows grouped bookings by client" -ForegroundColor White
Write-Host "  • Click any booking to view full details" -ForegroundColor White
Write-Host "  • Approve/Reject/Pending action buttons" -ForegroundColor White
Write-Host "  • Auto-sync to calendar on approval" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full documentation: BOOKING_ENHANCEMENTS_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 To restart dev server: npm run dev" -ForegroundColor Yellow
