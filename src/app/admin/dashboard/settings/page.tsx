'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { FiUser, FiMail, FiLock, FiSave, FiLogOut } from 'react-icons/fi';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
      }));
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your account information and security
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              ✅ Changes saved successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Profile Information
              </h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <FiMail className="text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                Save Profile
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiLock className="w-5 h-5" />
                Change Password
              </h2>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                <FiLock className="w-4 h-4" />
                Update Password
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <FiLogOut className="w-5 h-5" />
                Danger Zone
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Sign out from your account. You'll need to log in again to access the admin dashboard.
              </p>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <FiLogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

