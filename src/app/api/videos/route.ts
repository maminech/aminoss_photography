import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Public API - Get videos for display on website
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homepage = searchParams.get('homepage') === 'true';
    const backgroundVideo = searchParams.get('backgroundVideo') === 'true';
    const limit = searchParams.get('limit');
    
    const videos = await prisma.video.findMany({
      where: {
        showInGallery: true, // Only show videos marked to be displayed
        ...(homepage && { showOnHomepage: true }), // Filter by homepage if requested
        ...(backgroundVideo && { backgroundVideo: true }), // Filter for background video
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      ...(limit && { take: parseInt(limit) }),
    });

    const response = NextResponse.json(videos);
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('Error fetching public videos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
