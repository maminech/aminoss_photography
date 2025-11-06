import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Submit photobook for review
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const clientCookie = cookieStore.get('client-session');

    if (!clientCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = JSON.parse(clientCookie.value);
    const { photobookId, title, notes, pages } = await request.json();

    if (!photobookId) {
      return NextResponse.json({ error: 'Photobook ID required' }, { status: 400 });
    }

    // Verify ownership
    const photobook = await prisma.photobook.findUnique({
      where: { id: photobookId },
    });

    if (!photobook || photobook.clientId !== sessionData.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'Photobook must have at least one page' }, { status: 400 });
    }

    // Get cover photo URL from first page
    const firstPagePhotos = pages[0]?.photos;
    const coverPhotoUrl = firstPagePhotos && firstPagePhotos.length > 0 
      ? firstPagePhotos[0].url 
      : null;

    // Update photobook to submitted status
    const updated = await prisma.photobook.update({
      where: { id: photobookId },
      data: {
        title: title || photobook.title,
        notes: notes || photobook.notes,
        totalPages: pages.length,
        status: 'submitted',
        coverPhotoUrl: coverPhotoUrl,
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Delete existing pages
    await prisma.photobookPage.deleteMany({
      where: { photobookId: photobookId },
    });

    // Create new pages
    await prisma.photobookPage.createMany({
      data: pages.map((page: any) => ({
        photobookId: photobookId,
        pageNumber: page.pageNumber,
        layoutType: page.layoutType,
        photos: page.photos,
        notes: page.notes || null,
      })),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Photobook submitted successfully',
      photobook: updated 
    });
  } catch (error) {
    console.error('Submit photobook error:', error);
    return NextResponse.json(
      { error: 'Failed to submit photobook' },
      { status: 500 }
    );
  }
}
