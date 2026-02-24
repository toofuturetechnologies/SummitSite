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
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
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
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Loading guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{guide.display_name}</h1>
            <p className="text-summit-300">{guide.tagline || 'Guide'}</p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-300 text-sm mb-2">Your Trips</p>
            <p className="text-3xl font-bold text-white">{trips.length}</p>
          </div>
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-300 text-sm mb-2">Email</p>
            <p className="text-sm text-white">{user?.email}</p>
          </div>
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-300 text-sm mb-2">Quick Links</p>
            <Link href="/dashboard/bookings" className="text-summit-400 hover:text-summit-300">
              View Bookings →
            </Link>
          </div>
        </div>

        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your Trips</h2>
          {trips.length === 0 ? (
            <p className="text-summit-300 mb-4">No trips yet</p>
          ) : (
            <ul className="space-y-2">
              {trips.map((trip) => (
                <li key={trip.id} className="text-summit-300">
                  • {trip.title}
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/create-trip" className="inline-block bg-summit-600 hover:bg-summit-500 text-white px-6 py-2 rounded-lg transition mt-4">
            Create New Trip
          </Link>
        </div>
      </div>
    </div>
  );
}
