'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Star, MessageSquare, Calendar } from 'lucide-react';

const supabase = createClient();

interface Guide {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  rating: number;
  review_count: number;
  certifications: string;
  years_experience: number;
  profile: {
    avatar_url: string;
    full_name: string;
  };
}

interface Trip {
  id: string;
  title: string;
  price_per_person: number;
  difficulty: string;
  activity: string;
}

export default function GuidePage({ params }: { params: { id: string } }) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        // Load guide
        const { data: guideData } = await supabase
          .from('guides')
          .select('*, profile:user_id(avatar_url, full_name)')
          .eq('id', params.id)
          .single();

        if (guideData) {
          setGuide(guideData);

          // Load guide's trips
          const { data: tripsData } = await supabase
            .from('trips')
            .select('id, title, price_per_person, difficulty, activity')
            .eq('guide_id', guideData.id)
            .limit(6);

          setTrips(tripsData || []);
        }
      } catch (err) {
        console.error('Error loading guide:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-gray-900">Loading guide...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-gray-900">Guide not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex gap-6 mb-6">
            {guide.profile?.avatar_url ? (
              <img
                src={guide.profile.avatar_url}
                alt={guide.display_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {guide.display_name?.charAt(0) || 'G'}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{guide.display_name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span className="font-semibold text-gray-900">{guide.rating.toFixed(1)}</span>
                  <Link
                    href={`/guides/${guide.id}#reviews`}
                    className="text-gray-600 hover:text-blue-600 text-sm"
                  >
                    ({guide.review_count} reviews)
                  </Link>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{guide.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="text-lg font-semibold text-gray-900">{guide.years_experience}+ years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Certifications</p>
                  <p className="text-lg font-semibold text-blue-600">{guide.certifications || 'IFMGA'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                  Message Guide
                </button>
                <Link
                  href={`/guides/${guide.id}#trips`}
                  className="px-6 py-2 border border-gray-300 hover:border-gray-400 text-gray-900 rounded-lg font-medium transition"
                >
                  View Trips
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trips Section */}
        <div id="trips" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Adventures</h2>
          {trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{trip.title}</h3>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <p>Activity: {trip.activity}</p>
                    <p>Difficulty: {trip.difficulty}</p>
                    <p className="font-semibold text-gray-900">${trip.price_per_person}/person</p>
                  </div>
                  <button className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition font-medium">
                    View Details
                  </button>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No trips available yet</p>
          )}
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews ({guide.review_count})</h2>
          <p className="text-gray-600">Reviews will appear here once customers complete trips and leave feedback.</p>
        </div>
      </div>
    </div>
  );
}
