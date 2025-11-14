/**
 * Script to help identify and remove old albums/images from the database
 * Run this with: node clear-old-albums.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAlbums() {
  console.log('\n📸 Fetching all albums...\n');
  
  try {
    const albums = await prisma.album.findMany({
      include: {
        images: {
          select: {
            id: true,
            url: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (albums.length === 0) {
      console.log('✅ No albums found in database\n');
      return;
    }

    console.log(`Found ${albums.length} albums:\n`);
    
    albums.forEach((album, index) => {
      console.log(`${index + 1}. ${album.title || 'Untitled'}`);
      console.log(`   ID: ${album.id}`);
      console.log(`   Images: ${album.images.length}`);
      console.log(`   Show on Homepage: ${album.showOnHomepage ? 'Yes' : 'No'}`);
      console.log(`   Created: ${album.createdAt.toISOString()}`);
      if (album.images.length > 0) {
        console.log(`   First Image: ${album.images[0].url.substring(0, 60)}...`);
      }
      console.log('');
    });

    console.log('\n📝 To delete albums, use the admin dashboard or run:');
    console.log('   node delete-album.js <album-id>\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listAlbums();
