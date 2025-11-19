'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiMail, FiLock, FiSave, FiLogOut, FiGlobe, FiPhone, 
  FiInstagram, FiFacebook, FiYoutube, FiMapPin, FiInfo, FiSettings,
  FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiExternalLink
} from 'react-icons/fi';

type TabType = 'account' | 'site' | 'integrations' | 'appearance';

interface SiteSettings {
  siteName: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  googleCalendarEmail?: string;
  googleCalendarLastSync?: string;
  instagramUsername?: string;
  instagramLastSync?: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: '',
    tagline: '',
    location: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
  });

  useEffect(() => {
    if (session?.user) {
      setAccountForm(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
      }));
    }
    fetchSiteSettings();
  }, [session]);

  const fetchSiteSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 4000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountForm.name,
          email: accountForm.email,
        }),
      });

      if (res.ok) {
        showSuccess('✅ Profile updated successfully!');
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      showError('An error occurred while updating profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    if (accountForm.newPassword !== accountForm.confirmPassword) {
      showError('New passwords do not match');
      setSaveLoading(false);
      return;
    }

    if (accountForm.newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      setSaveLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: accountForm.currentPassword,
          newPassword: accountForm.newPassword,
        }),
      });

      if (res.ok) {
        showSuccess('✅ Password updated successfully!');
        setAccountForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to update password');
      }
    } catch (err) {
      showError('An error occurred while updating password');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });

      if (res.ok) {
        showSuccess('✅ Site settings updated successfully!');
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to update settings');
      }
    } catch (err) {
      showError('An error occurred while updating settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const tabs = [
    { id: 'account' as TabType, label: 'Account', icon: FiUser },
    { id: 'site' as TabType, label: 'Site Info', icon: FiGlobe },
    { id: 'integrations' as TabType, label: 'Integrations', icon: FiCalendar },
    { id: 'appearance' as TabType, label: 'Appearance', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-30">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
                  <FiSettings className="w-5 h-5 text-white" />
                </div>
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your account, site configuration, and integrations
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 max-w-md"
          >
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 max-w-md"
          >
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-5xl mx-auto">

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Account Tab */}
              {activeTab === 'account' && (
                <>
                  {/* Profile Information */}
                  <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700">
                    <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiUser className="w-5 h-5" />
                        Profile Information
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Update your personal account details
                      </p>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="Your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={accountForm.email}
                            onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <FiSave className="w-4 h-4" />
                        {saveLoading ? 'Saving...' : 'Save Profile'}
                      </button>
                    </form>
                  </div>

                  {/* Change Password */}
                  <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700">
                    <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiLock className="w-5 h-5" />
                        Change Password
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={accountForm.currentPassword}
                          onChange={(e) => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={accountForm.newPassword}
                          onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="Enter new password"
                          required
                          minLength={6}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                          <FiInfo className="w-3 h-3" />
                          Must be at least 6 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={accountForm.confirmPassword}
                          onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="Confirm new password"
                          required
                          minLength={6}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <FiLock className="w-4 h-4" />
                        {saveLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border-2 border-red-200 dark:border-red-900/50">
                    <div className="p-6 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-t-2xl">
                      <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 flex items-center gap-2">
                        <FiLogOut className="w-5 h-5" />
                        Danger Zone
                      </h2>
                      <p className="text-sm text-red-700 dark:text-red-400/80 mt-1">
                        Actions that require extra caution
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            Sign Out
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            You'll need to log in again to access the admin dashboard
                          </p>
                        </div>
                        <button
                          onClick={() => signOut({ callbackUrl: '/admin/login' })}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-500 dark:bg-red-600 text-white rounded-xl hover:bg-red-600 dark:hover:bg-red-700 transition font-medium whitespace-nowrap"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Site Info Tab */}
              {activeTab === 'site' && !loading && (
                <form onSubmit={handleUpdateSiteSettings} className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700">
                    <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiGlobe className="w-5 h-5" />
                        Basic Information
                      </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={siteSettings.siteName}
                          onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="Your photography studio name"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={siteSettings.tagline}
                          onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="Your catchy tagline"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={siteSettings.location}
                            onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700">
                    <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiPhone className="w-5 h-5" />
                        Contact Information
                      </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={siteSettings.email}
                            onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="contact@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            value={siteSettings.phone}
                            onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="+216 12 345 678"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          value={siteSettings.whatsappNumber}
                          onChange={(e) => setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          placeholder="21612345678 (without +)"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                          Enter without + or spaces (e.g., 21612345678)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700">
                    <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiInstagram className="w-5 h-5" />
                        Social Media Links
                      </h2>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Instagram URL
                        </label>
                        <div className="relative">
                          <FiInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={siteSettings.instagramUrl}
                            onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="https://instagram.com/your_account"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Facebook URL
                        </label>
                        <div className="relative">
                          <FiFacebook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={siteSettings.facebookUrl}
                            onChange={(e) => setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="https://facebook.com/your_page"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          YouTube URL
                        </label>
                        <div className="relative">
                          <FiYoutube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={siteSettings.youtubeUrl}
                            onChange={(e) => setSiteSettings({ ...siteSettings, youtubeUrl: e.target.value })}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="https://youtube.com/@your_channel"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <FiSave className="w-4 h-4" />
                    {saveLoading ? 'Saving...' : 'Save Site Settings'}
                  </button>
                </form>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  {/* Google Calendar */}
                  <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700">
                    <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiCalendar className="w-5 h-5" />
                        Google Calendar Integration
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          siteSettings.googleCalendarEmail
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-gray-100 dark:bg-dark-700'
                        }`}>
                          <FiCalendar className={`w-6 h-6 ${
                            siteSettings.googleCalendarEmail
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          {siteSettings.googleCalendarEmail ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                <FiCheckCircle className="w-5 h-5" />
                                Connected
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Account:</strong> {siteSettings.googleCalendarEmail}
                              </p>
                              {siteSettings.googleCalendarLastSync && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <strong>Last sync:</strong> {new Date(siteSettings.googleCalendarLastSync).toLocaleString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                                <FiAlertCircle className="w-5 h-5" />
                                Not Connected
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sync bookings automatically with Google Calendar
                              </p>
                            </div>
                          )}
                          <a
                            href="/admin/dashboard/calendar-integration"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium text-sm"
                          >
                            Manage Integration
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700">
                    <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiInstagram className="w-5 h-5" />
                        Instagram Integration
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          siteSettings.instagramUsername
                            ? 'bg-pink-100 dark:bg-pink-900/30'
                            : 'bg-gray-100 dark:bg-dark-700'
                        }`}>
                          <FiInstagram className={`w-6 h-6 ${
                            siteSettings.instagramUsername
                              ? 'text-pink-600 dark:text-pink-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          {siteSettings.instagramUsername ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-medium">
                                <FiCheckCircle className="w-5 h-5" />
                                Connected
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Username:</strong> @{siteSettings.instagramUsername}
                              </p>
                              {siteSettings.instagramLastSync && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <strong>Last sync:</strong> {new Date(siteSettings.instagramLastSync).toLocaleString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                                <FiAlertCircle className="w-5 h-5" />
                                Not Connected
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Display your Instagram posts automatically
                              </p>
                            </div>
                          )}
                          <a
                            href="/admin/dashboard/instagram"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium text-sm"
                          >
                            Manage Integration
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 p-8 text-center">
                  <FiSettings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Appearance Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Customize colors, themes, and visual elements
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Coming soon...
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

