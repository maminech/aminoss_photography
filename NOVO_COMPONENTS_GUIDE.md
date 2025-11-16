# Novo Components Guide

Complete documentation for all Novo-inspired components in the Professional theme.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Components](#components)
4. [Usage Examples](#usage-examples)
5. [Integration](#integration)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The Novo component library provides premium, animation-rich components inspired by the Novo WordPress theme. All components are built with:

- **React & TypeScript**: Type-safe, modern implementation
- **Framer Motion**: Smooth, performant animations
- **Next.js 14**: App Router compatibility
- **Responsive Design**: Mobile-first approach
- **Novo Aesthetic**: Gold (#d4af37) and Black (#1a1a1a) color palette

### Key Features

✅ Smooth 600-800ms transitions with cubic-bezier easing  
✅ Parallax scroll effects  
✅ Page transitions and preloader  
✅ Interactive carousels and grids  
✅ Split-screen layouts  
✅ Fixed/sticky navigation  
✅ Portfolio filtering with animations  

---

## Design System

### Colors

```typescript
// Primary Colors
const colors = {
  primary: '#1a1a1a',      // Black
  secondary: '#d4af37',    // Gold
  accent: '#8b7355',       // Bronze
  
  // Backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#f8f8f8',
    dark: '#1a1a1a',
  },
  
  // Text
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    light: '#999999',
    white: '#ffffff',
  },
};
```

### Typography

```typescript
// Font Families
Headings: 'Playfair Display' (serif, elegant)
Body: 'Lato' (sans-serif, clean)

// Font Sizes
h1: 4rem - 6rem (responsive)
h2: 3rem - 5rem
h3: 2rem - 3rem
body: 1rem - 1.25rem
small: 0.875rem
```

### Spacing

```typescript
// Section Padding
Mobile: 80px
Tablet: 120px
Desktop: 160px

// Container Widths
Max width: 1280px
Padding: 24px (mobile), 48px (desktop)
```

### Animations

```typescript
// Durations
fast: 200ms
normal: 300ms
medium: 500ms
slow: 600ms
slower: 800ms

// Easing
cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Components

### 1. NovoPreloader

Full-screen loading animation with dual-ring spinner.

**Location**: `src/components/professional/NovoPreloader.tsx`

**Props**:
```typescript
interface NovoPreloaderProps {
  isLoading: boolean;  // Controls visibility
}
```

**Features**:
- Dual-ring animated spinner (gold + black)
- "Loading" text with letter-spacing
- 1.5s display duration
- Smooth fade-out (600ms)
- Z-index 9999 (top layer)

**Usage**:
```tsx
import NovoPreloader from '@/components/professional/NovoPreloader';

<NovoPreloader isLoading={isLoading} />
```

---

### 2. NovoPageTransition

Automatic route change transition overlay.

**Location**: `src/components/professional/NovoPageTransition.tsx`

**Features**:
- Black overlay scales from bottom to top
- Gold "Loading" text during transition
- 600ms transition duration
- Automatic trigger on pathname change
- Content fade-in after transition

**Usage**:
```tsx
import NovoPageTransition from '@/components/professional/NovoPageTransition';

// Add once in layout
<NovoPageTransition />
```

---

### 3. NovoParallaxSection

Scroll-based parallax background effect.

**Location**: `src/components/professional/NovoParallaxSection.tsx`

**Props**:
```typescript
interface NovoParallaxSectionProps {
  children: ReactNode;
  speed?: number;              // Parallax intensity (default: 0.5)
  overlay?: boolean;           // Show dark overlay
  overlayOpacity?: number;     // Overlay transparency (0-1)
}
```

**Features**:
- Smooth Y-axis translation on scroll
- Configurable parallax speed
- Optional overlay with custom opacity
- Viewport-based activation

**Usage**:
```tsx
import NovoParallaxSection from '@/components/professional/NovoParallaxSection';

<NovoParallaxSection speed={0.5} overlay overlayOpacity={0.6}>
  <div style={{ backgroundImage: 'url(/image.jpg)', height: '500px' }}>
    <h2>Content with parallax background</h2>
  </div>
</NovoParallaxSection>
```

---

### 4. NovoHeroSection

Full-page hero section with parallax background.

**Location**: `src/components/professional/NovoHeroSection.tsx`

**Props**:
```typescript
interface NovoHeroSectionProps {
  title: string;                          // Main heading
  subtitle?: string;                      // Optional subtitle
  backgroundImage?: string;               // Hero background
  height?: 'full' | 'large' | 'medium';  // Section height
  overlay?: boolean;                      // Dark overlay
  parallax?: boolean;                     // Enable parallax
  children?: ReactNode;                   // CTA buttons, etc.
}
```

**Features**:
- Full-height hero sections
- Parallax background image
- Animated title, subtitle, decorative line
- Scroll indicator with animation
- Support for CTAs and custom content
- Responsive typography

**Usage**:
```tsx
import NovoHeroSection from '@/components/professional/NovoHeroSection';

<NovoHeroSection
  title="Innov8 Production"
  subtitle="Where Every Moment Becomes Art"
  backgroundImage="/hero.jpg"
  height="full"
  overlay
  parallax
>
  <Link href="/gallery" className="btn-primary">
    View Portfolio
  </Link>
</NovoHeroSection>
```

---

### 5. NovoSplitScreen

Split-screen layout with image and content.

**Location**: `src/components/professional/NovoSplitScreen.tsx`

**Props**:
```typescript
interface NovoSplitScreenProps {
  imagePosition: 'left' | 'right';  // Image side
  imageSrc: string;                 // Image URL
  imageAlt: string;                 // Image alt text
  title: string;                    // Section title
  subtitle?: string;                // Optional subtitle
  description?: string;             // Section description
  overlay?: boolean;                // Image overlay
  overlayColor?: string;            // Overlay color
  children?: ReactNode;             // Additional content
}
```

**Features**:
- 50/50 split layout (image | content)
- Image hover scale effect
- Staggered content animations
- Gold decorative line
- Responsive grid (stacks on mobile)

**Usage**:
```tsx
import NovoSplitScreen from '@/components/professional/NovoSplitScreen';

<NovoSplitScreen
  imagePosition="left"
  imageSrc="/about.jpg"
  imageAlt="About Us"
  title="Capturing Moments That Last Forever"
  subtitle="About Us"
  description="Professional photography with passion and expertise."
  overlay
>
  <Link href="/about" className="btn-primary">
    Learn More
  </Link>
</NovoSplitScreen>
```

---

### 6. NovoNavigation

Fixed/sticky navigation with mobile menu.

**Location**: `src/components/professional/NovoNavigation.tsx`

**Props**:
```typescript
interface NavItem {
  label: string;
  href: string;
}

interface NovoNavigationProps {
  logo?: string;              // Logo image URL
  items: NavItem[];           // Navigation links
  ctaLabel?: string;          // CTA button text
  ctaHref?: string;           // CTA button link
}
```

**Features**:
- Fixed position with scroll detection
- Transparent → White background transition
- Active page indicator (gold underline)
- Animated mobile menu overlay
- Hamburger animation
- Smooth color transitions

**Usage**:
```tsx
import NovoNavigation from '@/components/professional/NovoNavigation';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

<NovoNavigation
  items={navItems}
  ctaLabel="Book Now"
  ctaHref="/contact"
/>
```

---

### 7. NovoCarousel

Image carousel with drag-to-swipe and navigation.

**Location**: `src/components/professional/NovoCarousel.tsx`

**Props**:
```typescript
interface CarouselItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
}

interface NovoCarouselProps {
  items: CarouselItem[];
  autoplay?: boolean;           // Auto-advance slides
  autoplayInterval?: number;    // Interval in ms (default: 5000)
  showDots?: boolean;           // Show dot navigation
  showArrows?: boolean;         // Show arrow buttons
  loop?: boolean;               // Loop slides
}
```

**Features**:
- Smooth slide transitions (spring animation)
- Drag-to-swipe functionality
- Navigation arrows and dots
- Autoplay with configurable interval
- Slide counter (01/05 format)
- Image overlays with title/description
- Gradient overlay for text readability

**Usage**:
```tsx
import NovoCarousel from '@/components/professional/NovoCarousel';

const slides = [
  {
    id: '1',
    image: '/slide1.jpg',
    title: 'Elegant Moments',
    description: 'Capturing beauty through the lens',
  },
  // ... more slides
];

<NovoCarousel
  items={slides}
  autoplay
  autoplayInterval={5000}
  showDots
  showArrows
  loop
/>
```

---

### 8. NovoPortfolioGrid

Masonry portfolio grid with category filtering.

**Location**: `src/components/professional/NovoPortfolioGrid.tsx`

**Props**:
```typescript
interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
  href?: string;
}

interface NovoPortfolioGridProps {
  items: PortfolioItem[];
  categories?: string[];        // Filter categories
  columns?: 2 | 3 | 4;         // Grid columns
  showFilter?: boolean;         // Show filter bar
  gap?: 'small' | 'medium' | 'large';
}
```

**Features**:
- Animated category filtering
- Staggered item entrance animations
- Image hover effects (scale + overlay)
- Plus icon on hover
- Gold decorative line
- Responsive grid layout
- Empty state handling

**Usage**:
```tsx
import NovoPortfolioGrid from '@/components/professional/NovoPortfolioGrid';

const portfolioItems = [
  {
    id: '1',
    image: '/portfolio1.jpg',
    title: 'Wedding Collection',
    category: 'wedding',
    href: '/gallery/1',
  },
  // ... more items
];

<NovoPortfolioGrid
  items={portfolioItems}
  categories={['all', 'wedding', 'portrait', 'event']}
  columns={3}
  showFilter
  gap="medium"
/>
```

---

## Usage Examples

### Complete Page Example

```tsx
'use client';

import NovoHeroSection from '@/components/professional/NovoHeroSection';
import NovoSplitScreen from '@/components/professional/NovoSplitScreen';
import NovoPortfolioGrid from '@/components/professional/NovoPortfolioGrid';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <NovoHeroSection
        title="Photography Studio"
        subtitle="Professional Visual Storytelling"
        backgroundImage="/hero.jpg"
        height="full"
        overlay
        parallax
      >
        <Link href="/gallery" className="btn-primary">
          Explore Work
        </Link>
      </NovoHeroSection>

      {/* About */}
      <NovoSplitScreen
        imagePosition="left"
        imageSrc="/about.jpg"
        imageAlt="About Us"
        title="Our Story"
        subtitle="Who We Are"
        description="Passionate about capturing life's precious moments."
        overlay
      />

      {/* Portfolio */}
      <section className="section-padding bg-gray-50">
        <div className="container mx-auto px-6">
          <NovoPortfolioGrid
            items={portfolioItems}
            columns={3}
            showFilter
          />
        </div>
      </section>
    </div>
  );
}
```

### Custom Button Styles

The Professional theme includes pre-styled button classes:

```tsx
// Primary Button (Gold)
<button className="btn-primary">
  Click Me
