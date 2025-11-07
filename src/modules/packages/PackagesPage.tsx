'use client';

/**
 * Public Packages Page
 * Displays photography and videography packages
 * Allows users to book packages via contact form
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, Video, Clock, Check, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Pack {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  coverImage: string;
  features: string[];
  category: string;
  active: boolean;
}

export default function PackagesPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const res = await fetch('/api/packs');
      const data = await res.json();
      setPacks(data.filter((pack: Pack) => pack.active));
    } catch (error) {
      console.error('Error fetching packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(packs.map(p => p.category)))];
  const filteredPacks = filter === 'all' 
    ? packs 
    : packs.filter(p => p.category.toLowerCase() === filter.toLowerCase());

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('video')) return Video;
    return Camera;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-black dark:to-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Photography & Videography Packages</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent">
              Our Packages
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional photography and videography services tailored to capture your special moments
            </p>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300
                  ${filter === category
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredPacks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Camera className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-500 dark:text-gray-400">
                No packages available in this category
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPacks.map((pack, index) => {
                const CategoryIcon = getCategoryIcon(pack.category);
                
                return (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group glass-card overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
                  >
                    {/* Package Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={pack.coverImage}
                        alt={pack.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <CategoryIcon className="w-5 h-5 text-white" />
                        <span className="text-white text-sm font-medium">{pack.category}</span>
                      </div>
                    </div>

                    {/* Package Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                        {pack.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {pack.description}
                      </p>

                      {/* Duration & Price */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{pack.duration}</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {pack.price.toLocaleString()} DT
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {pack.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {pack.features.length > 4 && (
                          <li className="text-sm text-primary font-medium pl-6">
                            +{pack.features.length - 4} more features
                          </li>
                        )}
                      </ul>

                      {/* Book Now Button */}
                      <Link
                        href={`/contact?package=${encodeURIComponent(pack.name)}&price=${pack.price}`}
                        className="btn-primary w-full flex items-center justify-center gap-2 group"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center"
        >
          <div className="glass-card p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Need a Custom Package?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Every event is unique. Contact us to create a personalized package that fits your specific needs and budget.
            </p>
            <Link
              href="/contact"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
