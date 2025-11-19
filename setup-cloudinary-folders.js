/**
 * Cloudinary Folder Structure Setup Script
 * 
 * This script creates a clean, organized folder structure in your Cloudinary account
 * for the Aminoss Photography portfolio website.
 * 
 * Run with: node setup-cloudinary-folders.js
 */

require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm22wlmpx',
  api_key: process.env.CLOUDINARY_API_KEY || '816775898924348',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mbU--NngMju5dzFgvO_LExO7nnc',
});

/**
 * Complete Folder Structure for Aminoss Photography
 */
const FOLDER_STRUCTURE = {
  // Main portfolio content
  'innov8_portfolio': {
    description: '🎨 Main Portfolio - All website content',
    subfolders: {
      // Photo categories
      'photos': {
        description: '📸 Photography Portfolio',
        subfolders: {
          'weddings': { description: '💍 Wedding Photography' },
          'events': { description: '🎉 Event Photography' },
          'portraits': { description: '👤 Portrait Photography' },
          'fashion': { description: '👗 Fashion Photography' },
          'commercial': { description: '🏢 Commercial Photography' },
          'travel': { description: '✈️ Travel Photography' },
          'product': { description: '📦 Product Photography' },
          'food': { description: '🍽️ Food Photography' },
        }
      },
      
      // Video content
      'videos': {
        description: '🎥 Video Portfolio',
        subfolders: {
          'weddings': { description: '💍 Wedding Videos' },
          'events': { description: '🎉 Event Videos' },
          'commercials': { description: '📺 Commercial Videos' },
          'reels': { description: '📱 Instagram Reels & Short-form' },
          'highlights': { description: '⭐ Video Highlights' },
          'background': { description: '🎬 Hero Background Videos' },
        }
      },
      
      // Instagram synced content
      'instagram': {
        description: '📱 Instagram Synced Content',
        subfolders: {
          'posts': { description: '📷 Instagram Posts (Images)' },
          'reels': { description: '🎬 Instagram Reels (Videos)' },
          'stories': { description: '⚡ Instagram Stories Archive' },
        }
      },
      
      // Albums and collections
      'albums': {
        description: '📚 Client Albums & Collections',
        subfolders: {
          'featured': { description: '⭐ Featured Albums' },
          'private': { description: '🔒 Private Client Albums' },
        }
      },
      
      // Website UI assets
      'ui': {
        description: '🎨 Website UI Assets',
        subfolders: {
          'hero': { description: '🖼️ Hero Section Images' },
          'backgrounds': { description: '🌄 Background Images' },
          'logos': { description: '🏷️ Logos & Branding' },
          'testimonials': { description: '💬 Testimonial Photos' },
          'team': { description: '👥 Team Member Photos' },
        }
      },
    }
  },
  
  // Client deliveries
  'clients': {
    description: '👥 Client Deliveries (Organized by client)',
    subfolders: {
      '_template': {
        description: '📋 Template folder structure for new clients',
        subfolders: {
          'final': { description: '✅ Final Delivered Photos/Videos' },
          'selects': { description: '⭐ Client Selected Images' },
          'proofs': { description: '👀 Proof Gallery' },
        }
      },
    }
  },
  
  // Events and bookings
  'events': {
    description: '📅 Event-specific Content',
    subfolders: {
      'guest_uploads': { description: '📤 Guest Photo Uploads' },
      'photobooths': { description: '📸 Photobooth Images' },
    }
  },
  
  // System assets
  'system': {
    description: '⚙️ System & Admin Assets',
    subfolders: {
      'invoices': { description: '📄 Generated Invoice PDFs' },
      'temp': { description: '🗑️ Temporary uploads (auto-delete after 30 days)' },
      'cache': { description: '💾 Cached transformations' },
    }
  },
};

/**
 * Create folder by uploading a placeholder
 */
