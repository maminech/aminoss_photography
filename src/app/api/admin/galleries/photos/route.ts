import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add photos to gallery
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { galleryId, photos } = await request.json();

    if (!galleryId || !photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Gallery ID and photos array required' }, { status: 400 });
    }

    // Get current max order and photo number
    const maxOrder = await prisma.clientPhoto.aggregate({
      where: { galleryId },
      _max: { order: true, photoNumber: true },
    });

    const startOrder = (maxOrder._max.order || 0) + 1;
    const startPhotoNumber = (maxOrder._max.photoNumber || 0) + 1;

    // Create photos in batch
    const createdPhotos = await prisma.clientPhoto.createMany({
      data: photos.map((photo: any, index: number) => ({
        galleryId,
        cloudinaryId: photo.cloudinaryId,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        width: photo.width,
        height: photo.height,
        fileSize: photo.fileSize,
        order: startOrder + index,
        photoNumber: startPhotoNumber + index,
        selectedForPrint: false,
      })),
    });

    // Update gallery cover image if not set
    const gallery = await prisma.clientGallery.findUnique({
      where: { id: galleryId },
    });

    if (gallery && !gallery.coverImage && photos.length > 0) {
      await prisma.clientGallery.update({
        where: { id: galleryId },
        data: { coverImage: photos[0].thumbnailUrl },
      });
    }

    return NextResponse.json({ 
      message: 'Photos added successfully', 
      count: createdPhotos.count 
    });
  } catch (error) {
    console.error('Add photos error:', error);
    return NextResponse.json({ error: 'Failed to add photos' }, { status: 500 });
  }
}
