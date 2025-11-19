import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { albumQueries, CACHE_DURATION } from '@/lib/db-optimization';

export const dynamic = 'force-dynamic';
export const revalidate = CACHE_DURATION.SHORT; // Cache for 1 minute instead of 0

/**
 * GET /api/public/posts
 * Fetch Instagram-style posts (albums) for the homepage
 * Each post can contain multiple images
 * 
 * Performance optimizations:
 * - Cached queries with 1-minute revalidation
 * - Selective field loading
 * - Optimized database queries
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const homepage = searchParams.get('homepage') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Use optimized cached query for homepage
    if (homepage) {
      const albums = await albumQueries.getHomepageAlbums(limit);
      const posts = albums.map((album) => ({
        id: album.id,
        type: 'post' as const,
        title: album.title,
        description: album.description,
        category: album.category,
        coverImage: album.coverImageUrl || album.images[0]?.thumbnailUrl || '',
        imageCount: album.images.length,
        images: album.images,
        createdAt: album.createdAt,
        featured: album.featured,
      }));
      
      return NextResponse.json(posts, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    // Fetch albums that should be shown
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

    // Enable smart caching for better performance
    return NextResponse.json(posts, {
      headers: {
        // Cache for 60 seconds, serve stale for 120 seconds while revalidating
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
