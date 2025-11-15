import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const instagramPosts = await prisma.instagramPost.findMany({
      where: {
        active: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 30, // Limit to 30 most recent posts
    });

    const response = NextResponse.json(instagramPosts);
    
    // Aggressive cache prevention
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('CDN-Cache-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}
