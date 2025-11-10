import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Seed default packages (admin only)
 * POST /api/admin/packs/seed
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if packages already exist
    const existingPacks = await prisma.pack.count();
    
    if (existingPacks > 0) {
      return NextResponse.json({ 
        message: `${existingPacks} packages already exist. Delete them first to reseed.`,
        count: existingPacks 
      }, { status: 400 });
    }

    const defaultPackages = [
      {
        name: 'Essentiel',
        description: 'Package parfait pour les petits événements',
        price: 299,
        duration: '2 heures',
        coverImage: '/images/package-essentiel.jpg',
        features: ['2h de couverture', '100 photos retouchées', '1 photographe'],
        category: 'Photography',
        active: true,
        order: 1,
      },
      {
        name: 'Premium',
        description: 'Notre package le plus populaire',
        price: 499,
        duration: '4 heures',
        coverImage: '/images/package-premium.jpg',
        features: ['4h de couverture', '200 photos retouchées', '1 photographe', 'Album digital'],
        category: 'Photography',
        active: true,
        order: 2,
      },
      {
        name: 'Luxe',
        description: 'Couverture complète de votre événement',
        price: 799,
        duration: 'Journée complète',
        coverImage: '/images/package-luxe.jpg',
        features: ['Journée complète', '400+ photos', '2 photographes', 'Album premium', 'Vidéo highlights'],
        category: 'Photography',
        active: true,
        order: 3,
      },
      {
        name: 'Sur mesure',
        description: 'Package personnalisé selon vos besoins',
        price: 0,
        duration: 'Flexible',
        coverImage: '/images/package-custom.jpg',
        features: ['Package personnalisé selon vos besoins'],
        category: 'Custom',
        active: true,
        order: 4,
      },
    ];

    // Create packages
    const createdPackages = await prisma.pack.createMany({
      data: defaultPackages,
    });

    return NextResponse.json({
      message: 'Packages seeded successfully',
      count: createdPackages.count,
      packages: defaultPackages.map(p => p.name),
    });
  } catch (error) {
    console.error('Error seeding packages:', error);
    return NextResponse.json({ error: 'Failed to seed packages' }, { status: 500 });
  }
}
