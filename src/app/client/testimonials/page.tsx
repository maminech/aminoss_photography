'use client';

/**
 * Client Testimonials Page (Redirect to public testimonials)
 * This ensures clients can access testimonials from /client/testimonials
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientTestimonialsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to public testimonials page
    router.replace('/testimonials');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to testimonials...</p>
      </div>
    </div>
  );
}
