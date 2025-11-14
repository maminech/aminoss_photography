// Load environment variables
require('dotenv').config({ path: '.env.local' });

const INSTAGRAM_USER_ID = '25647122651552556';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

async function checkVideoCarousels() {
  try {
    console.log('🔍 Checking if VIDEO posts have children (photo frames)...\n');
    
    // Fetch all media
    const response = await fetch(
      `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}&limit=50&access_token=${ACCESS_TOKEN}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ Error:', data.error.message);
      return;
    }
    
    const posts = data.data || [];
    console.log(`📊 Total posts: ${posts.length}\n`);
    
    let videoWithChildren = 0;
    let videoWithoutChildren = 0;
    
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. Post ID: ${post.id}`);
      console.log(`   Type: ${post.media_type}`);
      console.log(`   URL: ${post.permalink}`);
      console.log(`   Caption: ${post.caption ? post.caption.substring(0, 50).replace(/\n/g, ' ') + '...' : 'No caption'}`);
      
      if (post.children) {
        console.log(`   ✅ HAS CHILDREN: ${post.children.data.length} items`);
        videoWithChildren++;
        
        post.children.data.forEach((child, childIndex) => {
          console.log(`      ${childIndex + 1}. ${child.media_type} - ${child.id}`);
          console.log(`         Media URL: ${child.media_url ? 'Available' : 'Not available'}`);
          console.log(`         Thumbnail: ${child.thumbnail_url ? 'Available' : 'Not available'}`);
        });
      } else {
        console.log(`   ❌ No children - Single video/reel`);
        videoWithoutChildren++;
      }
    });
    
    console.log('\n\n📈 SUMMARY:');
    console.log(`Total VIDEO posts: ${posts.length}`);
    console.log(`Video posts WITH children (photo carousels with music): ${videoWithChildren}`);
    console.log(`Video posts WITHOUT children (single reels): ${videoWithoutChildren}`);
    
    if (videoWithChildren > 0) {
      console.log('\n✅ Great! Your video posts with music DO have photo frames as children.');
      console.log('   We can extract these photos and save them separately!');
    } else {
      console.log('\n⚠️  None of your video posts have children (photo frames).');
      console.log('   They are single video reels, not photo carousels with music.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVideoCarousels();
