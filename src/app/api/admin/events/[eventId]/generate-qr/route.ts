import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Generate QR code
    const uploadUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/events/${params.eventId}/guest-upload`;
    
    const qrCodeDataURL = await QRCode.toDataURL(uploadUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    
    // Update gallery with QR code
    await prisma.clientGallery.update({
      where: { id: params.eventId },
      data: { 
        qrCodeUrl: qrCodeDataURL,
        guestUploadEnabled: true, // Enable guest uploads when generating QR
      },
    });
    
    return NextResponse.json({
      success: true,
      qrCodeUrl: qrCodeDataURL,
      uploadUrl,
    });
    
  } catch (error: any) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
