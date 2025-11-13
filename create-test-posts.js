const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestPosts() {
  console.log('🎨 Creating test posts (albums with multiple images)...\n');

  try {
    // Get some existing images to use in test albums
    const existingImages = await prisma.image.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
    });

    if (existingImages.length < 6) {
      console.log('❌ Need at least 6 images in database to create test posts');
      console.log('   Upload some photos via admin panel first!');
      return;
    }

    console.log(`✅ Found ${existingImages.length} images to use for test posts\n`);

    // Create 3 test albums (posts)
    const testPosts = [
      {
        title: 'Wedding Day Magic ✨',
        description: 'Beautiful moments from Sarah & Mike\'s wedding',
        category: 'weddings',
        imageIds: [0, 1, 2, 3], // First 4 images
      },
      {
        title: 'Sunset Session 🌅',
        description: 'Golden hour portraits at the beach',
        category: 'portraits',
        imageIds: [4, 5, 6], // Next 3 images
      },
      {
        title: 'Family Reunion 👨‍👩‍👧‍👦',
        description: 'Three generations together',
        category: 'portraits',
        imageIds: [7, 8, 9, 10], // Next 4 images
      },
    ];

    for (const postData of testPosts) {
      // Create album
      const album = await prisma.album.create({
        data: {
          title: postData.title,
          description: postData.description,
          category: postData.category,
          showOnHomepage: true,
          showInGallery: true,
          featured: false,
          order: 0,
        },
      });

      console.log(`📸 Created post: "${postData.title}"`);

      // Link images to album
      let linkedCount = 0;
      for (const imageIndex of postData.imageIds) {
        if (imageIndex < existingImages.length) {
          const image = existingImages[imageIndex];
          
          await prisma.image.update({
            where: { id: image.id },
            data: {
              albumId: album.id,
              showInGallery: false, // Don't show individually
              showOnHomepage: false, // Only show in album/post
            },
          });

          linkedCount++;
        }
      }

      // Set album cover image
      const firstImage = existingImages[postData.imageIds[0]];
      if (firstImage) {
        await prisma.album.update({
          where: { id: album.id },
          data: {
            coverImageUrl: firstImage.url,
          },
        });
      }

      console.log(`   ✅ Linked ${linkedCount} images to album\n`);
    }

    console.log('\n🎉 Test posts created successfully!');
    console.log('   Visit http://localhost:3000 to see them on the homepage\n');

  } catch (error) {
    console.error('❌ Error creating test posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPosts();
