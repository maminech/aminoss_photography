import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

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

export async function GET(req: NextRequest) {
  try {
    const clientId = await getClientFromToken(req);

    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all galleries for this client with their guest uploads
    const galleries = await prisma.clientGallery.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        guestUploads: {
          where: {
            status: 'approved',
          },
          orderBy: {
            uploadedAt: 'desc',
          },
          include: {
            photos: {
              orderBy: {
                uploadedAt: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data for easier frontend consumption
    const galleriesWithUploads = galleries
      .filter(gallery => gallery.guestUploads.length > 0)
      .map(gallery => {
        const uploads = gallery.guestUploads.map(upload => {
          const photos = upload.photos.map(photo => ({
            id: photo.id,
            fileUrl: photo.fileUrl,
            thumbnailUrl: photo.thumbnailUrl || photo.fileUrl,
            isSelectedForPrint: photo.isSelectedForPrint,
          }));

          return {
            uploadGroupId: upload.uploadGroupId,
            uploaderName: upload.uploaderName,
            message: upload.message,
            uploadedAt: upload.uploadedAt.toISOString(),
            photoCount: photos.length,
            photos,
            printPhoto: photos.find(p => p.isSelectedForPrint) || null,
            photoboothPrintUrl: upload.photoboothPrintUrl,
            status: upload.status,
          };
        });

        const totalPhotos = uploads.reduce((sum, u) => sum + u.photoCount, 0);
        const printSelected = uploads.filter(u => u.printPhoto).length;

        return {
          id: gallery.id,
          name: gallery.name,
          description: gallery.description,
          coverImage: gallery.coverImage,
          uploadCount: uploads.length,
          totalPhotos,
          printSelected,
          uploads,
        };
      });

    // Calculate overall stats
    const overallStats = {
      totalGalleries: galleriesWithUploads.length,
      totalGuests: galleriesWithUploads.reduce((sum, g) => sum + g.uploadCount, 0),
      totalPhotos: galleriesWithUploads.reduce((sum, g) => sum + g.totalPhotos, 0),
      printSelected: galleriesWithUploads.reduce((sum, g) => sum + g.printSelected, 0),
    };

    return NextResponse.json({
      galleries: galleriesWithUploads,
      stats: overallStats,
    });
  } catch (error) {
    console.error('Error fetching guest uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest uploads' },
      { status: 500 }
    );
  }
}
