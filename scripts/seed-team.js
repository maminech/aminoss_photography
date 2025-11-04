const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const teamMembers = [
  {
    name: 'Aminoss',
    role: 'Lead Photographer & Creative Director',
    bio: 'Professional photographer with 10+ years of experience, specializing in weddings and portraits.',
    image: 'https://res.cloudinary.com/dc67gl8fu/image/upload/v1762143346/575979105_1773518303328582_3518430202353162681_n_wmnkpr.jpg',
    instagram: '@ami_noss.photography',
    email: 'aminoss@photography.com',
    order: 1,
    visible: true,
  },
  {
    name: 'Sarah Johnson',
    role: 'Second Photographer',
    bio: 'Expert in capturing candid moments and alternative angles during events.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80',
    instagram: '@sarah_photos',
    order: 2,
    visible: true,
  },
  {
    name: 'Michael Chen',
    role: 'Videographer',
    bio: 'Cinematic storytelling specialist with a passion for capturing emotions in motion.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    instagram: '@michael_films',
    order: 3,
    visible: true,
  },
  {
    name: 'Emma Davis',
    role: 'Photo Editor',
    bio: 'Master of post-production, bringing out the best in every photograph.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
    instagram: '@emma_edits',
    order: 4,
    visible: true,
  },
  {
    name: 'James Wilson',
    role: 'Lighting Specialist',
    bio: 'Creates perfect lighting setups for studio and on-location shoots.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    instagram: '@james_lighting',
    order: 5,
    visible: true,
  },
  {
    name: 'Lisa Martinez',
    role: 'Studio Manager',
    bio: 'Coordinates bookings, schedules, and ensures smooth operations.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    instagram: '@lisa_manages',
    order: 6,
    visible: true,
  },
];

async function main() {
  console.log('🌱 Seeding team members...');

  for (const member of teamMembers) {
    const created = await prisma.teamMember.create({
      data: member,
    });
    console.log(`✅ Created: ${created.name} - ${created.role}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
