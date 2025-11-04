import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Get all selected photos across all clients
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const whereClause: any = {
      selectedForPrint: true,
    };

    if (clientId) {
      whereClause.gallery = {
        clientId,
      };
    }

    const selectedPhotos = await prisma.clientPhoto.findMany({
      where: whereClause,
      include: {
        gallery: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { gallery: { client: { name: 'asc' } } },
        { photoNumber: 'asc' },
      ],
    });

    // Group by client
    const groupedByClient = selectedPhotos.reduce((acc: Record<string, any>, photo: any) => {
      const clientName = photo.gallery.client.name;
      if (!acc[clientName]) {
        acc[clientName] = {
          client: photo.gallery.client,
          photos: [],
        };
      }
      acc[clientName].photos.push({
        ...photo,
        galleryName: photo.gallery.name,
      });
      return acc;
    }, {});

    return NextResponse.json(groupedByClient);
  } catch (error) {
    console.error('Get selected photos error:', error);
    return NextResponse.json({ error: 'Failed to fetch selected photos' }, { status: 500 });
  }
}
