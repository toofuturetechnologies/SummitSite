'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BookingConfirmedContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('trip');

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 max-w-md text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-400" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h1>

      <p className="text-gray-600 mb-6">
        Your adventure is booked. The guide will confirm your booking shortly, and you&apos;ll receive an email with next steps.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-600 text-sm mb-2">Next Steps:</p>
        <ul className="text-gray-600 text-sm space-y-2 text-left">
          <li>✓ Confirm your email address</li>
          <li>✓ Prepare your gear and equipment</li>
          <li>✓ Contact the guide with any questions</li>
          <li>✓ Check your email for details</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Link
          href="/trips"
          className="block w-full bg-summit-600 hover:bg-summit-500 text-white font-medium py-3 rounded-lg transition"
        >
          Browse More Trips
        </Link>
        <Link
          href="/"
          className="block w-full bg-gray-200 hover:bg-summit-600 text-white font-medium py-3 rounded-lg transition"
        >
          Back to Home
        </Link>
      </div>

      <p className="text-gray-600 text-xs mt-6">
        Booking ID: {tripId}
      </p>
    </div>
  );
}

export default function BookingConfirmedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="text-white text-lg">Loading...</div>
      }>
        <BookingConfirmedContent />
      </Suspense>
    </div>
  );
}
