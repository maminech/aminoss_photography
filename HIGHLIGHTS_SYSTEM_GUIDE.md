# 🎬 Instagram-Style Highlights System

## Overview

A complete manual highlights upload system that mimics Instagram Stories - created as an alternative to the Instagram API limitations.

## ✨ Features

### Admin Side
- **Beautiful Manager Interface** - Drag-and-drop upload with Instagram-style preview
- **Create Highlights** - Set title, cover image, and description
- **Add Media** - Upload photos and videos for each highlight
- **Reorder Items** - Drag to rearrange story order
- **Show/Hide** - Toggle highlights visibility on homepage
- **Live Preview** - See exactly how it looks to users

### User Side
- **Circular Avatars** - Instagram gradient rings around profile photos
- **Smooth Scrolling** - Horizontal scroll through all highlights
- **Full-Screen Viewer** - Immersive stories experience
- **Gestures** - Tap left/right, swipe to dismiss, hold to pause
- **Auto-Advance** - Progress bars show current position
- **Mobile-First** - Optimized for touch interactions

## 🚀 How to Use

### 1. Access Highlights Manager
```
Admin Dashboard → Highlights Manager
or
/admin/highlights
```

### 2. Create New Highlight
1. Click "New Highlight" button
2. Enter title (e.g., "Wedding", "Travel", "Behind the Scenes")
3. Upload cover image (will be shown in circular avatar)
4. Add optional description
5. Click "Create Highlight"

### 3. Add Photos/Videos
1. Click "Edit" on any highlight
2. Click "Add Photo or Video"
3. Select files from Cloudinary or upload new ones
4. Items are added instantly
5. Drag to reorder items

### 4. Manage Highlights
- **Edit** - Add/remove items, reorder them
- **Live/Off Toggle** - Show/hide on homepage
- **Delete** - Remove entire highlight (with confirmation)

### 5. View on Homepage
- Highlights appear below profile section
- Circular avatars with Instagram gradient rings
- Tap any highlight to view stories
- Swipe through items with smooth transitions

## 📱 Stories Viewer Controls

### Mobile Gestures
- **Tap Left** - Previous item
- **Tap Center** - Pause/Play
- **Tap Right** - Next item
- **Swipe Down** - Close viewer
- **Swipe Left/Right** - Navigate between items

### Desktop Controls
- **Left Arrow** - Previous item
- **Right Arrow** - Next item
- **Space** - Pause/Play
- **Escape** - Close viewer
- **Click Left/Right** - Navigate

### Auto-Play
- Images: 5 seconds
- Videos: Full duration
- Progress bars show current position
- Auto-advance to next item when complete

## 🎨 Design Features

### Homepage Display
```tsx
<HighlightsRow />
```
- Circular avatars (64-96px depending on screen)
- Instagram gradient ring (yellow → pink → purple)
- White padding ring for contrast
- Title below each highlight
- Horizontal scrollable row
- Snap-to-item scrolling

### Stories Viewer
- Full-screen black background
- Progress bars at top
- Profile info with small avatar
- Smooth fade transitions
- Gradient overlays for readability
- Captions at bottom
- Auto-advance timer

## 🛠️ Technical Details

### Database Models
```prisma
model Highlight {
  id          String
  title       String
  coverImage  String
  description String?
  order       Int
  active      Boolean
  items       HighlightItem[]
}

model HighlightItem {
  id           String
  highlightId  String
  cloudinaryId String
  mediaType    String  // "image" or "video"
  mediaUrl     String
  thumbnailUrl String
  title        String?
  description  String?
  width        Int?
  height       Int?
  duration     Float?  // Video duration in seconds
  order        Int
}
```

