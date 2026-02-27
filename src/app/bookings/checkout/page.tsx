'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

const supabase = createClient();

interface ReferrerProfile {
  id: string;
  full_name: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [referrerSearch, setReferrerSearch] = useState('');
  const [referrerSearchResults, setReferrerSearchResults] = useState<ReferrerProfile[]>([]);
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerProfile | null>(null);
  const [showReferrerResults, setShowReferrerResults] = useState(false);

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

        setCurrentUser(authData.user);

        const totalPrice = ((trip as any).price_per_person || 0) * parseInt(participants);

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

  // Search for referrer by username - only show users with ugc_code for this trip
  const handleReferrerSearch = async (searchTerm: string) => {
    setReferrerSearch(searchTerm);

    if (!searchTerm.trim() || !tripId) {
      setReferrerSearchResults([]);
      return;
    }

    try {
      // Find users who have booked this trip and have a ugc_code (completed booking)
      const { data, error } = await supabase
        .from('bookings')
        .select('user_id, profiles(id, full_name)')
        .eq('trip_id', tripId)
        .not('ugc_code', 'is', null) // Must have ugc_code (proof of booking)
        .neq('user_id', currentUser?.id); // Exclude current user

      if (error) {
        console.error('Search error:', error);
        return;
      }

      // Filter by search term and extract unique profiles
      if (data) {
        const uniqueUsers = new Map();
        data.forEach((booking: any) => {
          if (booking.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
            if (!uniqueUsers.has(booking.profiles.id)) {
              uniqueUsers.set(booking.profiles.id, booking.profiles);
            }
          }
        });
        setReferrerSearchResults(Array.from(uniqueUsers.values()).slice(0, 5));
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const selectReferrer = (profile: ReferrerProfile) => {
    setSelectedReferrer(profile);
    setReferrerSearch('');
    setShowReferrerResults(false);
  };

  const proceedToCheckout = async () => {
    if (!bookingData) return;

    try {
      setProcessing(true);

      // Create Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bookingData.totalPrice,
          tripId: bookingData.trip.id,
          tripName: bookingData.trip.title,
          guideName: bookingData.trip.guides?.display_name || 'Guide',
          userId: bookingData.userId,
          tripDateId: bookingData.tripDateId,
          participantCount: bookingData.participantCount,
          referralUserId: selectedReferrer?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center pt-20">
        <p className="text-gray-900 dark:text-gray-100 text-lg">Setting up payment...</p>
      </div>
    );
  }

  if (!tripId || !dateId || !participants) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4 pt-20">
        <div className="max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Start Your Booking</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">Please select a trip first</p>
          <Link
            href="/trips"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
          >
            Browse Trips
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4 pt-20">
        <div className="max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Payment Setup Error</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <Link
            href="/trips"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
          >
            Browse Trips
          </Link>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center pt-20">
        <p className="text-gray-900 dark:text-gray-100 text-lg">Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 pt-20 lg:pt-24">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/trips"
          className="text-blue-600 hover:text-blue-700 mb-8 inline-block font-medium"
        >
          ← Back to Trips
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Complete Your Booking</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            {bookingData.trip?.title} • {bookingData.participantCount} {bookingData.participantCount === 1 ? 'person' : 'people'}
          </p>

          {/* Price Summary */}
          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-8 border border-gray-200 dark:border-slate-700">
            <div className="flex justify-between mb-2">
              <span className="text-gray-900 dark:text-gray-100 font-medium">Price per person:</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">${bookingData.trip?.price_per_person}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-700 dark:text-gray-300">Subtotal ({bookingData.participantCount} {bookingData.participantCount === 1 ? 'person' : 'people'}):</span>
              <span className="text-gray-700 dark:text-gray-300">${bookingData.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-slate-700 pt-2">
              <span className="text-gray-900 dark:text-gray-100">You Pay:</span>
              <span className="text-blue-600">${bookingData.totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-3">
              💡 Platform fee: 12% + $1 hosting. Your guide keeps 88% minus fees.
            </p>
          </div>

          {/* Referrer Lookup Section */}
          <div className="mb-8">
            <label className="block text-gray-900 dark:text-gray-100 font-semibold mb-3">
              Who Referred You? (Optional)
            </label>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              If a creator referred you with TikTok content for this trip, search for their name. They'll earn a commission from this booking.
            </p>

            {selectedReferrer ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{selectedReferrer.full_name}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Referrer selected</p>
                </div>
                <button
                  onClick={() => setSelectedReferrer(null)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={referrerSearch}
                    onChange={(e) => {
                      handleReferrerSearch(e.target.value);
                      setShowReferrerResults(true);
                    }}
                    placeholder="Search by name..."
                    className="flex-1 outline-none text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                {showReferrerResults && referrerSearchResults.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg z-10">
                    {referrerSearchResults.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => selectReferrer(profile)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-200 dark:border-slate-700 last:border-b-0 text-gray-900 dark:text-gray-100 font-medium transition"
                      >
                        {profile.full_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proceed to Payment Button */}
          <button
            onClick={proceedToCheckout}
            disabled={processing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition text-lg"
          >
            {processing ? 'Processing...' : 'Proceed to Payment'}
          </button>

          <p className="text-gray-600 dark:text-gray-400 text-xs text-center mt-4">
            By booking, you agree to our terms and the guide's cancellation policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
          <p className="text-gray-900 dark:text-gray-100 text-lg">Loading...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
