# 📖 Photobook Editor - Complete User Guide

## 🎨 What's New

Your photography platform now features a **professional-grade photobook editor** powered by Polotno SDK, allowing clients to create stunning custom photobooks from their gallery photos.

---

## ✨ Features Overview

### 1. **Ready-Made Templates**
Choose from professionally designed templates:
- **Grid Layouts**: 2x2, 3x3 photo grids
- **Collages**: Hero layouts, asymmetric designs
- **Magazine Style**: Feature pages with text
- **Minimal**: Full bleed, centered designs

### 2. **Drag-and-Drop Interface**
- Drag photos from your gallery directly onto pages
- Photos automatically snap into place
- Smart scaling and positioning
- Visual placeholders guide photo placement

### 3. **Multi-Page Support**
- Create photobooks with unlimited pages
- Timeline view for easy navigation
- Add, duplicate, delete, and reorder pages
- Each page can have different layouts

### 4. **Professional Exports**
- **PDF Export**: High-quality PDF for printing (300 DPI)
- **Image Export**: Export individual pages as JPEG
- **Auto-Download**: Files download automatically

### 5. **Save & Resume**
- Save your photobook design anytime
- Designs saved to database
- Resume editing later
- All progress preserved

---

## 🚀 How to Use

### For Clients:

#### Step 1: Access Your Gallery
1. Log in to your client portal
2. Navigate to "My Galleries"
3. Select the gallery you want to create a photobook from

#### Step 2: Create Photobook
1. Click the **"Create Photobook"** button
2. The photobook editor will open with all your gallery photos loaded

#### Step 3: Choose a Template
1. Click the **"Templates"** tab on the left sidebar
2. Browse templates by category (Grid, Collage, Magazine, Minimal)
3. Click any template to apply it to your current page
4. Template placeholders show where to place photos

#### Step 4: Add Your Photos
1. Click the **"Gallery Photos"** tab
2. Your photos appear in a grid
3. **Drag any photo** onto the page
4. **Drop on placeholder** to replace it
5. **Drop anywhere** to add freely
6. Photos auto-scale to fit

#### Step 5: Customize (Optional)
- **Resize**: Drag corner handles
- **Move**: Drag photo to new position
- **Rotate**: Use rotation handle
- **Add Text**: Click "Text" tab to add captions
- **Backgrounds**: Click "Background" tab for page colors

#### Step 6: Add More Pages
1. Click **"+ Add Page"** button at bottom
2. Apply different template to new page
3. Repeat to build full photobook
4. Use timeline to navigate between pages

#### Step 7: Save Your Work
1. Click **"Save Design"** button (top right)
2. Photobook automatically saves to your account
3. You can close and resume editing later

#### Step 8: Export
When ready to print:
1. Click **"Export PDF"** button
2. High-quality PDF downloads automatically
3. Take PDF to print shop or upload to online printer

---

## 💡 Pro Tips

### Template Tips
- **Start with a template** - easier than blank page
- **Mix templates** - use different layouts for variety
- **Magazine style** - great for cover pages with titles

### Photo Placement
- **Drag directly to placeholder** - photos auto-fit perfectly
- **Hold and drag** - smooth placement
- **Click photo first** - select before moving
- **Double-click** - opens edit mode

### Design Tips
- **Consistent layouts** - use same template type for cohesion
- **White space** - don't fill every inch
- **Tell a story** - arrange photos chronologically
- **Feature photos** - hero layouts for best shots
- **Add captions** - use text for dates, names, quotes

### Workflow Tips
- **Save often** - click Save Design regularly
- **Preview all pages** - use timeline to review
- **Test on paper** - print one page to check quality
- **Get feedback** - share PDF with friends before printing

---

## 🎯 Common Tasks

### How to Replace a Photo
1. Click the photo you want to replace
2. Click "Gallery Photos" tab
3. Click the new photo to replace it

### How to Delete an Element
1. Click the photo or text
2. Press **Delete** or **Backspace**

### How to Duplicate a Page
1. Navigate to the page
2. Right-click on page thumbnail
3. Select "Duplicate Page"

### How to Change Page Order
1. Drag page thumbnails in timeline
2. Drop in new position

### How to Add Page Numbers
1. Click "Text" tab
2. Add text box
3. Type page number
4. Position in corner
5. Copy/paste to other pages

---

## 📐 Technical Specs

### Page Size
- Default: **8.5" x 11"** (Letter size)
- Resolution: **300 DPI** (print quality)
- Orientation: Portrait

### Export Formats
- **PDF**: Vector + Images, 300 DPI
- **JPEG**: Individual pages, high quality

### Photo Requirements
- All photos from your gallery automatically optimized
- Cloudinary delivers perfect resolution
- No manual uploading needed

---

## ⚙️ Admin Configuration

### Polotno License (Optional)

**Current Status**: FREE mode
- ✅ All features work
- ⚠️ Watermark on exports
- ⚠️ Not for commercial use

**To Remove Watermark**:
1. Purchase Polotno license: https://polotno.com/pricing
2. Add API key to `.env.local`:
   ```
   NEXT_PUBLIC_POLOTNO_KEY=your_api_key_here
   ```
3. Restart server
4. Watermark removed!

### Database Schema
Photobooks stored in `Photobook` model:
- `title`: Photobook name
- `design`: Complete Polotno JSON (all pages, elements)
- `clientId`: Owner reference
- `galleryId`: Source gallery
- `totalPages`: Page count
- `status`: draft, submitted, approved, etc.
- `createdAt`, `updatedAt`: Timestamps

---

## 🐛 Troubleshooting

### "Gallery Photos" tab is empty
- Check gallery has photos uploaded
- Verify photos have valid Cloudinary URLs
- Refresh page

### Can't drag photos
- Ensure editor fully loaded (no spinner)
- Try refreshing browser
- Check internet connection

### Save button doesn't work
- Check you're logged in
- Verify gallery access
- Check browser console for errors

### Export has watermark
- This is normal in FREE mode
- Purchase Polotno license to remove
- See "Admin Configuration" section above

### Editor looks broken
- Clear browser cache
- Update browser to latest version
- Try different browser (Chrome recommended)

---

## 📞 Support

### For Clients
Contact your photographer for assistance with:
- Accessing photobook editor
- Template selection help
- Design guidance
- Print recommendations

### For Admins
Technical issues:
1. Check browser console for errors
2. Verify Prisma schema is up-to-date (`npx prisma generate`)
3. Check API routes are working
4. Review POLOTNO_SETUP.md for configuration

---

## 🎉 Success!

Your photobook editor is now fully operational with:
- ✅ Professional templates
- ✅ Drag-and-drop interface
- ✅ Gallery photo integration
- ✅ Multi-page support
- ✅ PDF/Image export
- ✅ Database persistence
- ✅ Client-friendly UX

**Clients can now create beautiful custom photobooks from their gallery photos!**

---

## 📚 Additional Resources

- Polotno SDK Docs: https://polotno.com/docs
- Polotno API Reference: https://polotno.com/docs/api
- Support: Contact via admin panel or check documentation files

---

*Last Updated: November 8, 2025*
*Version: 3.0 (Polotno Integration)*
