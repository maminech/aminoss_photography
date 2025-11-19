const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    console.log('\n🧹 Cleaning up old Cloudinary data from database...\n');
    
    // Count posts with old account
    const oldPosts = await prisma.instagramPost.findMany({
      where: {
        OR: [
          { mediaUrl: { contains: 'dc67gl8fu' } },
          { thumbnailUrl: { contains: 'dc67gl8fu' } },
        ],
      },
    });
    
    console.log(`❌ Found ${oldPosts.length} posts using old Cloudinary account (dc67gl8fu)`);
    
    if (oldPosts.length > 0) {
      console.log('\n🗑️  Deleting old posts...');
      const deleted = await prisma.instagramPost.deleteMany({
        where: {
          OR: [
            { mediaUrl: { contains: 'dc67gl8fu' } },
            { thumbnailUrl: { contains: 'dc67gl8fu' } },
          ],
        },
      });
      console.log(`✅ Deleted ${deleted.count} posts with old Cloudinary URLs`);
    }
    
    // Check for any other old references
    const allPosts = await prisma.instagramPost.findMany();
    console.log(`\n📊 Remaining Instagram posts: ${allPosts.length}`);
    
    if (allPosts.length > 0) {
      console.log('\nSample URLs:');
      allPosts.slice(0, 3).forEach(post => {
        console.log(`  - ${post.mediaUrl.substring(0, 80)}...`);
      });
    }
    
    // Check highlights
    const highlights = await prisma.instagramHighlight.findMany();
    const oldHighlights = highlights.filter(h => h.coverImage.includes('dc67gl8fu'));
    
    if (oldHighlights.length > 0) {
      console.log(`\n❌ Found ${oldHighlights.length} highlights with old Cloudinary URLs`);
      console.log('🗑️  Deleting old highlights...');
      await prisma.instagramHighlight.deleteMany({
        where: {
          coverImage: { contains: 'dc67gl8fu' },
        },
      });
      console.log('✅ Deleted old highlights');
    }
    
    console.log('\n✅ Cleanup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to Admin Dashboard → Instagram');
    console.log('   2. Click "Disconnect" Instagram');
    console.log('   3. Click "Connect" Instagram again');
    console.log('   4. Click "Sync Now" to fetch posts with new account\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
