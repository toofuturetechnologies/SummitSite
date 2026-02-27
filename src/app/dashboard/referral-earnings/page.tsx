'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

const supabase = createClient();

interface ReferralEarning {
  id: string;
  trip_id: string;
  trip: {
    id: string;
    title: string;
  };
  booking_id: string;
  earnings_amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  created_at: string;
  paid_at: string | null;
}

interface TripEarnings {
  trip_id: string;
  trip_title: string;
  total_earnings: number;
  referral_count: number;
}

export default function ReferralEarningsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [earnings, setEarnings] = useState<ReferralEarning[]>([]);
  const [tripBreakdown, setTripBreakdown] = useState<TripEarnings[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEarnings = async () => {
    try {
      // Check auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        router.push('/auth/login');
        return;
      }

      setUser(authUser);

      // Fetch referral earnings
      const { data, error: earningsError } = await supabase
        .from('referral_earnings')
        .select('*')
        .eq('referrer_user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (earningsError) {
        console.error('Earnings fetch error:', earningsError);
        setError('Failed to load earnings');
        setLoading(false);
        return;
      }

      // Fetch trips separately to avoid RLS issues
      const tripIdsSet = new Set((data || []).map((e: any) => e.trip_id));
      const tripIds = Array.from(tripIdsSet) as string[];
      let tripsMap: { [key: string]: any } = {};

      if (tripIds.length > 0) {
        const { data: tripsData, error: tripsError } = await supabase
          .from('trips')
          .select('id, title')
          .in('id', tripIds);

        if (!tripsError && tripsData) {
          tripsMap = Object.fromEntries(tripsData.map((t: any) => [t.id, t]));
        }
      }

      // Enrich earnings with trip data
      const enrichedEarnings = (data || []).map((earning: any) => ({
        ...earning,
        trip: tripsMap[earning.trip_id] || { id: earning.trip_id, title: 'Unknown Trip' },
      }));

      setEarnings(enrichedEarnings as ReferralEarning[]);

      // Calculate trip breakdown
      const breakdown: { [key: string]: TripEarnings } = {};
      enrichedEarnings.forEach((earning: ReferralEarning) => {
        const tripId = earning.trip_id;
        if (!breakdown[tripId]) {
          breakdown[tripId] = {
            trip_id: tripId,
            trip_title: earning.trip?.title || 'Unknown Trip',
            total_earnings: 0,
            referral_count: 0,
          };
        }
        breakdown[tripId].total_earnings += earning.earnings_amount;
        breakdown[tripId].referral_count += 1;
      });

      setTripBreakdown(Object.values(breakdown));
      setLoading(false);
    } catch (err) {
      console.error('Error loading earnings:', err);
      setError('An error occurred');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center pt-20">
        <p className="text-gray-900 dark:text-gray-100 text-lg">Loading earnings...</p>
      </div>
    );
  }

  const totalEarnings = earnings.reduce((sum, e) => sum + e.earnings_amount, 0);
  const pendingEarnings = earnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.earnings_amount, 0);
  const paidEarnings = earnings
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.earnings_amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-8 inline-block font-medium">
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎬 Referral Earnings
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Track your earnings from UGC referrals. Users who book trips after seeing your content earn you a commission.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-900 font-semibold">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Pending Earnings */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Pending Payout</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${pendingEarnings.toFixed(2)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          {/* Paid Earnings */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Paid to Account</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${paidEarnings.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Per-Trip Breakdown */}
        {tripBreakdown.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Earnings by Trip</h2>
            <div className="space-y-3">
              {tripBreakdown.map((trip) => (
                <div key={trip.trip_id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{trip.trip_title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {trip.referral_count} {trip.referral_count === 1 ? 'referral' : 'referrals'}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">${trip.total_earnings.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Payout History */}
        {earnings.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Payout History</h2>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Trip</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {earnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{earning.trip?.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-bold">
                        ${earning.earnings_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            earning.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : earning.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-800'
                          }`}
                        >
                          {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No referral earnings yet.</p>
            <Link
              href="/creators/ugc"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Start Posting UGC
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
