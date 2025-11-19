import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm22wlmpx',
  api_key: process.env.CLOUDINARY_API_KEY || '816775898924348',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mbU--NngMju5dzFgvO_LExO7nnc',
});

/**
 * Generate Photobooth-Style Print
 * Creates a print-ready image with:
 * - White frame/border
 * - Bride & Groom names at top
 * - Wedding date
 * - Guest message at bottom
 * - Photobooth aesthetic
 */
export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    console.log('🎨 Photobooth generation started for event:', params.eventId);
    const { photoId } = await req.json();

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Get the photo and gallery info
    const photo = await prisma.guestUpload.findUnique({
      where: { id: photoId },
      include: {
        gallery: true,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    const gallery = photo.gallery as any; // Type assertion until Prisma client is regenerated

    // Format date
    const eventDate = gallery.eventDate
      ? new Date(gallery.eventDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Special Day';

    // Prepare names
    const brideName = gallery.brideName || 'Bride';
    const groomName = gallery.groomName || 'Groom';
    const coupleNames = `${brideName} & ${groomName}`;
    
    // Guest message (from the upload)
    const guestMessage = photo.message || 'Congratulations on your special day!';
    
    // Bottom message
    const bottomMessage = gallery.photoboothMessage || photo.uploaderName || 'Thank you for celebrating with us!';

    // Build Cloudinary URL manually for better control
    // Using direct URL construction instead of SDK to ensure transformations work correctly
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm22wlmpx';
    
    // URL encode text overlays
    const encodedCoupleNames = encodeURIComponent(coupleNames).replace(/%20/g, '%20');
    const encodedEventDate = encodeURIComponent(eventDate).replace(/%20/g, '%20');
    const encodedGuestMessage = encodeURIComponent(guestMessage.substring(0, 80)).replace(/%20/g, '%20');
    const encodedBottomMessage = encodeURIComponent(`With love from ${bottomMessage.substring(0, 25)}`).replace(/%20/g, '%20');
    
    // Build transformation string
    const transformations = [
      // Step 1: Resize the photo to center area
      'c_fill,g_auto:faces,h_1200,w_1000,q_auto:best',
      // Step 2: Add white borders
      'bo_200px_100px_180px_100px_solid_rgb:ffffff',
      // Step 3: Add top text overlays
      `l_text:Arial_50:♥,g_north,y_15,co_rgb:ff69b4`,
      `l_text:Pacifico_68_bold:${encodedCoupleNames},g_north,y_75,co_rgb:1a1a1a`,
      `l_text:Lato_38:${encodedEventDate},g_north,y_150,co_rgb:555555`,
      // Step 4: Add bottom text overlays
      'l_text:Arial_24:━━━━━━━━━━━━━━━━,g_south,y_145,co_rgb:ff69b4',
      `l_text:Lato_30:${encodedGuestMessage},g_south,y_100,co_rgb:333333`,
      `l_text:Lato_26:${encodedBottomMessage},g_south,y_60,co_rgb:666666`,
      'l_text:Arial_28:❤ ❤ ❤,g_south,y_20,co_rgb:ff69b4',
      // Step 5: Add shadow
      'e_shadow:40',
      // Step 6: Final sizing
      'c_pad,w_1200,h_1800,b_rgb:ffffff,q_100',
    ].join('/');
    
    console.log('🖼️ Generating photobooth URL for cloudinaryId:', photo.cloudinaryId);
    
    // Construct the full URL
    const photoboothUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/f_jpg/${photo.cloudinaryId}`;

    console.log('✅ Photobooth URL generated:', photoboothUrl);

    // Update the photo record with the photobooth print URL
    await prisma.guestUpload.update({
      where: { id: photoId },
      data: {
        photoboothPrintUrl: photoboothUrl,
      } as any, // Type assertion until Prisma client is regenerated
    });

    console.log('💾 Database updated with photobooth URL');

    return NextResponse.json({
      success: true,
      photoboothPrintUrl: photoboothUrl,
      coupleNames,
      eventDate,
    });

  } catch (error: any) {
    console.error('❌ Photobooth generation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: 'Failed to generate photobooth print', details: error.message },
      { status: 500 }
    );
  }
}
