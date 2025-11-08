import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch all photobooks for a user/client
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find client by email
    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const photobooks = await prisma.photobook.findMany({
      where: {
        clientId: client.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ photobooks });
  } catch (error) {
    console.error('Error fetching photobooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photobooks' },
      { status: 500 }
    );
  }
}

// POST - Create new photobook
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { galleryId, design, name } = body;

    if (!galleryId || !design) {
      return NextResponse.json(
        { error: 'Gallery ID and design are required' },
        { status: 400 }
      );
    }

    // Find client by email
    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Verify gallery belongs to client
    const gallery = await prisma.clientGallery.findFirst({
      where: {
        id: galleryId,
        clientId: client.id,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found or access denied' },
        { status: 404 }
      );
    }

    // Count pages from design
    const totalPages = design?.pages?.length || 0;

    const photobook = await (prisma.photobook as any).create({
      data: {
        title: name || `Photobook ${new Date().toLocaleDateString()}`,
        design: design, // Polotno design JSON
        clientId: client.id,
        galleryId: galleryId,
        totalPages: totalPages,
      },
    });

    return NextResponse.json({ photobook, success: true });
  } catch (error) {
    console.error('Error creating photobook:', error);
    return NextResponse.json(
      { error: 'Failed to create photobook' },
      { status: 500 }
    );
  }
}
