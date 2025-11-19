import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings?.instagramAccessToken) {
      return NextResponse.json({
        error: 'No Instagram token found',
        message: 'Instagram account not connected',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        accessToken: settings.instagramAccessToken,
        userId: settings.instagramUserId,
        username: settings.instagramUsername,
        lastSync: settings.instagramLastSync,
        tokenLength: settings.instagramAccessToken.length,
      },
    });
  } catch (error: any) {
    console.error('Error getting token:', error);
    return NextResponse.json(
      { error: 'Failed to get token', details: error.message },
      { status: 500 }
    );
  }
}