</button>

// Secondary Button (Outlined)
<button className="btn-secondary">
  Learn More
</button>

// Custom styles
<button className="px-8 py-3 bg-[#d4af37] text-white hover:bg-[#c09d2f] transition-all duration-300">
  Custom Button
</button>
```

### Section Spacing

Use the `.section-padding` class for consistent spacing:

```tsx
<section className="section-padding">
  {/* Content with 80px (mobile) to 160px (desktop) padding */}
</section>

<section className="section-padding bg-gray-50">
  {/* Colored background section */}
</section>
```

---

## Integration

### Step 1: Import Components

```tsx
import NovoPreloader from '@/components/professional/NovoPreloader';
import NovoPageTransition from '@/components/professional/NovoPageTransition';
import NovoNavigation from '@/components/professional/NovoNavigation';
import NovoHeroSection from '@/components/professional/NovoHeroSection';
import NovoSplitScreen from '@/components/professional/NovoSplitScreen';
import NovoCarousel from '@/components/professional/NovoCarousel';
import NovoPortfolioGrid from '@/components/professional/NovoPortfolioGrid';
import NovoParallaxSection from '@/components/professional/NovoParallaxSection';
```

### Step 2: Add to Layout

The `ProfessionalLayout` already includes:
- ✅ NovoPreloader
- ✅ NovoPageTransition
- ✅ Global Novo styles
- ✅ Smooth scroll behavior

### Step 3: Use in Pages

```tsx
// In any page under Professional theme
export default function MyPage() {
  return (
    <>
      <NovoNavigation items={navItems} />
      <NovoHeroSection title="Page Title" ... />
      {/* Other components */}
    </>
  );
}
```

### Step 4: Add Navigation to All Pages

Create a shared navigation component:

```tsx
// src/components/professional/SharedNavigation.tsx
'use client';

