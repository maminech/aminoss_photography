import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const { photoIds } = await req.json();

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid photo IDs' },
        { status: 400 }
      );
    }

    // Delete all selected photos
    const result = await prisma.clientPhoto.deleteMany({
      where: {
        id: {
          in: photoIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} photos deleted successfully`,
    });
  } catch (error) {
    console.error('Error bulk deleting photos:', error);
    return NextResponse.json(
      { error: 'Failed to delete photos' },
      { status: 500 }
    );
  }
}
