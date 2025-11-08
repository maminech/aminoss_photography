import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const highlights = await prisma.instagramHighlight.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        stories: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Transform to match the current highlights structure
    const formattedHighlights = highlights.map((highlight: any) => ({
      id: highlight.id,
      name: highlight.name,
      coverImage: highlight.coverImage,
      stories: highlight.stories.map((story: any) => ({
        id: story.id,
        image: story.mediaUrl,
        title: story.mediaType === 'VIDEO' ? 'Video' : undefined,
      })),
    }));

    return NextResponse.json(formattedHighlights);
  } catch (error: any) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}
