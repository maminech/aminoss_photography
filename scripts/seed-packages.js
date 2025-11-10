/**
 * Seed initial packages for "Demande de Devis" booking form
 * Run with: node scripts/seed-packages.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

async function main() {
  console.log('🌱 Seeding packages...');

  // Check if packages already exist
  const existingPacks = await prisma.pack.count();
  
  if (existingPacks > 0) {
    console.log(`⚠️  ${existingPacks} packages already exist. Skipping seed.`);
    console.log('   To reseed, delete existing packages from the admin panel first.');
    return;
  }

  // Create packages
  for (const packageData of defaultPackages) {
    const pack = await prisma.pack.create({
      data: packageData,
    });
    console.log(`✅ Created package: ${pack.name} (${pack.price} DT)`);
  }

  console.log('\n🎉 Packages seeded successfully!');
  console.log('📝 You can now manage these packages from: /admin/dashboard/packs');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding packages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
