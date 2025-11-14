import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch notification counts
    const [trackingBookings, todayBookings, unreadMessages, newPhotoSelections] = await Promise.all([
      // Count bookings in tracking status
      prisma.booking.count({
        where: { status: 'tracking' }
      }),
      
      // Count bookings created today
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      // Count unread contact messages
      prisma.contactMessage.count({
        where: { status: 'unread' }
      }).catch(() => 0),

      // Count photos selected for print in last 7 days
      prisma.clientPhoto.count({
        where: {
          selectedForPrint: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }).catch(() => 0)
    ]);

    return NextResponse.json({
      unreadMessages,
      newPhotoSelections,
      tracking: trackingBookings,
      newBookings: todayBookings
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
