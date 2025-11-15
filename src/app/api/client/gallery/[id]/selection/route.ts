import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Save client's photo selection
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = params.id;
    const body = await request.json();
    const { selectedPhotoIds } = body;

    if (!selectedPhotoIds || !Array.isArray(selectedPhotoIds)) {
      return NextResponse.json(
        { error: 'Invalid selection data' },
        { status: 400 }
      );
    }

    // Update the gallery with selected photos
    const gallery = await prisma.clientGallery.update({
      where: { id: galleryId },
      data: {
        selectedPhotos: selectedPhotoIds,
        selectionApprovedAt: new Date(),
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Selection saved successfully',
      selectedCount: selectedPhotoIds.length
    });

  } catch (error) {
    console.error('Error saving selection:', error);
    return NextResponse.json(
      { error: 'Failed to save selection' },
      { status: 500 }
    );
  }
}
