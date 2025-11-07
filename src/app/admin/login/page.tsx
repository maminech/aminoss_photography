'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiLock, FiMail, FiAlertCircle } from 'react-icons/fi';

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams?.get('callbackUrl') || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else if (result?.ok) {
        // Successful login - wait a bit for session to be established, then redirect
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 100);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 dark:from-primary/5 to-gray-100 dark:to-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
              <FiLock className="w-8 h-8 text-primary-600 dark:text-primary-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to manage your portfolio
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Protected admin area</p>
          </div>
        </div>

        {/* Setup Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            First time? Visit{' '}
            <a
              href="/admin/setup"
              className="text-primary-600 dark:text-primary-500 hover:underline font-medium"
            >
              /admin/setup
            </a>{' '}
            to create your admin account
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 dark:from-primary/5 to-gray-100 dark:to-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
