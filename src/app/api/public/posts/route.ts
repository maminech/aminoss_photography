import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/public/posts
 * Fetch Instagram-style posts (albums) for the homepage
 * Each post can contain multiple images
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const homepage = searchParams.get('homepage') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch albums that should be shown - with fresh data
    const albums = await prisma.album.findMany({
      where: homepage
        ? { 
            showOnHomepage: true,
            images: {
              some: {}  // Only albums with at least one image
            }
          }
        : { 
            showInGallery: true,
            images: {
              some: {}
            }
          },
      include: {
        images: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            width: true,
            height: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: [
        { order: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // Add cache-busting timestamp to all image URLs
    const timestamp = Date.now();
    const cacheBuster = `?v=${timestamp}`;

    // Transform to post format with cache-busting URLs
    const posts = albums
      .filter(album => album.images.length > 0) // Only albums with images
      .map((album) => ({
        id: album.id,
        type: 'post' as const,
        title: album.title,
        description: album.description,
        category: album.category,
        coverImage: (album.coverImageUrl || album.images[0]?.thumbnailUrl || '') + cacheBuster,
        imageCount: album.images.length,
        images: album.images.map(img => ({
          ...img,
          url: img.url + cacheBuster,
          thumbnailUrl: img.thumbnailUrl + cacheBuster,
        })),
        createdAt: album.createdAt,
        featured: album.featured,
      }));

    const response = NextResponse.json(posts);
    
    // Aggressive cache prevention
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
