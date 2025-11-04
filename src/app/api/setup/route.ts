import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Create initial admin user
export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Check if any user exists
    const existingUsers = await prisma.user.count();
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'Setup already completed' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Admin',
        role: 'admin',
      },
    });

    // Create default site settings
    await prisma.siteSettings.create({
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
        services: [
          { title: 'Wedding Photography', icon: 'camera', description: 'Capture your special day' },
          { title: 'Portrait Sessions', icon: 'user', description: 'Professional portraits' },
          { title: 'Event Coverage', icon: 'calendar', description: 'Complete event documentation' },
        ],
      },
    });

    // Create default categories
    const categories = ['All', 'Weddings', 'Portraits', 'Travel', 'Fashion', 'Events'];
    for (let i = 0; i < categories.length; i++) {
      await prisma.category.create({
        data: {
          name: categories[i],
          slug: categories[i].toLowerCase(),
          order: i,
          visible: true,
        },
      });
    }

    return NextResponse.json({
      message: 'Setup completed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}
