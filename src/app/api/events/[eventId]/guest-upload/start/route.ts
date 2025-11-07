import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { uploaderName, message } = await req.json();
    
    // Validation
    if (!uploaderName || uploaderName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    if (message.length > 200) {
      return NextResponse.json(
        { error: 'Message must be 200 characters or less' },
        { status: 400 }
      );
    }
    
    // Verify gallery exists and guest uploads are enabled
    const gallery = await prisma.clientGallery.findUnique({
      where: { id: params.eventId },
    });
    
    if (!gallery) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    if (!gallery.guestUploadEnabled) {
      return NextResponse.json(
        { error: 'Guest uploads are not enabled for this event' },
        { status: 403 }
      );
    }
    
    // Generate unique upload group ID
    const uploadGroupId = uuidv4();
    
    return NextResponse.json({
      success: true,
      uploadGroupId,
      eventId: params.eventId,
      uploaderName: uploaderName.trim(),
      message: message.trim(),
    });
    
  } catch (error: any) {
    console.error('Guest upload start error:', error);
    return NextResponse.json(
      { error: 'Failed to start upload session' },
      { status: 500 }
    );
  }
}
