import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

async function getClientFromToken(request: NextRequest) {
  const token = request.cookies.get('client-token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.clientId as string;
  } catch {
    return null;
  }
}

// Submit photobook for review
export async function POST(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Submit photobook request:', { 
      photobookId: body.photobookId, 
      hasPages: !!body.pages,
      pagesCount: body.pages?.length,
      hasDesign: !!body.design,
      title: body.title
    });

    const { photobookId, title, notes, pages } = body;

    if (!photobookId) {
      return NextResponse.json({ error: 'Photobook ID required' }, { status: 400 });
    }

    // Verify ownership
    const photobook = await prisma.photobook.findUnique({
      where: { id: photobookId },
    });

    if (!photobook || photobook.clientId !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate total pages and cover photo from pages array
    let totalPages = 0;
    let finalCoverPhotoUrl = null;

    if (pages && pages.length > 0) {
      totalPages = pages.length;
      // Get cover photo URL from first page
      const firstPagePhotos = pages[0]?.photos;
      finalCoverPhotoUrl = firstPagePhotos && firstPagePhotos.length > 0 
        ? firstPagePhotos[0].url 
        : null;
    }

    if (totalPages === 0) {
      return NextResponse.json({ error: 'Photobook must have at least one page' }, { status: 400 });
    }

    console.log('Updating photobook:', {
      photobookId,
      totalPages,
      hasCoverPhoto: !!finalCoverPhotoUrl,
      pagesData: pages.length
    });

    // Update photobook to submitted status
    const updated = await prisma.photobook.update({
      where: { id: photobookId },
      data: {
        title: title || photobook.title,
        notes: notes || photobook.notes,
        totalPages: totalPages,
        status: 'submitted',
        coverPhotoUrl: finalCoverPhotoUrl,
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Handle pages for custom photobook editor
    if (pages && pages.length > 0) {
      console.log('Deleting old pages and creating new ones');
      
      // Delete existing pages
      await prisma.photobookPage.deleteMany({
        where: { photobookId: photobookId },
      });

      // Create new pages
      const pagesData = pages.map((page: any) => ({
        photobookId: photobookId,
        pageNumber: page.pageNumber,
        layoutType: page.layoutType,
        photos: page.photos,
        notes: page.notes || null,
      }));

      console.log('Creating pages:', pagesData.length);
      
      await prisma.photobookPage.createMany({
        data: pagesData,
      });
    }

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
