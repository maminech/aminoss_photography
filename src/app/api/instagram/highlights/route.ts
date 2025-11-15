import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // Fetch from the correct Highlight table (not InstagramHighlight)
    const highlights = await prisma.highlight.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Transform to match the stories viewer structure
    const formattedHighlights = highlights.map((highlight: any) => ({
      id: highlight.id,
      name: highlight.title, // Use 'title' from Highlight model
      coverImage: highlight.coverImage,
      stories: highlight.items.map((item: any) => ({
        id: item.id,
        image: item.mediaUrl,
        title: item.title || (item.mediaType === 'VIDEO' ? 'Video' : undefined),
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
