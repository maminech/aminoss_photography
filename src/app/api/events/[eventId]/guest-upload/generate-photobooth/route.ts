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
    // Strategy: Create photo with large white borders, then position text in the border areas
    const transformations = [
      // 1. Resize the photo to core size (leaving room for text borders)
      { 
        width: 1000, 
        height: 1200, 
        crop: 'fill', 
        gravity: 'auto:faces', 
        quality: 'auto:best',
        fetch_format: 'auto'
      },
      
      // 2. Add large white borders: 200px top, 180px bottom, 100px sides
      // This creates white space for text placement
      { 
        border: '200px_100px_180px_100px_solid_rgb:ffffff',
      },
      
      // 3. Add heart decoration at very top of white border
      {
        overlay: {
          font_family: 'Arial',
          font_size: 50,
          text: '♥',
        },
        gravity: 'north',
        y: 15,
        color: '#ff69b4',
      },
      
      // 4. Add couple names in top white border
      {
        overlay: {
          font_family: 'Pacifico',
          font_size: 68,
          font_weight: 'bold',
          text: coupleNames,
        },
        gravity: 'north',
        y: 75,
        color: '#1a1a1a',
      },
      
      // 5. Add wedding date in top white border
      {
        overlay: {
          font_family: 'Lato',
          font_size: 38,
          text: eventDate,
        },
        gravity: 'north',
        y: 150,
        color: '#555555',
      },
      
      // 6. Add decorative line in bottom white border
      {
        overlay: {
          font_family: 'Arial',
          font_size: 24,
          text: '━━━━━━━━━━━━━━━━',
        },
        gravity: 'south',
        y: 145,
        color: '#ff69b4',
      },
      
      // 7. Add guest message in bottom white border
      {
        overlay: {
          font_family: 'Lato',
          font_size: 30,
          text: guestMessage.substring(0, 80), // Limit length
        },
        gravity: 'south',
        y: 100,
        color: '#333333',
      },
      
      // 8. Add "With love from" text in bottom white border
      {
        overlay: {
          font_family: 'Lato',
          font_size: 26,
          text: `With love from ${bottomMessage.substring(0, 25)}`,
        },
        gravity: 'south',
        y: 60,
        color: '#666666',
      },
      
      // 9. Add small hearts decoration at bottom of white border
      {
        overlay: {
          font_family: 'Arial',
          font_size: 28,
          text: '❤ ❤ ❤',
        },
        gravity: 'south',
        y: 20,
        color: '#ff69b4',
      },
      
      // 10. Add subtle shadow effect
      {
        effect: 'shadow:40'
      },
      
      // 11. Final resize to standard print size (4x6 inches at 300 DPI = 1200x1800px)
      { 
        width: 1200, 
        height: 1800, 
        crop: 'pad', 
        background: 'white',
        quality: 100
      },
    ];

    // Generate the URL with transformations
    console.log('🖼️ Generating photobooth URL for cloudinaryId:', photo.cloudinaryId);
    
    const photoboothUrl = cloudinary.url(photo.cloudinaryId, {
      transformation: transformations,
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
