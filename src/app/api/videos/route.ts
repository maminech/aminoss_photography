import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public API - Get videos for display on website
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homepage = searchParams.get('homepage') === 'true';
    
    const videos = await prisma.video.findMany({
      where: {
        showInGallery: true, // Only show videos marked to be displayed
        ...(homepage && { showOnHomepage: true }), // Filter by homepage if requested
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(videos);
  } catch (error: any) {
    console.error('Error fetching public videos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
