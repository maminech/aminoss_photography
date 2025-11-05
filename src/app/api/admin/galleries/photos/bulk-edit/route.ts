import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const { photoIds, updates } = await req.json();

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid photo IDs' },
        { status: 400 }
      );
    }

    // Build update data object (only include fields that are provided)
    const updateData: any = {};
    
    if (updates.title !== undefined && updates.title !== '') {
      updateData.title = updates.title;
    }
    
    if (updates.description !== undefined && updates.description !== '') {
      updateData.description = updates.description;
    }
    
    if (updates.selectedForPrint !== undefined) {
      updateData.selectedForPrint = updates.selectedForPrint;
    }

    // Update all selected photos
    const result = await prisma.clientPhoto.updateMany({
      where: {
        id: {
          in: photoIds,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} photos updated successfully`,
    });
  } catch (error) {
    console.error('Error bulk editing photos:', error);
    return NextResponse.json(
      { error: 'Failed to update photos' },
      { status: 500 }
    );
  }
}
