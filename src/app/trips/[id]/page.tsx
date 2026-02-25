'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Star, Users, MapPin, Calendar, MessageSquare } from 'lucide-react';
import ReviewsSection from '@/components/ReviewsSection';
import MessageGuideModal from '@/components/MessageGuideModal';

const supabase = createClient();

interface Trip {
  id: string;
  title: string;
  description: string;
  activity: string;
  difficulty: string;
  price_per_person: number;
  duration_days: number;
  max_group_size: number;
  min_group_size: number;
  country: string;
  region: string;
  highlights?: string[];
  itinerary?: any[];
  inclusions?: string[];
  exclusions?: string[];
  guide_id: string;
  is_instant_book?: boolean;
  is_active?: boolean;
}

interface Guide {
  id: string;
  user_id: string;  // Needed for messaging
  display_name: string;
  tagline?: string;
  bio?: string;
  rating: number;
  review_count: number;
}

interface AvailableDate {
  id: string;
  start_date: string;
  end_date: string;
  spots_total: number;
  spots_available: number;
  price_override?: number;
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trip
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', params.id)
          .eq('is_active', true)
          .single();

        if (tripError) {
          setError('Trip not found');
          return;
        }

        setTrip(tripData);

        // Fetch guide
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('*')
          .eq('id', tripData.guide_id)
          .single();

        if (!guideError && guideData) {
          setGuide(guideData);
        }

        // Fetch available dates
        const { data: datesData, error: datesError } = await supabase
          .from('trip_dates')
          .select('*')
          .eq('trip_id', tripData.id)
          .eq('is_available', true)
          .gte('start_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true });

        if (!datesError && datesData) {
          setAvailableDates(datesData);
          if (datesData.length > 0) {
            setSelectedDate(datesData[0].id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleBooking = async () => {
    if (!trip || !selectedDate) return;

    try {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        // Redirect to login
        const returnUrl = `/bookings/checkout?trip=${trip.id}window.location.href = '/auth/login';date=${selectedDate}window.location.href = '/auth/login';participants=${participantCount}`;
        window.location.href = `/auth/signup-customer?returnTo=${encodeURIComponent(returnUrl)}`;
        return;
      }

      // Redirect to checkout with booking details
      window.location.href = `/bookings/checkout?trip=${trip.id}&date=${selectedDate}&participants=${participantCount}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/trips" className="text-gray-600 hover:text-gray-600 mb-8 inline-block">
            ← Back to Trips
          </Link>
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg">
            {error || 'Trip not found'}
          </div>
        </div>
      </div>
    );
  }

  const selectedDateData = availableDates.find(d => d.id === selectedDate);
  const totalPrice = (trip.price_per_person || 0) * participantCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <Link href="/trips" className="text-gray-600 hover:text-gray-600 mb-8 inline-block">
          ← Back to Trips
        </Link>

        {/* Trip Title & Basic Info */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{trip.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-gray-700 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{trip.region}, {trip.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{trip.duration_days} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{trip.min_group_size}-{trip.max_group_size} people</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-white">${trip.price_per_person}</span>
            <span className="text-gray-600">per person</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="bg-summit-600 text-white px-3 py-1 rounded-full text-sm">
              {trip.activity.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="bg-gray-200 text-white px-3 py-1 rounded-full text-sm">
              {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
            </span>
          </div>
        </div>

        {/* Guide Info */}
        {guide && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About Your Guide</h2>
                <h3 className="text-lg font-bold text-gray-900">{guide.display_name}</h3>
                <p className="text-gray-700 text-sm mb-2">{guide.tagline}</p>
                <div className="flex items-center gap-2 text-gray-800 mb-3">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-medium">{guide.rating.toFixed(1)}</span>
                  <span className="text-gray-600">({guide.review_count} reviews)</span>
                </div>
                {guide.bio && (
                  <p className="text-gray-700 text-sm line-clamp-3">{guide.bio}</p>
                )}
              </div>
              <button
                onClick={() => setShowMessageModal(true)}
                className="ml-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 flex-shrink-0 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Trip</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{trip.description}</p>
            </div>

            {/* Highlights */}
            {trip.highlights && trip.highlights.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Highlights</h2>
                <ul className="space-y-2">
                  {trip.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Itinerary */}
            {trip.itinerary && trip.itinerary.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Itinerary</h2>
                <div className="space-y-4">
                  {trip.itinerary.map((day: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Day {day.day}: {day.title}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{day.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trip.inclusions && trip.inclusions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Included</h3>
                  <ul className="space-y-2">
                    {trip.inclusions.map((inc, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {trip.exclusions && trip.exclusions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Not Included</h3>
                  <ul className="space-y-2">
                    {trip.exclusions.map((exc, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-gray-400">—</span>
                        {exc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <ReviewsSection tripId={trip.id} guideId={trip.guide_id} />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Book This Trip</h2>

              {availableDates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No dates available</p>
                  <Link
                    href="/trips"
                    className="text-blue-600 hover:text-blue-700 underline font-medium transition"
                  >
                    Browse other trips
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-gray-900 text-sm font-semibold mb-2">
                      Select Date
                    </label>
                    <select
                      value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-medium"
                    >
                      {availableDates.map(date => (
                        <option key={date.id} value={date.id}>
                          {new Date(date.start_date).toLocaleDateString()} - {date.start_date === date.end_date ? 'Same day' : new Date(date.end_date).toLocaleDateString()} ({date.spots_available}/{date.spots_total} spots)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Participant Count */}
                  <div>
                    <label className="block text-gray-900 text-sm font-semibold mb-2">
                      Number of Participants
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setParticipantCount(Math.max(trip.min_group_size, participantCount - 1))}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold w-10 h-10 rounded flex items-center justify-center transition"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={participantCount}
                        onChange={(e) => setParticipantCount(Math.min(trip.max_group_size, Math.max(trip.min_group_size, parseInt(e.target.value) || 1)))}
                        min={trip.min_group_size}
                        max={trip.max_group_size}
                        className="flex-1 bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-center font-semibold"
                      />
                      <button
                        onClick={() => setParticipantCount(Math.min(trip.max_group_size, participantCount + 1))}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold w-10 h-10 rounded flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-gray-700 text-xs mt-1 font-medium">
                      {trip.min_group_size}-{trip.max_group_size} people per group
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2 border border-blue-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">${trip.price_per_person} × {participantCount}</span>
                      <span className="text-gray-900 font-semibold">${totalPrice}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-blue-600 text-lg">${totalPrice}</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    Book Now
                  </button>

                  <p className="text-gray-700 text-xs text-center font-medium">
                    {trip.is_instant_book ? '✓ Instant confirmation' : 'Guide will confirm your booking'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Guide Modal */}
        {trip && guide && guide.user_id && (
          <MessageGuideModal
            guideId={guide.id}
            guideUserId={guide.user_id}
            guideName={guide.display_name}
            tripId={trip.id}
            tripTitle={trip.title}
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
          />
        )}
      </div>
    </div>
  );
}
