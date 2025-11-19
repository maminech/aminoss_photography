import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = (session.user as any)?.role;
    if (!session || !userRole || userRole.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photobookId, status, adminNotes } = await request.json();

    if (!photobookId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update photobook status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    // Set approvedAt timestamp when approving
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }

    const photobook = await prisma.photobook.update({
      where: { id: photobookId },
      data: updateData,
    });

    // If rejecting (setting to draft), you might want to notify the client
    // Add notification logic here if needed

    return NextResponse.json({ success: true, photobook });
  } catch (error) {
    console.error('Error updating photobook status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
