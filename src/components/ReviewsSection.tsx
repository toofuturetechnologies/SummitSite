'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Star, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient();

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  guide_response?: string;
  guide_responded_at?: string;
  created_at: string;
  profiles: { full_name: string };
}

export default function ReviewsSection({ tripId, guideId }: { tripId: string; guideId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isGuide, setIsGuide] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);

          // Check if user is the guide
          const { data: guide } = await supabase
            .from('guides')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

          if (guide?.id === guideId) {
            setIsGuide(true);
          }
        }

        // Fetch reviews
        const { data: reviewsData, error } = await supabase
          .from('reviews')
          .select('*, profiles!reviews_reviewer_id_fkey(full_name)')
          .eq('trip_id', tripId)
          .order('created_at', { ascending: false });

        if (!error && reviewsData) {
          setReviews(reviewsData as any[]);
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tripId, guideId]);

  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim() || !isGuide) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('reviews')
        .update({
          guide_response: responseText,
          guide_responded_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (!error) {
        // Reload reviews
        const { data: updatedReviews } = await supabase
          .from('reviews')
          .select('*, profiles!reviews_reviewer_id_fkey(full_name)')
          .eq('trip_id', tripId)
          .order('created_at', { ascending: false });

        if (updatedReviews) {
          setReviews(updatedReviews as any[]);
        }
        setRespondingId(null);
        setResponseText('');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
        <p className="text-gray-600">No reviews yet. Be the first to review this trip!</p>
      </div>
    );
  }

  return (
    <div id="reviews" className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm scroll-mt-20">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews ({reviews.length})</h2>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base">
                  {review.title}
                </h3>
                <p className="text-gray-700 text-sm">
                  by {review.profiles?.full_name}
                </p>
              </div>
            </div>

            {/* Review Body */}
            <p className="text-gray-700 mb-4 leading-relaxed">{review.body}</p>

            {/* Guide Response */}
            {review.guide_response && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                <p className="text-sm font-bold text-blue-900 mb-2">Guide's Response</p>
                <p className="text-gray-800 text-sm mb-2 leading-relaxed">{review.guide_response}</p>
                <p className="text-gray-700 text-xs">
                  {review.guide_responded_at &&
                    new Date(review.guide_responded_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Guide Response Form */}
            {isGuide && !review.guide_response && respondingId === review.id && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response..."
                  rows={3}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmitResponse(review.id)}
                    disabled={!responseText.trim() || submitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                  >
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                  <button
                    onClick={() => {
                      setRespondingId(null);
                      setResponseText('');
                    }}
                    className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Guide Response Button */}
            {isGuide && !review.guide_response && respondingId !== review.id && (
              <button
                onClick={() => setRespondingId(review.id)}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 font-medium transition"
              >
                <MessageCircle className="w-4 h-4" />
                Respond to Review
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
