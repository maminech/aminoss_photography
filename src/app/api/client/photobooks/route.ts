import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('client-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const clientId = payload.clientId as string;

    // Fetch all photobooks for this client
    const photobooks = await prisma.photobook.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        pages: {
          orderBy: {
            pageNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get gallery info for each photobook
    const photobooksWithGallery = await Promise.all(
      photobooks.map(async (photobook) => {
        const gallery = await prisma.clientGallery.findUnique({
          where: { id: photobook.galleryId },
          select: { id: true, name: true },
        });
        return {
          ...photobook,
          gallery: gallery || { id: photobook.galleryId, name: 'Unknown Gallery' },
        };
      })
    );

    return NextResponse.json({ photobooks: photobooksWithGallery });
  } catch (error) {
    console.error('Error fetching photobooks:', error);
    return NextResponse.json({ error: 'Failed to fetch photobooks' }, { status: 500 });
  }
}
