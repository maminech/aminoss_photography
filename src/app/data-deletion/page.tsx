export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Data Deletion Instructions
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Innov8 Production respects your privacy and your right to control your data.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              How to Request Data Deletion
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you would like us to delete your personal data from our systems, please follow these steps:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-3">
              <li>
                <strong>Send an email</strong> to{' '}
                <a href="mailto:innov8.tn@gmail.com" className="text-primary hover:underline">
                  innov8.tn@gmail.com
                </a>
              </li>
              <li>
                <strong>Subject line:</strong> "Data Deletion Request"
              </li>
              <li>
                <strong>Include in your email:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your full name</li>
                  <li>Email address associated with your account/booking</li>
                  <li>Specific data you want deleted (photos, booking info, etc.)</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              What Data Will Be Deleted
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Upon your request, we will delete:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Your personal information (name, email, phone number)</li>
              <li>Photos and videos from your sessions</li>
              <li>Booking and communication history</li>
              <li>Client gallery access credentials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Processing Time
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We will process your data deletion request within <strong>30 days</strong> of receiving your email. You will receive a confirmation email once the deletion is complete.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Data Retention Exceptions
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Please note that we may retain certain information if:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Required by law for tax or business records</li>
              <li>Necessary to resolve disputes or enforce agreements</li>
              <li>Part of published portfolio work (with your prior consent)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              We will inform you of any data that cannot be deleted due to legal obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Instagram Data
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our Instagram integration only accesses our own business Instagram account. We do not store any visitor Instagram data. If you have concerns about Instagram data, please refer to{' '}
              <a href="https://help.instagram.com/519522125107875" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Instagram's Privacy Policy
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Questions?
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about data deletion or privacy, contact us at:{' '}
              <a href="mailto:innov8.tn@gmail.com" className="text-primary hover:underline">
                innov8.tn@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
