const { PrismaClient } = require('@prisma/client');

async function checkMediaTypes() {
  const prisma = new PrismaClient();
  try {
    const posts = await prisma.instagramPost.findMany({
      select: {
        instagramId: true,
        mediaType: true,
        caption: true,
      },
      orderBy: { timestamp: 'desc' },
    });
    
    console.log(`\n📊 Instagram Posts Media Types:\n`);
    
    const types = {};
    posts.forEach((post, idx) => {
      types[post.mediaType] = (types[post.mediaType] || 0) + 1;
      console.log(`${idx + 1}. ${post.instagramId} - ${post.mediaType}`);
      if (post.caption) {
        console.log(`   ${post.caption.substring(0, 50)}...`);
      }
    });
    
    console.log(`\n📈 Summary:`);
    Object.keys(types).forEach(type => {
      console.log(`  ${type}: ${types[type]}`);
    });
  } finally {
    await prisma.$disconnect();
  }
}

checkMediaTypes();
