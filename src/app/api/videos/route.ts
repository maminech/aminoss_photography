import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Public API - Get videos for display on website
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homepage = searchParams.get('homepage') === 'true';
    const backgroundVideo = searchParams.get('backgroundVideo') === 'true';
    const professionalMode = searchParams.get('professionalMode') === 'true';
    const limit = searchParams.get('limit');
    
    // Build where clause - background videos don't need showInGallery check
    const whereClause: any = {};
    
    if (backgroundVideo) {
      // For background video, only check the backgroundVideo flag
      whereClause.backgroundVideo = true;
    } else if (professionalMode) {
      // For professional mode, only show videos marked for professional mode
      whereClause.showInProfessionalMode = true;
    } else {
      // For regular/simple mode videos, check showInGallery
      whereClause.showInGallery = true;
      if (homepage) {
        whereClause.showOnHomepage = true;
      }
    }
    
    const videos = await prisma.video.findMany({
      where: whereClause,
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
