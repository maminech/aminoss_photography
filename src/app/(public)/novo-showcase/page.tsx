'use client';

import NovoHeroSection from '@/components/professional/NovoHeroSection';
import NovoSplitScreen from '@/components/professional/NovoSplitScreen';
import NovoCarousel from '@/components/professional/NovoCarousel';
import NovoPortfolioGrid from '@/components/professional/NovoPortfolioGrid';
import NovoParallaxSection from '@/components/professional/NovoParallaxSection';
import Link from 'next/link';

// Sample data for demonstration
const carouselItems = [
  {
    id: '1',
    image: '/images/sample1.jpg',
    title: 'Elegant Moments',
    description: 'Capturing the beauty of life through the lens',
  },
  {
    id: '2',
    image: '/images/sample2.jpg',
    title: 'Timeless Beauty',
    description: 'Professional photography for every occasion',
  },
  {
    id: '3',
    image: '/images/sample3.jpg',
    title: 'Artistic Vision',
    description: 'Where creativity meets perfection',
  },
];

const portfolioItems = [
  {
    id: '1',
    image: '/images/portfolio1.jpg',
    title: 'Wedding Collection',
    category: 'wedding',
    href: '/gallery/1',
  },
  {
    id: '2',
    image: '/images/portfolio2.jpg',
    title: 'Portrait Series',
    category: 'portrait',
    href: '/gallery/2',
  },
  {
    id: '3',
    image: '/images/portfolio3.jpg',
    title: 'Event Coverage',
    category: 'event',
    href: '/gallery/3',
  },
  {
    id: '4',
    image: '/images/portfolio4.jpg',
    title: 'Fashion Editorial',
    category: 'fashion',
    href: '/gallery/4',
  },
  {
    id: '5',
    image: '/images/portfolio5.jpg',
    title: 'Corporate Events',
    category: 'event',
    href: '/gallery/5',
  },
  {
    id: '6',
    image: '/images/portfolio6.jpg',
    title: 'Studio Sessions',
    category: 'portrait',
    href: '/gallery/6',
  },
];

export default function NovoShowcasePage() {
  return (
    <div className="novo-showcase">
      {/* Hero Section */}
      <NovoHeroSection
        title="Innov8 Production"
        subtitle="Where Every Moment Becomes Art"
        backgroundImage="/images/hero-bg.jpg"
        height="full"
        overlay
        parallax
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/gallery" className="btn-primary">
            View Portfolio
          </Link>
          <Link href="/contact" className="btn-secondary">
            Get in Touch
          </Link>
        </div>
      </NovoHeroSection>

      {/* About Section - Split Screen */}
      <NovoSplitScreen
        imagePosition="left"
        imageSrc="/images/about.jpg"
        imageAlt="About Innov8 Production"
        title="Capturing Moments That Last Forever"
        subtitle="About Us"
        description="With over a decade of experience in professional photography, we specialize in creating stunning visual stories that capture the essence of every moment. Our passion for perfection and attention to detail ensures that each photograph is a masterpiece."
        overlay
      >
        <Link href="/about" className="btn-primary inline-block">
          Learn More
        </Link>
      </NovoSplitScreen>

      {/* Parallax Section */}
      <NovoParallaxSection
        speed={0.5}
        overlay
        overlayOpacity={0.6}
      >
        <div
          className="relative h-[500px] flex items-center justify-center"
          style={{
            backgroundImage: 'url(/images/parallax-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 text-center text-white px-6 max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6">
              Award-Winning Photography
            </h2>
            <p className="text-lg md:text-xl font-lato font-light">
              Recognized for excellence in capturing life's most precious moments
            </p>
          </div>
        </div>
      </NovoParallaxSection>

      {/* Services Section - Split Screen (Image Right) */}
      <NovoSplitScreen
        imagePosition="right"
        imageSrc="/images/services.jpg"
        imageAlt="Our Services"
        title="Professional Photography Services"
        subtitle="What We Offer"
        description="From intimate portraits to grand celebrations, we offer a comprehensive range of photography services tailored to your unique needs. Every project receives our full creative attention and technical expertise."
        overlay
      >
        <div className="flex flex-col gap-3 text-gray-700 font-lato">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#d4af37]" />
            <span>Wedding Photography</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#d4af37]" />
            <span>Portrait Sessions</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#d4af37]" />
            <span>Event Coverage</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#d4af37]" />
            <span>Commercial Photography</span>
          </div>
        </div>
      </NovoSplitScreen>

      {/* Portfolio Grid Section */}
      <section className="section-padding bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-[#d4af37] text-sm uppercase tracking-[0.2em] font-lato font-medium mb-4">
              Our Work
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-6">
              Portfolio
            </h2>
            <div className="w-16 h-[1px] bg-[#d4af37] mx-auto" />
          </div>

          <NovoPortfolioGrid
            items={portfolioItems}
            categories={['all', 'wedding', 'portrait', 'event', 'fashion']}
            columns={3}
            showFilter
            gap="medium"
          />
        </div>
      </section>

      {/* Carousel Section */}
      <section className="section-padding">
        <div className="mb-16 text-center">
          <p className="text-[#d4af37] text-sm uppercase tracking-[0.2em] font-lato font-medium mb-4">
            Featured
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-6">
            Recent Highlights
          </h2>
          <div className="w-16 h-[1px] bg-[#d4af37] mx-auto" />
        </div>

        <NovoCarousel
          items={carouselItems}
          autoplay
          autoplayInterval={5000}
          showDots
          showArrows
          loop
        />
      </section>

      {/* Call to Action Section */}
      <section className="section-padding bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6">
            Ready to Create Something Beautiful?
          </h2>
          <p className="text-lg md:text-xl font-lato font-light text-white/90 mb-10 max-w-2xl mx-auto">
            Let's work together to capture your special moments and create lasting memories
          </p>
          <Link href="/contact" className="btn-primary inline-block">
            Book a Session
          </Link>
        </div>
      </section>
    </div>
  );
}
