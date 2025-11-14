import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Get single photobook
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photobook = await prisma.photobook.findUnique({
      where: { id: params.id },
      include: {
        pages: {
          orderBy: {
            pageNumber: 'asc',
          },
        },
      },
    });

    if (!photobook) {
      return NextResponse.json({ error: 'Photobook not found' }, { status: 404 });
    }

    // Fetch client and gallery
    const client = await prisma.client.findUnique({
      where: { id: photobook.clientId },
      select: { name: true, email: true },
    });

    const gallery = await prisma.clientGallery.findUnique({
      where: { id: photobook.galleryId },
      select: {
        name: true,
        photos: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      photobook: {
        ...photobook,
        client,
        gallery,
      },
    });
  } catch (error) {
    console.error('Error fetching photobook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photobook' },
      { status: 500 }
    );
  }
}

// PATCH - Update photobook status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Set timestamps based on status
    if (status === 'approved' && !updateData.approvedAt) {
      updateData.approvedAt = new Date();
    }
    if (status === 'submitted' && !updateData.submittedAt) {
      updateData.submittedAt = new Date();
    }

    const photobook = await (prisma.photobook as any).update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ photobook, success: true });
  } catch (error) {
    console.error('Error updating photobook:', error);
    return NextResponse.json(
      { error: 'Failed to update photobook' },
      { status: 500 }
    );
  }
}

// DELETE - Delete photobook
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await prisma.photobook.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photobook:', error);
    return NextResponse.json(
      { error: 'Failed to delete photobook' },
      { status: 500 }
    );
  }
}
