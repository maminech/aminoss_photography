import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/remerciements
 * Fetch all thank-you messages/images
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    const pendingOnly = url.searchParams.get('pendingOnly') === 'true';

    // For public display (activeOnly), no auth needed
    // For admin view, check auth
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    let where: any = {};

    if (activeOnly) {
      where.active = true;
      where.approved = true; // Only show approved items publicly
    } else if (pendingOnly) {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      where.approved = false;
    } else if (!isAdmin) {
      // Non-admin users can only see active, approved items
      where.active = true;
      where.approved = true;
    }

    const remerciements = await prisma.remerciement.findMany({
      where,
      orderBy: [{ approved: 'asc' }, { order: 'asc' }], // Show pending first for admin
    });

    return NextResponse.json(remerciements);
  } catch (error) {
    console.error('Error fetching remerciements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/remerciements
 * Create new thank-you message/image
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { type, content, author, image, active, order } = data;

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
        author,
        image,
        clientEmail: session.user.email, // Admin's email
        approved: true, // Admin-created items are auto-approved
        active: active !== undefined ? active : true,
        order: order !== undefined ? order : ((maxOrder._max.order || 0) + 1),
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
