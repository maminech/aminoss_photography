import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm22wlmpx',
  api_key: process.env.CLOUDINARY_API_KEY || '816775898924348',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mbU--NngMju5dzFgvO_LExO7nnc',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ids, action, data, deleteFromCloudinary } = body as {
      ids?: string[];
      action?: string;
      data?: any;
      deleteFromCloudinary?: boolean;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    if (action === 'delete') {
      const deleted: string[] = [];
      for (const id of ids) {
        const img = await prisma.image.findUnique({ where: { id } });
        if (!img) continue;
        if (deleteFromCloudinary) {
          try {
            await cloudinary.uploader.destroy(img.cloudinaryId);
          } catch (e) {
            console.error('Cloudinary delete error for', img.cloudinaryId, e);
          }
        }
        await prisma.image.delete({ where: { id } });
        deleted.push(id);
      }
      return NextResponse.json({ message: `Deleted ${deleted.length} images` });
    }

    if (action === 'update') {
      // Use updateMany where possible; for simplicity update one-by-one to support flexible partial updates
      const updated: string[] = [];
      for (const id of ids) {
        try {
          await prisma.image.update({ where: { id }, data });
          updated.push(id);
        } catch (e) {
          console.error('Bulk update failed for', id, e);
        }
      }
      return NextResponse.json({ message: `Updated ${updated.length} images` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk images error:', error);
    return NextResponse.json({ error: error.message || 'Bulk action failed' }, { status: 500 });
  }
}
