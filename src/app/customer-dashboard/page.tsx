'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Calendar, MapPin, Clock, ChevronRight, Loader } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Chat {
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Booking {
  id: string;
  trip_id: string;
  trip: { title: string; region: string; country: string };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  participant_count: number;
  trip_date_id: string;
  tripDate: { start_date: string; end_date: string };
  guide: { display_name: string };
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Booking[]>([]);
  const [pastTrips, setPastTrips] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          setLoading(false);
          return;
        }

        setUser(authData.user);

        // Load chats
        const conversationsRes = await fetch(`/api/messages/conversations?userId=${authData.user.id}`);
        if (conversationsRes.ok) {
          const data = await conversationsRes.json();
          setChats(data.conversations?.slice(0, 5) || []);
        }

        // Load bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*, trip:trip_id(title, region, country), tripDate:trip_date_id(start_date, end_date), guide:guide_id(display_name)')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false });

        if (bookingsData) {
          const now = new Date();
          const upcoming = bookingsData.filter((b: any) => new Date(b.tripDate.start_date) >= now);
          const past = bookingsData.filter((b: any) => new Date(b.tripDate.start_date) < now);
          setUpcomingTrips(upcoming as Booking[]);
          setPastTrips(past as Booking[]);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900/50 text-green-200 border-green-700';
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-200 border-yellow-700';
      case 'completed':
        return 'bg-blue-900/50 text-blue-200 border-blue-700';
      case 'cancelled':
        return 'bg-red-900/50 text-red-200 border-red-700';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const daysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your dashboard</p>
          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            {upcomingTrips.length} upcoming trip{upcomingTrips.length !== 1 ? 's' : ''} • {chats.length} active chat{chats.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {/* Recent Chats */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 gap-2">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 lg:w-5 h-4 lg:h-5 flex-shrink-0" />
                <span className="truncate">Chats</span>
              </h2>
              {chats.length > 0 && (
                <Link href="/dashboard/messages" className="text-blue-600 hover:text-blue-700 text-xs lg:text-sm whitespace-nowrap flex-shrink-0 font-medium">
                  View all
                </Link>
              )}
            </div>

            {chats.length === 0 ? (
              <p className="text-gray-600 text-sm">No active chats yet</p>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {chats.map((chat) => (
                  <Link
                    key={chat.otherUserId}
                    href="/dashboard/messages"
                    className="block p-3 bg-white hover:bg-blue-50 rounded-lg transition border border-gray-300 hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base truncate">{chat.otherUserName}</p>
                        <p className="text-gray-600 text-xs lg:text-sm truncate mt-1">{chat.lastMessage}</p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Trips */}
          <div className="lg:col-span-2 bg-gray-100 border border-gray-200 rounded-lg p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 gap-2">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2 min-w-0">
                <Calendar className="w-4 lg:w-5 h-4 lg:h-5 flex-shrink-0" />
                <span className="truncate">Upcoming</span>
              </h2>
              <Link href="/trips" className="text-blue-600 hover:text-blue-700 text-xs lg:text-sm whitespace-nowrap flex-shrink-0 font-medium">
                Browse more
              </Link>
            </div>

            {upcomingTrips.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No upcoming trips</p>
                <Link
                  href="/trips"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  Book a trip
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTrips.slice(0, 3).map((booking) => {
                  const days = daysUntil(booking.tripDate.start_date);
                  return (
                    <Link
                      key={booking.id}
                      href={`/trips/${booking.trip_id}`}
                      className="block p-4 bg-white hover:bg-blue-50 rounded-lg transition border border-gray-300 hover:border-blue-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{booking.trip.title}</h3>
                          <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {booking.trip.region}, {booking.trip.country}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          with {booking.guide.display_name}
                        </span>
                        <span className="text-gray-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {days} day{days !== 1 ? 's' : ''} away
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {upcomingTrips.length > 3 && (
                  <Link
                    href="#trips"
                    className="block p-3 text-center text-gray-700 hover:text-blue-600 border border-gray-300 hover:border-blue-300 rounded-lg transition font-medium"
                  >
                    View {upcomingTrips.length - 3} more trip{upcomingTrips.length - 3 !== 1 ? 's' : ''}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Past Trips */}
        {pastTrips.length > 0 && (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Past Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {pastTrips.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/trips/${booking.trip_id}`}
                  className="p-4 bg-white hover:bg-blue-50 rounded-lg transition border border-gray-300 hover:border-blue-300"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{booking.trip.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {new Date(booking.tripDate.start_date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm">{booking.guide.display_name}</p>
                  {booking.status === 'completed' && !booking.id.includes('reviewed') && (
                    <Link
                      href={`/bookings/review?booking=${booking.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block font-medium"
                    >
                      Leave review →
                    </Link>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
