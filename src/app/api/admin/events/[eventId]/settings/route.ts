import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { brideName, groomName, photoboothMessage, eventDate } = body;

    // Update gallery settings
    const gallery = await prisma.clientGallery.update({
      where: { id: params.eventId },
      data: {
        brideName: brideName || null,
        groomName: groomName || null,
        photoboothMessage: photoboothMessage || null,
        ...(eventDate && { eventDate: new Date(eventDate) }),
      } as any, // Type assertion until Prisma client is regenerated
    });

    return NextResponse.json({
      success: true,
      gallery,
    });

  } catch (error: any) {
    console.error('Update gallery settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery settings' },
      { status: 500 }
    );
  }
}
