'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';

const supabase = createClient();

interface Review {
  id: string;
  rating: number;
  comment: string;
  behavior_notes: string;
  professionalism_rating: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  bookings: {
    trip: {
      title: string;
    };
  };
}

export default function GuideReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.push('/auth/login');
          return;
        }

        // Verify guide
        const { data: guide, error: guideError } = await supabase
          .from('guides')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError || !guide) {
          setError('Only guides can access this page');
          setLoading(false);
          return;
        }

        // Fetch reviews
        const res = await fetch('/api/guide-reviews/list');
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load reviews');
          setLoading(false);
          return;
        }

        setReviews(data.reviews || []);
      } catch (err) {
        setError('Failed to load reviews');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center pt-20">
        <p className="text-gray-900 dark:text-gray-100">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8 pt-20">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition mb-8 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
            <h2 className="font-bold text-lg mb-2">Access Denied</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20 lg:pt-24">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Customer Reviews</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Feedback you've provided about customers who've completed your trips
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Reviews Given</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{reviews.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Average Rating</p>
            <p className="text-4xl font-bold text-yellow-400">
              {reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Avg Professionalism</p>
            <p className="text-4xl font-bold text-blue-400">
              {reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.professionalism_rating, 0) / reviews.length).toFixed(1)
                : '—'}
            </p>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No customer reviews yet
            </p>
            <p className="text-gray-500 text-sm">
              After you complete trips and mark them as completed, you'll be able to review your customers
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {review.profiles.full_name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Trip: {review.bookings.trip.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm mb-2">Overall Rating</p>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm mb-2">
                      Professionalism
                    </p>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.professionalism_rating
                              ? 'fill-blue-400 text-blue-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="font-bold text-gray-900 dark:text-gray-100 ml-2">
                        {review.professionalism_rating}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Behavior Notes */}
                {review.behavior_notes && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm mb-2">
                      Behavior & Conduct Notes
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                      {review.behavior_notes}
                    </p>
                  </div>
                )}

                {/* Comment */}
                {review.comment && (
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm mb-2">
                      Additional Comments
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                      {review.comment}
                    </p>
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
