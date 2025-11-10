import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const clientCookie = cookieStore.get('client-session');

    if (!clientCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientData = JSON.parse(clientCookie.value);
    const clientId = clientData.clientId;

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
