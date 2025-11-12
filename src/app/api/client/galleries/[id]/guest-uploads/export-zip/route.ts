import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import archiver from 'archiver';
import https from 'https';
import { Readable } from 'stream';

// Helper function to fetch image from URL
async function fetchImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = params.id;

    // Verify the client is accessing their own gallery
    const cookies = req.cookies;
    const clientEmail = cookies.get('client-email')?.value;

    if (!clientEmail) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
    }

    // Fetch gallery with guest uploads
    const gallery = await prisma.clientGallery.findUnique({
      where: { id: galleryId },
      include: {
        client: true,
        guestUploads: {
          where: {
            status: 'approved', // Only approved photos
          },
          orderBy: { uploadedAt: 'asc' },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    // Verify client owns this gallery
    if (gallery.client.email !== clientEmail) {
      return NextResponse.json({ error: 'Unauthorized - Access denied' }, { status: 403 });
    }

    if (gallery.guestUploads.length === 0) {
      return NextResponse.json(
        { error: 'No guest uploads available yet' },
        { status: 400 }
      );
    }

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
    });

    // Create CSV manifest
    const csvHeader = 'Guest Name,Message,Photo Number,Uploaded At,Status\n';
    const csvRows = gallery.guestUploads
      .map((upload: any) => {
        const name = upload.uploaderName.replace(/"/g, '""');
        const message = (upload.message || '').replace(/"/g, '""');
        const date = new Date(upload.uploadedAt).toLocaleDateString();
        const status = upload.status;
        return `"${name}","${message}","Photo","${date}","${status}"`;
      })
      .join('\n');
    const csvContent = csvHeader + csvRows;

    // Add CSV to archive
    archive.append(csvContent, { name: 'guest_uploads_manifest.csv' });

    // Add photo URLs list
    const photoUrlsList = gallery.guestUploads
      .map((upload: any, idx: number) => 
        `${idx + 1}. ${upload.uploaderName} - ${upload.fileUrl}`
      )
      .join('\n');
    
    archive.append(photoUrlsList, { name: 'photo_download_links.txt' });

    // Download and add actual photos to the archive
    console.log(`Starting download of ${gallery.guestUploads.length} photos...`);
    
    let downloadedCount = 0;
    for (const upload of gallery.guestUploads) {
      try {
        // Create a safe filename
        const guestName = upload.uploaderName.replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = new Date(upload.uploadedAt).getTime();
        const filename = `${guestName}_${timestamp}_${upload.id}.jpg`;
        
        // Fetch the image
        const imageBuffer = await fetchImage(upload.fileUrl);
        
        // Add to archive
        archive.append(imageBuffer, { name: `photos/${filename}` });
        downloadedCount++;
        
        console.log(`Downloaded ${downloadedCount}/${gallery.guestUploads.length}: ${filename}`);
      } catch (error) {
        console.error(`Failed to download photo ${upload.id}:`, error);
        // Continue with other photos even if one fails
      }
    }

    // Finalize the archive
    await archive.finalize();

    // Combine all chunks
    const buffer = Buffer.concat(chunks);

    // Return ZIP file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="guest-uploads-${gallery.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Export ZIP error:', error);
    return NextResponse.json(
      { error: 'Failed to export guest uploads' },
      { status: 500 }
    );
  }
}
