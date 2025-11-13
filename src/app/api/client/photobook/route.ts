import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

// Get photobook for a gallery or by photobookId
export async function GET(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');
    const photobookId = searchParams.get('photobookId');

    let photobook = null;

    if (photobookId) {
      // Get specific photobook by ID
      photobook = await prisma.photobook.findUnique({
        where: { id: photobookId },
        include: {
          pages: {
            orderBy: { pageNumber: 'asc' },
          },
        },
      });

      // Verify ownership
      if (photobook && photobook.clientId !== clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (galleryId) {
      // Get existing DRAFT photobook for gallery if any (only one draft per gallery)
      photobook = await prisma.photobook.findFirst({
        where: {
          clientId: clientId,
          galleryId: galleryId,
          status: 'draft', // Only return draft photobooks to continue editing
        },
        include: {
          pages: {
            orderBy: { pageNumber: 'asc' },
          },
        },
        orderBy: {
          updatedAt: 'desc', // Get the most recently updated draft
        },
      });
    } else {
      return NextResponse.json({ error: 'Gallery ID or Photobook ID required' }, { status: 400 });
    }

    return NextResponse.json({ photobook });
  } catch (error) {
    console.error('Get photobook error:', error);
    return NextResponse.json(
      { error: 'Failed to get photobook' },
      { status: 500 }
    );
  }
}

// Create new photobook or save/update existing draft
export async function POST(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized - No client token' }, { status: 401 });
    }

    const body = await request.json();
    const { galleryId, format, title, design, photobookId } = body;

    if (!galleryId) {
      return NextResponse.json({ error: 'Gallery ID required' }, { status: 400 });
    }

    // If photobookId is provided, update that specific photobook
    if (photobookId) {
      const existing = await prisma.photobook.findUnique({
        where: { id: photobookId },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Photobook not found' }, { status: 404 });
      }

      if (existing.clientId !== clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Only update drafts through this endpoint
      if (existing.status !== 'draft') {
        return NextResponse.json({ error: 'Can only update draft photobooks' }, { status: 400 });
      }

      const updated = await prisma.photobook.update({
        where: { id: photobookId },
        data: {
          title: title || existing.title,
          format: format || existing.format,
          design: design !== undefined ? design : existing.design,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ photobook: updated, isUpdate: true });
    }

    // Check if a draft photobook already exists for this gallery
    const existing = await prisma.photobook.findFirst({
      where: {
        clientId: clientId,
        galleryId: galleryId,
        status: 'draft',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (existing) {
      // Update existing draft
      const updated = await prisma.photobook.update({
        where: { id: existing.id },
        data: {
          title: title || existing.title,
          format: format || existing.format,
          design: design !== undefined ? design : existing.design,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ photobook: updated, isUpdate: true });
    }

    // Create new draft photobook
    const photobook = await prisma.photobook.create({
      data: {
        clientId: clientId,
        galleryId: galleryId,
        format: format || 'A4_LANDSCAPE',
        title: title || 'My Photobook',
        status: 'draft',
        totalPages: 0,
        design: design || null,
      },
    });

    return NextResponse.json({ photobook, isUpdate: false });
  } catch (error: any) {
    console.error('Create/Update photobook error:', error);
    return NextResponse.json(
      { error: 'Failed to save photobook', details: error.message },
      { status: 500 }
    );
  }
}

// Update photobook (save progress) - DEPRECATED, use POST instead
export async function PUT(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photobookId, title, notes, pages, design, coverPhotoUrl, format } = await request.json();

    if (!photobookId) {
      return NextResponse.json({ error: 'Photobook ID required' }, { status: 400 });
    }

    // Verify ownership and status
    const photobook = await prisma.photobook.findUnique({
      where: { id: photobookId },
    });

    if (!photobook) {
      return NextResponse.json({ error: 'Photobook not found' }, { status: 404 });
    }

    if (photobook.clientId !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (photobook.status !== 'draft') {
      return NextResponse.json({ error: 'Can only update draft photobooks' }, { status: 400 });
    }

    // Calculate total pages from design if available
    let totalPages = photobook.totalPages;
    if (design && design.pages) {
      totalPages = design.pages.length;
    } else if (pages && pages.length > 0) {
      totalPages = pages.length;
    }

    // Update photobook
    const updated = await prisma.photobook.update({
      where: { id: photobookId },
      data: {
        title: title !== undefined ? title : photobook.title,
        notes: notes !== undefined ? notes : photobook.notes,
        format: format !== undefined ? format : photobook.format,
        totalPages: totalPages,
        design: design !== undefined ? design : photobook.design,
        coverPhotoUrl: coverPhotoUrl !== undefined ? coverPhotoUrl : photobook.coverPhotoUrl,
        updatedAt: new Date(),
      },
    });

    // Only handle pages for old-style photobooks (legacy support)
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

    return NextResponse.json({ success: true, photobook: updated });
  } catch (error) {
    console.error('Update photobook error:', error);
    return NextResponse.json(
      { error: 'Failed to update photobook' },
      { status: 500 }
    );
  }
}

// Delete photobook
export async function DELETE(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photobookId } = await request.json();

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

    // Only allow deleting draft photobooks
    if (photobook.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft photobooks can be deleted' },
        { status: 400 }
      );
    }

    // Delete photobook pages first (cascade)
    await prisma.photobookPage.deleteMany({
      where: { photobookId: photobookId },
    });

    // Delete photobook
    await prisma.photobook.delete({
      where: { id: photobookId },
    });

    return NextResponse.json({ success: true, message: 'Photobook deleted successfully' });
  } catch (error) {
    console.error('Delete photobook error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photobook' },
      { status: 500 }
    );
  }
}
