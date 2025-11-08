# Polotno SDK Configuration for Photobook Editor

This document explains how to configure the Polotno SDK for your photobook editor.

## Polotno API Key

The photobook editor uses **Polotno SDK** for advanced design capabilities. You can use it in two modes:

### 1. Free Mode (Current Setup)
- ✅ **No API key required**
- ⚠️ Shows "Made with Polotno" watermark on exports
- ⚠️ Limited features
- ✅ Good for testing and development

### 2. Licensed Mode (Recommended for Production)
- ✅ **No watermark** on exports
- ✅ **Full features** unlocked
- ✅ Commercial use allowed
- 💰 Requires paid license

## How to Get a Polotno License

1. Visit: https://polotno.com/
2. Choose a plan (starts at ~$99/month or one-time purchase options)
3. After purchase, you'll receive an API key

## Add Your API Key

Once you have your API key, add it to your `.env.local` file:

```env
# Polotno SDK License Key (Optional - for production use)
NEXT_PUBLIC_POLOTNO_KEY=your_api_key_here
```

## Features Included

### ✅ Ready-Made Templates
- **Grid Layouts**: 2x2, 3x3 photo grids
- **Collage Styles**: Hero layouts, asymmetric designs
- **Magazine Style**: Feature pages, sidebar layouts
- **Minimal**: Full bleed, centered designs

### ✅ Drag-and-Drop Interface
- Drag photos from your gallery onto photobook pages
- Photos automatically snap to template placeholders
- Smart scaling and positioning

### ✅ Multi-Page Support
- Create photobooks with unlimited pages
- Timeline view for easy page navigation
- Duplicate, reorder, and delete pages

### ✅ Professional Exports
- **PDF Export**: High-quality PDF for printing
- **Image Export**: Individual page exports as JPEG/PNG
- **Design Save**: Save and reload your photobook designs

### ✅ Custom Template Builder
- Clients can create their own layouts
- Save custom templates for reuse
- Full control over positioning and sizing

## Testing Without a License

You can test the photobook editor without a license:
- All features work
- "Made with Polotno" watermark appears on exports
- Perfect for development and testing

## Production Deployment

**⚠️ Important**: For production use (live website with paying clients), you **must** purchase a Polotno license to remove watermarks and comply with licensing terms.

## Questions?

- Polotno Docs: https://polotno.com/docs
- Polotno Pricing: https://polotno.com/pricing
- Contact Polotno: https://polotno.com/contact

---

**Current Status**: Running in FREE mode (no license key configured)
