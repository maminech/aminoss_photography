import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/client/remerciements
 * Get client's own testimonials
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const remerciements = await prisma.remerciement.findMany({
      where: {
        clientEmail: session.user.email,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(remerciements);
  } catch (error) {
    console.error('Error fetching client remerciements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/remerciements
 * Submit a testimonial for admin approval
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow both authenticated clients and guests with email
    const data = await request.json();
    const { type, content, author, image, clientEmail } = data;

    // Use session email if available, otherwise require clientEmail in payload
    const email = session?.user?.email || clientEmail;
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      );
    }

    if (!['image', 'text', 'testimonial'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Get the highest order number
    const maxOrder = await prisma.remerciement.aggregate({
      _max: { order: true },
    });

    const remerciement = await prisma.remerciement.create({
      data: {
        type,
        content,
        author: author || session?.user?.name || 'Client',
        image,
        clientEmail: email,
        approved: false, // Requires admin approval
        active: false, // Will be activated by admin
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    return NextResponse.json(remerciement);
  } catch (error) {
    console.error('Error creating remerciement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
