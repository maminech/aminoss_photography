import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import archiver from 'archiver';

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.eventId;

    // Fetch gallery with guest uploads
    const gallery = await prisma.clientGallery.findUnique({
      where: { id: eventId },
      include: {
        guestUploads: {
          where: {
            isSelectedForPrint: true,
            status: 'approved',
          },
          orderBy: { uploadedAt: 'asc' },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    if (gallery.guestUploads.length === 0) {
      return NextResponse.json(
        { error: 'No print photos selected yet' },
        { status: 400 }
      );
    }

    // Create CSV content
    const csvHeader = 'Guest Name,Message,Photo URL,Uploaded At\n';
    const csvRows = gallery.guestUploads
      .map((upload: any) => {
        const name = upload.uploaderName.replace(/"/g, '""');
        const message = upload.message.replace(/"/g, '""');
        const url = upload.fileUrl;
        const date = new Date(upload.uploadedAt).toISOString();
        return `"${name}","${message}","${url}","${date}"`;
      })
      .join('\n');
    const csvContent = csvHeader + csvRows;

    // Add photo URLs to a text file (for batch download reference)
    const photoUrlsContent = gallery.guestUploads
      .map((upload: any, idx: number) => `${idx + 1}. ${upload.uploaderName} - ${upload.fileUrl}`)
      .join('\n');

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Collect chunks as the archive streams data
    const chunks: Buffer[] = [];
    
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Add files to archive
    archive.append(csvContent, { name: 'manifest.csv' });
    archive.append(photoUrlsContent, { name: 'photo_urls.txt' });

    // Finalize archive
    await archive.finalize();

    // Combine all chunks into a single buffer
    const buffer = Buffer.concat(chunks);

    // Return ZIP file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="guest-uploads-${eventId}.zip"`,
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
