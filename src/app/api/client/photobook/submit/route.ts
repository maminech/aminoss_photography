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

    const { photobookId, title, notes, pages, design, coverPhotoUrl } = await request.json();

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

    // Calculate total pages from design if available, otherwise from pages array
    let totalPages = 0;
    let finalCoverPhotoUrl = coverPhotoUrl;

    if (design && design.pages) {
      totalPages = design.pages.length;
      // Try to extract cover photo from first page if not provided
      if (!finalCoverPhotoUrl && design.pages[0]) {
        const firstPage = design.pages[0];
        const imageElement = firstPage.children?.find((child: any) => child.type === 'image');
        if (imageElement && imageElement.src) {
          finalCoverPhotoUrl = imageElement.src;
        }
      }
    } else if (pages && pages.length > 0) {
      totalPages = pages.length;
      // Get cover photo URL from first page for old-style photobooks
      if (!finalCoverPhotoUrl) {
        const firstPagePhotos = pages[0]?.photos;
        finalCoverPhotoUrl = firstPagePhotos && firstPagePhotos.length > 0 
          ? firstPagePhotos[0].url 
          : null;
      }
    }

    if (totalPages === 0) {
      return NextResponse.json({ error: 'Photobook must have at least one page' }, { status: 400 });
    }

    // Generate PDF URL placeholder (client will need to export PDF separately)
    // The design JSON is saved and admin can regenerate PDF from it
    const pdfUrl = design ? `/api/photobook/${photobookId}/pdf` : null;

    // Update photobook to submitted status with design field
    const updated = await prisma.photobook.update({
      where: { id: photobookId },
      data: {
        title: title || photobook.title,
        notes: notes || photobook.notes,
        totalPages: totalPages,
        status: 'submitted',
        coverPhotoUrl: finalCoverPhotoUrl,
        design: design || photobook.design, // Save Polotno design state
        pdfUrl: pdfUrl, // Reference to PDF generation endpoint
        submittedAt: new Date(),
        updatedAt: new Date(),
      } as any,
    });

    // Only handle pages for old-style photobooks
    if (pages && pages.length > 0) {
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