import NovoNavigation from './NovoNavigation';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function SharedNavigation() {
  return (
    <NovoNavigation
      items={navItems}
      ctaLabel="Book Now"
      ctaHref="/contact"
    />
  );
}
```

Then include it in your pages or layout.

---

## Troubleshooting

### Images Not Loading

**Problem**: Carousel or portfolio images show broken links.

**Solution**: Ensure images are in the `public/` directory:

```
public/
  images/
    hero.jpg
    portfolio1.jpg
    ...
```

Reference with: `/images/hero.jpg`

### Animations Not Smooth

**Problem**: Animations feel choppy or slow.

**Solution**: Check browser performance, ensure Framer Motion is properly installed:

```bash
npm install framer-motion
```

### Fonts Not Applied

**Problem**: Playfair Display or Lato not showing.

**Solution**: Verify fonts are loaded in `app/layout.tsx`:

```tsx
import { Playfair_Display, Lato } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const lato = Lato({ weight: ['300', '400', '700'], subsets: ['latin'], variable: '--font-lato' });
```

### Parallax Not Working

**Problem**: Parallax sections don't move on scroll.

**Solution**: Ensure the section has a background image and sufficient height:

```tsx
<NovoParallaxSection speed={0.5}>
  <div style={{ height: '500px', backgroundImage: 'url(...)' }}>
    Content
  </div>
