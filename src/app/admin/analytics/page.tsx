'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  platformRevenue: number;
  guidePayouts: number;
  averageBookingValue: number;
  totalGuides: number;
  totalTrips: number;
  topGuides: Array<{
    name: string;
    bookings: number;
    earnings: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all paid bookings
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, guides(display_name)')
          .eq('payment_status', 'paid');

        if (bookingsError) throw bookingsError;

        const bookingsList = bookings || [];

        // Calculate metrics
        const totalBookings = bookingsList.length;
        const totalRevenue = bookingsList.reduce((sum, b) => sum + b.total_price, 0);
        const platformRevenue = bookingsList.reduce(
          (sum, b) => sum + (b.commission_amount + b.hosting_fee),
          0
        );
        const guidePayouts = bookingsList.reduce((sum, b) => sum + b.guide_payout, 0);
        const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        // Get guides count
        const { count: guideCount } = await supabase
          .from('guides')
          .select('id', { count: 'exact' });

        // Get trips count
        const { count: tripCount } = await supabase
          .from('trips')
          .select('id', { count: 'exact' });

        // Top guides by earnings
        const guideEarnings = new Map<string, { bookings: number; earnings: number; name: string }>();
        bookingsList.forEach((b) => {
          const guideName = b.guides?.display_name || 'Unknown';
          if (!guideEarnings.has(guideName)) {
            guideEarnings.set(guideName, { bookings: 0, earnings: 0, name: guideName });
          }
          const guide = guideEarnings.get(guideName)!;
          guide.bookings += 1;
          guide.earnings += b.guide_payout;
        });

        const topGuides = Array.from(guideEarnings.values())
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, 5)
          .map((g) => ({ name: g.name, bookings: g.bookings, earnings: g.earnings }));

        setAnalytics({
          totalBookings,
          totalRevenue,
          platformRevenue,
          guidePayouts,
          averageBookingValue,
          totalGuides: guideCount || 0,
          totalTrips: tripCount || 0,
          topGuides,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <div className="max-w-md text-center">
          <p className="text-red-100 mb-4">{error}</p>
          <Link href="/" className="text-summit-400 hover:text-summit-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Platform Analytics</h1>
          <p className="text-summit-300">Real-time revenue and growth metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-summit-400 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">
                  ${analytics.totalRevenue.toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-summit-600" />
            </div>
          </div>

          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-summit-400 text-sm mb-1">Platform Revenue</p>
                <p className="text-3xl font-bold text-white">${analytics.platformRevenue.toFixed(0)}</p>
                <p className="text-summit-400 text-xs mt-1">
                  {((analytics.platformRevenue / analytics.totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-summit-600" />
            </div>
          </div>

          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-summit-400 text-sm mb-1">Bookings</p>
                <p className="text-3xl font-bold text-white">{analytics.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-summit-600" />
            </div>
          </div>

          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-summit-400 text-sm mb-1">Avg Booking Value</p>
                <p className="text-3xl font-bold text-white">
                  ${analytics.averageBookingValue.toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-summit-600" />
            </div>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-400 text-sm mb-2">Active Guides</p>
            <p className="text-4xl font-bold text-white">{analytics.totalGuides}</p>
          </div>

          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-400 text-sm mb-2">Listed Trips</p>
            <p className="text-4xl font-bold text-white">{analytics.totalTrips}</p>
          </div>

          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-400 text-sm mb-2">Guide Payouts</p>
            <p className="text-4xl font-bold text-green-400">${analytics.guidePayouts.toFixed(0)}</p>
          </div>
        </div>

        {/* Top Guides */}
        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Top Guides by Earnings</h2>

          {analytics.topGuides.length === 0 ? (
            <p className="text-summit-300 text-center py-8">No earnings data yet</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-summit-700">
                <div className="text-summit-400 font-medium text-sm">Guide Name</div>
                <div className="text-right text-summit-400 font-medium text-sm">Bookings</div>
                <div className="text-right text-summit-400 font-medium text-sm">Earnings</div>
              </div>

              {analytics.topGuides.map((guide, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 py-3 hover:bg-summit-700/20 transition px-2 rounded">
                  <div className="text-white font-medium">{guide.name}</div>
                  <div className="text-right text-summit-300">{guide.bookings}</div>
                  <div className="text-right text-green-400 font-semibold">
                    ${guide.earnings.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-summit-400 hover:text-summit-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
