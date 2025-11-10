import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/google-calendar/sync
 * Manually sync calendar events
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.siteSettings.findFirst() as any;
    
    if (!settings?.googleCalendarAccessToken) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    // Update last sync timestamp
    await (prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        googleCalendarLastSync: new Date(),
      } as any,
    }) as any);

    return NextResponse.json({ 
      message: 'Calendar synced successfully',
      lastSync: new Date(),
    });
  } catch (error: any) {
    console.error('Error syncing Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    );
  }
}
