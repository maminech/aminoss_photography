import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clientName, rating, comment, eventType, eventDate, photoUrl, approved, featured } = body;

    // Validate required fields
    if (!clientName || !comment) {
      return NextResponse.json(
        { error: 'Client name and comment are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // For admin-created testimonials (screenshots), use a system clientId
    // This could be the admin's ID or a placeholder. We'll use "system" as clientId
    const adminClientId = '000000000000000000000000'; // Placeholder ObjectId for system/admin testimonials

    // Create testimonial
    const testimonial = await prisma.testimonial.create({
      data: {
        clientId: adminClientId,
        clientName,
        clientEmail: null, // Admin screenshots don't have client emails
        rating,
        comment,
        eventType: eventType || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        photoUrl: photoUrl || null,
        approved: approved ?? true, // Auto-approve admin testimonials by default
        featured: featured ?? false,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error creating admin testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}
