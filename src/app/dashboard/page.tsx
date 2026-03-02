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

        // Check if user is admin
        console.log('🔐 Dashboard: Checking admin status...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          console.log('🔐 Dashboard: Got access token, calling admin check...');
          const adminCheckRes = await fetch('/api/admin/check', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          const adminData = await adminCheckRes.json();
          console.log('🔐 Dashboard: Admin check response:', adminData);
          
          if (adminData.isAdmin) {
            console.log('✅ Dashboard: User is admin, redirecting to admin panel');
            router.push('/admin');
            return;
          }
        } else {
          console.log('⚠️ Dashboard: No access token available');
        }

        // Get guide
        console.log('📋 Dashboard: Fetching guide...');
        const { data: guideData, error: guideError } = await (supabase as any)
          .from('guides')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (guideError || !guideData) {
          console.log('ℹ️ Dashboard: Not a guide or admin, redirecting to trips');
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
        <p className="text-sky-900 dark:text-sky-100 text-lg">Loading your dashboard...</p>
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
          <p className="text-sky-900 dark:text-sky-100">Loading guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-sky-900 dark:text-sky-100 mb-2">{guide.display_name}</h1>
            <p className="text-sky-700 font-medium">{guide.tagline || 'Guide'}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/ugc"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition font-medium"
            >
              🎬 UGC
            </Link>
            <Link
              href="/dashboard/analytics"
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition font-medium"
            >
              📊 Analytics
            </Link>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-100 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-lg p-6">
            <p className="text-sky-600 text-sm mb-2">Your Trips</p>
            <p className="text-3xl font-bold text-sky-900 dark:text-sky-100">{trips.length}</p>
          </div>
          <div className="bg-gray-100 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-lg p-6">
            <p className="text-sky-600 text-sm mb-2">Email</p>
            <p className="text-sm text-sky-900 dark:text-sky-100">{user?.email}</p>
          </div>
          <div className="bg-gray-100 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-lg p-6">
            <p className="text-sky-600 text-sm mb-2">Quick Links</p>
            <div className="space-y-2">
              <Link href="/dashboard/bookings" className="text-sky-600 hover:text-sky-600 block transition">
                View Bookings →
              </Link>
              <Link href="/dashboard/guide-reviews" className="text-sky-600 hover:text-sky-600 block transition">
                Customer Reviews →
              </Link>
              <Link href="/dashboard/messages" className="text-sky-600 hover:text-sky-600 block transition">
                Messages →
              </Link>
              <Link href="/dashboard/earnings" className="text-sky-600 hover:text-sky-600 block transition">
                Earnings →
              </Link>
            </div>
          </div>
        </div>

        {/* Stripe Connect CTA */}
        {!guide?.stripe_account_id && (
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-2">💰 Ready to Get Paid?</h2>
            <p className="text-sky-200 mb-4">
              Connect your bank account to receive automatic payouts from bookings. You'll get 88% of each booking price.
            </p>
            <Link
              href="/dashboard/stripe-connect"
              className="inline-block bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded-lg transition font-medium"
            >
              Set Up Payouts →
            </Link>
          </div>
        )}

        {guide?.stripe_account_id && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-2">✅ Payouts Connected</h2>
            <p className="text-green-200">
              Your Stripe account is connected. You'll receive automatic payouts for each booking!
            </p>
          </div>
        )}

        {/* UGC Settings - For Guides to Set Referral Rates */}
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 dark:border-slate-700 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-sky-900 dark:text-sky-100 mb-1">⚙️ UGC Settings</h2>
              <p className="text-sky-700 text-sm">Manage referral rates for your trips</p>
            </div>
            <Link
              href="/dashboard/ugc"
              className="text-sky-600 hover:text-sky-700 font-medium text-sm underline"
            >
              Configure →
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-sky-700 text-sm leading-relaxed">
              Set custom referral commission rates (0-2%) for each of your trips. Higher rates attract more creators and drive bookings!
            </p>
            <div className="bg-sky-100 rounded p-3">
              <p className="text-blue-900 text-xs font-medium">💡 Pro Tip</p>
              <p className="text-blue-800 text-xs mt-1">
                Set 1-2% commission to incentivize quality content. Most trips use 1.5%.
              </p>
            </div>
            <Link
              href="/dashboard/ugc"
              className="inline-block w-full bg-sky-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition text-center"
            >
              Set Rates Per Trip
            </Link>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-sky-900 dark:text-sky-100 mb-4">Your Trips</h2>
          {trips.length === 0 ? (
            <p className="text-sky-600 mb-4">No trips yet</p>
          ) : (
            <ul className="space-y-2">
              {trips.map((trip) => (
                <li key={trip.id} className="text-sky-600">
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
