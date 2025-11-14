// Load environment variables
require('dotenv').config({ path: '.env.local' });

const INSTAGRAM_USER_ID = '25647122651552556';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

async function fetchAllMedia() {
  try {
    console.log('🔍 Fetching ALL media from Instagram...\n');
    
    // Fetch media with pagination
    let allPosts = [];
    let nextUrl = `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}&limit=100&access_token=${ACCESS_TOKEN}`;
    
    let pageNum = 0;
    while (nextUrl && pageNum < 10) { // Limit to 10 pages for safety
      pageNum++;
      console.log(`📄 Fetching page ${pageNum}...`);
      
      const response = await fetch(nextUrl);
      const data = await response.json();
      
      if (data.error) {
        console.log('❌ Error:', data.error.message);
        break;
      }
      
      if (data.data) {
        console.log(`   Found ${data.data.length} posts on this page`);
        allPosts = allPosts.concat(data.data);
        
        // Show first few posts in detail
        if (pageNum === 1) {
          console.log('\n📸 First 5 posts in detail:\n');
          data.data.slice(0, 5).forEach((post, index) => {
            console.log(`${index + 1}. Type: ${post.media_type}`);
            console.log(`   ID: ${post.id}`);
            console.log(`   URL: ${post.permalink}`);
            console.log(`   Caption: ${post.caption ? post.caption.substring(0, 60).replace(/\n/g, ' ') + '...' : 'No caption'}`);
            if (post.children) {
              console.log(`   🎠 Has ${post.children.data.length} children:`);
              post.children.data.forEach((child, i) => {
                console.log(`      ${i + 1}. ${child.media_type}`);
              });
            }
            console.log('');
          });
        }
        
        nextUrl = data.paging?.next || null;
        if (nextUrl) {
          console.log('   ➡️ More pages available...\n');
        } else {
          console.log('   ✓ No more pages\n');
        }
      } else {
        break;
      }
    }
    
    // Analyze all posts
    console.log('\n📊 COMPLETE ANALYSIS:\n');
    console.log(`Total posts found: ${allPosts.length}\n`);
    
    const typeCount = {};
    const carouselPosts = [];
    const imagePosts = [];
    const videoPosts = [];
    
    allPosts.forEach(post => {
      typeCount[post.media_type] = (typeCount[post.media_type] || 0) + 1;
      
      if (post.media_type === 'CAROUSEL_ALBUM') {
        carouselPosts.push(post);
      } else if (post.media_type === 'IMAGE') {
        imagePosts.push(post);
      } else if (post.media_type === 'VIDEO') {
        videoPosts.push(post);
      }
    });
    
    console.log('📈 Media type breakdown:');
    Object.keys(typeCount).forEach(type => {
      console.log(`   ${type}: ${typeCount[type]}`);
    });
    
    if (carouselPosts.length > 0) {
      console.log(`\n🎠 Found ${carouselPosts.length} carousel albums:`);
      carouselPosts.forEach((post, i) => {
        console.log(`   ${i + 1}. ${post.children.data.length} items - ${post.permalink}`);
      });
    }
    
    if (imagePosts.length > 0) {
      console.log(`\n🖼️  Found ${imagePosts.length} single images`);
    }
    
    if (videoPosts.length > 0) {
      console.log(`\n🎥 Found ${videoPosts.length} videos (including Reels)`);
    }
    
    console.log('\n💡 NOTE: Instagram Reels appear as VIDEO type, even if they show a cover photo!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fetchAllMedia();
