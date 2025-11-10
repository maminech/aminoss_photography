import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get client session (from cookie)
    const clientId = req.cookies.get('clientId')?.value;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify client owns this gallery
    const gallery = await prisma.clientGallery.findFirst({
      where: {
        id: params.id,
        clientId: clientId,
      },
      select: {
        id: true,
        name: true,
        guestUploadEnabled: true,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found or access denied' },
        { status: 404 }
      );
    }

    if (!gallery.guestUploadEnabled) {
      return NextResponse.json({
        uploads: [],
        stats: {
          totalGuests: 0,
          totalPhotos: 0,
          printSelected: 0,
          approved: 0,
          pending: 0,
        },
        galleryName: gallery.name,
      });
    }

    // Fetch all guest uploads for this gallery
    const uploads = await prisma.guestUpload.findMany({
      where: {
        galleryId: params.id,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // Group by uploadGroupId
    const groupedUploads = uploads.reduce((acc: any, upload) => {
      const groupId = upload.uploadGroupId;
      
      if (!acc[groupId]) {
        acc[groupId] = {
          uploadGroupId: groupId,
          uploaderName: upload.uploaderName,
          message: upload.message || '',
          uploadedAt: upload.uploadedAt,
          photos: [],
          photoCount: 0,
          printPhoto: null,
          photoboothPrintUrl: null,
          status: upload.status,
        };
      }

      acc[groupId].photos.push({
        id: upload.id,
        fileUrl: upload.fileUrl,
        thumbnailUrl: upload.thumbnailUrl,
        isSelectedForPrint: upload.isSelectedForPrint,
      });

      acc[groupId].photoCount++;

      if (upload.isSelectedForPrint) {
        acc[groupId].printPhoto = {
          id: upload.id,
          fileUrl: upload.fileUrl,
          thumbnailUrl: upload.thumbnailUrl,
          isSelectedForPrint: true,
        };
      }

      // Get photobooth print URL from the selected photo
      if ((upload as any).photoboothPrintUrl) {
        acc[groupId].photoboothPrintUrl = (upload as any).photoboothPrintUrl;
      }

      return acc;
    }, {});

    const formattedUploads = Object.values(groupedUploads);

    // Calculate stats
    const stats = {
      totalGuests: formattedUploads.length,
      totalPhotos: uploads.length,
      printSelected: uploads.filter((u: any) => u.isSelectedForPrint).length,
      approved: Object.values(groupedUploads).filter((g: any) => g.status === 'approved').length,
      pending: Object.values(groupedUploads).filter((g: any) => g.status === 'pending').length,
    };

    return NextResponse.json({
      uploads: formattedUploads,
      stats,
      galleryName: gallery.name,
    });
  } catch (error: any) {
    console.error('Error fetching guest uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest uploads' },
      { status: 500 }
    );
  }
}
