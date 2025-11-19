import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = (session.user as any)?.role;
    if (!session || !userRole || userRole.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photobookId = params.id;

    const photobook = await prisma.photobook.findUnique({
      where: { id: photobookId },
      include: {
        pages: {
          orderBy: {
            pageNumber: 'asc'
          }
        }
      }
    });

    if (!photobook) {
      return NextResponse.json({ error: 'Photobook not found' }, { status: 404 });
    }

    // Get client and gallery info
    const client = await prisma.client.findUnique({
      where: { id: photobook.clientId },
      select: { name: true, email: true }
    });

    const gallery = await prisma.clientGallery.findUnique({
      where: { id: photobook.galleryId },
      select: { name: true }
    });

    // Return photobook data for PDF generation
    // The client-side will use this data to generate PDF using jsPDF or similar
    return NextResponse.json({
      photobook: {
        ...photobook,
        client: client || { name: 'Unknown', email: 'N/A' },
        gallery: gallery || { name: 'Unknown Gallery' }
      }
    });
  } catch (error) {
    console.error('Error fetching photobook for PDF:', error);
    return NextResponse.json({ error: 'Failed to fetch photobook' }, { status: 500 });
  }
}
