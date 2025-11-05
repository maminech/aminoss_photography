'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestSettingsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const testGet = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setResult({ 
        status: res.status, 
        ok: res.ok,
        data 
      });
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const testPut = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor: '#ff0000',
          secondaryColor: '#00ff00',
          fontHeading: 'Arial',
          fontBody: 'Verdana',
          designTheme: 'test',
        }),
      });
      const data = await res.json();
      setResult({ 
        status: res.status, 
        ok: res.ok,
        data 
      });
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings API Test</h1>
      
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Session Status</h2>
        <pre className="bg-gray-100 dark:bg-dark-700 p-4 rounded overflow-auto">
          {JSON.stringify({ status, session: session?.user }, null, 2)}
        </pre>
      </div>

      <div className="space-x-4 mb-6">
        <button
          onClick={testGet}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Test GET
        </button>
        <button
          onClick={testPut}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Test PUT (Save)
        </button>
      </div>

      {result && (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Result</h2>
          <pre className="bg-gray-100 dark:bg-dark-700 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
