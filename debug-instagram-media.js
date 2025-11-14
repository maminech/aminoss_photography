const INSTAGRAM_USER_ID = '25647122651552556';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

async function debugInstagramMedia() {
  try {
    console.log('🔍 Debugging Instagram Media Access...\n');
    
    // Test 1: Get user profile info
    console.log('1️⃣ Checking user profile...');
    const profileUrl = `https://graph.instagram.com/${INSTAGRAM_USER_ID}?fields=id,username,media_count&access_token=${ACCESS_TOKEN}`;
    const profileRes = await fetch(profileUrl);
    const profile = await profileRes.json();
    console.log('Profile:', profile);
    console.log('Total media count:', profile.media_count, '\n');
    
    // Test 2: Fetch with detailed fields
    console.log('2️⃣ Fetching media with detailed fields...');
    const mediaUrl = `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,children{id,media_type,media_url}&limit=25&access_token=${ACCESS_TOKEN}`;
    const mediaRes = await fetch(mediaUrl);
    const media = await mediaRes.json();
    
    if (media.data) {
      console.log(`Found ${media.data.length} posts\n`);
      
      media.data.forEach((post, index) => {
        console.log(`\n📱 Post ${index + 1}:`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Type: ${post.media_type}`);
        console.log(`   URL: ${post.permalink}`);
        console.log(`   Media URL: ${post.media_url ? 'Available' : 'Not available'}`);
        console.log(`   Thumbnail: ${post.thumbnail_url ? 'Available' : 'Not available'}`);
        console.log(`   Caption: ${post.caption ? post.caption.substring(0, 50) + '...' : 'No caption'}`);
        
        if (post.children) {
          console.log(`   🎠 Children: ${post.children.data.length}`);
          post.children.data.forEach((child, childIndex) => {
            console.log(`      Child ${childIndex + 1}: ${child.media_type}`);
          });
        }
      });
      
      // Summary
      const typeCount = {};
      media.data.forEach(post => {
        typeCount[post.media_type] = (typeCount[post.media_type] || 0) + 1;
      });
      
      console.log('\n\n📊 Summary:');
      console.log('Media Types:', typeCount);
      
    } else {
      console.log('❌ Error:', media);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Load .env.local
require('dotenv').config({ path: '.env.local' });
debugInstagramMedia();
