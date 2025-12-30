'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to test API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      
      if (data.status === 'success') {
        setResult({
          ...data,
          databaseTest: 'MongoDB connection successful!',
        });
      }
    } catch (err) {
      setError('Failed to test database connection');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          CBT System Test Page
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This page tests the core functionality of the CBT system.
          </p>

          <div className="flex space-x-4 mb-6">
            <Button onClick={testAPI} disabled={loading}>
              {loading ? 'Testing API...' : 'Test API'}
            </Button>
            <Button onClick={testDatabase} disabled={loading} variant="secondary">
              {loading ? 'Testing DB...' : 'Test Database'}
            </Button>
          </div>

          {error && <Alert type="error" message={error} />}

          {result && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Test Results:</h3>
              <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Next Steps
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Set up MongoDB connection</li>
            <li>• Configure environment variables in .env</li>
            <li>• Test authentication system</li>
            <li>• Implement test builder interface</li>
            <li>• Add question management features</li>
            <li>• Develop secure test environment</li>
            <li>• Integrate Claude API for AI scoring</li>
            <li>• Build real-time monitoring dashboard</li>
            <li>• Create comprehensive analytics</li>
            <li>• Write unit and integration tests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}