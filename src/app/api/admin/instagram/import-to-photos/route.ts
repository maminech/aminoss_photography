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

        // Only import images (not videos for now)
        if (post.mediaType !== 'IMAGE') {
          console.log(`⏭️ Skipping ${post.instagramId} - not an image`);
          skipped++;
          continue;
        }

        // Upload to Cloudinary
        console.log(`📤 Uploading ${post.instagramId} to Cloudinary...`);
        const uploadResult = await cloudinary.uploader.upload(post.mediaUrl, {
          folder: 'aminoss_portfolio/instagram',
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good', fetch_format: 'auto' },
          ],
        });

        // Generate thumbnail URL
        const thumbnailUrl = uploadResult.secure_url.replace(
          '/upload/',
          '/upload/w_800,h_800,c_fill,q_90,f_auto/'
        );

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
