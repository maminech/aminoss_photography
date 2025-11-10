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
    
    // Message at bottom
    const bottomMessage = gallery.photoboothMessage || 'Thank you for celebrating with us!';

    // Upload a white background frame template to Cloudinary
    // We'll use Cloudinary's text overlays and transformations
    
    // Create the photobooth print using Cloudinary transformations
    const transformations = [
      // 1. Resize the photo to fit in a 4x6 print area (1200x1800px at 300 DPI)
      { width: 1000, height: 1400, crop: 'fill', gravity: 'auto', quality: 'auto:best' },
      
      // 2. Add white border/padding
      { border: '60px_solid_white' },
      
      // 3. Add couple names at the top
      {
        overlay: {
          font_family: 'Arial',
          font_size: 60,
          font_weight: 'bold',
          text: coupleNames,
        },
        gravity: 'north',
        y: 20,
        color: '#333333',
      },
      
      // 4. Add wedding date below names
      {
        overlay: {
          font_family: 'Arial',
          font_size: 36,
          text: eventDate,
        },
        gravity: 'north',
        y: 90,
        color: '#666666',
      },
      
      // 5. Add message at the bottom
      {
        overlay: {
          font_family: 'Arial',
          font_size: 32,
          text: bottomMessage,
        },
        gravity: 'south',
        y: 30,
        color: '#666666',
      },
      
      // 6. Add decorative heart icon at top
      {
        overlay: {
          font_family: 'Arial',
          font_size: 40,
          text: '❤',
        },
        gravity: 'north',
        y: 5,
      },
      
      // 7. Final resize to standard print size (4x6 inches at 300 DPI = 1200x1800px)
      { width: 1200, height: 1800, crop: 'pad', background: 'white' },
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
