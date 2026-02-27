'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, Users, TrendingUp, Star } from 'lucide-react';

const supabase = createClient();

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    monthlyEarnings: [] as any[],
    popularTrips: [] as any[],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        setUser(user);

        // Get guide
        const { data: guideData, error: guideError } = await (supabase as any)
          .from('guides')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (guideError || !guideData) {
          router.push('/trips');
          return;
        }

        setGuide(guideData);

        // Get all bookings for this guide
        const { data: bookings, error: bookingsError } = await (supabase as any)
          .from('bookings')
          .select('*, trips(title)')
          .eq('guide_id', guideData.id);

        if (bookingsError) throw bookingsError;

        // Calculate stats
        const totalEarnings = bookings.reduce((sum: number, b: any) => sum + (b.guide_payout || 0), 0);
        const completedBookings = bookings.filter((b: any) => b.status === 'completed').length;
        const totalBookings = bookings.length;

        // Get reviews
        const { data: reviews, error: reviewsError } = await (supabase as any)
          .from('reviews')
          .select('*')
          .eq('guide_id', guideData.id);

        if (reviewsError) throw reviewsError;

        const averageRating = reviews.length > 0
          ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : 0;

        // Monthly earnings (last 6 months)
        const monthlyData: any = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          monthlyData[monthKey] = 0;
        }

        bookings.forEach((booking: any) => {
          const bookingDate = new Date(booking.created_at);
          const monthKey = bookingDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          if (monthKey in monthlyData && booking.status === 'completed') {
            monthlyData[monthKey] += booking.guide_payout || 0;
          }
        });

        const monthlyEarnings = Object.entries(monthlyData).map(([month, earnings]: any) => ({
          month,
          earnings: parseFloat(earnings.toFixed(2)),
        }));

        // Popular trips
        const tripBookings: any = {};
        bookings.forEach((booking: any) => {
          const tripTitle = booking.trips?.title || 'Unknown';
          if (!tripBookings[tripTitle]) {
            tripBookings[tripTitle] = 0;
          }
          tripBookings[tripTitle]++;
        });

        const popularTrips = Object.entries(tripBookings)
          .map(([title, count]: any) => ({ title, bookings: count }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5);

        setStats({
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          totalBookings,
          completedBookings,
          averageRating: parseFloat(String(averageRating)),
          totalReviews: reviews.length,
          monthlyEarnings,
          popularTrips,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error loading analytics');
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-gray-900 dark:text-gray-100">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8 pt-20 lg:pt-24">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition mb-8 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="bg-red-900/50 text-red-100 p-6 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8 pt-20 lg:pt-24">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition mb-8 inline-block">
          ← Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">📊 Your Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Track your earnings, bookings, and customer satisfaction</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Earnings</p>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">All time</p>
          </div>

          {/* Total Bookings */}
          <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Bookings</p>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">{stats.completedBookings} completed</p>
          </div>

          {/* Average Rating */}
          <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Average Rating</p>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.averageRating}/5.0</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">{stats.totalReviews} reviews</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completion Rate</p>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">Of all bookings</p>
          </div>
        </div>

        {/* Monthly Earnings Chart (Text-based) */}
        <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">💰 Monthly Earnings</h2>
          <div className="space-y-3">
            {stats.monthlyEarnings.map((data: any, idx: number) => {
              const maxEarnings = Math.max(...stats.monthlyEarnings.map((d: any) => d.earnings));
              const percentage = maxEarnings > 0 ? (data.earnings / maxEarnings) * 100 : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{data.month}</span>
                    <span className="text-white font-bold">${data.earnings.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Trips */}
        {stats.popularTrips.length > 0 && (
          <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🏔️ Most Popular Trips</h2>
            <div className="space-y-3">
              {stats.popularTrips.map((trip: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-700 last:border-0">
                  <span className="text-white">{trip.title}</span>
                  <span className="bg-summit-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {trip.bookings} booking{trip.bookings !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
