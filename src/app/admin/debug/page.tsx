'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AdminDebugPage() {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState('');

  useEffect(() => {
    setCookies(document.cookie);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
          <pre className="mt-4 bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Cookies</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto">
            {cookies || 'No cookies found'}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Environment</h2>
          <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set'}</p>
          <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/admin/setup"
              className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-center"
            >
              Create Admin Account
            </a>
            <a
              href="/admin/login"
              className="block px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center"
            >
              Go to Login
            </a>
            <a
              href="/api/auth/signin"
              className="block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-center"
            >
              NextAuth Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
