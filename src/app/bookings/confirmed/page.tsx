'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function BookingConfirmedPage() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('trip');

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
      <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8 max-w-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h1>

        <p className="text-summit-300 mb-6">
          Your adventure is booked. The guide will confirm your booking shortly, and you'll receive an email with next steps.
        </p>

        <div className="bg-summit-900/50 rounded-lg p-4 mb-6">
          <p className="text-summit-400 text-sm mb-2">Next Steps:</p>
          <ul className="text-summit-300 text-sm space-y-2 text-left">
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
            className="block w-full bg-summit-700 hover:bg-summit-600 text-white font-medium py-3 rounded-lg transition"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-summit-400 text-xs mt-6">
          Booking ID: {tripId}
        </p>
      </div>
    </div>
  );
}
