# 📁 Cloudinary Folder Structure Guide

## Overview
This document explains the organized folder structure for your Cloudinary account (`dm22wlmpx`).

---

## 🗂️ Complete Folder Structure

```
cloudinary://dm22wlmpx/
│
├── 📂 innov8_portfolio/                    # Main portfolio content
│   ├── 📂 photos/                          # Photography portfolio
│   │   ├── 📂 weddings/                    # Wedding photography
│   │   ├── 📂 events/                      # Event photography
│   │   ├── 📂 portraits/                   # Portrait photography
│   │   ├── 📂 fashion/                     # Fashion photography
│   │   ├── 📂 commercial/                  # Commercial photography
│   │   ├── 📂 travel/                      # Travel photography
│   │   ├── 📂 product/                     # Product photography
│   │   └── 📂 food/                        # Food photography
│   │
│   ├── 📂 videos/                          # Video portfolio
│   │   ├── 📂 weddings/                    # Wedding videos
│   │   ├── 📂 events/                      # Event videos
│   │   ├── 📂 commercials/                 # Commercial videos
│   │   ├── 📂 reels/                       # Instagram Reels & short-form
│   │   ├── 📂 highlights/                  # Video highlights
│   │   └── 📂 background/                  # Hero background videos
│   │
│   ├── 📂 instagram/                       # Instagram synced content
│   │   ├── 📂 posts/                       # Instagram posts
│   │   ├── 📂 reels/                       # Instagram reels
│   │   └── 📂 stories/                     # Instagram stories archive
│   │
│   ├── 📂 albums/                          # Client albums & collections
│   │   ├── 📂 featured/                    # Featured albums (public)
│   │   └── 📂 private/                     # Private client albums
│   │
│   └── 📂 ui/                              # Website UI assets
│       ├── 📂 hero/                        # Hero section images
│       ├── 📂 backgrounds/                 # Background images
│       ├── 📂 logos/                       # Logos & branding
│       ├── 📂 testimonials/                # Testimonial photos
│       └── 📂 team/                        # Team member photos
│
├── 📂 clients/                             # Client deliveries
│   ├── 📂 _template/                       # Template for new clients
│   │   ├── 📂 final/                       # Final delivered content
│   │   ├── 📂 selects/                     # Client selected images
│   │   └── 📂 proofs/                      # Proof gallery
│   │
│   └── 📂 [client-name]/                   # Individual client folders
│       ├── 📂 final/                       # Use template structure
│       ├── 📂 selects/
│       └── 📂 proofs/
│
├── 📂 events/                              # Event-specific content
│   ├── 📂 guest_uploads/                   # Guest photo uploads
│   └── 📂 photobooths/                     # Photobooth images
│
└── 📂 system/                              # System & admin assets
    ├── 📂 invoices/                        # Generated invoice PDFs
    ├── 📂 temp/                            # Temporary uploads (auto-delete)
    └── 📂 cache/                           # Cached transformations
```

---

## 🎯 Folder Usage Guide

### 1. **innov8_portfolio/** - Main Portfolio
**Purpose**: All public-facing website content

#### **photos/** - Photography Categories
- Upload photos by category for organized portfolio display
- Each category appears as a filter on your website
- **Example**: Wedding photos → `innov8_portfolio/photos/weddings/`

