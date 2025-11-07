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
    // Public endpoint - no auth required for fetching active items
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';

    const where = activeOnly ? { active: true } : {};

    const remerciements = await prisma.remerciement.findMany({
      where,
      orderBy: { order: 'asc' },
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

    const remerciement = await prisma.remerciement.create({
      data: {
        type,
        content,
        author,
        image,
        active: active !== undefined ? active : true,
        order: order !== undefined ? order : 0,
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
