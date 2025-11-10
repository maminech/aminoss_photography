import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/google-calendar/disconnect
 * Disconnect Google Calendar
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create site settings
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      return NextResponse.json({ message: 'Already disconnected' });
    }

    // Clear Google Calendar credentials
    await (prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        googleCalendarAccessToken: null,
        googleCalendarRefreshToken: null,
        googleCalendarEmail: null,
        googleCalendarLastSync: null,
      } as any,
    }) as any);

    return NextResponse.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error: any) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
