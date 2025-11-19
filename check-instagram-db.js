/**
 * Check Instagram posts in database
 * Run: node check-instagram-db.js
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking Instagram posts in database...\n');

  try {
    const posts = await prisma.instagramPost.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    console.log(`📊 Total Instagram posts in database: ${posts.length}\n`);

    if (posts.length === 0) {
      console.log('❌ No Instagram posts found in database!');
      console.log('\n💡 Action Required:');
      console.log('1. Go to: /admin/dashboard/instagram');
      console.log('2. Click "Sync Now" button');
      console.log('3. Wait for sync to complete');
      console.log('4. Run this script again');
      return;
    }

    const images = posts.filter(p => p.mediaType === 'IMAGE');
    const videos = posts.filter(p => p.mediaType === 'VIDEO');
    const carousels = posts.filter(p => p.mediaType === 'CAROUSEL_ALBUM');

    console.log('📸 Images:', images.length);
    console.log('🎥 Videos:', videos.length);
    console.log('📦 Carousels:', carousels.length);
    console.log('\n─'.repeat(60));

    // Show video details
    if (videos.length > 0) {
      console.log('\n🎥 VIDEO POSTS:\n');
      videos.forEach((video, idx) => {
        console.log(`${idx + 1}. Instagram ID: ${video.instagramId}`);
        console.log(`   Caption: ${video.caption?.substring(0, 50) || 'No caption'}...`);
        console.log(`   Media URL: ${video.mediaUrl}`);
        console.log(`   Thumbnail: ${video.thumbnailUrl}`);
        console.log(`   Active: ${video.active}`);
        console.log(`   Timestamp: ${video.timestamp}`);
        console.log('');
      });

      // Check if URLs are from Cloudinary
      const cloudinaryVideos = videos.filter(v => v.mediaUrl.includes('cloudinary'));
      console.log(`✅ Videos uploaded to Cloudinary: ${cloudinaryVideos.length}/${videos.length}`);
      
      if (cloudinaryVideos.length < videos.length) {
        console.log('⚠️ Some videos are still using Instagram URLs');
        console.log('   They need to be synced again or imported');
      }
    } else {
      console.log('\n⚠️ No VIDEO type posts found in database');
      console.log('   This could mean:');
      console.log('   - Instagram account has no video posts');
      console.log('   - Videos are in carousels (check above)');
      console.log('   - Sync filtered out videos');
    }

    // Show image details (first 5)
    if (images.length > 0) {
      console.log(`\n📸 IMAGE POSTS (showing first 5 of ${images.length}):\n`);
      images.slice(0, 5).forEach((img, idx) => {
        console.log(`${idx + 1}. Instagram ID: ${img.instagramId}`);
        console.log(`   Caption: ${img.caption?.substring(0, 50) || 'No caption'}...`);
        console.log(`   Media URL: ${img.mediaUrl?.substring(0, 80)}...`);
        console.log(`   In Cloudinary: ${img.mediaUrl.includes('cloudinary') ? '✅' : '❌'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
