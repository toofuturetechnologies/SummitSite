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
  console.log('🎯 DashboardPage component rendering');
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🔧 State initialized:', { loading, user: user?.id, guide: guide?.id });

  useEffect(() => {
    // Prevent infinite loops with a flag
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      // Attempt to restore session first
      console.log('🔄 Attempting to restore session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('📌 Session restore result:', { 
        hasSession: !!session,
        userId: session?.user?.id,
        error: sessionError ? sessionError.message : null 
      });
      
      if (sessionError) {
        console.error('❌ Session restore error:', sessionError);
      }
      
      try {
        console.log('📊 Dashboard: Starting auth check...');
        console.log('⏱️ Timestamp:', new Date().toISOString());
        
        // If we have a session, use it. Otherwise, try getUser()
        let authData;
        let authError;
        
        if (session?.user) {
          console.log('✅ Using restored session user');
          authData = { user: session.user };
          authError = null;
        } else {
          console.log('🔍 Session not found, trying getUser()...');
          const result = await supabase.auth.getUser();
          authData = result.data;
          authError = result.error;
        }
        
        console.log('👤 Auth response:', {
          hasUser: !!authData?.user,
          userId: authData?.user?.id,
          userEmail: authData?.user?.email,
          hasError: !!authError,
          errorCode: authError?.code,
          errorStatus: authError?.status,
          errorMessage: authError?.message,
        });
        
        if (authError) {
          console.error('❌ Auth error:', authError.message, authError.code, authError.status);
        }
        
        if (!authData?.user) {
          console.error('❌ No authenticated user in authData');
          if (isMounted) {
            console.log('🔄 Pushing to login...');
            router.push('/auth/login');
          }
          return;
        }

        if (!isMounted) return;
        console.log('✅ User authenticated:', authData.user.id);
        setUser(authData.user);

        // Fetch guide profile
        console.log('🔍 Fetching guide for user:', authData.user.id);
        const { data: guideData, error: guideError } = await (supabase as any)
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        console.log('📋 Guide fetch result:', { guideData: guideData?.id, error: guideError ? JSON.stringify(guideError) : null });

        if (guideError || !guideData) {
          // Not a guide - redirect to trips page
          console.log('⚠️ No guide found, redirecting to /trips');
          if (isMounted) {
            router.push('/trips');
          }
          return;
        }

        if (!isMounted) return;
        console.log('✅ Guide found:', guideData.display_name);
        setGuide(guideData);

        // Fetch trips
        console.log('🎯 Fetching trips for guide:', guideData.id);
        const { data: tripData, error: tripError } = await (supabase as any)
          .from('trips')
          .select('*')
          .eq('guide_id', guideData.id);

        console.log('🏔️ Trips fetch result:', { count: tripData?.length, error: tripError ? JSON.stringify(tripError) : null });
        
        if (!isMounted) return;
        
        if (tripError) {
          console.error('❌ Error fetching trips:', tripError);
        } else {
          setTrips(tripData || []);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        console.error('❌ Dashboard error:', errorMsg, err);
        if (isMounted) {
          setError(errorMsg);
        }
      } finally {
        console.log('✨ Dashboard loading complete');
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      console.log('🔔 Auth state changed:', _event, session?.user?.id);
      if (isMounted) {
        if (session?.user) {
          setUser(session.user);
        }
      }
    });
    
    // Cleanup function
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Loading dashboard...</p>
          <p className="text-summit-300 text-sm">Fetching your profile and trips</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-4">
            <h2 className="font-bold mb-2">Dashboard Error</h2>
            <p>{error}</p>
          </div>
          <Link
            href="/auth/login"
            className="inline-block bg-summit-600 hover:bg-summit-500 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!guide || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-900/50 text-yellow-100 p-4 rounded-lg">
            <p>⚠️ Guide profile not fully loaded</p>
            <p className="text-sm mt-2">User ID: {user?.id || 'N/A'}</p>
            <p className="text-sm">Guide ID: {guide?.id || 'N/A'}</p>
            <p className="text-sm mt-4">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('✨ Rendering dashboard with data:', { guide: guide.display_name, trips: trips.length });
  
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
