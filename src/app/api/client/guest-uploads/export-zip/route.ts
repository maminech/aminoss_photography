import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import archiver from 'archiver';
import https from 'https';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

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

function fetchImageAsBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
  });
}

export async function GET(req: NextRequest) {
  try {
    const clientId = await getClientFromToken(req);

    if (!clientId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all galleries with approved guest uploads for this client
    const galleries = await prisma.clientGallery.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        guestUploads: {
          where: {
            status: 'approved',
          },
          orderBy: {
            uploadedAt: 'asc',
          },
        },
      },
    });

    // Filter galleries that have uploads
    const galleriesWithUploads = galleries.filter(
      g => g.guestUploads.length > 0
    );

    if (galleriesWithUploads.length === 0) {
      return NextResponse.json(
        { error: 'No guest uploads found' },
        { status: 404 }
      );
    }

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 6 },
    });

    const chunks: Buffer[] = [];

    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    const archivePromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      archive.on('error', reject);
    });

    // Add files to archive organized by gallery (ONLY photos, no metadata)
    for (const gallery of galleriesWithUploads) {
      const galleryFolderName = gallery.name.replace(/[^a-z0-9]/gi, '_');

      // Group uploads by uploadGroupId to organize photos by guest
      const uploadGroups = new Map<string, typeof gallery.guestUploads>();
      for (const upload of gallery.guestUploads) {
        if (!uploadGroups.has(upload.uploadGroupId)) {
          uploadGroups.set(upload.uploadGroupId, []);
        }
        uploadGroups.get(upload.uploadGroupId)!.push(upload);
      }

      // Process each guest's uploads
      for (const [groupId, uploads] of uploadGroups.entries()) {
        const firstUpload = uploads[0];
        const guestFolderName = firstUpload.uploaderName.replace(/[^a-z0-9]/gi, '_');
        
        // Add each photo from this guest
        for (let i = 0; i < uploads.length; i++) {
          const upload = uploads[i];
          try {
            const imageBuffer = await fetchImageAsBuffer(upload.fileUrl);
            const fileName = `photo_${i + 1}.jpg`;
            archive.append(imageBuffer, {
              name: `${galleryFolderName}/${guestFolderName}/${fileName}`,
            });
          } catch (error) {
            console.error(`Failed to fetch image: ${upload.fileUrl}`, error);
          }
        }
      }
    }

    // Finalize the archive
    await archive.finalize();
    const zipBuffer = await archivePromise;

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="all_guest_uploads.zip"`,
      },
    });
  } catch (error) {
    console.error('Export ZIP error:', error);
    return NextResponse.json(
      { error: 'Failed to create ZIP file' },
      { status: 500 }
    );
  }
}
