import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get('admin-session');

    if (!adminCookie) {
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
