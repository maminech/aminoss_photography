import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/google-calendar/settings
 * Check Google Calendar connection status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Google Calendar credentials exist in database
    const settings = await prisma.siteSettings.findFirst() as any;
    
    const isConnected = !!(
      settings?.googleCalendarAccessToken && 
      settings?.googleCalendarRefreshToken
    );

    return NextResponse.json({
      isConnected,
      email: settings?.googleCalendarEmail || undefined,
      lastSync: settings?.googleCalendarLastSync || undefined,
    });
  } catch (error: any) {
    console.error('Error fetching Google Calendar settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
