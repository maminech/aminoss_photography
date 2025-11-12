import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import archiver from 'archiver';
import https from 'https';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

async function getClientFromToken(request: NextRequest) {
  const token = request.cookies.get('client-token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.clientId as string;
  } catch {
    return null;
  }
}

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
    const clientId = await getClientFromToken(req);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
    }

    // Fetch gallery with guest uploads
    const gallery = await prisma.clientGallery.findFirst({
      where: { 
        id: galleryId,
        clientId: clientId, // Verify ownership
      },
      include: {
        guestUploads: {
          where: {
            status: 'approved', // Only approved photos
          },
          orderBy: { uploadedAt: 'asc' },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found or access denied' }, { status: 404 });
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

    // Download and add actual photos to the archive (ONLY photos, no metadata files)
    console.log(`Starting download of ${gallery.guestUploads.length} photos...`);
    
    // Group uploads by uploadGroupId to organize by guest
    const uploadGroups = new Map<string, typeof gallery.guestUploads>();
    for (const upload of gallery.guestUploads) {
      if (!uploadGroups.has(upload.uploadGroupId)) {
        uploadGroups.set(upload.uploadGroupId, []);
      }
      uploadGroups.get(upload.uploadGroupId)!.push(upload);
    }
    
    let downloadedCount = 0;
    // Process each guest's photos
    for (const [groupId, uploads] of uploadGroups.entries()) {
      const guestName = uploads[0].uploaderName.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Add each photo from this guest
      for (let i = 0; i < uploads.length; i++) {
        const upload = uploads[i];
        try {
          const filename = `${guestName}/photo_${i + 1}.jpg`;
          
          // Fetch the image
          const imageBuffer = await fetchImage(upload.fileUrl);
          
          // Add to archive
          archive.append(imageBuffer, { name: filename });
          downloadedCount++;
          
          console.log(`Downloaded ${downloadedCount}/${gallery.guestUploads.length}: ${filename}`);
        } catch (error) {
          console.error(`Failed to download photo ${upload.id}:`, error);
          // Continue with other photos even if one fails
        }
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
