import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all stats in parallel
    const [
      totalPhotos,
      totalVideos,
      featuredPhotos,
      totalClients,
      totalBookings,
      totalTeamMembers,
      unreadMessages,
    ] = await Promise.all([
      prisma.image.count(),
      prisma.video.count(),
      prisma.image.count({ where: { featured: true } }),
      prisma.client.count(),
      prisma.booking.count(),
      prisma.teamMember.count(),
      prisma.contactMessage.count({ where: { status: 'unread' } }),
    ]);

    return NextResponse.json({
      totalPhotos,
      totalVideos,
      featuredPhotos,
      totalClients,
      totalBookings,
      totalTeamMembers,
      unreadMessages,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
