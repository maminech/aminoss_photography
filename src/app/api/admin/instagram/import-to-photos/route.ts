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
    const { postIds } = body; // Array of Instagram post IDs to import

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

    console.log(`📤 Importing ${instagramPosts.length} Instagram posts to Photos...`);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const post of instagramPosts) {
      try {
        // Skip if already imported (check by Instagram ID in tags)
        const existing = await prisma.image.findFirst({
          where: {
            tags: { has: `instagram:${post.instagramId}` },
          },
        });

        if (existing) {
          console.log(`⏭️ Skipping ${post.instagramId} - already imported`);
          skipped++;
          continue;
        }

        // Check if post has Cloudinary URL (uploaded during sync)
        if (!post.mediaUrl.includes('cloudinary')) {
          console.log(`⏭️ Skipping ${post.instagramId} - not uploaded to Cloudinary yet`);
          skipped++;
          continue;
        }

        // For videos, use the thumbnail URL; for images, use the media URL
        const urlToImport = post.mediaType === 'VIDEO' ? post.thumbnailUrl : post.mediaUrl;
        
        console.log(`📤 Importing ${post.mediaType} ${post.instagramId} to Photos...`);
        
        // The post is already on Cloudinary, just use that URL
        const uploadResult = {
          secure_url: urlToImport,
          public_id: urlToImport.split('/upload/')[1]?.split('.')[0] || post.instagramId,
          width: 1080,
          height: 1080,
          format: 'jpg',
        };

        // Use existing thumbnail URL or generate one
        const thumbnailUrl = post.thumbnailUrl.includes('cloudinary')
          ? post.thumbnailUrl
          : uploadResult.secure_url.replace('/upload/', '/upload/w_800,h_800,c_fill,q_90,f_auto/');

        // Extract title from caption (first 50 chars)
        const title = post.caption
          ? post.caption.substring(0, 50).trim() + (post.caption.length > 50 ? '...' : '')
          : `Instagram Post ${new Date(post.timestamp).toLocaleDateString()}`;

        // Create image in database
        await prisma.image.create({
          data: {
            cloudinaryId: uploadResult.public_id,
            url: uploadResult.secure_url,
            thumbnailUrl: thumbnailUrl,
            title: title,
            description: post.caption || '',
            category: 'Instagram',
            tags: ['Instagram', `instagram:${post.instagramId}`],
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            featured: false,
            showOnHomepage: true,
            showInGallery: true,
            order: 0,
          },
        });

        console.log(`✅ Imported ${post.instagramId}`);
        imported++;
      } catch (error: any) {
        console.error(`❌ Error importing ${post.instagramId}:`, error);
        errors.push(`${post.instagramId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} posts to Photos, skipped ${skipped}`,
      stats: {
        imported,
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
