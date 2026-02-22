'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);

  const tripId = searchParams.get('trip');
  const dateId = searchParams.get('date');
  const participants = searchParams.get('participants');

  useEffect(() => {
    const setupPayment = async () => {
      try {
        if (!tripId || !dateId || !participants) {
          setError('Missing booking information');
          setLoading(false);
          return;
        }

        // Fetch trip and guide info
        const { data: trip, error: tripError } = await supabase
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
          window.location.href = '/auth/login';
          return;
        }

        const totalPrice = (trip.price_per_person || 0) * parseInt(participants);

        // Create payment intent
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalPrice,
            tripId,
            bookingId: `${tripId}-${dateId}-${Date.now()}`,
            tripName: trip.title,
            guideName: trip.guides?.display_name || 'Guide',
            userId: authData.user.id,
            tripDateId: dateId,
            participantCount: parseInt(participants),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
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

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading payment form...</p>
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
            <div className="flex justify-between text-lg font-bold border-t border-summit-700 pt-2">
              <span className="text-white">Total:</span>
              <span className="text-green-400">${bookingData?.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Stripe Checkout */}
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              clientSecret,
              onComplete: async () => {
                try {
                  // Create booking after payment succeeds
                  const { error: bookingError } = await supabase
                    .from('bookings')
                    .insert({
                      trip_id: tripId,
                      trip_date_id: dateId,
                      user_id: bookingData.userId,
                      guide_id: bookingData.trip.guide_id,
                      participant_count: bookingData.participantCount,
                      total_price: bookingData.totalPrice,
                      commission_amount: bookingData.totalPrice * 0.12,
                      guide_payout: bookingData.totalPrice * 0.88,
                      status: 'confirmed',
                      payment_status: 'paid',
                    });

                  if (bookingError) throw bookingError;

                  // Redirect to confirmation
                  window.location.href = `/bookings/confirmed?trip=${tripId}`;
                } catch (err) {
                  console.error('Booking creation failed:', err);
                  window.location.href = `/bookings/error?error=Booking+creation+failed`;
                }
              },
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
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
