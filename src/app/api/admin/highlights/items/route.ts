import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Add item to highlight
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || !userRole || userRole.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      highlightId,
      cloudinaryId,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      title,
      description,
      width,
      height,
      duration,
      order
    } = body;

    if (!highlightId || !cloudinaryId || !mediaType || !mediaUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const item = await prisma.highlightItem.create({
      data: {
        highlightId,
        cloudinaryId,
        mediaType,
        mediaUrl,
        thumbnailUrl: thumbnailUrl || mediaUrl,
        title: title || null,
        description: description || null,
        width: width || null,
        height: height || null,
        duration: duration || null,
        order: order || 0
      }
    });

    revalidatePath('/', 'page');

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error adding highlight item:', error);
    return NextResponse.json(
      { error: 'Failed to add highlight item' },
      { status: 500 }
    );
  }
}

// PATCH - Update item
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || !userRole || userRole.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await prisma.highlightItem.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/', 'page');

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating highlight item:', error);
    return NextResponse.json(
      { error: 'Failed to update highlight item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || !userRole || userRole.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get item to delete from Cloudinary
    const item = await prisma.highlightItem.findUnique({
      where: { id }
    });

    if (item) {
      // Delete from Cloudinary
      try {
        const resourceType = item.mediaType === 'video' ? 'video' : 'image';
        await cloudinary.uploader.destroy(item.cloudinaryId, {
          resource_type: resourceType
        });
        console.log(`Deleted ${resourceType} from Cloudinary:`, item.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await prisma.highlightItem.delete({
      where: { id }
    });

    revalidatePath('/', 'page');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight item:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight item' },
      { status: 500 }
    );
  }
}
