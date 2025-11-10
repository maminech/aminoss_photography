import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { uploadGroupId, photoId } = await req.json();
    
    if (!uploadGroupId || !photoId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify photo belongs to this group (privacy check)
    const photo = await prisma.guestUpload.findFirst({
      where: {
        id: photoId,
        galleryId: params.eventId,
        uploadGroupId,
      },
    });
    
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found or access denied' },
        { status: 404 }
      );
    }
    
    // Transaction: Unselect all others in group, select this one
    // This ensures only ONE photo per guest is marked for print
    await prisma.$transaction([
      // Set all photos in group to NOT selected
      prisma.guestUpload.updateMany({
        where: {
          galleryId: params.eventId,
          uploadGroupId,
        },
        data: {
          isSelectedForPrint: false,
        },
      }),
      // Set selected photo to true
      prisma.guestUpload.update({
        where: { id: photoId },
        data: {
          isSelectedForPrint: true,
        },
      }),
    ]);

    // Generate photobooth-style print
    let photoboothPrintUrl = null;
    try {
      const photoboothResponse = await fetch(
        `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/events/${params.eventId}/guest-upload/generate-photobooth`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId }),
        }
      );

      if (photoboothResponse.ok) {
        const photoboothData = await photoboothResponse.json();
        photoboothPrintUrl = photoboothData.photoboothPrintUrl;
      }
    } catch (photoboothError) {
      console.error('Photobooth generation failed (non-critical):', photoboothError);
      // Continue even if photobooth generation fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Print photo selected successfully',
      photoboothPrintUrl,
    });
    
  } catch (error: any) {
    console.error('Select print photo error:', error);
    return NextResponse.json(
      { error: 'Failed to select print photo' },
      { status: 500 }
    );
  }
}
