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

// GET - Fetch all photobooks for a user/client
export async function GET(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);
    
    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photobooks = await prisma.photobook.findMany({
      where: {
        clientId: clientId,
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
    const clientId = await getClientFromToken(request);
    
    if (!clientId) {
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

    // Verify gallery belongs to client
    const gallery = await prisma.clientGallery.findFirst({
      where: {
        id: galleryId,
        clientId: clientId,
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
        design: design, // Design JSON
        clientId: clientId,
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
