import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

// GET - Fetch Instagram account stats (followers, following)
export async function GET() {
  try {
    // Get Instagram settings from database
    const settings = await prisma.settings.findFirst({
      select: {
        instagramAccessToken: true,
        instagramUserId: true,
      }
    });

    if (!settings?.instagramAccessToken || !settings?.instagramUserId) {
      // Return default stats if not configured
      return NextResponse.json({
        followers_count: 0,
        follows_count: 0,
        media_count: 0,
        configured: false
      });
    }

    // Fetch Instagram Business Account data
    const instagramApiUrl = `https://graph.instagram.com/${settings.instagramUserId}?fields=followers_count,follows_count,media_count&access_token=${settings.instagramAccessToken}`;
    
    const response = await fetch(instagramApiUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('Instagram API error:', response.status, response.statusText);
      return NextResponse.json({
        followers_count: 0,
        follows_count: 0,
        media_count: 0,
        configured: false
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      followers_count: data.followers_count || 0,
      follows_count: data.follows_count || 0,
      media_count: data.media_count || 0,
      configured: true
    });

  } catch (error) {
    console.error('Error fetching Instagram stats:', error);
    return NextResponse.json({
      followers_count: 0,
      follows_count: 0,
      media_count: 0,
      configured: false
    });
  }
}
