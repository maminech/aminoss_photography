const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔍 Checking Cloudinary Account...\n');
console.log('📋 Configuration:');
console.log(`   Cloud Name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY}`);
console.log('');

async function checkCloudinary() {
  try {
    // 1. Check account usage
    console.log('📊 Checking Account Usage...');
    const usage = await cloudinary.api.usage();
    console.log(`   Plan: ${usage.plan}`);
    console.log(`   Credits Used: ${usage.credits?.used || 0} / ${usage.credits?.limit || 'unlimited'}`);
    console.log(`   Storage: ${(usage.storage?.used / 1024 / 1024).toFixed(2)} MB used`);
    console.log(`   Bandwidth: ${(usage.bandwidth?.used / 1024 / 1024).toFixed(2)} MB used this month`);
    console.log(`   Resources: ${usage.resources || 0} files`);
    console.log('');

    // 2. List root folders
    console.log('📁 Root Folders:');
    const rootFolders = await cloudinary.api.root_folders();
    if (rootFolders.folders && rootFolders.folders.length > 0) {
      rootFolders.folders.forEach(folder => {
        console.log(`   - ${folder.name} (${folder.path})`);
      });
    } else {
      console.log('   No folders found');
    }
    console.log('');

    // 3. Check for events folder
    console.log('🎉 Checking Events Folder...');
    try {
      const eventsFolder = await cloudinary.api.sub_folders('events');
      if (eventsFolder.folders && eventsFolder.folders.length > 0) {
        console.log(`   Found ${eventsFolder.folders.length} event(s):`);
        eventsFolder.folders.forEach(folder => {
          console.log(`   - ${folder.name}`);
        });
      } else {
        console.log('   No events found yet');
      }
    } catch (err) {
      if (err.error?.http_code === 404) {
        console.log('   Events folder does not exist yet');
      } else {
        console.log(`   Error: ${err.message}`);
      }
    }
    console.log('');

    // 4. Check for galleries folder
    console.log('🖼️  Checking Galleries Folder...');
    try {
      const galleriesFolder = await cloudinary.api.sub_folders('galleries');
      if (galleriesFolder.folders && galleriesFolder.folders.length > 0) {
        console.log(`   Found ${galleriesFolder.folders.length} gallery(ies):`);
        galleriesFolder.folders.forEach(folder => {
          console.log(`   - ${folder.name}`);
        });
      } else {
        console.log('   No galleries found yet');
      }
    } catch (err) {
      if (err.error?.http_code === 404) {
        console.log('   Galleries folder does not exist yet');
      } else {
        console.log(`   Error: ${err.message}`);
      }
    }
    console.log('');

    // 5. List recent uploads (last 10)
    console.log('📤 Recent Uploads (Last 10):');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 10,
      resource_type: 'image'
    });
    
    if (resources.resources && resources.resources.length > 0) {
      resources.resources.forEach((resource, index) => {
        const date = new Date(resource.created_at);
        console.log(`   ${index + 1}. ${resource.public_id}`);
        console.log(`      Size: ${(resource.bytes / 1024).toFixed(2)} KB`);
        console.log(`      Uploaded: ${date.toLocaleString()}`);
        console.log(`      Format: ${resource.format}`);
        console.log('');
      });
    } else {
      console.log('   No uploads found');
    }

    console.log('✅ Cloudinary check complete!');
    
  } catch (error) {
    console.error('❌ Error checking Cloudinary:');
    console.error(`   Message: ${error.message}`);
    if (error.error) {
      console.error(`   Details: ${JSON.stringify(error.error, null, 2)}`);
    }
  }
}

checkCloudinary();
