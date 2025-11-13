import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get approved testimonials for public display
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: [
        { featured: 'desc' }, // Featured first
        { createdAt: 'desc' }, // Then by date
      ],
      select: {
        id: true,
        clientName: true,
        rating: true,
        comment: true,
        eventType: true,
        eventDate: true,
        photoUrl: true,
        featured: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Get public testimonials error:', error);
    return NextResponse.json(
      { error: 'Failed to get testimonials' },
      { status: 500 }
    );
  }
}
