/**
 * Public Guide Profile Page
 * /guide/[guideId]
 * 
 * Shows guide profile, trips, reviews, and activity feed
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import ProfileHeader from '@/components/ProfileHeader';
import ActivityFeed from '@/components/ActivityFeed';
import ReviewsSection from '@/components/ReviewsSection';
import { MapPin, BookOpen, Star } from 'lucide-react';

const supabase = createClient();

interface Guide {
  id: string;
  display_name: string;
  tagline: string;
  bio: string;
  location: string;
  avatar_url?: string;
  cover_url?: string;
  years_experience?: number;
  specialties?: string[];
  languages?: string[];
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
}

interface Trip {
  id: string;
  title: string;
  activity: string;
  difficulty: string;
  price: number;
  description: string;
  image_url?: string;
}

export default function GuideProfilePage({ params }: { params: { guideId: string } }) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGuideData();
  }, [params.guideId]);

  const loadGuideData = async () => {
    try {
      // Get guide profile
      const { data: guideData, error: guideError } = await supabase
        .from('guides')
        .select('*')
        .eq('id', params.guideId)
        .single();

      if (guideError || !guideData) {
        setError('Guide not found');
        setLoading(false);
        return;
      }

      setGuide(guideData);

      // Get guide's trips
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .eq('guide_id', params.guideId)
        .limit(6);

      setTrips(tripsData || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load guide profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-500"></div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-6 rounded-lg max-w-md text-center">
          <p className="font-semibold mb-2">Profile Not Found</p>
          <p className="text-sm mb-4">{error || 'This guide profile does not exist.'}</p>
          <Link href="/trips" className="text-red-600 dark:text-red-400 hover:underline">
            ← Back to trips
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          name={guide.display_name}
          tagline={guide.tagline}
          bio={guide.bio}
          avatarUrl={guide.avatar_url}
          coverUrl={guide.cover_url}
          location={guide.location}
          joinedDate={guide.created_at}
          isGuide={true}
          guideStats={{
            totalTrips: trips.length,
            rating: guide.average_rating,
          }}
          socialLinks={guide.social_media}
        />

        {/* Guide Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guide.years_experience && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Experience</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {guide.years_experience}+
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">years</p>
            </div>
          )}

          {guide.languages && guide.languages.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Languages</p>
              <div className="flex flex-wrap gap-1">
                {guide.languages.slice(0, 3).map((lang) => (
                  <span
                    key={lang}
                    className="text-xs bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-2 py-1 rounded"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {guide.specialties && guide.specialties.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Specialties</p>
              <div className="flex flex-wrap gap-1">
                {guide.specialties.slice(0, 3).map((specialty) => (
                  <span
                    key={specialty}
                    className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-1 rounded"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Featured Trips */}
        {trips.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Featured Trips ({trips.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="group bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {trip.image_url && (
                    <div className="h-32 bg-gray-200 dark:bg-slate-700 overflow-hidden">
                      <img
                        src={trip.image_url}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      {trip.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {trip.activity} • {trip.difficulty}
                    </p>
                    <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
                      ${trip.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href={`/trips?guide=${guide.id}`}
              className="inline-block px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
            >
              View All Trips
            </Link>
          </div>
        )}

        {/* Reviews Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Reviews & Ratings
            </h2>
          </div>
          <ReviewsSection guideId={guide.id} guideName={guide.display_name} />
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h2>
          <ActivityFeed userId={guide.id} isGuide={true} />
        </div>

        {/* Book Button */}
        <div className="sticky bottom-4 right-4">
          <button className="fixed bottom-6 right-6 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all">
            Book {guide.display_name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
