import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch public contact and social settings
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      select: {
        email: true,
        phone: true,
        whatsappNumber: true,
        instagramUrl: true,
        facebookUrl: true,
        youtubeUrl: true,
        twitterUrl: true,
        linkedinUrl: true,
        location: true,
      },
    });

    // Return defaults if no settings exist
    if (!settings) {
      return NextResponse.json({
        email: 'innov8production@gmail.com',
        phone: '+216 55985565',
        whatsappNumber: '21655985565',
        instagramUrl: 'https://www.instagram.com/innov8_production',
        facebookUrl: 'https://www.facebook.com/innovproduction',
        youtubeUrl: 'https://youtube.com/@innov8production',
        location: 'Moknine, Sousse Governorate, Tunisia',
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching contact settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact settings' },
      { status: 500 }
    );
  }
}