async function createFolder(folderPath, description) {
  try {
    // Check if folder already has content
    const existing = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 1,
    }).catch(() => ({ resources: [] }));

    if (existing.resources.length > 0) {
      console.log(`✓ Folder exists: ${folderPath}`);
      return { success: true, existed: true };
    }

    // Create a simple 1x1 pixel placeholder
    const placeholderData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    // Upload placeholder to create the folder
    // Remove emojis and special chars from description for context
    const cleanDescription = description.replace(/[^\w\s-]/g, '').trim();
    
    const result = await cloudinary.uploader.upload(placeholderData, {
      folder: folderPath,
      public_id: '.folder_placeholder',
      context: cleanDescription ? `description=${cleanDescription}` : undefined,
      tags: ['placeholder', 'system'],
      overwrite: true,
    });

    console.log(`✓ Created: ${folderPath} - ${description}`);
    return { success: true, existed: false };
  } catch (error) {
    console.error(`✗ Failed to create ${folderPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Recursively create folder structure
 */
async function createFolderStructure(structure, basePath = '') {
  const results = {
    created: 0,
    existed: 0,
    failed: 0,
  };

  for (const [folderName, config] of Object.entries(structure)) {
    const folderPath = basePath ? `${basePath}/${folderName}` : folderName;
    
    // Create current folder
    const result = await createFolder(folderPath, config.description);
    
    if (result.success) {
      if (result.existed) {
        results.existed++;
      } else {
        results.created++;
      }
    } else {
      results.failed++;
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));

    // Create subfolders recursively
    if (config.subfolders) {
      const subResults = await createFolderStructure(config.subfolders, folderPath);
      results.created += subResults.created;
      results.existed += subResults.existed;
      results.failed += subResults.failed;
    }
  }

  return results;
}

/**
 * Create upload presets for different content types
 */
async function setupUploadPresets() {
  console.log('\n📋 Setting up upload presets...\n');

  const presets = [
    {
      name: 'innov8_portfolio',
      unsigned: true,
      folder: 'innov8_portfolio/photos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'],
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
      tags: ['portfolio', 'auto-upload'],
    },
    {
      name: 'innov8_videos',
      unsigned: true,
      folder: 'innov8_portfolio/videos',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
      tags: ['video', 'portfolio'],
    },
    {
      name: 'innov8_instagram',
      unsigned: true,
      folder: 'innov8_portfolio/instagram',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
      tags: ['instagram', 'social-media'],
    },
    {
      name: 'innov8_client',
      unsigned: false, // Requires authentication
      folder: 'clients',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'raw', 'dng', 'cr2'],
      tags: ['client', 'delivery'],
    },
    {
      name: 'innov8_guest_upload',
      unsigned: true,
      folder: 'events/guest_uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      tags: ['guest-upload', 'event'],
    },
  ];

  const results = {
    created: 0,
    updated: 0,
    failed: 0,
  };

  for (const preset of presets) {
    try {
      // Try to update existing preset first
      try {
        await cloudinary.api.upload_preset(preset.name);
        await cloudinary.api.update_upload_preset(preset.name, preset);
        console.log(`✓ Updated preset: ${preset.name}`);
        results.updated++;
      } catch (updateError) {
        // Preset doesn't exist, create it
        await cloudinary.api.create_upload_preset(preset);
        console.log(`✓ Created preset: ${preset.name}`);
        results.created++;
      }
    } catch (error) {
      console.error(`✗ Failed preset ${preset.name}:`, error.message);
      results.failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

/**
 * Print folder structure tree
 */
function printFolderTree(structure, indent = '') {
  for (const [folderName, config] of Object.entries(structure)) {
    console.log(`${indent}📁 ${folderName} - ${config.description}`);
    if (config.subfolders) {
      printFolderTree(config.subfolders, indent + '  ');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Aminoss Photography - Cloudinary Folder Setup\n');
  console.log(`📡 Cloud Name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}\n`);
  
  // Print planned structure
  console.log('📂 Planned Folder Structure:\n');
  printFolderTree(FOLDER_STRUCTURE);
  
  console.log('\n⏳ Creating folders...\n');
  
  // Create folder structure
  const folderResults = await createFolderStructure(FOLDER_STRUCTURE);
  
  console.log('\n📊 Folder Creation Summary:');
  console.log(`  ✓ Created: ${folderResults.created}`);
  console.log(`  ℹ Already Existed: ${folderResults.existed}`);
  console.log(`  ✗ Failed: ${folderResults.failed}`);
  
  // Setup upload presets
  const presetResults = await setupUploadPresets();
  
  console.log('\n📊 Upload Preset Summary:');
  console.log(`  ✓ Created: ${presetResults.created}`);
  console.log(`  ↻ Updated: ${presetResults.updated}`);
  console.log(`  ✗ Failed: ${presetResults.failed}`);
  
  // Print success message
  console.log('\n✅ Cloudinary folder structure setup complete!\n');
  console.log('📝 Next Steps:');
  console.log('  1. Go to https://cloudinary.com/console/media_library/folders');
  console.log('  2. Verify all folders were created');
  console.log('  3. Start uploading content to appropriate folders');
  console.log('  4. Use the upload presets in your application\n');
  
  console.log('💡 Folder Usage Guide:');
  console.log('  - innov8_portfolio/* → Main website content');
  console.log('  - clients/* → Client deliveries (create subfolder per client)');
  console.log('  - events/* → Event-specific content');
  console.log('  - system/* → System assets (invoices, temp files)');
  console.log('\n🎉 Your Cloudinary account is now organized and ready to use!\n');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createFolderStructure, setupUploadPresets };
