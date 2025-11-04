# Cloudinary Setup Guide

This guide will help you set up Cloudinary for the Aminoss Photography portfolio.

## 📝 Step 1: Create Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up Free"
3. Fill in your details
4. Verify your email

## 🔑 Step 2: Get Your Credentials

1. Go to your [Dashboard](https://console.cloudinary.com/)
2. Find your credentials:
   - **Cloud Name**: `dxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxxxxxxxxx`

3. Add to `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📁 Step 3: Create Folder Structure

Create these folders in Cloudinary:

```
aminoss_photography/
├── weddings/
├── portraits/
├── travel/
├── fashion/
└── videos/
```

**How to create folders:**
1. Go to **Media Library**
2. Click **"Create folder"**
3. Name it `aminoss_photography`
4. Create subfolders for each category

## 📤 Step 4: Upload Images

### Upload via Web Interface

1. Go to **Media Library**
2. Select folder (e.g., `aminoss_photography/weddings`)
3. Click **"Upload"**
4. Select your images
5. Wait for upload to complete

### Upload via Cloudinary UI

For bulk uploads:
1. Download Cloudinary mobile app
2. Select multiple images
3. Upload to correct folder

### Recommended Image Settings

- **Format**: JPEG or PNG
- **Size**: Maximum 5MB per image
- **Resolution**: 1920px width recommended
- **Quality**: High (don't compress too much)

## 🏷️ Step 5: Add Tags & Metadata

### Add Tags

Tags help categorize images:
- `featured` - for hero images
- `wedding`
- `portrait`
- `landscape`

**How to add tags:**
1. Click on an image
2. Find "Tags" section
3. Add relevant tags
4. Save

### Add Custom Context (Optional)

Add metadata to images:

1. Click on image
2. Go to **"Context"** tab
3. Add custom fields:

```json
{
  "custom": {
    "title": "Beautiful Wedding Ceremony",
    "description": "Outdoor wedding in Sidi Bou Said",
    "camera": "Canon EOS R5",
    "lens": "RF 24-70mm f/2.8",
    "category": "weddings"
  }
}
```

## 🎥 Step 6: Upload Videos

### For Videos

1. Go to `aminoss_photography/videos` folder
2. Click **"Upload"**
3. Select video files
4. Cloudinary will process them

### Or Use YouTube/Vimeo

If you prefer hosting on YouTube:
1. Upload videos to YouTube
2. Get embed URL
3. Videos will still work with placeholder images

## ⚙️ Step 7: Optimize Settings

### Image Optimization

1. Go to **Settings** → **Upload**
2. Enable:
   - ✅ Auto-format
   - ✅ Auto-quality
   - ✅ Lazy loading

### Transformations

Cloudinary automatically handles:
- Responsive sizing
- Format conversion (WebP)
- Quality optimization
- Lazy loading

## 🔗 Step 8: Test Integration

Run your development server:

```bash
npm run dev
```

Check if:
- [ ] Images load on Gallery page
- [ ] Categories filter correctly
- [ ] Lightbox shows full images
- [ ] Videos play (if uploaded)
- [ ] Featured image shows on homepage

## 📊 Step 9: Monitor Usage

Free Plan Limits:
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month

**To monitor:**
1. Go to Dashboard
2. Check usage statistics
3. Upgrade if needed

## 🎨 Sample Folder Structure Example

```
aminoss_photography/
├── weddings/
│   ├── wedding_001.jpg [tagged: featured]
│   ├── wedding_002.jpg
│   └── wedding_003.jpg
├── portraits/
│   ├── portrait_001.jpg
│   ├── portrait_002.jpg
│   └── portrait_003.jpg
├── travel/
│   ├── sahara_001.jpg
│   ├── tunis_001.jpg
│   └── sidi_bou_said_001.jpg
├── fashion/
│   ├── fashion_001.jpg
│   └── fashion_002.jpg
└── videos/
    ├── wedding_highlight.mp4
    └── travel_vlog.mp4
```

## 🔄 Updating Content

### Add New Photos

1. Upload to correct category folder
2. Add tags and metadata
3. Photos automatically appear on site

### Remove Photos

1. Select image in Media Library
2. Click **"Delete"**
3. Confirm deletion

### Reorder Photos

Photos appear by upload date. To reorder:
1. Delete and re-upload, or
2. Use Cloudinary's sort features

## 🛡️ Security Best Practices

- ✅ Keep API Secret confidential
- ✅ Use signed URLs for sensitive content
- ✅ Enable Upload presets
- ✅ Restrict upload sources
- ✅ Monitor usage regularly

## 🆘 Troubleshooting

### Images Not Showing

**Problem**: 404 errors
- **Fix**: Check folder names match exactly
- **Fix**: Ensure images are public
- **Fix**: Verify credentials in `.env.local`

**Problem**: Slow loading
- **Fix**: Enable auto-format and auto-quality
- **Fix**: Use transformations
- **Fix**: Compress images before upload

**Problem**: Quota exceeded
- **Fix**: Delete unused images
- **Fix**: Upgrade plan
- **Fix**: Optimize transformations

## 📚 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Image Upload Guide](https://cloudinary.com/documentation/image_upload_api_reference)
- [Video Upload Guide](https://cloudinary.com/documentation/video_manipulation_and_delivery)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)

## ✅ Checklist

Before going live:
- [ ] Account created
- [ ] Credentials added to `.env.local`
- [ ] Folders created
- [ ] Sample images uploaded
- [ ] Tags added
- [ ] Featured image tagged
- [ ] Videos uploaded (optional)
- [ ] Tested locally
- [ ] Optimization enabled

---

**Your Cloudinary setup is complete! 🎉**

Now your photos will load fast, look great, and scale automatically!
