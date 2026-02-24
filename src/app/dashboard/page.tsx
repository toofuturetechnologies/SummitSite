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
  bio?: string;
  base_location?: string;
  years_experience?: number;
  rating: number;
  review_count: number;
  profile_video_url?: string | null;
}

interface Trip {
  id: string;
  title: string;
  slug: string;
  activity: string;
  difficulty: string;
  price_per_person: number;
  is_active: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sessionCheckTimeout: NodeJS.Timeout;

    console.log('🎯 [Dashboard] Setting up auth listener');

    // Check localStorage for recent login
    const recentAuthUserId = typeof window !== 'undefined' ? localStorage.getItem('auth_user_id') : null;
    const authTimestamp = typeof window !== 'undefined' ? localStorage.getItem('auth_timestamp') : null;
    const isRecentLogin = recentAuthUserId && authTimestamp && (Date.now() - parseInt(authTimestamp)) < 5000;
    
    console.log('📱 [Dashboard] Recent login in localStorage:', isRecentLogin ? recentAuthUserId : 'none');

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('🔔 [Dashboard] Auth state changed:', event, 'Session:', !!session?.user, 'Event:', event);

      if (!isMounted) {
        console.log('🛑 [Dashboard] Component unmounted, skipping');
        return;
      }

      // Handle INITIAL_SESSION and SIGNED_IN events
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (!session?.user) {
          // If we have a recent login in localStorage, give it more time to load
          if (isRecentLogin && !sessionCheckTimeout) {
            console.log('⏳ [Dashboard] No session yet but recent login detected, waiting...');
            sessionCheckTimeout = setTimeout(async () => {
              if (isMounted) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  console.log('✅ [Dashboard] Session loaded after delay');
                  // Trigger a re-check
                } else {
                  console.log('⚠️ [Dashboard] Still no session after wait');
                  setAuthState('unauthenticated');
                  setLoading(false);
                }
              }
            }, 1500);
            return;
          }
          
          console.log('⚠️ [Dashboard] No session, user needs to login');
          setAuthState('unauthenticated');
          setLoading(false);
          return;
        }

        console.log('✅ [Dashboard] User authenticated:', session.user.id);
        setAuthState('authenticated');
        setUser(session.user);

        try {
          // Fetch guide
          console.log('📋 [Dashboard] Fetching guide data');
          const { data: guideData, error: guideError } = await (supabase as any)
            .from('guides')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!isMounted) return;

          if (guideError || !guideData) {
            console.log('ℹ️ [Dashboard] User is not a guide');
            setLoading(false);
            router.push('/trips');
            return;
          }

          console.log('✅ [Dashboard] Guide found:', guideData.display_name);
          setGuide(guideData);

          // Fetch trips
          console.log('🎯 [Dashboard] Fetching trips');
          const { data: tripData } = await (supabase as any)
            .from('trips')
            .select('*')
            .eq('guide_id', guideData.id);

          if (!isMounted) return;

          setTrips(tripData || []);
          setLoading(false);
        } catch (err) {
          console.error('❌ [Dashboard] Error:', err);
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Error loading dashboard');
            setLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 [Dashboard] User signed out');
        setAuthState('unauthenticated');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      if (sessionCheckTimeout) clearTimeout(sessionCheckTimeout);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (authState === 'checking' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Loading your dashboard...</p>
          <p className="text-summit-300 text-sm">Authenticating and fetching your profile</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-summit-300 mb-6">Please log in to access your guide dashboard</p>
          <Link
            href="/auth/login?returnTo=/dashboard"
            className="inline-block w-full bg-summit-600 hover:bg-summit-500 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-4">
            <h2 className="font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
          <Link
            href="/"
            className="inline-block bg-summit-600 hover:bg-summit-500 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Guide profile not found. Redirecting...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {guide?.display_name || 'Dashboard'}
            </h1>
            <p className="text-summit-300">{guide?.tagline}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard/earnings"
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg transition"
            >
              Earnings
            </Link>
            <Link
              href="/dashboard/bookings"
              className="bg-summit-600 hover:bg-summit-500 text-white px-6 py-2 rounded-lg transition"
            >
              Bookings
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Guide Stats */}
        {guide && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
              <p className="text-summit-300 text-sm mb-2">Rating</p>
              <p className="text-3xl font-bold text-white">
                {guide.rating ? guide.rating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-summit-400 text-xs">
                ({guide.review_count} reviews)
              </p>
            </div>
            <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
              <p className="text-summit-300 text-sm mb-2">Active Trips</p>
              <p className="text-3xl font-bold text-white">
                {trips.filter(t => t.is_active).length}
              </p>
            </div>
            <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
              <p className="text-summit-300 text-sm mb-2">Total Trips</p>
              <p className="text-3xl font-bold text-white">{trips.length}</p>
            </div>
          </div>
        )}

        {/* Trips Section */}
        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Trips</h2>
            <Link
              href="/dashboard/create-trip"
              className="bg-summit-600 hover:bg-summit-500 text-white px-4 py-2 rounded-lg transition"
            >
              Create New Trip
            </Link>
          </div>

          {trips.length === 0 ? (
            <p className="text-summit-300">
              No trips yet.{' '}
              <Link
                href="/dashboard/create-trip"
                className="text-summit-400 hover:text-summit-300"
              >
                Create one
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {trips.map(trip => (
                <div
                  key={trip.id}
                  className="border border-summit-700 rounded-lg p-4 hover:bg-summit-700/30 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {trip.title}
                      </h3>
                      <div className="flex gap-4 text-summit-300 text-sm">
                        <span>📍 {trip.activity}</span>
                        <span>⭐ {trip.difficulty}</span>
                        <span>💰 ${trip.price_per_person}/person</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/trip/${trip.id}`}
                        className="bg-summit-600 hover:bg-summit-500 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Edit
                      </Link>
                      <button className="bg-summit-700 hover:bg-summit-600 text-white px-3 py-1 rounded text-sm transition">
                        {trip.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {guide && guide.bio && (
          <div className="mt-8 bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">About You</h2>
            <p className="text-summit-300 mb-4">{guide.bio}</p>
            <div className="text-sm text-summit-400 space-y-1 mb-6">
              <p>📍 {guide.base_location || 'Location not set'}</p>
              <p>⏱️ {guide.years_experience || 0} years of experience</p>
            </div>
            <Link
              href="/dashboard/profile"
              className="bg-summit-600 hover:bg-summit-500 text-white px-6 py-2 rounded-lg transition"
            >
              Edit Profile
            </Link>
          </div>
        )}

        {/* No Bio CTA */}
        {guide && !guide.bio && (
          <div className="mt-8 bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>
            <p className="text-summit-300 mb-6">
              Add a biography, location, and experience to help customers learn about you.
            </p>
            <Link
              href="/dashboard/profile"
              className="bg-summit-600 hover:bg-summit-500 text-white px-6 py-2 rounded-lg transition"
            >
              Complete Profile
            </Link>
          </div>
        )}

        {/* Payout Settings */}
        <div className="mt-8 bg-summit-800/50 border border-summit-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">💰 Stripe Payouts</h2>
          <p className="text-summit-300 mb-6">
            Connect your Stripe account to receive automatic payouts from bookings (88% of booking price).
          </p>
          <Link
            href="/dashboard/stripe-connect"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition"
          >
            Set Up Payouts
          </Link>
        </div>
      </div>
    </div>
  );
}
