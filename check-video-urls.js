// Script to check what URLs are stored for videos
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function checkVideoUrls() {
  console.log('🔍 Checking video URLs in database...\n');

  try {
    // Check videos in Video table
    const videos = await prisma.video.findMany({
      where: {
        tags: {
          hasSome: ['Instagram']
        }
      },
      select: {
        id: true,
        title: true,
        url: true,
        thumbnailUrl: true,
        cloudinaryId: true,
        category: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📹 Found ${videos.length} Instagram videos in Video table:\n`);

    if (videos.length > 0) {
      videos.forEach((video, index) => {
        console.log(`${index + 1}. ${video.title}`);
        console.log(`   ID: ${video.id}`);
        console.log(`   Cloudinary ID: ${video.cloudinaryId}`);
        console.log(`   Video URL: ${video.url}`);
        console.log(`   Thumbnail URL: ${video.thumbnailUrl}`);
        console.log(`   Category: ${video.category}`);
        console.log(`   Tags: ${video.tags.join(', ')}`);
        
        // Check if URL is from Cloudinary
        const isCloudinary = video.url.includes('cloudinary.com');
        const urlDomain = isCloudinary ? '✅ Cloudinary' : '❌ Instagram (not uploaded)';
        console.log(`   Status: ${urlDomain}\n`);
      });

      // Summary
      const cloudinaryCount = videos.filter(v => v.url.includes('cloudinary.com')).length;
      const instagramCount = videos.filter(v => !v.url.includes('cloudinary.com')).length;
      
      console.log('📊 Summary:');
      console.log(`   ✅ Uploaded to Cloudinary: ${cloudinaryCount}`);
      console.log(`   ❌ Still using Instagram URLs: ${instagramCount}`);
    } else {
      console.log('❌ No Instagram videos found in Video table');
    }

    // Also check InstagramPost table
    console.log('\n' + '='.repeat(60) + '\n');
    
    const instagramPosts = await prisma.instagramPost.findMany({
      where: {
        mediaType: 'VIDEO',
      },
      select: {
        id: true,
        instagramId: true,
        caption: true,
        mediaUrl: true,
        thumbnailUrl: true,
        mediaType: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    console.log(`📱 Found ${instagramPosts.length} videos in InstagramPost table:\n`);

    if (instagramPosts.length > 0) {
      instagramPosts.forEach((post, index) => {
        const caption = post.caption ? post.caption.substring(0, 50) + '...' : 'No caption';
        console.log(`${index + 1}. Instagram ID: ${post.instagramId}`);
        console.log(`   Caption: ${caption}`);
        console.log(`   Video URL: ${post.mediaUrl}`);
        console.log(`   Thumbnail URL: ${post.thumbnailUrl}`);
        
        // Check if URL is from Cloudinary
        const isCloudinary = post.mediaUrl.includes('cloudinary.com');
        const urlDomain = isCloudinary ? '✅ Cloudinary' : '❌ Instagram (not uploaded)';
        console.log(`   Status: ${urlDomain}\n`);
      });

      // Summary
      const cloudinaryCount = instagramPosts.filter(p => p.mediaUrl.includes('cloudinary.com')).length;
      const instagramCount = instagramPosts.filter(p => !p.mediaUrl.includes('cloudinary.com')).length;
      
      console.log('📊 Summary:');
      console.log(`   ✅ Uploaded to Cloudinary: ${cloudinaryCount}`);
      console.log(`   ❌ Still using Instagram URLs: ${instagramCount}`);
    } else {
      console.log('❌ No videos found in InstagramPost table');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideoUrls();
