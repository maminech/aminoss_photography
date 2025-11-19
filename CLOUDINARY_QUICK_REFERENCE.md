# 📌 Quick Reference - Cloudinary Folders

## ✅ SETUP COMPLETE
**Account**: `dm22wlmpx`  
**Status**: 42 folders created  
**Presets**: 5 upload presets configured

---

## 🎯 Most Used Folders

### Portfolio Content
```
innov8_portfolio/photos/weddings/    → Wedding photos
innov8_portfolio/photos/events/      → Event photos
innov8_portfolio/videos/reels/       → Instagram Reels
innov8_portfolio/videos/weddings/    → Wedding videos
innov8_portfolio/instagram/posts/    → Instagram synced posts
```

### Client Work
```
clients/[client-name]/final/         → Delivered photos
clients/[client-name]/selects/       → Client favorites
clients/[client-name]/proofs/        → Proof gallery
```

### System
```
system/invoices/                     → Invoice PDFs
events/guest_uploads/                → Guest photo uploads
```

---

## 🔧 Upload Presets

| Preset Name | Folder | Type | Use For |
|------------|--------|------|---------|
| `innov8_portfolio` | innov8_portfolio/photos | Images | Main portfolio photos |
| `innov8_videos` | innov8_portfolio/videos | Videos | Portfolio videos |
| `innov8_instagram` | innov8_portfolio/instagram | Both | Instagram sync |
| `innov8_guest_upload` | events/guest_uploads | Images | Guest uploads |
| `innov8_client` | clients | Both | Client deliveries |

---

## 📱 How to Upload

### Via Admin Dashboard
1. Go to `/admin/dashboard/photos` or `/admin/dashboard/videos`
2. Click "Upload" button
3. Files automatically go to correct folders

### Via Cloudinary Console
1. Visit: https://cloudinary.com/console/media_library/folders
2. Navigate to desired folder
3. Drag & drop files

### Programmatically
```javascript
// Example: Upload wedding photo
await cloudinary.uploader.upload('photo.jpg', {
  folder: 'innov8_portfolio/photos/weddings',
  tags: ['wedding', '2025'],
});
```

---

## 🗂️ Complete Structure

```
innov8_portfolio/
├── photos/           (8 categories: weddings, events, portraits, etc.)
├── videos/           (6 types: weddings, reels, commercials, etc.)
├── instagram/        (posts, reels, stories)
├── albums/           (featured, private)
└── ui/               (hero, backgrounds, logos, etc.)

clients/
└── _template/        (final, selects, proofs)

events/
├── guest_uploads/
└── photobooths/

system/
├── invoices/
├── temp/
└── cache/
```

---

## 💡 Tips

### Creating New Client Folder
```powershell
# Copy template structure
clients/john-smith-wedding/
├── final/
├── selects/
└── proofs/
```

### Naming Convention
- Lowercase: `john-smith-wedding`
- Use hyphens: `new-year-party-2025`
- Be specific: `fashion-spring-collection-2025`

### Tags to Use
- Date: `2025`, `january`, `q1`
- Type: `featured`, `portfolio`, `client-work`
- Category: `wedding`, `event`, `commercial`
- Status: `delivered`, `draft`, `published`

---

## 📊 View Your Folders

**Cloudinary Console**: https://cloudinary.com/console/media_library/folders

**Quick Access**:
- Media Library: https://cloudinary.com/console/media_library
- Upload Presets: https://cloudinary.com/console/settings/upload
- API Keys: https://cloudinary.com/console/settings/security

---

## 🚀 Next Steps

1. ✅ Folder structure created
2. ⬜ Upload some test content
3. ⬜ Sync Instagram photos
4. ⬜ Test admin upload features
5. ⬜ Create first client folder

---

**Created**: November 19, 2025  
**Last Updated**: November 19, 2025
