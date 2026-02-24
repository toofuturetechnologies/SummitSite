'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

const supabase = createClient();

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const tripId = searchParams.get('trip');
  const dateId = searchParams.get('date');
  const participants = searchParams.get('participants');

  useEffect(() => {
    const setupPayment = async () => {
      try {
        if (!tripId || !dateId || !participants) {
          // Redirect to trips page if booking info is missing
          setTimeout(() => {
            window.location.href = '/trips';
          }, 1000);
          return;
        }

        // Fetch trip and guide info
        const { data: trip, error: tripError } = await (supabase as any)
          .from('trips')
          .select('*, guides(display_name)')
          .eq('id', tripId)
          .single();

        if (tripError || !trip) {
          setError('Trip not found');
          setLoading(false);
          return;
        }

        // Get current user
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          // Redirect to customer signup with return URL
          const returnUrl = `/bookings/checkout?trip=${tripId}&date=${dateId}&participants=${participants}`;
          window.location.href = `/auth/signup-customer?returnTo=${encodeURIComponent(returnUrl)}`;
          return;
        }

        const totalPrice = ((trip as any).price_per_person || 0) * parseInt(participants);

        // Create Stripe Checkout Session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice,
            tripId,
            tripName: trip.title,
            guideName: trip.guides?.display_name || 'Guide',
            userId: authData.user.id,
            tripDateId: dateId,
            participantCount: parseInt(participants),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const data = await response.json();
        setCheckoutUrl(data.url);
        setBookingData({
          trip,
          totalPrice,
          participantCount: parseInt(participants),
          userId: authData.user.id,
          tripDateId: dateId,
        });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Setup failed');
        setLoading(false);
      }
    };

    setupPayment();
  }, [tripId, dateId, participants]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">Setting up payment...</p>
      </div>
    );
  }

  if (!tripId || !dateId || !participants) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-summit-800/50 border border-summit-700 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Start Your Booking</h1>
          <p className="text-summit-300 mb-6">Please select a trip first</p>
          <Link
            href="/trips"
            className="block w-full bg-summit-600 hover:bg-summit-500 text-white font-medium py-3 rounded-lg transition"
          >
            Browse Trips
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-summit-800/50 border border-summit-700 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Payment Setup Error</h1>
          <p className="text-summit-300 mb-6">{error}</p>
          <Link
            href="/trips"
            className="block w-full bg-summit-600 hover:bg-summit-500 text-white font-medium py-3 rounded-lg transition"
          >
            Browse Trips
          </Link>
        </div>
      </div>
    );
  }

  if (!checkoutUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/trips"
          className="text-summit-400 hover:text-summit-300 mb-8 inline-block"
        >
          ← Back to Trips
        </Link>

        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Booking</h1>
          <p className="text-summit-300 mb-8">
            {bookingData?.trip?.title} • {bookingData?.participantCount} {bookingData?.participantCount === 1 ? 'person' : 'people'}
          </p>

          {/* Price Summary */}
          <div className="bg-summit-900/50 rounded-lg p-4 mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-summit-300">Price per person:</span>
              <span className="text-white font-semibold">${bookingData?.trip?.price_per_person}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-summit-400">Subtotal ({bookingData?.participantCount} {bookingData?.participantCount === 1 ? 'person' : 'people'}):</span>
              <span className="text-summit-300">${bookingData?.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-summit-700 pt-2">
              <span className="text-white">You Pay:</span>
              <span className="text-green-400">${bookingData?.totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-summit-400 text-xs mt-3">
              💡 Platform fee: 12% + $1 hosting. Your guide keeps 88% minus fees.
            </p>
          </div>

          {/* Payment Button */}
          <button
            onClick={() => {
              setProcessing(true);
              if (checkoutUrl) {
                window.location.href = checkoutUrl;
              }
            }}
            disabled={processing}
            className="w-full bg-gradient-to-r from-summit-500 to-summit-600 hover:from-summit-400 hover:to-summit-500 disabled:from-summit-700 disabled:to-summit-700 text-white font-bold py-4 rounded-lg transition text-lg"
          >
            {processing ? 'Redirecting to Stripe...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
          <p className="text-white text-lg">Loading...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
