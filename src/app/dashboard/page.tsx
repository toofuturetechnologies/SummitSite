'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Guide {
  id: string;
  display_name: string;
  tagline?: string;
  bio?: string;
  rating: number;
  review_count: number;
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
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData.user) {
          router.push('/auth/login');
          return;
        }

        setUser(authData.user);

        // Fetch guide profile
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError) {
          setError('Guide profile not found');
          return;
        }

        setGuide(guideData);

        // Fetch trips
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('guide_id', guideData.id);

        if (tripError) {
          console.error('Error fetching trips:', tripError);
        } else {
          setTrips(tripData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg">
            <p>Error: {error}</p>
          </div>
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
      </div>
    </div>
  );
}
