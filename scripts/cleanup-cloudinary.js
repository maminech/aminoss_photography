import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function organizeCloudinary() {
  try {
    console.log('🔍 Fetching all images from Cloudinary...\n');

    // Get all images
    const result = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    console.log(`📊 Found ${result.total_count} images total\n`);

    // Your actual uploaded photos (based on the ones you provided)
    const yourPhotos = [
      '099_dsnltg',
      '105_pzgmgt',
      '089_jdagpy',
    ];

    const toKeep = [];
    const toDelete = [];

    result.resources.forEach((resource) => {
      const publicId = resource.public_id;
      const fileName = publicId.split('/').pop();
      
      // Check if this is one of your photos
      const isYourPhoto = yourPhotos.some(photo => fileName?.includes(photo));
      
      if (isYourPhoto) {
        toKeep.push({
          publicId,
          url: resource.secure_url,
          size: `${(resource.bytes / 1024).toFixed(2)} KB`,
        });
      } else {
        toDelete.push({
          publicId,
          url: resource.secure_url,
          size: `${(resource.bytes / 1024).toFixed(2)} KB`,
        });
      }
    });

    console.log('✅ YOUR PHOTOS TO KEEP:');
    console.log('========================');
    toKeep.forEach((img, i) => {
      console.log(`${i + 1}. ${img.publicId}`);
      console.log(`   URL: ${img.url}`);
      console.log(`   Size: ${img.size}\n`);
    });

    console.log('\n❌ SAMPLE/OLD PHOTOS TO DELETE:');
    console.log('=================================');
    toDelete.forEach((img, i) => {
      console.log(`${i + 1}. ${img.publicId}`);
      console.log(`   URL: ${img.url}`);
      console.log(`   Size: ${img.size}\n`);
    });

    console.log(`\n📋 SUMMARY:`);
    console.log(`   Keep: ${toKeep.length} photos`);
    console.log(`   Delete: ${toDelete.length} photos\n`);

    // Prompt for confirmation
    console.log('⚠️  TO DELETE SAMPLE PHOTOS, run:');
    console.log('   node scripts/cleanup-cloudinary.js --confirm\n');

    // If --confirm flag is passed, delete the photos
    if (process.argv.includes('--confirm')) {
      console.log('🗑️  Deleting sample photos...\n');
      
      for (const img of toDelete) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
          console.log(`✅ Deleted: ${img.publicId}`);
        } catch (error) {
          console.log(`❌ Failed to delete: ${img.publicId}`);
        }
      }

      console.log('\n✨ Cleanup complete!');
      
      // Create folder for organized photos
      console.log('\n📁 Creating organized folder structure...');
      console.log('   Keeping photos in root for now');
      console.log('   You can organize them later from Cloudinary console\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

organizeCloudinary();