</NovoParallaxSection>
```

### Mobile Menu Not Closing

**Problem**: Mobile menu stays open after navigation.

**Solution**: The component already handles this with pathname change detection. Ensure Next.js routing is working properly.

### Build Errors

**Problem**: TypeScript errors during build.

**Solution**: Ensure all required props are provided:

```tsx
// ❌ Missing required props
<NovoHeroSection title="Title" />

// ✅ All required props
<NovoHeroSection
  title="Title"
  backgroundImage="/hero.jpg"
/>
```

---

## Best Practices

### 1. Image Optimization

Always use Next.js `Image` component for optimization:

```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  fill
  className="object-cover"
  quality={90}
  priority  // For above-fold images
/>
```

### 2. Responsive Design

Test on multiple screen sizes:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### 3. Performance

- Use `priority` prop for hero images
- Lazy load below-fold images
- Optimize image file sizes (use WebP format)
- Limit carousel items to 5-10 slides

### 4. Accessibility

- Always provide `alt` text for images
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Use semantic HTML
- Test keyboard navigation

### 5. SEO

- Include descriptive titles and subtitles
- Use proper meta tags in page head
- Optimize images with alt text
- Implement schema markup

---

## Component Showcase

Visit `/novo-showcase` to see all components in action with sample data.

---

## Support

For issues or questions:
1. Check this documentation
2. Review component source code
3. Test with sample data from showcase page
4. Verify all dependencies are installed

## Credits

Components inspired by the Novo WordPress premium theme, rebuilt with modern React/Next.js architecture and Framer Motion animations.

