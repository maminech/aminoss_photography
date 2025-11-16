# 📸 Innov8 Production Portfolio

A professional, production-ready photography portfolio website built with **Next.js 14**, **TailwindCSS**, and **Framer Motion**. Features an Instagram-style gallery, video reels, contact form, and Cloudinary integration.

![Innov8 Production](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## ✨ Features

- 🎨 **Instagram-style Gallery** - Responsive grid layout with category filters
- 🖼️ **Lightbox Modal** - Fullscreen image viewer with keyboard navigation
- 🎥 **Video Showcase** - Embedded video player for reels and cinematics
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- ⚡ **Fast & Optimized** - Next.js Image optimization and lazy loading
- 🎭 **Smooth Animations** - Framer Motion for professional transitions
- 📧 **Contact Form** - Nodemailer integration with email notifications
- ☁️ **Cloudinary Integration** - Cloud-based media management
- 🔍 **SEO Optimized** - Meta tags, Open Graph, and semantic HTML
- 🚀 **Vercel Ready** - One-click deployment

## 🏗️ Project Structure

```
Innov8-photography/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── contact/
│   │   │       └── route.ts          # Contact form API
│   │   ├── about/
│   │   │   └── page.tsx             # About page
│   │   ├── contact/
│   │   │   └── page.tsx             # Contact page
│   │   ├── gallery/
│   │   │   └── page.tsx             # Gallery page
│   │   ├── videos/
│   │   │   └── page.tsx             # Videos page
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── components/
│   │   ├── CategoryFilter.tsx       # Category filter buttons
│   │   ├── Footer.tsx               # Site footer
│   │   ├── GalleryGrid.tsx          # Photo grid component
│   │   ├── LightboxModal.tsx        # Full-screen image viewer
│   │   ├── Navbar.tsx               # Navigation bar
│   │   └── VideoPlayer.tsx          # Video player component
│   ├── lib/
│   │   ├── cloudinary.ts            # Cloudinary integration
│   │   └── sample-data.ts           # Sample data for development
│   ├── styles/
│   │   └── globals.css              # Global styles
│   └── types/
│       └── index.ts                 # TypeScript types
├── public/                          # Static assets
├── .env.example                     # Environment variables template
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git ignore file
├── next.config.js                   # Next.js configuration
├── package.json                     # Project dependencies
├── postcss.config.js                # PostCSS configuration
├── README.md                        # This file
├── tailwind.config.ts               # Tailwind configuration
└── tsconfig.json                    # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Cloudinary account (free)
- Gmail account (for contact form)

### Installation

1. **Clone or download this project**

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_USER=innov8.tn@gmail.com
EMAIL_PASS=your_app_password

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📧 Email Setup (Contact Form)

To enable the contact form, you need to set up Gmail App Password:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to **Security** → **App Passwords**
4. Create a new app password for "Mail"
5. Copy the password to `EMAIL_PASS` in `.env.local`

## ☁️ Cloudinary Setup

### 1. Create Cloudinary Account

- Sign up at [cloudinary.com](https://cloudinary.com)
- Get your Cloud Name, API Key, and API Secret from the dashboard

### 2. Organize Your Media

Create folders in Cloudinary with this structure:

```
Innov8_photography/
├── weddings/
├── portraits/
├── travel/
├── fashion/
└── videos/
```

### 3. Upload Images

- Upload photos to respective category folders
- Use tags like `featured` for hero images
- Add metadata (title, description, camera info) via Context

### 4. Add Metadata (Optional)

In Cloudinary, you can add custom context to images:

```json
{
  "custom": {
    "title": "Beautiful Sunset",
    "description": "Wedding ceremony at sunset",
    "category": "weddings",
    "camera": "Canon EOS R5",
    "lens": "RF 24-70mm f/2.8"
  }
}
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  primary: {
    500: '#your-color',
    600: '#your-color',
    // ...
  }
}
```

### Fonts

Modify fonts in `src/app/layout.tsx`:

```typescript
import { YourFont } from 'next/font/google';
```

### Content

Update photographer info in:
- `src/app/about/page.tsx` - Biography and awards
- `src/components/Footer.tsx` - Social links
- `src/app/layout.tsx` - SEO metadata

## 📱 Features Guide

### Home Page
- Hero section with featured image
- Latest work showcase
- Services overview
- Call-to-action section

### Gallery Page
- Category filtering (All, Weddings, Portraits, Travel, Fashion)
- Instagram-style grid layout
- Lightbox modal with full-screen viewing
- Smooth animations and loading states

### Videos Page
- Video grid with thumbnails
- Embedded video playback
- YouTube/Vimeo integration support

### About Page
- Photographer biography
- Philosophy and approach
- Awards and exhibitions
- Equipment and expertise
- PDF portfolio download

### Contact Page
- Contact form with validation
- Email notifications
- Social media links
- Business hours
- Success/error feedback

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com)

3. Click "New Project" and import your repository

4. Add environment variables in Vercel dashboard

5. Deploy!

### Environment Variables in Vercel

Add these in your Vercel project settings:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`

### Custom Domain

In Vercel dashboard:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

## 🛠️ Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## 📊 Performance

- ✅ Lighthouse Score: 95+
- ✅ Image optimization with Next.js Image
- ✅ Lazy loading
- ✅ Responsive images
- ✅ CSS optimization
- ✅ Fast page transitions

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Media Hosting**: Cloudinary
- **Email**: Nodemailer
- **Icons**: React Icons
- **Deployment**: Vercel

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Innov8**
- Website: [Innov8-photography.com](https://Innov8-photography.com)
- Instagram: [@ami_noss.photography](https://www.instagram.com/ami_noss.photography)
- Facebook: [Mohamed Chalghoum](https://www.facebook.com/mohamed.chalghoum.266885)
- Location: Sousse, Tunisia
- Email: innov8.tn@gmail.com

## 🤝 Support

For support, email innov8.tn@gmail.com or open an issue in the repository.

## 🎯 Roadmap

- [ ] Admin dashboard for content management
- [ ] Blog/news section
- [ ] Client galleries with password protection
- [ ] Booking system integration
- [ ] Multi-language support
- [ ] Dark mode toggle

---

**Made with ❤️ in Tunisia**

