import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

// Get photobook for a gallery
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
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
    const cookieStore = await cookies();
    const clientCookie = cookieStore.get('client-session');

    console.log('Client cookie:', clientCookie ? 'exists' : 'missing');

    if (!clientCookie) {
      return NextResponse.json({ error: 'Unauthorized - No session cookie' }, { status: 401 });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(clientCookie.value);
      console.log('Session data:', sessionData);
    } catch (parseError) {
      console.error('Failed to parse session cookie:', parseError);
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id: sessionData.clientId },
    });

    console.log('Client found:', client ? 'yes' : 'no');

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();
    const { galleryId, format, title } = body;

    console.log('Request body:', { galleryId, format, title });

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

    console.log('Existing photobook:', existing ? 'found' : 'not found');

    if (existing) {
      return NextResponse.json({ photobook: existing });
    }

    // Create new photobook
    console.log('Creating new photobook...');
    const photobook = await prisma.photobook.create({
      data: {
        clientId: client.id,
        galleryId: galleryId,
        format: format,
        title: title || 'My Photobook',
        status: 'draft',
        totalPages: 0,
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
    const cookieStore = await cookies();
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
