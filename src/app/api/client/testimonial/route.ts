import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

async function getClientFromToken(request: NextRequest) {
  const token = request.cookies.get('client-token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.clientId as string;
  } catch {
    return null;
  }
}

// Submit a testimonial
export async function POST(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client info
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true, email: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();
    const { rating, comment, eventType, eventDate, photoUrl } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    // Create testimonial
    const testimonial = await prisma.testimonial.create({
      data: {
        clientId,
        clientName: client.name,
        clientEmail: client.email,
        rating,
        comment: comment.trim(),
        eventType: eventType || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        photoUrl: photoUrl || null,
        approved: false, // Requires admin approval
        featured: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback! Your testimonial will be reviewed by our team.',
      testimonial,
    });
  } catch (error) {
    console.error('Submit testimonial error:', error);
    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
      { status: 500 }
    );
  }
}

// Get client's testimonials
export async function GET(request: NextRequest) {
  try {
    const clientId = await getClientFromToken(request);

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    return NextResponse.json(
      { error: 'Failed to get testimonials' },
      { status: 500 }
    );
  }
}
