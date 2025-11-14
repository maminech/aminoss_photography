'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiClock, FiDollarSign } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import NavigationButton from '@/components/NavigationButton';

interface Pack {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  coverImage: string;
  features: string[];
  category: string;
  packageType: 'aymen' | 'equipe';
}

export default function PacksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentTheme } = useLayoutTheme();
  const isProfessional = currentTheme === 'professional';
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Protect page - redirect non-admin users to homepage
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const res = await fetch('/api/packs');
      if (res.ok) {
        const data = await res.json();
        setPacks(data);
      }
    } catch (error) {
      console.error('Error fetching packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(packs.map(p => p.category)))];
  const filteredPacks = filter === 'all' ? packs : packs.filter(p => p.category === filter);

  // Show loading while checking authentication or fetching data
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {status === 'loading' ? 'Verifying access...' : 'Loading packages...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render content if not admin (will redirect in useEffect)
  if (!session || session.user?.role?.toLowerCase() !== 'admin') {
    return null;
  }

  // Professional/Novo Theme Layout
  if (isProfessional) {
    return (
      <div className="novo-packs-page bg-white dark:bg-gray-900 min-h-screen">
        <NavigationButton variant="both" />
        <section className="py-24 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8">
                Photography Packages
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[1px] bg-[#d4af37] mx-auto mb-12"
              />

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-lato leading-relaxed max-w-3xl mx-auto">
                Professional photography packages tailored to capture your special moments
              </p>
            </motion.div>

            {/* Category Filters - Novo Style */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-6 py-2 text-sm font-lato uppercase tracking-[0.2em] transition-all duration-300 ${
                    filter === category
                      ? 'bg-[#d4af37] text-white'
                      : 'bg-transparent text-[#1a1a1a] dark:text-gray-100 border border-gray-300 hover:border-[#d4af37]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Packages Par Aymen Section */}
            <div className="mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8 text-center"
              >
                Packages Par Aymen
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPacks.filter(pack => pack.packageType === 'aymen').map((pack, index) => (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#d4af37] transition-all duration-300 overflow-hidden"
                  >
                    {/* Pack Cover Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {pack.coverImage ? (
                        <img
                          src={pack.coverImage}
                          alt={pack.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                      
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-[#d4af37] text-white px-4 py-2">
                        <span className="text-2xl font-playfair font-bold">{pack.price} TND</span>
                      </div>
                    </div>

                    {/* Pack Details */}
                    <div className="p-6">
                      <h3 className="text-2xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-3">
                        {pack.name}
                      </h3>
                      
                      <p className="text-gray-600 font-lato mb-4 line-clamp-2">
                        {pack.description}
                      </p>

                      {/* Duration */}
                      <div className="flex items-center gap-2 mb-4 text-gray-600">
                        <FiClock className="w-4 h-4" />
                        <span className="font-lato text-sm">{pack.duration}</span>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2 mb-6">
                        {pack.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <FiCheck className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
                            <span className="font-lato text-sm">{feature}</span>
                          </li>
                        ))}
                        {pack.features.length > 4 && (
                          <li className="text-[#d4af37] font-lato text-sm">
                            +{pack.features.length - 4} more features
                          </li>
                        )}
                      </ul>

                      {/* Demande de Devis Button */}
                      <Link
                        href="/booking"
                        className="block w-full px-6 py-3 bg-[#1a1a1a] text-white font-lato text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all duration-300 text-center"
                      >
                        Demande de Devis
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredPacks.filter(pack => pack.packageType === 'aymen').length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-lato text-lg">No packages available in this category yet.</p>
                </div>
              )}
            </div>

            {/* Packages Par Équipe Section */}
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8 text-center"
              >
                Packages Par Équipe
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPacks.filter(pack => pack.packageType === 'equipe').map((pack, index) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#d4af37] transition-all duration-300 overflow-hidden"
                >
                  {/* Pack Cover Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {pack.coverImage ? (
                      <img
                        src={pack.coverImage}
                        alt={pack.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-[#d4af37] text-white px-4 py-2">
                      <span className="text-2xl font-playfair font-bold">{pack.price} TND</span>
                    </div>
                  </div>

                  {/* Pack Details */}
                  <div className="p-6">
                    <h3 className="text-2xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-3 group-hover:text-[#d4af37] transition-colors">
                      {pack.name}
                    </h3>
                    
                    <p className="text-gray-600 font-lato mb-4 line-clamp-2">
                      {pack.description}
                    </p>

                    {/* Duration */}
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                      <FiClock className="w-4 h-4" />
                      <span className="font-lato text-sm">{pack.duration}</span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {pack.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <FiCheck className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
                          <span className="font-lato text-sm">{feature}</span>
                        </li>
                      ))}
                      {pack.features.length > 4 && (
                        <li className="text-[#d4af37] font-lato text-sm">
                          +{pack.features.length - 4} more features
                        </li>
                      )}
                    </ul>

                    {/* Demande de Devis Button */}
                    <Link
                      href="/booking"
                      className="block w-full px-6 py-3 bg-[#1a1a1a] text-white font-lato text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all duration-300 text-center"
                    >
                      Demande de Devis
                    </Link>
                  </div>
                </motion.div>
              ))}
              </div>
              {filteredPacks.filter(pack => pack.packageType === 'equipe').length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-lato text-lg">No packages available in this category yet.</p>
                </div>
              )}
            </div>

            {filteredPacks.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 font-lato text-lg">No packages available yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Simple Theme Layout (existing)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <NavigationButton variant="both" />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white dark:via-dark-800 to-primary/5 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Photography Packages
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Discover our professional photography packages tailored to capture your special moments
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition whitespace-nowrap ${
                  filter === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Packs Grid - Instagram Style */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {filteredPacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No Packages Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                {filter === 'all' 
                  ? "We're currently updating our packages. Check back soon!"
                  : `No packages found in the "${filter}" category.`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="btn-primary"
                >
                  View All Packages
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Packages Par Aymen Section */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                Packages Par Aymen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredPacks.filter(pack => pack.packageType === 'aymen').map((pack, index) => (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={pack.coverImage}
                        alt={pack.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full">
                          {pack.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{pack.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{pack.description}</p>

                      {/* Price & Duration */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2 text-primary dark:text-primary-400">
                          <FiDollarSign className="w-5 h-5" />
                          <span className="text-2xl font-bold">{pack.price} TND</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <FiClock className="w-4 h-4" />
                          <span className="text-sm font-medium">{pack.duration}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {pack.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                            <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {pack.features.length > 4 && (
                          <li className="text-sm text-primary dark:text-primary-400 font-medium">
                            +{pack.features.length - 4} more features
                          </li>
                        )}
                      </ul>

                      {/* Demande de Devis Button (non-clickable, for display) */}
                      <Link
                        href="/booking"
                        className="block w-full py-4 md:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold text-center text-base md:text-sm"
                      >
                        Demande de Devis
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredPacks.filter(pack => pack.packageType === 'aymen').length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No packages available in this category yet.</p>
                </div>
              )}
            </div>

            {/* Packages Par Équipe Section */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                Packages Par Équipe
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredPacks.filter(pack => pack.packageType === 'equipe').map((pack, index) => (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={pack.coverImage}
                        alt={pack.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full">
                          {pack.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{pack.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{pack.description}</p>

                      {/* Price & Duration */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2 text-primary dark:text-primary-400">
                          <FiDollarSign className="w-5 h-5" />
                          <span className="text-2xl font-bold">{pack.price} TND</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <FiClock className="w-4 h-4" />
                          <span className="text-sm font-medium">{pack.duration}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {pack.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                            <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {pack.features.length > 4 && (
                          <li className="text-sm text-primary dark:text-primary-400 font-medium">
                            +{pack.features.length - 4} more features
                          </li>
                        )}
                      </ul>

                      {/* Demande de Devis Button (non-clickable, for display) */}
                      <Link
                        href="/booking"
                        className="block w-full py-4 md:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold text-center text-base md:text-sm"
                      >
                        Demande de Devis
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredPacks.filter(pack => pack.packageType === 'equipe').length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No packages available in this category yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
