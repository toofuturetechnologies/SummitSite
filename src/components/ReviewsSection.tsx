/**
 * Reviews Section Component
 * Displays reviews and ratings for a guide
 */

'use client';

import { useState, useEffect } from 'react';
import { Star, Loader } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  reviewer?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  verified_booking: boolean;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
}

interface ReviewsSectionProps {
  guideId: string;
  guideName?: string;
  limit?: number;
  compact?: boolean;
}

export default function ReviewsSection({
  guideId,
  guideName = 'This guide',
  limit = 10,
  compact = false,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [guideId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews/guide/${guideId}?limit=100`);
      
      if (!res.ok) throw new Error('Failed to load reviews');
      
      const data = await res.json();
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <p>No reviews yet. Be the first to review this guide!</p>
      </div>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, limit);

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {!compact && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl font-bold text-amber-400">
                  {stats.average_rating.toFixed(1)}
                </div>
                <div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(stats.average_rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution] || 0;
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                      {rating} ⭐
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-sky-900 dark:text-sky-100">
                  {review.title}
                </h4>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {review.rating}.0
                  </span>
                </div>
              </div>
              {review.verified_booking && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  ✓ Verified
                </span>
              )}
            </div>

            {/* Review Content */}
            <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
              {review.content}
            </p>

            {/* Review Footer */}
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                {review.reviewer?.name || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {reviews.length > limit && !showAll && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2 bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 font-medium rounded-lg hover:bg-sky-200 dark:hover:bg-sky-900/30 transition-colors"
          >
            Show all {stats.total_reviews} reviews
          </button>
        </div>
      )}
    </div>
  );
}
