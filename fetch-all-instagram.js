const { PrismaClient } = require('@prisma/client');

async function fetchAllPosts() {
  const prisma = new PrismaClient();
  
  try {
    const settings = await prisma.siteSettings.findFirst();
    const accessToken = settings.instagramAccessToken;
    const userId = settings.instagramUserId;
    
    console.log('🔍 Fetching ALL Instagram posts (not just first 50)...\n');
    
    let allPosts = [];
    let nextUrl = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,children{id,media_type,media_url}&media_url,thumbnail_url,permalink,timestamp&limit=100&access_token=${accessToken}`;
    let pageCount = 0;
    
    while (nextUrl && pageCount < 5) { // Max 5 pages = 500 posts
      pageCount++;
      console.log(`📄 Fetching page ${pageCount}...`);
      
      const response = await fetch(nextUrl);
      const data = await response.json();
      
      if (data.data) {
        allPosts = allPosts.concat(data.data);
        console.log(`  Found ${data.data.length} posts on this page`);
        
        // Check for carousels on this page
        const carousels = data.data.filter(p => p.media_type === 'CAROUSEL_ALBUM');
        if (carousels.length > 0) {
          console.log(`  🎠 ${carousels.length} carousel(s) found!`);
        }
      }
      
      // Get next page URL
      nextUrl = data.paging?.next;
      if (!nextUrl) {
        console.log(`  ✓ No more pages\n`);
      }
    }
    
    console.log(`\n📊 Total posts fetched: ${allPosts.length}\n`);
    
    // Count by type
    const types = {};
    const carouselPosts = [];
    
    allPosts.forEach(post => {
      types[post.media_type] = (types[post.media_type] || 0) + 1;
      if (post.media_type === 'CAROUSEL_ALBUM') {
        carouselPosts.push(post);
      }
    });
    
    console.log('📈 Media Types:');
    Object.keys(types).forEach(type => {
      console.log(`  ${type}: ${types[type]}`);
    });
    
    if (carouselPosts.length > 0) {
      console.log(`\n🎠 Found ${carouselPosts.length} Carousel Albums:\n`);
      carouselPosts.slice(0, 5).forEach((post, idx) => {
        console.log(`${idx + 1}. ID: ${post.id}`);
        console.log(`   Caption: ${post.caption?.substring(0, 60) || 'No caption'}...`);
        console.log(`   Link: ${post.permalink}`);
        console.log(`   Date: ${post.timestamp}`);
        if (post.children?.data) {
          console.log(`   Children: ${post.children.data.length} items`);
          post.children.data.forEach((child, i) => {
            console.log(`     ${i+1}. ${child.media_type}`);
          });
        }
        console.log('');
      });
    } else {
      console.log(`\n❌ No carousel albums found in ${allPosts.length} posts`);
      console.log(`\nYour Instagram posts are:`)
      console.log(`  - ${types.VIDEO || 0} individual videos`);
      console.log(`  - ${types.IMAGE || 0} individual photos`);
      console.log(`\n💡 Carousel albums are posts with multiple photos/videos swiped together.`);
      console.log(`   If you don't have any, that's why they're not syncing!`);
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

fetchAllPosts();
