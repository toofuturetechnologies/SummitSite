'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, DollarSign } from 'lucide-react';

const supabase = createClient();

interface Booking {
  id: string;
  trip_id: string;
  trip?: { title: string };
  user_id: string;
  participant_count: number;
  total_price: number;
  guide_payout: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  start_date?: string;
  end_date?: string;
  traveler_name?: string;
  traveler_email?: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-900/50 text-yellow-100',
  confirmed: 'bg-green-900/50 text-green-100',
  completed: 'bg-blue-900/50 text-blue-100',
  cancelled: 'bg-red-900/50 text-red-100',
};

export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData.user) {
          router.push('/auth/login');
          return;
        }

        // Get guide ID
        const { data: guideData, error: guideError } = await (supabase as any)
          .from('guides')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError) {
          setError('Guide profile not found');
          return;
        }

        setGuideId(guideData.id);

        // Fetch bookings for this guide
        let query = (supabase as any)
          .from('bookings')
          .select(`
            id,
            trip_id,
            user_id,
            participant_count,
            total_price,
            guide_payout,
            status,
            created_at,
            trip_date_id,
            trips:trip_id(title)
          `)
          .eq('guide_id', guideData.id)
          .order('created_at', { ascending: false });

        if (filterStatus !== 'all') {
          query = query.eq('status', filterStatus);
        }

        const { data: bookingsData, error: bookingsError } = await query;

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          setError('Failed to load bookings');
          return;
        }

        // Fetch dates for each booking
        if (bookingsData && bookingsData.length > 0) {
          const dateIds = Array.from(new Set(bookingsData.map((b: any) => b.trip_date_id)));
          const { data: datesData } = await supabase
            .from('trip_dates')
            .select('id, start_date, end_date')
            .in('id', dateIds);

          const dateMap = new Map(datesData?.map((d: any) => [d.id, d]) || []);

          const enhancedBookings = bookingsData.map((b: any) => ({
            ...b,
            start_date: (dateMap.get(b.trip_date_id) as any)?.start_date,
            end_date: (dateMap.get(b.trip_date_id) as any)?.end_date,
            trip: b.trips as any,
          } as any));

          setBookings(enhancedBookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, filterStatus]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Update local state
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus as any } : b
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex pt-20 lg:pt-24 items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalPayout: bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.guide_payout, 0),
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20 lg:pt-24">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-600 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Bookings</h1>
          <p className="text-gray-600">Manage your trip bookings and payments</p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-white">{stats.confirmed}</p>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-white">{stats.completed}</p>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Total Payout</p>
            <p className="text-3xl font-bold text-green-400">${stats.totalPayout.toFixed(0)}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-summit-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              {filterStatus === 'all' 
                ? 'No bookings yet' 
                : `No ${filterStatus} bookings`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div
                key={booking.id}
                className="bg-gray-100 border border-gray-200 rounded-lg p-6 hover:bg-gray-200/30 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Trip & Date */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {booking.trip?.title || 'Trip'}
                    </h3>
                    {booking.start_date && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(booking.start_date).toLocaleDateString()}
                          {booking.start_date !== booking.end_date && booking.end_date && 
                            ` - ${new Date(booking.end_date).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Participants */}
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Participants</p>
                    <div className="flex items-center gap-2 text-white">
                      <Users className="w-4 h-4" />
                      <span className="text-lg font-semibold">{booking.participant_count}</span>
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Your Payout</p>
                    <div className="flex items-center gap-2 text-green-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-lg font-semibold">
                        ${booking.guide_payout.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[booking.status]}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {booking.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded-lg transition"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-lg transition"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href={`/bookings/review?booking=${booking.id}`}
                      className="block w-full bg-summit-600 hover:bg-summit-500 text-white font-medium py-2 rounded-lg transition text-center"
                    >
                      ⭐ Leave a Review
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
