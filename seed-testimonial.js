const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTestimonial() {
  try {
    console.log('Creating sample testimonial...');
    
    const testimonial = await prisma.testimonial.create({
      data: {
        clientId: '000000000000000000000000', // System client ID
        clientName: 'Sarah & Ahmed',
        clientEmail: null,
        rating: 5,
        comment: 'Une expérience extraordinaire ! Aymen et son équipe ont capturé notre mariage avec une sensibilité et un professionnalisme exceptionnels. Chaque photo raconte notre histoire d\'amour. Nous sommes éternellement reconnaissants pour ces souvenirs magnifiques.',
        eventType: 'Mariage',
        eventDate: new Date('2024-09-15'),
        photoUrl: null,
        approved: true,
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Sample testimonial created successfully:', testimonial.id);
    console.log('📝 Client:', testimonial.clientName);
    console.log('⭐ Rating:', testimonial.rating);
    console.log('🎉 Featured:', testimonial.featured);
    console.log('\n🌐 Visit your home page to see it in the carousel!');
  } catch (error) {
    console.error('❌ Error creating testimonial:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestimonial();
