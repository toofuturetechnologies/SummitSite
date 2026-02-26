'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient();

interface Guide {
  id: string;
  display_name: string;
  tagline?: string;
  stripe_account_id?: string;
}

interface Trip {
  id: string;
  title: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Wait for Supabase session to fully load from storage
        console.log('⏳ Dashboard: Waiting for session to load...');
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        console.log('🎯 Dashboard: Getting user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('❌ Dashboard: Auth error:', userError.message);
        }

        if (!user) {
          console.log('⚠️ Dashboard: No user, redirecting to login');
          setTimeout(() => {
            router.push('/auth/login?returnTo=/dashboard');
          }, 300);
          return;
        }

        console.log('✅ Dashboard: User found:', user.id);
        setUser(user);

        // Get guide
        console.log('📋 Dashboard: Fetching guide...');
        const { data: guideData, error: guideError } = await (supabase as any)
          .from('guides')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (guideError || !guideData) {
          console.log('ℹ️ Dashboard: Not a guide, redirecting to trips');
          router.push('/trips');
          return;
        }

        console.log('✅ Dashboard: Guide found:', guideData.display_name);
        setGuide(guideData);

        // Get trips
        console.log('🎯 Dashboard: Fetching trips...');
        const { data: tripData } = await (supabase as any)
          .from('trips')
          .select('id, title')
          .eq('guide_id', guideData.id);

        setTrips(tripData || []);
        setLoading(false);
      } catch (err) {
        console.error('❌ Dashboard error:', err);
        setError(err instanceof Error ? err.message : 'Error loading dashboard');
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-white text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8 pt-20 lg:pt-24">
        <div className="max-w-4xl mx-auto bg-red-900/50 text-red-100 p-6 rounded-lg">
          <h2 className="font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <Link href="/auth/login" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded inline-block">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8 pt-20 lg:pt-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Loading guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 sm:p-8 pt-24 lg:pt-28">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{guide.display_name}</h1>
            <p className="text-gray-600 font-medium">{guide.tagline || 'Adventure Guide'}</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard/ugc"
              className="flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 text-white px-4 sm:px-6 py-2 rounded-lg transition font-medium text-center text-sm sm:text-base"
            >
              🎬 UGC
            </Link>
            <Link
              href="/dashboard/earnings"
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition font-medium text-center text-sm sm:text-base"
            >
              💰 Earnings
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-lg transition font-medium text-center text-sm sm:text-base"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Active Trips</p>
            <p className="text-4xl font-bold text-gray-900">{trips.length}</p>
            <p className="text-gray-500 text-xs mt-2">Click to manage</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Account Email</p>
            <p className="text-base text-gray-900 break-all font-mono">{user?.email}</p>
            <p className="text-gray-500 text-xs mt-2">Verified guide</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium mb-3">Quick Links</p>
            <div className="space-y-2">
              <Link href="/dashboard/bookings" className="text-blue-600 hover:text-blue-700 text-sm font-medium block">
                → View Bookings
              </Link>
              <Link href="/dashboard/messages" className="text-blue-600 hover:text-blue-700 text-sm font-medium block">
                → Messages
              </Link>
              <Link href="/dashboard/referral-earnings" className="text-blue-600 hover:text-blue-700 text-sm font-medium block">
                → Referral Earnings
              </Link>
            </div>
          </div>
        </div>

        {/* Payout Status */}
        {!guide?.stripe_account_id && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-2">💰 Ready to Get Paid?</h2>
                <p className="text-blue-800 mb-4">
                  Connect your bank account to receive automatic payouts from bookings. You'll receive 88% of each booking price.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/stripe-connect"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium"
            >
              Set Up Payouts →
            </Link>
          </div>
        )}

        {guide?.stripe_account_id && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-green-900 mb-2">✅ Payouts Connected</h2>
            <p className="text-green-800">
              Your Stripe account is connected. Automatic payouts are ready for each booking!
            </p>
          </div>
        )}

        {/* UGC & Referral Settings */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">🎬 UGC & Referral System</h2>
              <p className="text-gray-700 text-sm">Manage referral commission rates for your trips</p>
            </div>
            <Link
              href="/dashboard/ugc"
              className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
            >
              Configure →
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-gray-700 text-sm leading-relaxed">
              Set custom referral commission rates (0-2%) for each trip. Higher rates attract content creators and drive more bookings through user-generated content.
            </p>
            <div className="bg-blue-100 border border-blue-200 rounded p-3">
              <p className="text-blue-900 text-xs font-semibold">💡 Pro Tip</p>
              <p className="text-blue-900 text-xs mt-1">
                Most guides use 1.0-1.5% commission. Higher rates (1.5-2%) attract more creators for competitive trips.
              </p>
            </div>
          </div>
        </div>

        {/* Your Trips */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Adventures</h2>
            <Link 
              href="/dashboard/create-trip" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
            >
              + New Trip
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No trips yet</p>
              <Link 
                href="/dashboard/create-trip" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium"
              >
                Create Your First Adventure
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/dashboard/trip/${trip.id}`}
                  className="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition"
                >
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition">{trip.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">Click to manage details, bookings, and availability</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
