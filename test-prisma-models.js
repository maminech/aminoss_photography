// Test script to verify all Prisma models work correctly
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testModels() {
  console.log('🧪 Testing Prisma Models...\n');

  try {
    // Test 1: Client model
    console.log('✓ Testing Client model...');
    const clientCount = await prisma.client.count();
    console.log(`  Found ${clientCount} clients`);

    // Test 2: ClientGallery model
    console.log('✓ Testing ClientGallery model...');
    const galleryCount = await prisma.clientGallery.count();
    console.log(`  Found ${galleryCount} galleries`);

    // Test 3: ClientPhoto model
    console.log('✓ Testing ClientPhoto model...');
    const photoCount = await prisma.clientPhoto.count();
    console.log(`  Found ${photoCount} photos`);

    // Test 4: Pack model
    console.log('✓ Testing Pack model...');
    const packCount = await prisma.pack.count();
    console.log(`  Found ${packCount} packs`);

    // Test 5: Booking model
    console.log('✓ Testing Booking model...');
    const bookingCount = await prisma.booking.count();
    console.log(`  Found ${bookingCount} bookings`);

    // Test 6: BlockedDate model
    console.log('✓ Testing BlockedDate model...');
    const blockedCount = await prisma.blockedDate.count();
    console.log(`  Found ${blockedCount} blocked dates`);

    // Test 7: Image model
    console.log('✓ Testing Image model...');
    const imageCount = await prisma.image.count();
    console.log(`  Found ${imageCount} images`);

    // Test 8: Video model
    console.log('✓ Testing Video model...');
    const videoCount = await prisma.video.count();
    console.log(`  Found ${videoCount} videos`);

    console.log('\n✅ All Prisma models are working correctly!');
    console.log('📊 Summary:');
    console.log(`   - Clients: ${clientCount}`);
    console.log(`   - Galleries: ${galleryCount}`);
    console.log(`   - Photos: ${photoCount}`);
    console.log(`   - Packs: ${packCount}`);
    console.log(`   - Bookings: ${bookingCount}`);
    console.log(`   - Images: ${imageCount}`);
    console.log(`   - Videos: ${videoCount}`);

  } catch (error) {
    console.error('❌ Error testing models:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testModels();
