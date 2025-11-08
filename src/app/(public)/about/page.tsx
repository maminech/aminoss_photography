'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiDownload, FiAward, FiCamera } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import NavigationButton from '@/components/NavigationButton';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image: string;
  instagram?: string;
  visible: boolean;
}

export default function AboutPage() {
  const { currentTheme } = useLayoutTheme();
  const isProfessional = currentTheme === 'professional';
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Fetch team members from API
    fetch('/api/admin/team')
      .then(res => res.json())
      .then((data: TeamMember[]) => {
        // Only show visible members
        setTeamMembers(data.filter(m => m.visible));
      })
      .catch(err => console.error('Error fetching team:', err));
  }, []);

  // Professional/Novo Theme Layout
  if (isProfessional) {
    return (
      <div className="novo-about-page bg-white min-h-screen">
        <NavigationButton variant="both" />
        <section className="py-24 md:py-32 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-8">
                About Me
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[1px] bg-[#d4af37] mx-auto mb-12"
              />

              <p className="text-lg md:text-xl text-gray-700 font-lato leading-relaxed max-w-3xl mx-auto">
                Passionate photographer capturing life's beautiful moments
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-24">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src="https://res.cloudinary.com/dc67gl8fu/image/upload/v1762143346/575979105_1773518303328582_3518430202353162681_n_wmnkpr.jpg"
                  alt="Aminoss"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col justify-center"
              >
                <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6 text-[#1a1a1a]">
                  Hello, I'm Aminoss
                </h2>
                <div className="space-y-6 text-gray-700 font-lato text-lg leading-relaxed">
                  <p>
                    I'm a professional photographer based in Sousse, Tunisia, with a passion for 
                    capturing authentic moments and creating timeless memories.
                  </p>
                  <p>
                    With over 10 years of experience in photography and videography, I specialize 
                    in weddings, portraits, fashion, and travel photography. My work is characterized 
                    by its natural, artistic approach and attention to detail.
                  </p>
                  <p>
                    Every photograph tells a story, and my goal is to help you tell yours in the 
                    most beautiful and meaningful way possible.
                  </p>
                </div>

                <div className="mt-8">
                  <Link
                    href="/contact"
                    className="inline-block px-10 py-4 bg-[#1a1a1a] text-white font-lato font-medium text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all duration-300"
                  >
                    Work With Me
                  </Link>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 py-16 border-t border-b border-gray-200"
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-playfair font-bold text-[#d4af37] mb-2">500+</div>
                <div className="text-sm md:text-base font-lato uppercase tracking-wider text-gray-600">
                  Happy Clients
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-playfair font-bold text-[#d4af37] mb-2">1000+</div>
                <div className="text-sm md:text-base font-lato uppercase tracking-wider text-gray-600">
                  Projects Done
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-playfair font-bold text-[#d4af37] mb-2">15+</div>
                <div className="text-sm md:text-base font-lato uppercase tracking-wider text-gray-600">
                  Awards Won
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-playfair font-bold text-[#d4af37] mb-2">10+</div>
                <div className="text-sm md:text-base font-lato uppercase tracking-wider text-gray-600">
                  Years Experience
                </div>
              </div>
            </motion.div>

            <div className="mb-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#1a1a1a] mb-8">
                  What I Do
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '60px' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-[1px] bg-[#d4af37] mx-auto"
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: FiCamera, title: 'Wedding Photography', desc: 'Capturing your special day with elegance and emotion' },
                  { icon: FiAward, title: 'Portrait Sessions', desc: 'Professional portraits that showcase your unique personality' },
                  { icon: FiCamera, title: 'Fashion & Editorial', desc: 'Creative and artistic fashion photography' }
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center p-8 border border-gray-200 hover:border-[#d4af37] transition-colors duration-300"
                  >
                    <service.icon className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
                    <h3 className="text-xl font-playfair font-bold text-[#1a1a1a] mb-3">{service.title}</h3>
                    <p className="text-gray-600 font-lato">{service.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {teamMembers.length > 0 && (
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#1a1a1a] mb-8">
                    Meet The Team
                  </h2>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '60px' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-[1px] bg-[#d4af37] mx-auto"
                  />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="relative aspect-square mb-4 overflow-hidden">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="text-xl font-playfair font-bold text-[#1a1a1a] mb-1">{member.name}</h3>
                      <p className="text-sm font-lato uppercase tracking-wider text-[#d4af37] mb-2">{member.role}</p>
                      {member.bio && <p className="text-gray-600 font-lato text-sm">{member.bio}</p>}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Simple Theme Layout (existing)
  return (
    <div className="min-h-screen py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <NavigationButton variant="both" />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 text-gray-900 dark:text-gray-100">
              About Me
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Passionate photographer capturing life's beautiful moments
            </p>
          </div>

          {/* Portrait and Bio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl"
            >
              <Image
                src="https://res.cloudinary.com/dc67gl8fu/image/upload/v1762143346/575979105_1773518303328582_3518430202353162681_n_wmnkpr.jpg"
                alt="Aminoss"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-3xl font-display font-bold mb-4 text-gray-900 dark:text-gray-100">Hello, I'm Aminoss</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                <p>
                  I'm a professional photographer based in Sousse, Tunisia, with a passion for 
                  capturing authentic moments and creating timeless memories.
                </p>
                <p>
                  With over 10 years of experience in photography and videography, I specialize 
                  in weddings, portraits, fashion, and travel photography. My work is characterized 
                  by its natural, artistic approach and attention to detail.
                </p>
                <p>
                  Every photograph tells a story, and I'm here to help tell yours in the most 
                  beautiful way possible.
                </p>
              </div>

              <div className="mt-8">
                <button className="btn-primary inline-flex items-center gap-2">
                  <FiDownload />
                  Download Portfolio PDF
                </button>
              </div>
            </motion.div>
          </div>

          {/* Philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card bg-gray-50 dark:bg-dark-800 mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiCamera className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">My Philosophy</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              I believe that the best photographs are those that capture genuine emotions and 
              authentic moments. My approach is to blend into the background, allowing natural 
              interactions to unfold while being ready to capture those fleeting, perfect moments. 
              Whether it's a wedding, a portrait session, or a fashion shoot, I strive to create 
              images that are not just beautiful, but meaningful and timeless.
            </p>
          </motion.div>

          {/* Awards & Recognition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <FiAward className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">Awards & Exhibitions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  year: '2024',
                  title: 'Best Wedding Photographer',
                  organization: 'Tunisia Photography Awards',
                },
                {
                  year: '2023',
                  title: 'Featured Exhibition',
                  organization: 'Tunis Contemporary Art Gallery',
                },
                {
                  year: '2022',
                  title: 'Portrait Photography Excellence',
                  organization: 'African Photography Festival',
                },
                {
                  year: '2021',
                  title: 'Emerging Photographer Award',
                  organization: 'Mediterranean Photo Contest',
                },
              ].map((award, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card bg-white dark:bg-dark-800 border-l-4 border-primary-600 dark:border-primary-400"
                >
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">{award.year}</span>
                  <h3 className="text-xl font-semibold mt-2 mb-1 text-gray-900 dark:text-gray-100">{award.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{award.organization}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Meet The Team */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-display font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Meet The Team
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              Behind every great shot is a dedicated team of professionals working together to bring your vision to life.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.length === 0 ? (
                // Show placeholder while loading
                [...Array(6)].map((_, index) => (
                  <div key={index} className="glass-card bg-gray-100 dark:bg-dark-800 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-300 dark:bg-dark-700"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-300 dark:bg-dark-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded w-2/3 mb-3"></div>
                      <div className="h-16 bg-gray-300 dark:bg-dark-700 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card bg-white dark:bg-dark-800 overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    {/* Photo */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">{member.name}</h3>
                      <p className="text-primary-600 dark:text-primary-400 font-semibold mb-3">{member.role}</p>
                      {member.bio && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{member.bio}</p>
                      )}
                      {member.instagram && (
                        <a
                          href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {member.instagram}
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Equipment & Skills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-display font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
              Equipment & Expertise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card text-center bg-white dark:bg-dark-800">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Cameras</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Canon EOS R5</li>
                  <li>Sony A7R IV</li>
                  <li>Fujifilm X-T4</li>
                </ul>
              </div>
              <div className="glass-card text-center bg-white dark:bg-dark-800">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Lenses</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>24-70mm f/2.8</li>
                  <li>70-200mm f/2.8</li>
                  <li>50mm f/1.2</li>
                  <li>85mm f/1.4</li>
                </ul>
              </div>
              <div className="glass-card text-center bg-white dark:bg-dark-800">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Specializations</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Wedding Photography</li>
                  <li>Portrait Sessions</li>
                  <li>Fashion Editorial</li>
                  <li>Travel Documentary</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center glass-card bg-primary-600 dark:bg-primary-700 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Let's Work Together
            </h2>
            <p className="text-xl mb-8 text-primary-100 dark:text-primary-200">
              Ready to create something amazing?
            </p>
            <Link href="/contact">
              <button className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Get in Touch
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
