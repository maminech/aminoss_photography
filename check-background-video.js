const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBackgroundVideo() {
  try {
    const videos = await prisma.video.findMany({
      where: { backgroundVideo: true }
    });
    console.log('Background videos found:', videos.length);
    videos.forEach(v => {
      console.log(`- ${v.title} (ID: ${v.id}, backgroundVideo: ${v.backgroundVideo})`);
    });
    
    if (videos.length === 0) {
      console.log('\nNo background video set! You need to:');
      console.log('1. Go to Admin Dashboard > Videos & Reels');
      console.log('2. Edit a video');
      console.log('3. Check the "Use as background video" checkbox');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBackgroundVideo();
