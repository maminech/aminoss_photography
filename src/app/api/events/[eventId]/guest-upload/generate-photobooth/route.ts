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

    // Create enhanced photobooth print using Cloudinary transformations
    // Strategy: Resize photo first, add white border, then overlay text
    const transformations = {
      transformation: [
        // Step 1: Resize the photo to fit in the center
        { 
          width: 1000, 
          height: 1200, 
          crop: 'fill', 
          gravity: 'auto:faces', 
          quality: 'auto:best',
        },
        
        // Step 2: Add white borders (200px top, 100px sides, 180px bottom)
        { 
          border: '200px_100px_180px_100px_solid_rgb:ffffff',
        },
        
        // Step 3: Add all text overlays
        {
          overlay: 'text:Arial_50:♥',
          gravity: 'north',
          y: 15,
          color: 'ff69b4',
        },
        {
          overlay: `text:Pacifico_68_bold:${encodeURIComponent(coupleNames)}`,
          gravity: 'north',
          y: 75,
          color: '1a1a1a',
        },
        {
          overlay: `text:Lato_38:${encodeURIComponent(eventDate)}`,
          gravity: 'north',
          y: 150,
          color: '555555',
        },
        {
          overlay: 'text:Arial_24:━━━━━━━━━━━━━━━━',
          gravity: 'south',
          y: 145,
          color: 'ff69b4',
        },
        {
          overlay: `text:Lato_30:${encodeURIComponent(guestMessage.substring(0, 80))}`,
          gravity: 'south',
          y: 100,
          color: '333333',
        },
        {
          overlay: `text:Lato_26:${encodeURIComponent(`With love from ${bottomMessage.substring(0, 25)}`)}`,
          gravity: 'south',
          y: 60,
          color: '666666',
        },
        {
          overlay: 'text:Arial_28:❤ ❤ ❤',
          gravity: 'south',
          y: 20,
          color: 'ff69b4',
        },
        
        // Step 4: Add shadow effect
        {
          effect: 'shadow:40'
        },
        
        // Step 5: Final resize to print size (4x6 at 300 DPI)
        { 
          width: 1200, 
          height: 1800, 
          crop: 'pad', 
          background: 'white',
          quality: 100
        },
      ]
    };

    // Generate the URL with transformations
    console.log('🖼️ Generating photobooth URL for cloudinaryId:', photo.cloudinaryId);
    
    const photoboothUrl = cloudinary.url(photo.cloudinaryId, {
      ...transformations,
      fetch_format: 'jpg',
      quality: 'auto:best',
    });

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
