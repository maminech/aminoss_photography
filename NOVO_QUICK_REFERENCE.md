# Novo Components - Quick Reference

Quick copy-paste snippets for all Novo components.

---

## 🚀 Quick Imports

```tsx
import NovoPreloader from '@/components/professional/NovoPreloader';
import NovoPageTransition from '@/components/professional/NovoPageTransition';
import NovoParallaxSection from '@/components/professional/NovoParallaxSection';
import NovoHeroSection from '@/components/professional/NovoHeroSection';
import NovoSplitScreen from '@/components/professional/NovoSplitScreen';
import NovoNavigation from '@/components/professional/NovoNavigation';
import NovoCarousel from '@/components/professional/NovoCarousel';
import NovoPortfolioGrid from '@/components/professional/NovoPortfolioGrid';
```

---

## 📝 Component Snippets

### NovoHeroSection

```tsx
<NovoHeroSection
  title="Your Amazing Title"
  subtitle="Your subtitle here"
  backgroundImage="/images/hero.jpg"
  height="full"
  overlay
  parallax
>
  <Link href="/contact" className="btn-primary">
    Get Started
  </Link>
</NovoHeroSection>
```

**Props**:
- `title` (required): Main heading
- `subtitle` (optional): Subheading
- `backgroundImage` (optional): Background image URL
- `height`: `'full'` | `'large'` | `'medium'`
- `overlay`: Boolean for dark overlay
- `parallax`: Boolean for scroll effect
- `children`: Custom content (CTAs, etc.)

---

### NovoSplitScreen

```tsx
<NovoSplitScreen
  imagePosition="left"
  imageSrc="/images/about.jpg"
  imageAlt="About Us"
  title="Our Story"
  subtitle="Who We Are"
  description="Your description text here."
  overlay
>
  <Link href="/about" className="btn-primary">
    Learn More
  </Link>
</NovoSplitScreen>
```

**Props**:
- `imagePosition` (required): `'left'` | `'right'`
- `imageSrc` (required): Image URL
- `imageAlt` (required): Image alt text
- `title` (required): Section title
- `subtitle` (optional): Small text above title
- `description` (optional): Body text
- `overlay`: Boolean for image overlay
- `overlayColor`: Custom overlay color
- `children`: Additional content

---

### NovoNavigation

```tsx
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

**Props**:
- `items` (required): Array of `{ label: string, href: string }`
- `logo` (optional): Logo image URL
- `ctaLabel` (optional): CTA button text
- `ctaHref` (optional): CTA button link

---

### NovoCarousel

```tsx
const carouselItems = [
  {
    id: '1',
    image: '/images/slide1.jpg',
    title: 'Slide Title',
    description: 'Slide description',
  },
  {
    id: '2',
    image: '/images/slide2.jpg',
    title: 'Another Slide',
    description: 'Description text',
  },
];

<NovoCarousel
  items={carouselItems}
  autoplay
  autoplayInterval={5000}
  showDots
  showArrows
  loop
