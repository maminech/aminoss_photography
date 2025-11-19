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
    
    // Get bride and groom names from request body
    const { brideName, groomName } = await req.json();
    
    if (!brideName || !groomName) {
      return NextResponse.json({ error: 'Bride and groom names are required' }, { status: 400 });
    }
    
    // Get the base URL from request headers (works in production and local)
    const host = req.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`;
    
    // Generate QR code with correct URL
    const uploadUrl = `${baseUrl}/events/${params.eventId}/guest-upload`;
    
    const qrCodeDataURL = await QRCode.toDataURL(uploadUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    
    // Update gallery with QR code and names
    await prisma.clientGallery.update({
      where: { id: params.eventId },
      data: { 
        qrCodeUrl: qrCodeDataURL,
        guestUploadEnabled: true, // Enable guest uploads when generating QR
        brideName,
        groomName,
      },
    });
    
    return NextResponse.json({
      success: true,
      qrCodeDataURL,
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
