import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
    const transformations = [
      // 1. Resize the photo to fit in a 4x6 print area with optimal quality
      { 
        width: 1000, 
        height: 1300, 
        crop: 'fill', 
        gravity: 'auto:faces', 
        quality: 'auto:best',
        fetch_format: 'auto'
      },
      
      // 2. Add elegant white border with shadow effect
      { 
        border: '80px_solid_rgb:ffffff',
        effect: 'shadow:50'
      },
      
      // 3. Add decorative top border/frame
      {
        overlay: {
          font_family: 'Pacifico',
          font_size: 72,
          font_weight: 'bold',
          text: coupleNames,
        },
        gravity: 'north',
        y: 25,
        color: '#1a1a1a',
      },
      
      // 4. Add heart decoration above names
      {
        overlay: {
          font_family: 'Arial',
          font_size: 48,
          text: '♥',
        },
        gravity: 'north',
        y: 5,
        color: '#ff69b4',
      },
      
      // 5. Add wedding date with elegant styling
      {
        overlay: {
          font_family: 'Lato',
          font_size: 40,
          text: eventDate,
        },
        gravity: 'north',
        y: 105,
        color: '#555555',
      },
      
      // 6. Add decorative line under date
      {
        overlay: {
          font_family: 'Arial',
          font_size: 24,
          text: '━━━━━━━━━━━━━━━━',
        },
        gravity: 'north',
        y: 150,
        color: '#ff69b4',
      },
      
      // 7. Add guest message in the middle-bottom area
      {
        overlay: {
          font_family: 'Lato',
          font_size: 32,
          text: guestMessage.substring(0, 100), // Limit length
        },
        gravity: 'south',
        y: 120,
        color: '#333333',
      },
      
      // 8. Add "With love from" text
      {
        overlay: {
          font_family: 'Lato',
          font_size: 28,
          text: `With love from ${bottomMessage.substring(0, 30)}`,
        },
        gravity: 'south',
        y: 70,
        color: '#666666',
      },
      
      // 9. Add small hearts decoration at bottom
      {
        overlay: {
          font_family: 'Arial',
          font_size: 28,
          text: '❤ ❤ ❤',
        },
        gravity: 'south',
        y: 25,
        color: '#ff69b4',
      },
      
      // 10. Final resize to standard print size (4x6 inches at 300 DPI = 1200x1800px)
      { 
        width: 1200, 
        height: 1800, 
        crop: 'pad', 
        background: 'white',
        quality: 100
      },
    ];

    // Generate the URL with transformations
    const photoboothUrl = cloudinary.url(photo.cloudinaryId, {
      transformation: transformations,
      fetch_format: 'jpg',
      quality: 'auto:best',
    });

    // Update the photo record with the photobooth print URL
    await prisma.guestUpload.update({
      where: { id: photoId },
      data: {
        photoboothPrintUrl: photoboothUrl,
      } as any, // Type assertion until Prisma client is regenerated
    });

    return NextResponse.json({
      success: true,
      photoboothPrintUrl: photoboothUrl,
      coupleNames,
      eventDate,
    });

  } catch (error: any) {
    console.error('Photobooth generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate photobooth print', details: error.message },
      { status: 500 }
    );
  }
}
