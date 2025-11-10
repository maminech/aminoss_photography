import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get all packs (admin or public if active=true)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    // If requesting active packages only, allow public access (for booking form)
    if (!activeOnly) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const where = activeOnly ? { active: true } : {};

    const packs = await prisma.pack.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    return NextResponse.json(packs);
  } catch (error) {
    console.error('Error fetching packs:', error);
    return NextResponse.json({ error: 'Failed to fetch packs' }, { status: 500 });
  }
}

// POST - Create pack
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, duration, coverImage, features, category, active, order } = await request.json();

    const pack = await prisma.pack.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration,
        coverImage,
        features: features || [],
        category,
        active: active !== false,
        order: order || 0,
      },
    });

    return NextResponse.json(pack, { status: 201 });
  } catch (error) {
    console.error('Error creating pack:', error);
    return NextResponse.json({ error: 'Failed to create pack' }, { status: 500 });
  }
}

// PUT - Update pack
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await request.json();

    if (data.price) data.price = parseFloat(data.price);

    const pack = await prisma.pack.update({
      where: { id },
      data,
    });

    return NextResponse.json(pack);
  } catch (error) {
    console.error('Error updating pack:', error);
    return NextResponse.json({ error: 'Failed to update pack' }, { status: 500 });
  }
}

// DELETE - Delete pack
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Pack ID required' }, { status: 400 });
    }

    await prisma.pack.delete({ where: { id } });

    return NextResponse.json({ message: 'Pack deleted' });
  } catch (error) {
    console.error('Error deleting pack:', error);
    return NextResponse.json({ error: 'Failed to delete pack' }, { status: 500 });
  }
}
