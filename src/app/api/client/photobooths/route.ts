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

    // Get all guest uploads with photobooth prints for this client's galleries
    const clientGalleries = await prisma.clientGallery.findMany({
      where: { clientId },
      select: { id: true },
    });

    const galleryIds = clientGalleries.map(g => g.id);

    const guestUploads = await (prisma as any).guestUpload.findMany({
      where: {
        galleryId: { in: galleryIds },
        photoboothPrintUrl: { not: null },
      },
      include: {
        gallery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // Transform to photobooth prints format
    const prints = guestUploads.map((upload: any) => ({
      id: upload.id,
      photoboothPrintUrl: upload.photoboothPrintUrl,
      createdAt: upload.uploadedAt,
      gallery: upload.gallery,
      guestName: upload.uploaderName,
      guestEmail: upload.guestEmail || null,
    }));

    return NextResponse.json({ prints });
  } catch (error) {
    console.error('Error fetching photobooth prints:', error);
    return NextResponse.json({ error: 'Failed to fetch photobooth prints' }, { status: 500 });
  }
}
