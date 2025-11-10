'use client';

import { useState, useEffect } from 'react';
import { FiBell, FiBellOff, FiCheck, FiAlertCircle } from 'react-icons/fi';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Push API is supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          },
          userAgent: navigator.userAgent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
      setError(null);
    } catch (err: any) {
      console.error('Error subscribing:', err);
      setError(err.message || 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe();

        // Remove subscription from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          }),
        });
      }

      setIsSubscribed(false);
      setError(null);
    } catch (err: any) {
      console.error('Error unsubscribing:', err);
      setError(err.message || 'Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isSubscribed ? (
              <>
                <FiBell className="text-green-600 dark:text-green-400" size={20} />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications Enabled
                </h3>
              </>
            ) : (
              <>
                <FiBellOff className="text-gray-400" size={20} />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Enable Notifications
                </h3>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {isSubscribed
              ? 'You\'ll receive instant alerts for new bookings, messages, and payments'
              : 'Get notified instantly when important events happen'}
          </p>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-3">
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isSubscribed
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            {isSubscribed ? 'Disabling...' : 'Enabling...'}
          </>
        ) : isSubscribed ? (
          <>
            <FiBellOff size={18} />
            Disable Notifications
          </>
        ) : (
          <>
            <FiCheck size={18} />
            Enable Notifications
          </>
        )}
      </button>

      {isSubscribed && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>New bookings</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>New messages</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Payment received</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Guest uploads</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
