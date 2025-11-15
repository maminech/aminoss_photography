import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET - Fetch all highlights with items
export async function GET() {
  try {
    const highlights = await prisma.highlight.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(highlights);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

// POST - Create new highlight
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, coverImage, description, active, order } = body;

    if (!title || !coverImage) {
      return NextResponse.json(
        { error: 'Title and cover image are required' },
        { status: 400 }
      );
    }

    const highlight = await prisma.highlight.create({
      data: {
        title,
        coverImage,
        description: description || null,
        active: active !== undefined ? active : true,
        order: order || 0
      },
      include: {
        items: true
      }
    });

    revalidatePath('/', 'page');
    
    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}

// PATCH - Update highlight order or details
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Highlight ID is required' },
        { status: 400 }
      );
    }

    const highlight = await prisma.highlight.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    revalidatePath('/', 'page');

    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Error updating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to update highlight' },
      { status: 500 }
    );
  }
}

// DELETE - Delete highlight
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Highlight ID is required' },
        { status: 400 }
      );
    }

    await prisma.highlight.delete({
      where: { id }
    });

    revalidatePath('/', 'page');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}
