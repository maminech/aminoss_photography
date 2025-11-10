'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaAndroid, 
  FaDownload, 
  FaQrcode, 
  FaCamera, 
  FaCalendar, 
  FaImages, 
  FaMoon, 
  FaBolt, 
  FaShieldAlt,
  FaCheckCircle,
  FaMobileAlt
} from 'react-icons/fa';
import QRCode from 'qrcode';

export default function DownloadAppPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect Android device
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent));

    // Generate QR code
    const appUrl = `${window.location.origin}/downloads/aminoss-photography.apk`;
    QRCode.toDataURL(appUrl, { width: 200, margin: 2 })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, []);

  const features = [
    {
      icon: FaImages,
      title: 'Browse Galleries',
      description: 'Explore stunning photo collections with smooth navigation'
    },
    {
      icon: FaCalendar,
      title: 'Easy Booking',
      description: 'Schedule your photography session in just a few taps'
    },
    {
      icon: FaCamera,
      title: 'View Portfolios',
      description: 'See our complete work in beautiful high-resolution'
    },
    {
      icon: FaMoon,
      title: 'Dark Mode',
      description: 'Easy on the eyes with automatic dark mode support'
    },
    {
      icon: FaBolt,
      title: 'Lightning Fast',
      description: 'Optimized performance with offline caching'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Your data is protected with industry-standard security'
    }
  ];

  const screenshots = [
    { title: 'Home', image: '/screenshots/home.png' },
    { title: 'Gallery', image: '/screenshots/gallery.png' },
    { title: 'Booking', image: '/screenshots/booking.png' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-orange-600/10 dark:from-amber-600/5 dark:to-orange-600/5" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-3xl shadow-2xl">
              <FaMobileAlt className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Download Our App
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience Aminoss Photography in your pocket. Book sessions, browse galleries, and stay connected - all in one beautiful app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAndroid ? (
                <motion.a
                  href="/downloads/aminoss-photography.apk"
                  download
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                >
                  <FaAndroid className="w-6 h-6" />
                  Download for Android
                  <FaDownload className="w-5 h-5" />
                </motion.a>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Scan with your Android phone to download
                  </p>
                  {qrCodeUrl && (
                    <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FaCheckCircle className="text-green-500" />
              <span>Free Download</span>
              <span>•</span>
              <span>~15 MB</span>
              <span>•</span>
              <span>No Ads</span>
              <span>•</span>
              <span>Secure</span>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need in a photography app
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Easy Installation
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get started in just 3 simple steps
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: 'Download the APK',
                description: 'Tap the download button above to get the app file'
              },
              {
                step: 2,
                title: 'Allow Installation',
                description: 'If prompted, enable "Install from Unknown Sources" in your settings'
              },
              {
                step: 3,
                title: 'Install & Open',
                description: 'Tap the downloaded file, install the app, and start exploring!'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'Is the app free?',
                answer: 'Yes! The app is completely free to download and use with no hidden fees or subscriptions.'
              },
              {
                question: 'Is it safe to install?',
                answer: 'Absolutely! The app is built and maintained by Aminoss Photography. It\'s completely safe and secure.'
              },
              {
                question: 'Why not on Play Store?',
                answer: 'Direct download gives you faster updates and we can provide a more personalized experience without app store restrictions.'
              },
              {
                question: 'Does it work offline?',
                answer: 'Yes! Once you\'ve browsed content, it\'s cached and available offline for faster loading.'
              },
              {
                question: 'How do I update the app?',
                answer: 'The app will notify you when updates are available. Just download and install the new version.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Download now and experience photography booking like never before
            </p>
            <motion.a
              href="/downloads/aminoss-photography.apk"
              download
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-amber-600 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              <FaDownload className="w-5 h-5" />
              Download Now
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
