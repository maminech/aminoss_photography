const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPhotobooks() {
  try {
    console.log('🔍 Checking submitted photobooks...\n');
    
    const photobooks = await prisma.photobook.findMany({
      where: {
        status: 'submitted'
      },
      include: {
        pages: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    console.log(`📚 Found ${photobooks.length} submitted photobooks:\n`);
    
    for (const pb of photobooks) {
      console.log(`ID: ${pb.id}`);
      console.log(`Title: ${pb.title}`);
      console.log(`Format: ${pb.format}`);
      console.log(`Client ID: ${pb.clientId}`);
      console.log(`Gallery ID: ${pb.galleryId}`);
      console.log(`Total Pages: ${pb.totalPages}`);
      console.log(`Pages in DB: ${pb.pages.length}`);
      console.log(`Submitted At: ${pb.submittedAt}`);
      console.log(`Cover Photo: ${pb.coverPhotoUrl ? 'Yes' : 'No'}`);
      console.log('---');
    }
    
    // Also check all photobooks
    const allPhotobooks = await prisma.photobook.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📊 Total photobooks in database: ${allPhotobooks.length}`);
    console.log('Status breakdown:');
    const statusCounts = allPhotobooks.reduce((acc, pb) => {
      acc[pb.status] = (acc[pb.status] || 0) + 1;
      return acc;
    }, {});
    console.log(statusCounts);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPhotobooks();
