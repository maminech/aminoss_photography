import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      cloudinaryId,
      url,
      thumbnailUrl,
      title,
      description,
      category,
      tags,
      featured,
      showOnHomepage,
      showInGallery,
      width,
      height,
      format,
      albumId, // NEW: Support for album assignment
    } = body;

    // Validate required fields
    if (!cloudinaryId || !url) {
      return NextResponse.json(
        { error: 'cloudinaryId and url are required' },
        { status: 400 }
      );
    }

    // Check if image already exists
    const existingImage = await prisma.image.findUnique({
      where: { cloudinaryId },
    });

    if (existingImage) {
      return NextResponse.json(
        { error: 'Image already exists in database' },
        { status: 409 }
      );
    }

    // Get the highest order number
    const lastImage = await prisma.image.findFirst({
      orderBy: { order: 'desc' },
    });

    // Create new image
    const newImage = await prisma.image.create({
      data: {
        cloudinaryId,
        url,
        thumbnailUrl: thumbnailUrl || url,
        title: title || null,
        description: description || null,
        category: category || 'weddings',
        tags: tags || [],
        featured: featured || false,
        showOnHomepage: showOnHomepage || false,
        showInGallery: showInGallery !== undefined ? showInGallery : true,
        order: (lastImage?.order || 0) + 1,
        width: width || null,
        height: height || null,
        format: format || null,
        albumId: albumId || null, // NEW: Link to album if provided
      },
    });

    // If albumId provided, update album's cover image if not set
    if (albumId) {
      const album = await prisma.album.findUnique({
        where: { id: albumId },
        select: { coverImageUrl: true },
      });

      if (album && !album.coverImageUrl) {
        await prisma.album.update({
          where: { id: albumId },
          data: { coverImageUrl: url },
        });
      }
    }

    return NextResponse.json({
      message: 'Photo uploaded successfully',
      image: newImage,
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
