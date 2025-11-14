// Test Instagram API to see if there are any carousel albums
const { PrismaClient } = require('@prisma/client');

async function checkForCarousels() {
  const prisma = new PrismaClient();
  
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings?.instagramAccessToken) {
      console.log('❌ No Instagram token found');
      return;
    }
    
    const accessToken = settings.instagramAccessToken;
    const userId = settings.instagramUserId;
    
    console.log('🔍 Checking for carousel albums...\n');
    
    const response = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${accessToken}`
    );
    
    const data = await response.json();
    const posts = data.data || [];
    
    console.log(`📊 Found ${posts.length} total posts\n`);
    
    const types = {};
    const carousels = [];
    
    posts.forEach((post, idx) => {
      types[post.media_type] = (types[post.media_type] || 0) + 1;
      
      if (post.media_type === 'CAROUSEL_ALBUM') {
        carousels.push(post);
        console.log(`\n🎠 CAROUSEL FOUND: ${post.id}`);
        console.log(`   Caption: ${post.caption?.substring(0, 60) || 'No caption'}...`);
        console.log(`   Permalink: ${post.permalink}`);
      }
    });
    
    console.log(`\n📈 Media Type Summary:`);
    Object.keys(types).forEach(type => {
      console.log(`  ${type}: ${types[type]}`);
    });
    
    if (carousels.length > 0) {
      console.log(`\n✅ Found ${carousels.length} carousel album(s)!`);
      console.log(`\nTesting children fetch for first carousel...`);
      
      const firstCarousel = carousels[0];
      const childrenResponse = await fetch(
        `https://graph.instagram.com/${firstCarousel.id}/children?fields=id,media_type,media_url,thumbnail_url&access_token=${accessToken}`
      );
      
      if (childrenResponse.ok) {
        const childrenData = await childrenResponse.json();
        console.log(`\n📸 Children in carousel ${firstCarousel.id}:`);
        childrenData.data.forEach((child, idx) => {
          console.log(`  ${idx + 1}. ${child.id} - ${child.media_type}`);
          console.log(`     URL: ${child.media_url?.substring(0, 60)}...`);
        });
      }
    } else {
      console.log(`\n⚠️ No carousel albums found in first 50 posts`);
      console.log(`Your Instagram account has only individual photos/videos`);
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

checkForCarousels();
