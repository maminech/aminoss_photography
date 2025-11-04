import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

// Toggle photo selection for print
export async function POST(request: Request) {
  try {
    // Verify client token
    const cookieStore = cookies();
    const token = cookieStore.get('client-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const clientId = payload.clientId as string;

    const { photoId, selected } = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 });
    }

    // Verify photo belongs to client's gallery
    const photo = await prisma.clientPhoto.findUnique({
      where: { id: photoId },
      include: { gallery: true },
    });

    if (!photo || photo.gallery.clientId !== clientId) {
      return NextResponse.json({ error: 'Photo not found or unauthorized' }, { status: 404 });
    }

    // Update selection status
    const updatedPhoto = await prisma.clientPhoto.update({
      where: { id: photoId },
      data: { selectedForPrint: selected },
    });

    return NextResponse.json({ 
      success: true, 
      photoNumber: updatedPhoto.photoNumber,
      selectedForPrint: updatedPhoto.selectedForPrint 
    });
  } catch (error) {
    console.error('Toggle photo selection error:', error);
    return NextResponse.json({ error: 'Failed to update selection' }, { status: 500 });
  }
}
