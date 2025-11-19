const { PrismaClient } = require('@prisma/client');

async function testSync() {
  const prisma = new PrismaClient();
  
  try {
    // Get settings
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings?.instagramAccessToken) {
      console.log('❌ No Instagram token found');
      return;
    }
    
    console.log('✅ Token found:', settings.instagramAccessToken.substring(0, 20) + '...');
    console.log('✅ User ID:', settings.instagramUserId);
    
    const accessToken = settings.instagramAccessToken;
    const userId = settings.instagramUserId;
    
    // Fetch posts
    console.log('\n🔄 Fetching Instagram posts...');
    const url = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${accessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.log('❌ API Error:', data);
      return;
    }
    
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    const posts = data.data || [];
    console.log(`\n📸 Found ${posts.length} posts`);
    
    // Test uploading first post to Cloudinary
    if (posts.length > 0) {
      const firstPost = posts[0];
      console.log('\n📤 Testing Cloudinary upload for first post...');
      console.log('Media URL:', firstPost.media_url);
      console.log('Media Type:', firstPost.media_type);
      
      if (firstPost.media_type === 'IMAGE') {
        const formData = new FormData();
        formData.append('file', firstPost.media_url);
        formData.append('upload_preset', 'innov8_portfolio');
        formData.append('folder', 'innov8_portfolio/instagram');
        
        const uploadResponse = await fetch(
          'https://api.cloudinary.com/v1_1/dm22wlmpx/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );
        
        const uploadData = await uploadResponse.json();
        
        if (uploadResponse.ok) {
          console.log('✅ Cloudinary upload successful!');
          console.log('Secure URL:', uploadData.secure_url);
        } else {
          console.log('❌ Cloudinary upload failed:', uploadData);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSync();

