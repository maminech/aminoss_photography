const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDashboardData() {
  try {
    console.log('🔍 Checking dashboard data in database...\n');

    // Fetch all stats
    const [
      totalPhotos,
      totalVideos,
      featuredPhotos,
      totalClients,
      totalBookings,
      totalTeamMembers,
      unreadMessages,
      tracking,
      allBookings,
      allMessages,
    ] = await Promise.all([
      prisma.image.count(),
      prisma.video.count(),
      prisma.image.count({ where: { featured: true } }),
      prisma.client.count(),
      prisma.booking.count(),
      prisma.teamMember.count(),
      prisma.contactMessage.count({ where: { status: 'unread' } }),
      prisma.booking.count({ where: { status: 'tracking' } }),
      prisma.booking.findMany({ select: { id: true, status: true, clientName: true } }),
      prisma.contactMessage.findMany({ select: { id: true, status: true, name: true } }),
    ]);

    console.log('📊 Dashboard Statistics:');
    console.log('========================');
    console.log(`📸 Total Photos: ${totalPhotos}`);
    console.log(`🎥 Total Videos: ${totalVideos}`);
    console.log(`⭐ Featured Photos: ${featuredPhotos}`);
    console.log(`👥 Total Clients: ${totalClients}`);
    console.log(`📅 Total Bookings: ${totalBookings}`);
    console.log(`👨‍💼 Team Members: ${totalTeamMembers}`);
    console.log(`✉️  Unread Messages: ${unreadMessages}`);
    console.log(`📈 Tracking (Leads): ${tracking}`);
    console.log('\n');

    // Show booking details
    if (allBookings.length > 0) {
      console.log('📅 Bookings Details:');
      console.log('===================');
      allBookings.forEach((booking, i) => {
        console.log(`${i + 1}. ${booking.clientName || 'No name'} - Status: ${booking.status}`);
      });
      console.log('\n');
    }

    // Show message details
    if (allMessages.length > 0) {
      console.log('✉️  Messages Details:');
      console.log('===================');
      allMessages.forEach((msg, i) => {
        console.log(`${i + 1}. ${msg.name || 'No name'} - Status: ${msg.status}`);
      });
      console.log('\n');
    }

    // Check if any data exists
    if (totalPhotos === 0 && totalVideos === 0 && totalBookings === 0) {
      console.log('⚠️  WARNING: No data found in database!');
      console.log('\n📝 Possible reasons:');
      console.log('   1. Database is empty (first time setup)');
      console.log('   2. Photos not synced from Cloudinary yet');
      console.log('   3. No bookings or messages received');
      console.log('\n💡 Next steps:');
      console.log('   - Visit /admin/dashboard/photos to sync photos');
      console.log('   - Test booking form at /booking');
      console.log('   - Test contact form at /contact');
    } else {
      console.log('✅ Database has data!');
    }

  } catch (error) {
    console.error('❌ Error checking dashboard data:', error);
    console.error('\nFull error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDashboardData();
