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
      settings = await (prisma.siteSettings.create({
        data: {
          siteName: 'Innov8 Production',
          tagline: 'Creative Wedding & Event Photography in Tunisia',
          location: 'Moknine, Sousse Governorate, Tunisia',
          email: 'innov8production@gmail.com',
          phone: '+216 55985565',
          whatsappNumber: '21655985565',
          instagramUrl: 'https://www.instagram.com/innov8_production',
          facebookUrl: 'https://www.facebook.com/innovproduction',
          youtubeUrl: 'https://youtube.com/@innov8production',
          heroTitle: 'Capturing Timeless Moments with Passion and Precision',
          heroSubtitle: 'Weddings · Engagements · Events · Lifestyle',
          aboutTitle: 'About Innov8 Production',
          aboutContent: 'Innov8 Production is a creative wedding and event photography studio based in Sousse, Tunisia, led by Aymen Ben Ammar. We specialize in capturing timeless moments with passion and precision.',
          aboutBio: "I'm the founder of Innov8 Production, a creative wedding and event photography studio based in Moknine, Sousse Governorate, Tunisia. We specialize in capturing timeless moments with passion and precision.",
          aboutStatProjects: '+270',
          aboutStatFollowers: '+47.6K',
          aboutStatSatisfaction: '100%',
          aboutStatExperience: '10+',
          services: [],
        } as any,
      }) as any);
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
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    console.log('✅ Session found:', session.user?.email);

    const data = await req.json();
    console.log('📥 Received data:', data);
    
    // Remove fields that shouldn't be updated
    const { id, updatedAt, createdAt, ...updateData } = data;

    let settings = await prisma.siteSettings.findFirst();
    console.log('🔍 Current settings:', settings ? 'Found' : 'Not found');

    if (settings) {
      console.log('📝 Updating existing settings...');
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
      console.log('✅ Settings updated successfully');
    } else {
      console.log('🆕 Creating new settings...');
      settings = await prisma.siteSettings.create({
        data: updateData,
      });
      console.log('✅ Settings created successfully');
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('❌ Error updating settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// POST: Same as PUT (for compatibility)
export async function POST(req: NextRequest) {
  return PUT(req);
}

// PATCH: Same as PUT (for compatibility)
export async function PATCH(req: NextRequest) {
  return PUT(req);
}
