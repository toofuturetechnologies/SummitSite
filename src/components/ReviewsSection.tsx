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
    return <div className="text-summit-400">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Reviews</h2>
        <p className="text-summit-400">No reviews yet. Be the first to review this trip!</p>
      </div>
    );
  }

  return (
    <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Reviews ({reviews.length})</h2>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-summit-700 pb-6 last:border-b-0">
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
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-summit-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-summit-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-white">
                  {review.title}
                </h3>
                <p className="text-summit-300 text-sm">
                  by {review.profiles?.full_name}
                </p>
              </div>
            </div>

            {/* Review Body */}
            <p className="text-summit-300 mb-4">{review.body}</p>

            {/* Guide Response */}
            {review.guide_response && (
              <div className="bg-summit-900/50 rounded-lg p-4 mb-4 border-l-2 border-summit-600">
                <p className="text-sm font-semibold text-white mb-2">Guide's Response</p>
                <p className="text-summit-300 text-sm mb-1">{review.guide_response}</p>
                <p className="text-summit-400 text-xs">
                  {review.guide_responded_at &&
                    new Date(review.guide_responded_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Guide Response Form */}
            {isGuide && !review.guide_response && respondingId === review.id && (
              <div className="bg-summit-900/50 rounded-lg p-4 space-y-3">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response..."
                  rows={3}
                  className="w-full bg-summit-900 border border-summit-600 text-white px-3 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmitResponse(review.id)}
                    disabled={!responseText.trim() || submitting}
                    className="bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition text-sm"
                  >
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                  <button
                    onClick={() => {
                      setRespondingId(null);
                      setResponseText('');
                    }}
                    className="text-summit-400 hover:text-summit-300 px-4 py-2 text-sm"
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
                className="text-summit-400 hover:text-summit-300 text-sm flex items-center gap-1"
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
