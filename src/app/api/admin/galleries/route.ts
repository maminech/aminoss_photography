import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Create gallery
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, name, description, expiresAt, allowDownload, password } = await request.json();

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const gallery = await prisma.clientGallery.create({
      data: {
        clientId,
        name,
        description: description || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        allowDownload: allowDownload !== false,
        password: hashedPassword,
      },
    });

    return NextResponse.json(gallery);
  } catch (error) {
    console.error('Create gallery error:', error);
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 });
  }
}

// Delete gallery
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gallery ID required' }, { status: 400 });
    }

    // Delete gallery and all photos (cascade)
    await prisma.clientGallery.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Gallery deleted' });
  } catch (error) {
    console.error('Delete gallery error:', error);
    return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 });
  }
}
