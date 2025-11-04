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

// GET: Fetch all images from database
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (featured === 'true') {
      where.featured = true;
    }

    const images = await prisma.image.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(images);
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST: Sync images from Cloudinary
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const folder = body.folder || '';

    // Fetch images from Cloudinary
    // If no folder specified, get all images from root
    const expression = folder 
      ? `folder:${folder} AND resource_type:image`
      : `resource_type:image`;
    
    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    const syncedImages = [];

    for (const resource of result.resources) {
      // Check if image already exists
      const existing = await prisma.image.findUnique({
        where: { cloudinaryId: resource.public_id },
      });

      const imageData = {
        cloudinaryId: resource.public_id,
        url: resource.secure_url,
        thumbnailUrl: cloudinary.url(resource.public_id, {
          transformation: [
            { width: 800, height: 800, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        }),
        title: resource.public_id.split('/').pop() || 'Untitled',
        width: resource.width,
        height: resource.height,
        format: resource.format,
      };

      if (existing) {
        // Update existing image
        const updated = await prisma.image.update({
          where: { id: existing.id },
          data: imageData,
        });
        syncedImages.push(updated);
      } else {
        // Create new image
        const created = await prisma.image.create({
          data: {
            ...imageData,
            category: 'all',
            tags: [],
            featured: false,
            order: 0,
          },
        });
        syncedImages.push(created);
      }
    }

    return NextResponse.json({
      message: `Synced ${syncedImages.length} images from Cloudinary`,
      images: syncedImages,
    });
  } catch (error: any) {
    console.error('Error syncing images:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync images' },
      { status: 500 }
    );
  }
}

// PUT: Update image metadata
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();

    const updated = await prisma.image.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE: Delete image
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Optional: Delete from Cloudinary too
    // await cloudinary.uploader.destroy(image.cloudinaryId);

    await prisma.image.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
