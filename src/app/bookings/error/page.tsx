'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Something went wrong with your booking';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 max-w-md text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-16 h-16 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Booking Failed</h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {decodeURIComponent(error)}
        </p>

        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Please try again or contact support if the problem persists.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/trips"
            className="block w-full bg-summit-600 hover:bg-summit-500 text-white font-medium py-3 rounded-lg transition"
          >
            Browse Trips
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-900 dark:text-gray-100 font-medium py-3 rounded-lg transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
          <p className="text-gray-900 dark:text-gray-100 text-lg">Loading...</p>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