### API Routes
- `GET /api/admin/highlights` - Fetch all highlights
- `POST /api/admin/highlights` - Create new highlight
- `PATCH /api/admin/highlights` - Update highlight
- `DELETE /api/admin/highlights?id=xxx` - Delete highlight
- `POST /api/admin/highlights/items` - Add item to highlight
- `PATCH /api/admin/highlights/items` - Update item
- `DELETE /api/admin/highlights/items?id=xxx` - Delete item

### Components
- `HighlightsRow.tsx` - Homepage display + viewer
- `HighlightsManager.tsx` - Admin management interface

## 🔄 Workflow Example

### Wedding Photography Use Case
1. Create highlight: "Sarah & John's Wedding"
2. Upload cover: Couple portrait
3. Add 10 photos from ceremony
4. Add 5 photos from reception
5. Add 1 highlight reel video
6. Reorder to tell the story
7. Toggle "Live" - appears on homepage instantly
8. Clients tap to view their wedding highlights

### Behind the Scenes
1. Create highlight: "Behind the Scenes"
2. Upload cover: Camera setup photo
3. Add photos of equipment
4. Add videos of shooting process
5. Add photos of team working
6. Shows potential clients your process

## 🎯 Why Manual Upload?

### Instagram API Limitations
- ❌ Stories API is deprecated
- ❌ Highlights require Business Discovery API
- ❌ Most apps can't access stories/highlights
- ❌ Privacy restrictions by Instagram
- ❌ Requires special partnership approval

### Manual Upload Benefits
- ✅ Full control over content
- ✅ No API rate limits
- ✅ Works forever without maintenance
- ✅ Better quality (full resolution)
- ✅ Custom captions and descriptions
- ✅ Reorder anytime
- ✅ Mix Instagram + original content

## 📊 Best Practices

### Cover Images
- Use high-quality, recognizable photos
- Square format (1:1) recommended
- Clear subject in center (will be cropped to circle)
- Good contrast with background

### Item Order
- Start with establishing shot
- Build narrative flow
- End with call-to-action or logo
- 5-15 items per highlight is ideal

### Titles
- Short and descriptive
- 1-3 words (e.g., "Weddings", "Travel")
- Use emojis for personality (e.g., "💍 Weddings")

### Video Tips
- Keep under 15 seconds when possible
- Ensure good first frame (used as thumbnail)
- Add captions for sound-off viewing

## 🚨 Troubleshooting

### Highlight Not Showing
- Check "Live/Off" toggle is green
- Verify at least 1 item added
- Check cover image uploaded correctly

### Items Not Uploading
- Verify Cloudinary credentials
- Check file size (max 100MB)
- Ensure stable internet connection

### Viewer Not Opening
- Clear browser cache
- Check console for errors
- Verify items have valid URLs

### Reordering Not Saving
- Drag to new position completely
- Wait for success indicator
- Refresh to verify order saved

## 📱 Mobile Optimization

- Touch targets: 44px minimum
- Smooth animations: 60fps
- Lazy loading images
- Video preloading
- Safe area insets for notched devices
- Momentum scrolling
- Pull-to-refresh support

## 🎨 Customization

### Change Gradient Colors
Edit `HighlightsRow.tsx`:
```tsx
bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600
```

### Change Auto-Advance Duration
Edit `HighlightsRow.tsx`:
```tsx
const duration = currentItem?.mediaType === 'video' 
  ? (currentItem.duration || 10) * 1000 
  : 5000; // Change 5000 to desired milliseconds
```

### Change Avatar Size
Edit `HighlightsRow.tsx`:
```tsx
className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
// Adjust these values
```

## 🎉 Summary

This system provides a beautiful, Instagram-like highlights experience without relying on Instagram's restricted API. Users can manually curate their best moments, reels, and behind-the-scenes content in an engaging, mobile-first format that works perfectly on any device.

**Perfect for:**
- 📸 Photographers showcasing work
- 💍 Wedding highlights
- 🎥 Video portfolios
- 🌍 Travel photography
- 👥 Team introductions
- 🎨 Process documentation
- 📱 Social proof and testimonials