/>
```

**Props**:
- `items` (required): Array of carousel items
- `autoplay`: Boolean for auto-advance
- `autoplayInterval`: Milliseconds between slides
- `showDots`: Boolean for dot navigation
- `showArrows`: Boolean for arrow buttons
- `loop`: Boolean for infinite loop

---

### NovoPortfolioGrid

```tsx
const portfolioItems = [
  {
    id: '1',
    image: '/images/portfolio1.jpg',
    title: 'Project Name',
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

**Props**:
- `items` (required): Array of portfolio items
- `categories` (optional): Filter categories (auto-generated if not provided)
- `columns`: `2` | `3` | `4`
- `showFilter`: Boolean for filter bar
- `gap`: `'small'` | `'medium'` | `'large'`

---

### NovoParallaxSection

```tsx
<NovoParallaxSection speed={0.5} overlay overlayOpacity={0.6}>
  <div 
    className="h-[500px] flex items-center justify-center"
    style={{ backgroundImage: 'url(/images/parallax.jpg)' }}
  >
    <h2 className="text-white text-5xl font-playfair">
      Your Content Here
    </h2>
  </div>
</NovoParallaxSection>
```

**Props**:
- `speed` (optional): Parallax intensity (default: 0.5)
- `overlay` (optional): Boolean for dark overlay
- `overlayOpacity` (optional): Number 0-1 (default: 0.6)
- `children`: Content with background image

---

### NovoPreloader

```tsx
// In layout or page component
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => setIsLoading(false), 1500);
  return () => clearTimeout(timer);
}, []);

<NovoPreloader isLoading={isLoading} />
```

**Props**:
- `isLoading` (required): Boolean to control visibility

---

### NovoPageTransition

```tsx
// Add once in layout
<NovoPageTransition />
```

**No props** - automatically handles route changes.

---

## 🎨 Utility Classes

### Buttons

```tsx
// Primary Button (Gold)
<button className="btn-primary">Click Me</button>

// Secondary Button (Outlined)
<button className="btn-secondary">Learn More</button>
```

### Section Spacing

```tsx
// Standard section padding (80px-160px responsive)
<section className="section-padding">
  {/* Your content */}
</section>

// With background
<section className="section-padding bg-gray-50">
  {/* Your content */}
</section>
```

### Container

```tsx
<div className="container mx-auto px-6 lg:px-12">
  {/* Centered content with padding */}
</div>
```

### Typography

```tsx
// Heading with Novo style
<h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-6">
  Title
</h2>

// Subtitle
<p className="text-[#d4af37] text-sm uppercase tracking-[0.2em] font-lato font-medium mb-4">
  Subtitle
</p>

// Body text
<p className="text-base md:text-lg text-gray-700 font-lato font-light leading-relaxed">
  Description
</p>

// Decorative line
<div className="w-16 h-[1px] bg-[#d4af37]" />
```

---

## 📄 Complete Page Template

```tsx
'use client';

import NovoNavigation from '@/components/professional/NovoNavigation';
import NovoHeroSection from '@/components/professional/NovoHeroSection';
import NovoSplitScreen from '@/components/professional/NovoSplitScreen';
import NovoPortfolioGrid from '@/components/professional/NovoPortfolioGrid';
import Link from 'next/link';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const portfolioItems = [
  { id: '1', image: '/images/p1.jpg', title: 'Project 1', category: 'wedding', href: '/gallery/1' },
  { id: '2', image: '/images/p2.jpg', title: 'Project 2', category: 'portrait', href: '/gallery/2' },
  // ... more items
];

export default function HomePage() {
  return (
    <>
      {/* Navigation */}
      <NovoNavigation
        items={navItems}
        ctaLabel="Book Now"
        ctaHref="/contact"
      />

      {/* Hero Section */}
      <NovoHeroSection
        title="Photography Studio"
        subtitle="Professional Visual Storytelling"
        backgroundImage="/images/hero.jpg"
        height="full"
        overlay
        parallax
      >
        <div className="flex gap-4">
          <Link href="/gallery" className="btn-primary">
            View Portfolio
          </Link>
          <Link href="/contact" className="btn-secondary">
            Contact Us
          </Link>
        </div>
      </NovoHeroSection>

      {/* About Section */}
      <NovoSplitScreen
        imagePosition="left"
        imageSrc="/images/about.jpg"
        imageAlt="About Us"
        title="Capturing Life's Beautiful Moments"
        subtitle="About Us"
        description="Professional photography with passion and expertise."
        overlay
      >
        <Link href="/about" className="btn-primary">
          Learn More
        </Link>
      </NovoSplitScreen>

      {/* Portfolio Section */}
      <section className="section-padding bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-[#d4af37] text-sm uppercase tracking-[0.2em] font-lato font-medium mb-4">
              Our Work
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-6">
              Portfolio
            </h2>
            <div className="w-16 h-[1px] bg-[#d4af37] mx-auto" />
          </div>

          {/* Portfolio Grid */}
          <NovoPortfolioGrid
            items={portfolioItems}
            categories={['all', 'wedding', 'portrait', 'event']}
            columns={3}
            showFilter
            gap="medium"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6">
            Ready to Book Your Session?
          </h2>
          <p className="text-lg md:text-xl font-lato font-light text-white/90 mb-10 max-w-2xl mx-auto">
            Let's create beautiful memories together
          </p>
          <Link href="/contact" className="btn-primary">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
```

---

## 🎯 Common Patterns

### Section Header

```tsx
<div className="text-center mb-16">
  <p className="text-[#d4af37] text-sm uppercase tracking-[0.2em] font-lato font-medium mb-4">
    Section Label
  </p>
  <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-6">
    Section Title
  </h2>
  <div className="w-16 h-[1px] bg-[#d4af37] mx-auto" />
</div>
```

### Two-Column Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
  <div>{/* Column 1 */}</div>
  <div>{/* Column 2 */}</div>
</div>
```

### Image with Overlay

```tsx
<div className="relative overflow-hidden group">
  <Image src="/image.jpg" alt="..." fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
  <div className="absolute inset-0 bg-black/40" />
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Content */}
  </div>
</div>
```

---

## 🎨 Color Reference

```css
/* Primary Colors */
Black:  #1a1a1a
Gold:   #d4af37
Bronze: #8b7355

/* Backgrounds */
White:      #ffffff
Light Gray: #f8f8f8
Dark:       #1a1a1a

/* Text */
Primary:   #1a1a1a
Secondary: #666666
Light:     #999999
```

---

## ⚡ Animation Durations

```tsx
// Framer Motion
transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}

// CSS Classes
transition-all duration-300  // Fast (hover effects)
transition-all duration-500  // Medium (layout changes)
transition-all duration-700  // Slow (image scales)
```

---

## 📱 Responsive Breakpoints

```tsx
// Tailwind breakpoints
xs:   475px
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px

// Example
className="text-2xl md:text-4xl lg:text-6xl"
```

---

## 🔗 Links

- **Components Guide**: `NOVO_COMPONENTS_GUIDE.md`
- **Implementation Summary**: `NOVO_IMPLEMENTATION_SUMMARY.md`
- **Multi-Theme Guide**: `MULTI_THEME_GUIDE.md`
- **Showcase Page**: `/novo-showcase`

---

**Quick Start**: Copy any snippet above and customize with your content!
