import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch both albums and standalone images for public gallery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = { showInGallery: true };
    if (category && category !== 'all') {
      where.category = category;
    }

    // Fetch albums with their photos (Instagram-style posts)
    const albums = await prisma.album.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            width: true,
            height: true,
          },
        },
        _count: {
          select: { images: true },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Fetch standalone images (not in any album)
    const standaloneImages = await prisma.image.findMany({
      where: {
        ...where,
        albumId: null, // Only images not in an album
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        cloudinaryId: true,
        url: true,
        thumbnailUrl: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        width: true,
        height: true,
        format: true,
        createdAt: true,
      },
    });

    // Combine albums and standalone images
    const gallery = [
      ...albums.map((album) => ({
        type: 'album',
        id: album.id,
        title: album.title,
        description: album.description,
        category: album.category,
        coverImage: album.coverImageUrl || album.images[0]?.url,
        photoCount: album._count.images,
        photos: album.images,
        createdAt: album.createdAt,
        featured: album.featured,
      })),
      ...standaloneImages.map((image) => ({
        type: 'image',
        id: image.id,
        publicId: image.cloudinaryId,
        url: image.url,
        thumbnailUrl: image.thumbnailUrl,
        title: image.title,
        description: image.description,
        category: image.category,
        tags: image.tags,
        width: image.width,
        height: image.height,
        format: image.format,
        createdAt: image.createdAt,
      })),
    ];

    // Sort by creation date
    gallery.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });

    return NextResponse.json(gallery);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}
