import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(instagramPosts);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}
