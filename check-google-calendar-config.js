/**
 * Google Calendar Configuration Checker
 * 
 * Run this script to verify your Google Calendar OAuth setup
 * Usage: node check-google-calendar-config.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Checking Google Calendar Configuration...\n');

const config = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
};

let hasErrors = false;

// Check if all required variables are set
Object.entries(config).forEach(([key, value]) => {
  const isPlaceholder = value && (
    value.includes('your-') || 
    value.includes('here') ||
    value.length < 10
  );
  
  if (!value) {
    console.log(`❌ ${key}: NOT SET`);
    hasErrors = true;
  } else if (isPlaceholder) {
    console.log(`⚠️  ${key}: PLACEHOLDER (needs real value)`);
    hasErrors = true;
  } else {
    // Show partial value for security
    const preview = value.length > 30 
      ? value.substring(0, 30) + '...' 
      : value.substring(0, 10) + '...';
    console.log(`✅ ${key}: ${preview}`);
  }
});

console.log('\n');

if (hasErrors) {
  console.log('⚠️  Configuration incomplete!\n');
  console.log('📚 Follow these steps:\n');
  console.log('1. Read GOOGLE_CALENDAR_SETUP_GUIDE.md');
  console.log('2. Create Google Cloud Project');
  console.log('3. Enable Google Calendar API');
  console.log('4. Create OAuth 2.0 Credentials');
  console.log('5. Update .env.local with real credentials');
  console.log('6. Run this script again to verify\n');
  process.exit(1);
} else {
  console.log('✅ All Google Calendar credentials are configured!\n');
  
  // Validate format
  const clientIdValid = config.GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com');
  const redirectUriValid = config.GOOGLE_REDIRECT_URI.startsWith('http://') || 
                          config.GOOGLE_REDIRECT_URI.startsWith('https://');
  
  if (!clientIdValid) {
    console.log('⚠️  GOOGLE_CLIENT_ID format looks incorrect');
    console.log('   Expected format: xxxxxxxxx.apps.googleusercontent.com\n');
    hasErrors = true;
  }
  
  if (!redirectUriValid) {
    console.log('⚠️  GOOGLE_REDIRECT_URI must start with http:// or https://\n');
    hasErrors = true;
  }
  
  if (hasErrors) {
    console.log('⚠️  Please check the format of your credentials\n');
    process.exit(1);
  }
  
  console.log('🎉 Configuration looks good!\n');
  console.log('Next steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Visit: http://localhost:3000/admin/dashboard/calendar-integration');
  console.log('3. Click "Connecter Google Calendar"');
  console.log('4. Authorize the app\n');
  console.log('For production deployment:');
  console.log('1. Add these variables to Vercel environment variables');
  console.log('2. Update GOOGLE_REDIRECT_URI for production domain');
  console.log('3. Redeploy your application\n');
}
