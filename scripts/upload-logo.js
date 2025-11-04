const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadLogo() {
  try {
    console.log('📤 Uploading logo to Cloudinary...\n');
    
    const result = await cloudinary.uploader.upload('path_to_logo.png', {
      folder: 'branding',
      public_id: 'aminoss-logo',
      overwrite: true,
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });

    console.log('✅ Logo uploaded successfully!');
    console.log('URL:', result.secure_url);
    console.log('\nOptimized URLs:');
    console.log('Dark BG:', cloudinary.url('branding/aminoss-logo', {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { height: 50 }
      ]
    }));
    console.log('Light BG:', cloudinary.url('branding/aminoss-logo', {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { height: 50 },
        { effect: 'brightness:20' }
      ]
    }));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

uploadLogo();
