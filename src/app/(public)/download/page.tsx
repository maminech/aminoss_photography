'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function DownloadAppPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = () => {
    setDownloadStarted(true);
    // Replace this URL with your actual APK URL after upload
    const apkUrl = '/downloads/Innov8-photography.apk'; // Or your hosting URL
    window.location.href = apkUrl;
    
    setTimeout(() => setDownloadStarted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#c67548] to-[#8B5CF6] bg-clip-text text-transparent">
            Download Our Mobile App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get the full Innov8 Production experience on your Android device
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left: Phone Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  {/* App Screenshot Placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-[#c67548] to-[#8B5CF6] flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <svg
                        className="w-24 h-24 mx-auto mb-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                      <h3 className="text-2xl font-bold">Innov8</h3>
                      <p className="text-white/80">Photography</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
              >
                NEW
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Download Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col justify-center"
          >
            {/* Features */}
            <div className="space-y-6 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Why Download Our App?
              </h2>
              
              {[
                {
                  icon: '📸',
                  title: 'Browse Galleries',
                  description: 'Swipe through stunning photo collections',
                },
                {
                  icon: '📅',
                  title: 'Easy Booking',
                  description: 'Book your photography session in seconds',
                },
                {
                  icon: '🔔',
                  title: 'Push Notifications',
                  description: 'Get instant updates on your bookings',
                },
                {
                  icon: '🌙',
                  title: 'Dark Mode',
                  description: 'Beautiful dark theme for night browsing',
                },
                {
                  icon: '📱',
                  title: 'Offline Access',
                  description: 'View your photos even without internet',
                },
                {
                  icon: '⚡',
                  title: 'Lightning Fast',
                  description: 'Native performance, no lag',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start space-x-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur"
                >
                  <span className="text-3xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={downloadStarted}
              className="w-full bg-gradient-to-r from-[#c67548] to-[#8B5CF6] text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadStarted ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Downloading...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download for Android (APK)
                </span>
              )}
            </motion.button>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Installation Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Download the APK file</li>
                    <li>Allow installation from unknown sources in settings</li>
                    <li>Open the downloaded file and tap Install</li>
                    <li>Enjoy the app!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: 'Size', value: '~25 MB' },
                { label: 'Version', value: '1.0.0' },
                { label: 'Rating', value: '5.0 ⭐' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur"
                >
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Is the app free?',
                a: 'Yes! The app is completely free to download and use.',
              },
              {
                q: 'Is it safe to install?',
                a: 'Absolutely! The app is built with security in mind and contains no malware.',
              },
              {
                q: 'Will it work on iOS/iPhone?',
                a: 'Currently, this is an Android APK. iOS version coming soon!',
              },
              {
                q: 'Can I use it offline?',
                a: 'Yes! Once you view galleries, they are cached for offline viewing.',
              },
              {
                q: 'How do I update the app?',
                a: 'You\'ll receive a notification when updates are available. Simply download the new version.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md"
              >
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-[#c67548] to-[#8B5CF6] rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Experience Amazing Photography?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Download the app now and start exploring our galleries
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="bg-white text-[#c67548] px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Download Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
