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
        email: 'aminoss.photography@gmail.com',
        phone: '+216 94 124 796',
        whatsappNumber: '21694124796',
        instagramUrl: 'https://www.instagram.com/ami_noss.photography',
        facebookUrl: 'https://www.facebook.com/mohamed.chalghoum.266885',
        youtubeUrl: 'https://youtube.com/@aminoss',
        location: 'Sousse, Tunisia',
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
