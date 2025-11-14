export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Name and contact information when you book a session</li>
              <li>Photos and videos you upload through our platform</li>
              <li>Messages and communications with our team</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Instagram Integration
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our website displays public Instagram content from our photography account. We use the Instagram Basic Display API to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Display our public Instagram photos on our portfolio</li>
              <li>Show our Instagram highlights and stories</li>
              <li>Sync our latest photography work automatically</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              We only access our own Instagram account and do not collect any visitor Instagram data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide photography services and manage bookings</li>
              <li>Share photos and videos from your sessions</li>
              <li>Communicate with you about your booking</li>
              <li>Improve our website and services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Storage
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your photos and data are securely stored using industry-standard cloud services (Cloudinary for media, MongoDB for data). We implement appropriate security measures to protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Download your photos and videos</li>
              <li>Opt-out of communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We use essential cookies to maintain your session and preferences. We do not use tracking cookies or third-party advertising cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:aminoss.photography@gmail.com" className="text-primary hover:underline">
                aminoss.photography@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
