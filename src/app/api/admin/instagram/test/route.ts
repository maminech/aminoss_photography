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
        error: 'No access token found',
        hasToken: false,
      });
    }

    const accessToken = settings.instagramAccessToken;
    const userId = settings.instagramUserId;

    // Test the access token
    const testResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );

    if (!testResponse.ok) {
      const error = await testResponse.json();
      return NextResponse.json({
        error: 'Access token is invalid or expired',
        details: error,
        hasToken: true,
        tokenValid: false,
      });
    }

    const userData = await testResponse.json();

    // Test fetching media
    const mediaResponse = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type&limit=5&access_token=${accessToken}`
    );

    let mediaCount = 0;
    let mediaError = null;

    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      mediaCount = mediaData.data?.length || 0;
    } else {
      mediaError = await mediaResponse.json();
    }

    return NextResponse.json({
      hasToken: true,
      tokenValid: true,
      username: userData.username,
      userId: userData.id,
      mediaCount,
      mediaError,
      message: mediaCount > 0 
        ? `✅ Token is valid! Found ${mediaCount} posts.`
        : '⚠️ Token is valid but no posts found. Make sure your Instagram is a Business account.',
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      details: error.message,
    }, { status: 500 });
  }
}
