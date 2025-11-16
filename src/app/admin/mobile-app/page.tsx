'use client';

import { useState } from 'react';
import { Download, Smartphone, Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function MobileAppDownloadPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    // Redirect to admin dashboard for PWA installation
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-full mb-6">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Innov8 Admin Mobile App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Install as a Progressive Web App - Works on ANY device (Android, iOS, Desktop)
          </p>
        </div>

        {/* Download Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-6 mb-8">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Progressive Web App (PWA)
              </h2>
              <p className="text-gray-600 mb-4">
                Version 1.0.0 • Works on Android, iOS, and Desktop • No app store needed
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Install App
              </button>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Installation Instructions:</h3>
            
            {/* Android Chrome */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">📱 Android (Chrome/Edge):</h4>
              <ol className="space-y-2 text-gray-700 ml-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                  <span>Click "Install App" button above or visit admin dashboard</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                  <span>Tap the "Install" banner or menu (⋮) → "Install app"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                  <span>App appears on home screen - tap to open</span>
                </li>
              </ol>
            </div>

            {/* iPhone/iPad */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">🍎 iPhone/iPad (Safari):</h4>
              <ol className="space-y-2 text-gray-700 ml-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                  <span>Visit admin dashboard in Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                  <span>Tap Share button (⬆️) at bottom</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                  <span>Scroll and tap "Add to Home Screen"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                  <span>Tap "Add" - app icon appears on home screen</span>
                </li>
              </ol>
            </div>

            {/* Desktop */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">💻 Desktop (Chrome/Edge):</h4>
              <ol className="space-y-2 text-gray-700 ml-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                  <span>Click install icon (⊕) in address bar</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                  <span>Click "Install" in popup</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                  <span>App opens in its own window</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Mark as Paid</h3>
            <p className="text-gray-600 text-sm">
              Quickly mark invoices as paid with a single tap
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Approve Bookings</h3>
            <p className="text-gray-600 text-sm">
              Approve or reject booking requests instantly
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-Time Sync</h3>
            <p className="text-gray-600 text-sm">
              Connected to live database - all changes sync instantly
            </p>
          </div>
        </div>

        {/* Key Features List */}
        <div className="bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">What's Included</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Dashboard with Stats</p>
                <p className="text-sm text-gray-600">View revenue, expenses, and business metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Invoice Management</p>
                <p className="text-sm text-gray-600">List, filter, and mark invoices as paid</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Booking Requests</p>
                <p className="text-sm text-gray-600">Approve or reject booking requests</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Pull-to-Refresh</p>
                <p className="text-sm text-gray-600">Always see the latest data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">TND Currency</p>
                <p className="text-sm text-gray-600">All amounts displayed in Tunisian Dinar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Secure Login</p>
                <p className="text-sm text-gray-600">Admin-only access with session management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">System Requirements</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• ✅ Works on ANY device (Android, iOS, Windows, Mac, Linux)</li>
            <li>• ✅ No app store needed - installs directly</li>
            <li>• ✅ Minimal storage (~5 MB cached)</li>
            <li>• ✅ Offline support after first install</li>
            <li>• ✅ Internet connection for data sync</li>
            <li>• ✅ Admin account credentials required</li>
          </ul>
        </div>

        {/* Support */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Need help? Contact support or check the admin dashboard for more information.</p>
        </div>
      </div>
    </div>
  );
}
