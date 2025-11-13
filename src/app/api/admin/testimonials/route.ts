import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Get all testimonials (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'all'

    const where: any = {};
    if (status === 'pending') {
      where.approved = false;
    } else if (status === 'approved') {
      where.approved = true;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
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

// Update testimonial (approve/feature/edit)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, approved, featured } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial ID required' },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        approved: approved !== undefined ? approved : undefined,
        featured: featured !== undefined ? featured : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    console.error('Update testimonial error:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// Delete testimonial
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial ID required' },
        { status: 400 }
      );
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
