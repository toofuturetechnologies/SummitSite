/**
 * Offline Fallback Page
 * Shown when user is offline and page not in cache
 */

import Link from 'next/link';
import { Wifi } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <Wifi className="h-16 w-16 text-gray-400 dark:text-gray-600 rotate-45 opacity-50" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          You're Offline
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          It looks like you've lost internet connection. Some features may be unavailable.
        </p>

        <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-sky-700 dark:text-sky-300">
            <strong>📱 Good news:</strong> You can still view cached pages like trips and your profile!
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/trips"
            className="block px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors"
          >
            Browse Cached Trips
          </Link>

          <Link
            href="/dashboard"
            className="block px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-colors"
          >
            View Dashboard
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-8">
          Check your connection and refresh the page to get back online
        </p>
      </div>
    </div>
  );
}
