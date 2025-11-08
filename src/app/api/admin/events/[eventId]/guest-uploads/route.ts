import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    // Admin authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all guest uploads for this event
    const uploads = await prisma.guestUpload.findMany({
      where: {
        galleryId: params.eventId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
    
    // Group by uploadGroupId
    const groupedUploads = uploads.reduce((acc: any, upload: any) => {
      if (!acc[upload.uploadGroupId]) {
        acc[upload.uploadGroupId] = {
          uploadGroupId: upload.uploadGroupId,
          uploaderName: upload.uploaderName,
          message: upload.message,
          uploadedAt: upload.uploadedAt,
          photos: [],
          photoCount: 0,
          printPhoto: null,
          status: upload.status,
        };
      }
      
      acc[upload.uploadGroupId].photos.push({
        id: upload.id,
        fileUrl: upload.fileUrl,
        thumbnailUrl: upload.thumbnailUrl,
        isSelectedForPrint: upload.isSelectedForPrint,
        width: upload.width,
        height: upload.height,
      });
      
      acc[upload.uploadGroupId].photoCount++;
      
      if (upload.isSelectedForPrint) {
        acc[upload.uploadGroupId].printPhoto = {
          id: upload.id,
          thumbnailUrl: upload.thumbnailUrl,
          fileUrl: upload.fileUrl,
        };
      }
      
      return acc;
    }, {});
    
    const uploadsArray = Object.values(groupedUploads);
    
    // Calculate stats
    const stats = {
      totalGuests: uploadsArray.length,
      totalPhotos: uploads.length,
      printSelected: uploads.filter((u: any) => u.isSelectedForPrint).length,
      pending: uploads.filter((u: any) => u.status === 'pending').length,
      approved: uploads.filter((u: any) => u.status === 'approved').length,
    };
    
    return NextResponse.json({
      success: true,
      stats,
      uploads: uploadsArray,
    });
    
  } catch (error: any) {
    console.error('Get guest uploads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest uploads' },
      { status: 500 }
    );
  }
}

// Update upload status (approve/reject)
export async function PATCH(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { uploadGroupId, status } = await req.json();
    
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Update all photos in the group
    await prisma.guestUpload.updateMany({
      where: {
        galleryId: params.eventId,
        uploadGroupId,
      },
      data: {
        status,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: `Guest uploads ${status} successfully`,
    });
    
  } catch (error: any) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
