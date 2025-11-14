import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postIds, type } = body; // type: 'photos' or 'videos' or undefined for all

    // Get Instagram posts from database
    const instagramPosts = await prisma.instagramPost.findMany({
      where: postIds ? { id: { in: postIds } } : { active: true },
      orderBy: { timestamp: 'desc' },
    });

    if (instagramPosts.length === 0) {
      return NextResponse.json(
        { error: 'No Instagram posts found to import' },
        { status: 404 }
      );
    }

    console.log(`📤 Importing ${instagramPosts.length} Instagram posts...`);

    let importedPhotos = 0;
    let importedVideos = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const post of instagramPosts) {
      try {
        const isVideo = post.mediaType === 'VIDEO';
        
        // Skip based on type filter
        if (type === 'photos' && isVideo) {
          skipped++;
          continue;
        }
        if (type === 'videos' && !isVideo) {
          skipped++;
          continue;
        }

        // Check if already imported to Photos
        const existingPhoto = await prisma.image.findFirst({
          where: { tags: { has: `instagram:${post.instagramId}` } },
        });

        // Check if already imported to Videos
        const existingVideo = await prisma.video.findFirst({
          where: { tags: { has: `instagram:${post.instagramId}` } },
        });

        if (existingPhoto || existingVideo) {
          console.log(`⏭️ Skipping ${post.instagramId} - already imported`);
          skipped++;
          continue;
        }

        // Upload to Cloudinary if not already uploaded
        let cloudinaryUrl = post.mediaUrl;
        let cloudinaryThumbnail = post.thumbnailUrl;
        
        if (!post.mediaUrl.includes('cloudinary')) {
          console.log(`📤 Uploading ${post.mediaType} ${post.instagramId} to Cloudinary...`);
          
          const urlToUpload = isVideo ? post.thumbnailUrl : post.mediaUrl;
          const uploadResult = await cloudinary.uploader.upload(urlToUpload || '', {
            folder: 'aminoss_portfolio/instagram',
            resource_type: 'image',
            transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
          });
          
          cloudinaryUrl = uploadResult.secure_url;
          cloudinaryThumbnail = uploadResult.secure_url.replace(
            '/upload/',
            '/upload/w_800,h_800,c_fill,q_90,f_auto/'
          );
          
          // Update Instagram post with Cloudinary URL
          await prisma.instagramPost.update({
            where: { id: post.id },
            data: {
              mediaUrl: cloudinaryUrl,
              thumbnailUrl: cloudinaryThumbnail,
            },
          });
        }

        // Extract title from caption
        const title = post.caption
          ? post.caption.substring(0, 50).trim() + (post.caption.length > 50 ? '...' : '')
          : `Instagram ${isVideo ? 'Video' : 'Photo'} ${new Date(post.timestamp).toLocaleDateString()}`;

        if (isVideo) {
          // Import to Videos section
          await prisma.video.create({
            data: {
              cloudinaryId: post.instagramId,
              url: post.mediaUrl, // Original video URL
              thumbnailUrl: cloudinaryThumbnail,
              title: title,
              description: post.caption || '',
              category: 'Instagram',
              tags: ['Instagram', `instagram:${post.instagramId}`],
              duration: 0,
              featured: false,
              showOnHomepage: true,
              order: 0,
            },
          });
          importedVideos++;
          console.log(`✅ Imported video ${post.instagramId}`);
        } else {
          // Import to Photos section
          await prisma.image.create({
            data: {
              cloudinaryId: post.instagramId,
              url: cloudinaryUrl,
              thumbnailUrl: cloudinaryThumbnail,
              title: title,
              description: post.caption || '',
              category: 'Instagram',
              tags: ['Instagram', `instagram:${post.instagramId}`],
              width: 1080,
              height: 1080,
              format: 'jpg',
              featured: false,
              showOnHomepage: true,
              showInGallery: true,
              order: 0,
            },
          });
          importedPhotos++;
          console.log(`✅ Imported photo ${post.instagramId}`);
        }
      } catch (error: any) {
        console.error(`❌ Error importing ${post.instagramId}:`, error);
        errors.push(`${post.instagramId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${importedPhotos} photos and ${importedVideos} videos, skipped ${skipped}`,
      stats: {
        importedPhotos,
        importedVideos,
        imported: importedPhotos + importedVideos,
        skipped,
        total: instagramPosts.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Instagram import error:', error);
    return NextResponse.json(
      { error: 'Failed to import Instagram posts', details: error.message },
      { status: 500 }
    );
  }
}
