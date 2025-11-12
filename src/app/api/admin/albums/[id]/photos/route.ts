import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// POST - Add photos to album
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: albumId } = params;
    const body = await request.json();
    const { imageIds } = body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: 'Image IDs array is required' },
        { status: 400 }
      );
    }

    // Update images to link them to the album
    await prisma.image.updateMany({
      where: {
        id: { in: imageIds },
      },
      data: {
        albumId,
      },
    });

    // Get the first image URL to update album cover if not set
    const firstImage = await prisma.image.findFirst({
      where: { id: imageIds[0] },
      select: { url: true },
    });

    // Update album cover if not set
    const album = await prisma.album.findUnique({
      where: { id: albumId },
      select: { coverImageUrl: true },
    });

    if (!album?.coverImageUrl && firstImage) {
      await prisma.album.update({
        where: { id: albumId },
        data: { coverImageUrl: firstImage.url },
      });
    }

    const updatedAlbum = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { images: true },
        },
      },
    });

    return NextResponse.json(updatedAlbum);
  } catch (error) {
    console.error('Error adding photos to album:', error);
    return NextResponse.json(
      { error: 'Failed to add photos to album' },
      { status: 500 }
    );
  }
}

// DELETE - Remove photo from album
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: albumId } = params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Remove image from album (set albumId to null)
    await prisma.image.update({
      where: { id: imageId },
      data: { albumId: null },
    });

    const updatedAlbum = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { images: true },
        },
      },
    });

    return NextResponse.json(updatedAlbum);
  } catch (error) {
    console.error('Error removing photo from album:', error);
    return NextResponse.json(
      { error: 'Failed to remove photo from album' },
      { status: 500 }
    );
  }
}
