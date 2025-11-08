import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    
    if (!groupId) {
      return NextResponse.json(
        { error: 'Upload group ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch photos for this upload group ONLY (privacy enforcement)
    const photos = await prisma.guestUpload.findMany({
      where: {
        galleryId: params.eventId,
        uploadGroupId: groupId,
      },
      orderBy: {
        uploadedAt: 'asc',
      },
      select: {
        id: true,
        fileUrl: true,
        thumbnailUrl: true,
        isSelectedForPrint: true,
        uploaderName: true,
        message: true,
        width: true,
        height: true,
      },
    });
    
    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos found for this upload session' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      uploaderName: photos[0].uploaderName,
      message: photos[0].message,
      photos: photos.map((p: any) => ({
        id: p.id,
        fileUrl: p.fileUrl,
        thumbnailUrl: p.thumbnailUrl,
        isSelectedForPrint: p.isSelectedForPrint,
        width: p.width,
        height: p.height,
      })),
    });
    
  } catch (error: any) {
    console.error('Get photos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
