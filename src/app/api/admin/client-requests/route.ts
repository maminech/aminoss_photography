import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/client-requests
 * Fetch all client booking requests
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching client requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
