import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - List all albums
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featuredOnly = searchParams.get('featured') === 'true';
    const homepageOnly = searchParams.get('homepage') === 'true';

    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (featuredOnly) where.featured = true;
    if (homepageOnly) where.showOnHomepage = true;

    const albums = await prisma.album.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { images: true },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

// POST - Create new album
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Album POST - Session check:', {
      hasSession: !!session,
      user: session?.user,
      role: session?.user?.role,
    });
    
    if (!session) {
      console.error('Album POST - No session found');
      return NextResponse.json({ error: 'Not authenticated. Please log in again.' }, { status: 401 });
    }
    
    const userRole = session.user?.role?.toLowerCase();
    if (userRole !== 'admin') {
      console.error('Album POST - User is not admin. Role:', session.user?.role);
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Creating album with body:', body);
    
    const {
      title,
      description,
      category,
      featured,
      showOnHomepage,
      showInGallery,
      order,
    } = body;

    if (!title) {
      console.error('Album creation failed: Title is required');
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const album = await prisma.album.create({
      data: {
        title,
        description: description || null,
        category: category || 'all',
        featured: featured || false,
        showOnHomepage: showOnHomepage || false,
        showInGallery: showInGallery !== false, // Default true
        order: order || 0,
      },
      include: {
        images: true,
        _count: {
          select: { images: true },
        },
      },
    });

    console.log('Album created successfully:', album.id);
    return NextResponse.json(album);
  } catch (error) {
    console.error('Error creating album:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create album', details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update album
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Album ID is required' },
        { status: 400 }
      );
    }

    const album = await prisma.album.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { images: true },
        },
      },
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json(
      { error: 'Failed to update album' },
      { status: 500 }
    );
  }
}

// DELETE - Delete album
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Album ID is required' },
        { status: 400 }
      );
    }

    // This will set albumId to null for all images in the album (SetNull in schema)
    await prisma.album.delete({
      where: { id },
    });

    // Revalidate all relevant paths to clear cache
    revalidatePath('/');
    revalidatePath('/api/public/posts');
    revalidatePath('/gallery');

    return NextResponse.json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json(
      { error: 'Failed to delete album' },
      { status: 500 }
    );
  }
}