#### **videos/** - Video Content
- Organize videos by type
- **reels/**: Short-form vertical videos (Instagram Reels style)
- **background/**: Videos for hero section background
- **highlights/**: Featured video clips

#### **instagram/** - Social Media Sync
- Auto-synced Instagram content
- **posts/**: Regular Instagram posts
- **reels/**: Instagram Reels
- **stories/**: Archived stories

#### **albums/** - Collections
- **featured/**: Public albums shown on website
- **private/**: Password-protected client albums

#### **ui/** - Website Assets
- Design elements, logos, backgrounds
- Team photos, testimonial images

---

### 2. **clients/** - Client Work
**Purpose**: Organized client deliveries

#### How to Use:
1. Create folder: `clients/john-smith-wedding/`
2. Use subfolders:
   - `final/` - Delivered photos/videos
   - `selects/` - Client's chosen favorites
   - `proofs/` - Initial selection gallery

#### Example Structure:
```
clients/
├── john-smith-wedding/
│   ├── final/          (500 delivered photos)
│   ├── selects/        (50 favorites)
│   └── proofs/         (800 proof images)
```

---

### 3. **events/** - Event Management
**Purpose**: Event-specific features

#### **guest_uploads/**
- Guest photo uploads from events
- Used by guest upload feature on website

#### **photobooths/**
- Photobooth generated images
- Event photobooth feature output

---

### 4. **system/** - System Assets
**Purpose**: Backend system files

#### **invoices/**
- Auto-generated invoice PDFs
- Stored for client download

#### **temp/**
- Temporary uploads
- Can be auto-deleted after 30 days

#### **cache/**
- Transformed image cache
- Optimized versions

---

## 🔧 Upload Presets

The setup script creates these upload presets:

### `innov8_portfolio`
- **Folder**: `innov8_portfolio/photos`
- **Type**: Images (jpg, png, webp)
- **Use**: Main portfolio uploads
- **Unsigned**: ✅ Yes

### `innov8_videos`
- **Folder**: `innov8_portfolio/videos`
- **Type**: Videos (mp4, mov, webm)
- **Use**: Video portfolio uploads
- **Unsigned**: ✅ Yes

### `innov8_instagram`
- **Folder**: `innov8_portfolio/instagram`
- **Type**: Images & Videos
- **Use**: Instagram sync
- **Unsigned**: ✅ Yes

### `innov8_client`
- **Folder**: `clients`
- **Type**: Images (including RAW)
- **Use**: Client deliveries
- **Unsigned**: ❌ No (requires auth)

### `innov8_guest_upload`
- **Folder**: `events/guest_uploads`
- **Type**: Images
- **Use**: Guest uploads at events
- **Unsigned**: ✅ Yes

---

## 🚀 Setup Instructions

### Step 1: Run Setup Script
```powershell
node setup-cloudinary-folders.js
```

### Step 2: Verify in Cloudinary Console
1. Go to: https://cloudinary.com/console/media_library/folders
2. Check all folders were created
3. Verify upload presets: https://cloudinary.com/console/settings/upload

### Step 3: Start Uploading Content
Use the folder structure for new uploads:

**Example - Upload Wedding Photos:**
```javascript
cloudinary.uploader.upload('photo.jpg', {
  folder: 'innov8_portfolio/photos/weddings',
  tags: ['wedding', '2025', 'featured'],
})
```

---

## 💡 Best Practices

### DO ✅
- **Use consistent naming**: `lastname-firstname-eventtype`
- **Tag everything**: Add relevant tags for easy search
- **Use categories**: Keep photos in appropriate category folders
- **Client folders**: Create new folder per client
- **Clean up temp**: Regularly delete old temp files

### DON'T ❌
- **Don't mix content**: Keep portfolio separate from client work
- **Don't use root**: Always use subfolders
- **Don't duplicate**: Check folder before creating new
- **Don't forget tags**: Makes search impossible later

---

## 🔄 Migration from Old Account

**Current Cloudinary Account**: `dm22wlmpx`

### Option 1: Manual Migration
1. Download from old account
2. Upload to new account following folder structure
3. Update database references

### Option 2: Automated Migration
Use the migration tool at `/admin/migrate-cloudinary`

---

## 📊 Maintenance

### Monthly Tasks
- [ ] Clean up `system/temp/` folder
- [ ] Review client folders (archive completed projects)
- [ ] Check storage usage
- [ ] Organize new uploads

### Quarterly Tasks
- [ ] Audit folder structure
- [ ] Remove unused assets
- [ ] Update tags and categories
- [ ] Backup critical content

---

## 🆘 Support

### Common Issues

**Folder not appearing?**
- Upload at least one file to make it visible
- Check folder path spelling

**Upload preset not working?**
- Verify it's set to "unsigned" if used client-side
- Check folder permissions

**Can't find uploaded file?**
- Check correct folder path
- Search by upload date or tags

### Resources
- Cloudinary Console: https://cloudinary.com/console
- API Documentation: https://cloudinary.com/documentation
- Upload Presets: https://cloudinary.com/console/settings/upload

---

## 📝 Notes

- All paths are case-sensitive
- Use lowercase and hyphens for consistency
- Folder structure can be expanded as needed
- Old folder structure (`Innov8_photography/`) can be phased out

---

**Last Updated**: November 19, 2025  
**Account**: dm22wlmpx (NEW)  
**Status**: ✅ Active and Organized
