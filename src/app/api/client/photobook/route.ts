import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

// Get photobook for a gallery
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const clientCookie = cookieStore.get('client-session');

    if (!clientCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify client session
    const sessionData = JSON.parse(clientCookie.value);
    const client = await prisma.client.findUnique({
      where: { id: sessionData.clientId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');

    if (!galleryId) {
      return NextResponse.json({ error: 'Gallery ID required' }, { status: 400 });
    }

    // Get existing photobook if any
    const photobook = await prisma.photobook.findFirst({
      where: {
        clientId: client.id,
        galleryId: galleryId,
      },
      include: {
        pages: {
          orderBy: { pageNumber: 'asc' },
        },
      },
    });

    return NextResponse.json({ photobook });
  } catch (error) {
    console.error('Get photobook error:', error);
    return NextResponse.json(
      { error: 'Failed to get photobook' },
      { status: 500 }
    );
  }
}

// Create new photobook
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const clientCookie = cookieStore.get('client-session');

    if (!clientCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = JSON.parse(clientCookie.value);
    const client = await prisma.client.findUnique({
      where: { id: sessionData.clientId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { galleryId, format, title } = await request.json();

    if (!galleryId || !format) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if photobook already exists
    const existing = await prisma.photobook.findFirst({
      where: {
        clientId: client.id,
        galleryId: galleryId,
      },
    });

    if (existing) {
      return NextResponse.json({ photobook: existing });
    }

    // Create new photobook
    const photobook = await prisma.photobook.create({
      data: {
        clientId: client.id,
        galleryId: galleryId,
        format: format,
        title: title || 'My Photobook',
        status: 'draft',
      },
    });

    return NextResponse.json({ photobook });
  } catch (error) {
    console.error('Create photobook error:', error);
    return NextResponse.json(
      { error: 'Failed to create photobook' },
      { status: 500 }
    );
  }
}

// Update photobook (save progress)
export async function PUT(request: NextRequest) {
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

    // Update photobook
    const updated = await prisma.photobook.update({
      where: { id: photobookId },
      data: {
        title: title || photobook.title,
        notes: notes || photobook.notes,
        totalPages: pages?.length || photobook.totalPages,
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
