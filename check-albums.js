const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAlbums() {
  try {
    console.log('🔍 Checking albums in database...\n');

    // Get all albums
    const allAlbums = await prisma.album.findMany({
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Total albums: ${allAlbums.length}\n`);

    // Show homepage albums
    const homepageAlbums = allAlbums.filter(a => a.showOnHomepage);
    console.log(`✅ Albums with showOnHomepage=true: ${homepageAlbums.length}`);
    
    if (homepageAlbums.length > 0) {
      console.log('\nHomepage Albums:');
      homepageAlbums.forEach((album, index) => {
        console.log(`\n${index + 1}. ${album.title}`);
        console.log(`   📁 Category: ${album.category}`);
        console.log(`   🖼️  Images: ${album.images.length}`);
        console.log(`   📅 Created: ${new Date(album.createdAt).toLocaleDateString()}`);
        console.log(`   🏠 Show on Homepage: ${album.showOnHomepage ? '✅' : '❌'}`);
        console.log(`   🖼️  Show in Gallery: ${album.showInGallery ? '✅' : '❌'}`);
        if (album.images.length > 0) {
          console.log(`   🔗 First image: ${album.images[0].url.substring(0, 80)}...`);
        }
      });
    }

    // Show gallery albums
    const galleryAlbums = allAlbums.filter(a => a.showInGallery);
    console.log(`\n✅ Albums with showInGallery=true: ${galleryAlbums.length}`);

    // Show albums with no images
    const emptyAlbums = allAlbums.filter(a => a.images.length === 0);
    if (emptyAlbums.length > 0) {
      console.log(`\n⚠️  Empty albums (no images): ${emptyAlbums.length}`);
      emptyAlbums.forEach((album, index) => {
        console.log(`   ${index + 1}. ${album.title} (${album.category}) - Created: ${new Date(album.createdAt).toLocaleDateString()}`);
      });
    }

    // Show recent albums
    console.log('\n\n📅 Most Recent Albums:');
    allAlbums.slice(0, 5).forEach((album, index) => {
      console.log(`\n${index + 1}. ${album.title}`);
      console.log(`   📁 Category: ${album.category}`);
      console.log(`   🖼️  Images: ${album.images.length}`);
      console.log(`   📅 Created: ${new Date(album.createdAt).toLocaleDateString()}`);
      console.log(`   🏠 Homepage: ${album.showOnHomepage ? '✅' : '❌'}  |  🖼️  Gallery: ${album.showInGallery ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlbums();
