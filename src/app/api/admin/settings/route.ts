import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Fetch site settings
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Aminoss Photography',
          tagline: 'Capturing Moments, Creating Memories',
          location: 'Sousse, Tunisia',
          instagramUrl: 'https://www.instagram.com/ami_noss.photography',
          facebookUrl: 'https://www.facebook.com/mohamed.chalghoum.266885',
          heroTitle: 'Capturing Life\'s Beautiful Moments',
          heroSubtitle: 'Professional Photography & Videography',
          aboutTitle: 'About Me',
          aboutContent: 'Your story here...',
          services: [],
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT: Update site settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Remove fields that shouldn't be updated
    const { id, updatedAt, createdAt, ...updateData } = data;

    let settings = await prisma.siteSettings.findFirst();

    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: updateData,
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
