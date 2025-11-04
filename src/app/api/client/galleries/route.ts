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

// GET - Get all galleries for logged-in client
export async function GET(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const galleries = await prisma.clientGallery.findMany({
      where: { clientId },
      include: {
        photos: {
          orderBy: { photoNumber: 'asc' },
        },
        _count: {
          select: { photos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out expired galleries
    const activeGalleries = galleries.filter((gallery: any) => {
      if (!gallery.expiresAt) return true;
      return new Date(gallery.expiresAt) > new Date();
    });

    return NextResponse.json(activeGalleries);
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch galleries' },
      { status: 500 }
    );
  }
}
