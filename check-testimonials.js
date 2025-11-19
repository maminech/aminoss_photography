const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { approved: true }
    });
    
    console.log('✅ Approved testimonials in database:', testimonials.length);
    testimonials.forEach(t => {
      console.log(`- ${t.clientName}: ${t.rating} stars ${t.featured ? '⭐ Featured' : ''}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestimonials();
