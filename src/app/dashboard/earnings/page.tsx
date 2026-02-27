'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

const supabase = createClient();

interface Booking {
  id: string;
  trip_id: string;
  trips: { title: string };
  total_price: number;
  guide_payout: number;
  commission_amount: number;
  hosting_fee: number;
  participant_count: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function EarningsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          router.push('/auth/login');
          return;
        }

        // Get guide ID
        const { data: guide, error: guideError } = await supabase
          .from('guides')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError || !guide) {
          setError('Guide profile not found');
          setLoading(false);
          return;
        }

        setGuideId(guide.id);

        // Fetch all bookings for this guide
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, trips(title)')
          .eq('guide_id', guide.id)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          setError('Failed to load bookings');
          setLoading(false);
          return;
        }

        setBookings(bookingsData || []);

        // Calculate stats
        const paidBookings = (bookingsData || []).filter(
          (b: any) => b.payment_status === 'paid'
        );
        const totalEarnings = paidBookings.reduce((sum: any, b: any) => sum + b.guide_payout, 0);
        const pendingPayouts = paidBookings.length;
        const averageBookingValue =
          paidBookings.length > 0 ? totalEarnings / paidBookings.length : 0;

        setStats({
          totalEarnings,
          totalBookings: paidBookings.length,
          averageBookingValue,
          pendingPayouts,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center pt-20 lg:pt-24">
        <p className="text-gray-900 dark:text-gray-100 text-lg">Loading earnings...</p>
      </div>
    );
  }

  const paidBookings = bookings.filter((b: any) => b.payment_status === 'paid');
  const refundedBookings = bookings.filter((b: any) => b.payment_status === 'refunded');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20 lg:pt-24">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Earnings Dashboard</h1>
            <p className="text-gray-700 dark:text-gray-300">Track your payouts and booking history</p>
          </div>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-900 border border-red-200 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Paid Bookings</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalBookings}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Avg Per Booking</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ${stats.averageBookingValue.toFixed(2)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Pending Payouts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingPayouts}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Booking History</h2>

          {paidBookings.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No paid bookings yet. Your first payout will appear here once a customer books your trip.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Trip</th>
                    <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Date</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Amount</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Commission (12%)</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Hosting Fee</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Your Payout</th>
                    <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paidBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900 transition">
                      <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-medium">{booking.trips.title}</td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-gray-100 font-semibold">
                        ${booking.total_price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                        -${booking.commission_amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                        -${booking.hosting_fee.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right text-green-600 font-semibold">
                        ${booking.guide_payout.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refund History */}
        {refundedBookings.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Refunded Bookings</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Trip</th>
                    <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Date</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Original Amount</th>
                    <th className="text-center py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {refundedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900 transition">
                      <td className="py-4 px-4 text-gray-900 dark:text-gray-100 font-medium">{booking.trips.title}</td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                        ${booking.total_price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          Refunded
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
