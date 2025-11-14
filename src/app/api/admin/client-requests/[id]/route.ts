import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/client-requests/[id]
 * Update booking request status (approve/reject)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const { id } = params;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        eventType: true,
        eventDate: true,
        timeSlot: true,
        location: true,
        packageName: true,
        packagePrice: true,
        message: true,
        status: true,
        createdAt: true,
        contractGenerated: true,
        calendarEventId: true,
      },
    });

    // TODO: Send email notification to client
    // if (status === 'approved') {
    //   await sendApprovalEmail(updatedBooking);
    // }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating client request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
