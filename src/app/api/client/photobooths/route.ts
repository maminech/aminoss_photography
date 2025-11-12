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
            eventDate: true,
            brideName: true,
            groomName: true,
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
      message: upload.message,
    }));

    return NextResponse.json({ prints });
  } catch (error) {
    console.error('Error fetching photobooth prints:', error);
    return NextResponse.json({ error: 'Failed to fetch photobooth prints' }, { status: 500 });
  }
}
