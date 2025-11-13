import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    // Fetch albums that should be shown
    const albums = await prisma.album.findMany({
      where: homepage
        ? { showOnHomepage: true }
        : { showInGallery: true },
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

    // Transform to post format
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

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
