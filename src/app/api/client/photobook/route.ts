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
      // Get existing photobook for gallery if any
      photobook = await prisma.photobook.findFirst({
        where: {
          clientId: clientId,
          galleryId: galleryId,
        },
        include: {
          pages: {
            orderBy: { pageNumber: 'asc' },
          },
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

    console.log('Client ID from token:', clientId);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized - No client token' }, { status: 401 });
    }

    const body = await request.json();
    const { galleryId, format, title, design } = body;

    console.log('Request body:', { galleryId, format, title, hasDesign: !!design });

    if (!galleryId) {
      return NextResponse.json({ error: 'Gallery ID required' }, { status: 400 });
    }

    // Check if photobook already exists for this gallery
    const existing = await prisma.photobook.findFirst({
      where: {
        clientId: clientId,
        galleryId: galleryId,
        status: 'draft', // Only match draft photobooks
      },
    });

    console.log('Existing draft photobook:', existing ? 'found' : 'not found');

    if (existing) {
      // Update existing draft with new design
      const updated = await prisma.photobook.update({
        where: { id: existing.id },
        data: {
          title: title || existing.title,
          design: design || existing.design,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ photobook: updated });
    }

    // Create new photobook
    console.log('Creating new photobook...');
    const photobook = await prisma.photobook.create({
      data: {
        clientId: clientId,
        galleryId: galleryId,
        format: format || 'A4_LANDSCAPE',
        title: title || 'My Photobook',
        status: 'draft',
        totalPages: 0,
        design: design || undefined,
      },
    });

    console.log('Photobook created:', photobook.id);
    return NextResponse.json({ photobook });
  } catch (error: any) {
    console.error('Create photobook error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to create photobook', details: error.message },
      { status: 500 }
    );
  }
}

// Update photobook (save progress)
export async function PUT(request: NextRequest) {
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

    // Update photobook
    const updated = await prisma.photobook.update({
      where: { id: photobookId },
      data: {
        title: title || photobook.title,
        notes: notes || photobook.notes,
        totalPages: pages?.length || photobook.totalPages,
        design: design !== undefined ? design : photobook.design, // Save Polotno design state
        coverPhotoUrl: coverPhotoUrl !== undefined ? coverPhotoUrl : photobook.coverPhotoUrl,
        updatedAt: new Date(),
      },
    });

    // Delete existing pages
    await prisma.photobookPage.deleteMany({
      where: { photobookId: photobookId },
    });

    // Create new pages
    if (pages && pages.length > 0) {
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
