import { NextRequest, NextResponse } from 'next/server';
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

// GET - Fetch all videos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST - Sync videos from Cloudinary or create new
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { folder = '', action = 'sync' } = body;

    if (action === 'sync') {
      // Sync videos from Cloudinary
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'video',
        prefix: folder,
        max_results: 500,
      });

      let syncedCount = 0;
      let updatedCount = 0;

      for (const resource of result.resources) {
        const videoData = {
          cloudinaryId: resource.public_id,
          url: resource.secure_url,
          thumbnailUrl: resource.secure_url.replace('/upload/', '/upload/so_0,w_800,h_800,c_fill/') + '.jpg',
          title: resource.context?.custom?.title || resource.public_id.split('/').pop() || 'Untitled',
          description: resource.context?.custom?.description || '',
          category: resource.context?.custom?.category || 'videos',
          tags: resource.tags || [],
          featured: false,
          order: 0,
          width: resource.width || 1920,
          height: resource.height || 1080,
          duration: resource.duration || 0,
          format: resource.format || 'mp4',
        };

        const existing = await prisma.video.findUnique({
          where: { cloudinaryId: resource.public_id },
        });

        if (existing) {
          await prisma.video.update({
            where: { id: existing.id },
            data: videoData,
          });
          updatedCount++;
        } else {
          await prisma.video.create({ data: videoData });
          syncedCount++;
        }
      }

      return NextResponse.json({
        message: `✅ Synced ${syncedCount} new videos, updated ${updatedCount} existing videos`,
        synced: syncedCount,
        updated: updatedCount,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error syncing videos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync videos' },
      { status: 500 }
    );
  }
}

// PUT - Update video
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    const video = await prisma.video.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

// DELETE - Delete video
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    await prisma.video.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
