'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiLock, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import Logo from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';

function ClientLoginForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const callbackUrl = searchParams?.get('callbackUrl') || '/client/dashboard';
  const expired = searchParams?.get('expired');

  useEffect(() => {
    if (expired === 'true') {
      setError(t('client.sessionExpired'));
    }
  }, [expired, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login - redirect to callback URL
        window.location.href = callbackUrl;
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-dark-900 to-gray-100 dark:to-dark-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 mb-8 transition"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')} {t('common.home')}
        </Link>

        {/* Login Card */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 dark:bg-primary-700 px-8 py-6">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-lg">
                <Logo size="md" variant="light" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center">{t('client.login')}</h1>
            <p className="text-primary-100 dark:text-primary-200 text-center mt-2">
              {t('client.viewGallery')}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-sm flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('client.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder={t('client.email')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('client.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('client.loggingIn')}
                  </span>
                ) : (
                  t('client.loginButton')
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Need help? Contact{' '}
                <a
                  href="mailto:innov8.tn@gmail.com"
                  className="text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 font-medium"
                >
                  innov8.tn@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Your login credentials were sent to you via email by your photographer.
        </p>
      </div>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 dark:from-dark-900 to-gray-100 dark:to-dark-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ClientLoginForm />
    </Suspense>
  );
}
