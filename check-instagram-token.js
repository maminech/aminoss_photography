const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkToken() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    console.log('\n🔍 Instagram Token Check:');
    console.log('========================');
    
    if (!settings) {
      console.log('❌ No site settings found');
      return;
    }
    
    console.log(`✅ Instagram Connected: ${!!settings.instagramAccessToken}`);
    console.log(`✅ Instagram User ID: ${settings.instagramUserId || 'NOT SET'}`);
    console.log(`✅ Instagram Username: ${settings.instagramUsername || 'NOT SET'}`);
    
    if (settings.instagramAccessToken) {
      const tokenPreview = settings.instagramAccessToken.substring(0, 20) + '...';
      console.log(`✅ Access Token (preview): ${tokenPreview}`);
      console.log(`✅ Token Length: ${settings.instagramAccessToken.length} characters`);
      
      // Test the token
      console.log('\n🧪 Testing token with Instagram API...');
      const response = await fetch(
        `https://graph.instagram.com/${settings.instagramUserId}?fields=id,username,account_type&access_token=${settings.instagramAccessToken}`
      );
      
      console.log(`📡 API Response Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token is VALID');
        console.log(`   Username: ${data.username}`);
        console.log(`   Account Type: ${data.account_type}`);
        console.log(`   User ID: ${data.id}`);
        
        if (data.account_type !== 'BUSINESS') {
          console.log('\n⚠️  WARNING: Account type is not BUSINESS');
          console.log('   Feed posts require Instagram Business Account');
        }
      } else {
        const error = await response.json();
        console.log('❌ Token is INVALID or EXPIRED');
        console.log('   Error:', error);
      }
    } else {
      console.log('❌ No Instagram access token found');
      console.log('\n💡 To fix: Go to Admin Dashboard → Instagram → Connect Account');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkToken();
