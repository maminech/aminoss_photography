import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

    // Fetch all guest uploads (approved ones)
    const uploads = await prisma.guestUpload.findMany({
      where: {
        galleryId: eventId,
        status: 'approved',
      },
      orderBy: { uploadedAt: 'asc' },
    });

    if (uploads.length === 0) {
      return NextResponse.json(
        { error: 'No approved uploads yet' },
        { status: 400 }
      );
    }

    // Create CSV content
    const csvHeader = 'Guest Name,Message,Photo URL,Thumbnail URL,Is Print Selected,Uploaded At,File Size,Format\n';
    const csvRows = uploads
      .map((upload: any) => {
        const name = upload.uploaderName.replace(/"/g, '""');
        const message = upload.message.replace(/"/g, '""');
        const url = upload.fileUrl;
        const thumbnail = upload.thumbnailUrl;
        const isPrint = upload.isSelectedForPrint ? 'Yes' : 'No';
        const date = new Date(upload.uploadedAt).toISOString();
        const fileSize = upload.fileSize || 0;
        const format = upload.format || 'jpg';
        return `"${name}","${message}","${url}","${thumbnail}","${isPrint}","${date}",${fileSize},"${format}"`;
      })
      .join('\n');

    const csvContent = csvHeader + csvRows;

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="guest-uploads-${eventId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      { error: 'Failed to export guest uploads' },
      { status: 500 }
    );
  }
}
