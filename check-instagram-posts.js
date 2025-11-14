const { PrismaClient } = require('@prisma/client');

async function checkPosts() {
  const prisma = new PrismaClient();
  try {
    const posts = await prisma.instagramPost.findMany({
      select: {
        id: true,
        instagramId: true,
        caption: true,
        mediaUrl: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'desc' },
    });
    
    console.log(`\n📊 Found ${posts.length} Instagram posts in database:\n`);
    posts.forEach((post, idx) => {
      console.log(`${idx + 1}. ${post.instagramId}`);
      console.log(`   Caption: ${post.caption?.substring(0, 50) || 'No caption'}...`);
      console.log(`   URL: ${post.mediaUrl.substring(0, 60)}...`);
      console.log(`   Cloudinary: ${post.mediaUrl.includes('cloudinary') ? '✅' : '❌'}`);
      console.log('');
    });
  } finally {
    await prisma.$disconnect();
  }
}

checkPosts();
