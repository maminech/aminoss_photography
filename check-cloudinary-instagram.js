/**
 * Check Cloudinary Instagram folders
 * Run: node check-cloudinary-instagram.js
 */

require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm22wlmpx',
  api_key: process.env.CLOUDINARY_API_KEY || '816775898924348',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mbU--NngMju5dzFgvO_LExO7nnc',
});

async function checkFolders() {
  console.log('🔍 Checking Cloudinary Instagram folders...\n');

  // Check all Instagram subfolders
  const folders = [
    'innov8_portfolio/instagram',
    'innov8_portfolio/instagram/posts',
    'innov8_portfolio/instagram/reels',
    'innov8_portfolio/instagram/stories',
  ];

  for (const folder of folders) {
    console.log(`\n📁 Checking folder: ${folder}`);
    console.log('─'.repeat(60));
    
    try {
      // Check for images
      const images = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 10,
        resource_type: 'image',
      });
      
      console.log(`📸 Images: ${images.resources.length}`);
      if (images.resources.length > 0) {
        images.resources.forEach((img, idx) => {
          console.log(`  ${idx + 1}. ${img.public_id}`);
          console.log(`     URL: ${img.secure_url}`);
        });
      }

      // Check for videos
      const videos = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 10,
        resource_type: 'video',
      });
      
      console.log(`🎥 Videos: ${videos.resources.length}`);
      if (videos.resources.length > 0) {
        videos.resources.forEach((vid, idx) => {
          console.log(`  ${idx + 1}. ${vid.public_id}`);
          console.log(`     URL: ${vid.secure_url}`);
        });
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n📊 Summary:');
  console.log('─'.repeat(60));
  console.log('If you see 0 videos in innov8_portfolio/instagram/reels,');
  console.log('it means the videos haven\'t been uploaded yet.');
  console.log('\nNext steps:');
  console.log('1. Go to admin dashboard');
  console.log('2. Click "Sync Now" to fetch from Instagram');
  console.log('3. Check Vercel logs for upload status');
  console.log('4. Run this script again to verify uploads');
}

checkFolders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
