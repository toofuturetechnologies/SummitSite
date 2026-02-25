'use client';

import Link from 'next/link';
import { CheckCircle, Copy, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

function BookingConfirmedContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const [ugcCode, setUgcCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('ugc_code')
          .eq('id', bookingId)
          .single();

        if (error) {
          console.error('Failed to fetch booking:', error);
        } else if (data?.ugc_code) {
          setUgcCode(data.ugc_code);
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleCopy = async () => {
    if (ugcCode) {
      await navigator.clipboard.writeText(ugcCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>

      <p className="text-gray-700 mb-6">
        Your adventure is booked. The guide will confirm your booking shortly, and you&apos;ll receive an email with next steps.
      </p>

      {/* UGC Code Section */}
      {ugcCode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-900 text-sm font-semibold mb-2">🎬 Your UGC Code</p>
          <p className="text-gray-600 text-xs mb-3">
            Save this code to post TikTok content and earn referral commissions!
          </p>
          <div className="bg-white border border-blue-300 rounded p-3 flex items-center justify-between">
            <code className="text-gray-900 font-mono text-sm font-bold">{ugcCode}</code>
            <button
              onClick={handleCopy}
              className="ml-2 p-2 hover:bg-blue-100 rounded transition"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-900 text-sm font-semibold mb-2">Next Steps:</p>
        <ul className="text-gray-700 text-sm space-y-2 text-left">
          <li>✓ Confirm your email address</li>
          <li>✓ Save your UGC code for later</li>
          <li>✓ Prepare your gear and equipment</li>
          <li>✓ Contact the guide with any questions</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Link
          href="/trips"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
        >
          Browse More Trips
        </Link>
        <Link
          href="/"
          className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 rounded-lg transition"
        >
          Back to Home
        </Link>
      </div>

      {bookingId && (
        <p className="text-gray-600 text-xs mt-6">
          Booking ID: {bookingId}
        </p>
      )}
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
