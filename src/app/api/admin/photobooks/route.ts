import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get('admin-session');

    if (!adminCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photobooks = await prisma.photobook.findMany({
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

    // Get client and gallery info for each photobook
    const photobooksWithDetails = await Promise.all(
      photobooks.map(async (photobook) => {
        const client = await prisma.client.findUnique({
          where: { id: photobook.clientId },
          select: { name: true, email: true },
        });

        const gallery = await prisma.clientGallery.findUnique({
          where: { id: photobook.galleryId },
          select: { name: true },
        });

        return {
          ...photobook,
          client: client || { name: 'Unknown', email: '' },
          gallery: gallery || { name: 'Unknown' },
        };
      })
    );

    return NextResponse.json(photobooksWithDetails);
  } catch (error) {
    console.error('Error fetching photobooks:', error);
    return NextResponse.json({ error: 'Failed to fetch photobooks' }, { status: 500 });
  }
}
