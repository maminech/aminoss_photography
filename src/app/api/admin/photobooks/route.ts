import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('🔐 Admin photobooks request - Session:', session?.user?.email || 'None');

    if (!session || !session.user) {
      console.log('❌ No session found');
      return NextResponse.json({ 
        error: 'Unauthorized - Please log in to admin panel',
        needsLogin: true 
      }, { status: 401 });
    }

    // Check if user is admin (case-insensitive)
    const userRole = (session.user as any).role;
    if (!userRole || userRole.toLowerCase() !== 'admin') {
      console.log('❌ User is not admin:', userRole);
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required',
        needsLogin: true 
      }, { status: 403 });
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'draft', 'submitted', 'approved', 'printing', 'completed'

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const photobooks = await prisma.photobook.findMany({
      where,
      include: {
        pages: {
          orderBy: {
            pageNumber: 'asc',
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Show submitted/pending first
        { updatedAt: 'desc' }, // Then by most recent
      ],
    });

    // Get client and gallery info for each photobook
    const photobooksWithDetails = await Promise.all(
      photobooks.map(async (photobook) => {
        const client = await prisma.client.findUnique({
          where: { id: photobook.clientId },
          select: { id: true, name: true, email: true },
        });

        const gallery = await prisma.clientGallery.findUnique({
          where: { id: photobook.galleryId },
          select: { id: true, name: true },
        });

        return {
          ...photobook,
          client: client || { id: photobook.clientId, name: 'Unknown Client', email: 'N/A' },
          gallery: gallery || { id: photobook.galleryId, name: 'Unknown Gallery' },
        };
      })
    );

    return NextResponse.json({ photobooks: photobooksWithDetails });
  } catch (error) {
    console.error('Error fetching photobooks:', error);
    return NextResponse.json({ error: 'Failed to fetch photobooks' }, { status: 500 });
  }
}

// Update photobook status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = (session.user as any)?.role;
    if (!session || !userRole || userRole.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photobookId, status, adminNotes } = await request.json();

    if (!photobookId) {
      return NextResponse.json({ error: 'Photobook ID required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['draft', 'submitted', 'approved', 'printing', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const photobook = await prisma.photobook.findUnique({
      where: { id: photobookId },
    });

    if (!photobook) {
      return NextResponse.json({ error: 'Photobook not found' }, { status: 404 });
    }

    // Update photobook
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    // Set approvedAt timestamp when status changes to approved
    if (status === 'approved' && photobook.status !== 'approved') {
      updateData.approvedAt = new Date();
    }

    const updated = await prisma.photobook.update({
      where: { id: photobookId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      photobook: updated,
      message: `Photobook status updated to ${status}` 
    });
  } catch (error) {
    console.error('Error updating photobook:', error);
    return NextResponse.json({ error: 'Failed to update photobook' }, { status: 500 });
  }
}
