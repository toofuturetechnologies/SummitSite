'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

interface ReviewFormProps {
  tripId: string;
  guideId: string;
  reviewType: 'trip' | 'guide';
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({
  tripId,
  guideId,
  reviewType,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error('You must be logged in to leave a review');
      }

      // Get or create profile for this user
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();

      const profileId = profileData?.id || authData.user.id;

      // Create review
      const { error: reviewError } = await supabase.from('reviews').insert({
        trip_id: tripId,
        guide_id: guideId,
        reviewer_id: profileId,
        rating,
        title,
        body,
        review_type: reviewType,
      });

      if (reviewError) throw reviewError;

      // If TikTok URL provided, submit as UGC
      if (tiktokUrl.trim()) {
        const { error: ugcError } = await supabase.from('ugc_videos').insert({
          trip_id: tripId,
          guide_id: guideId,
          tiktok_url: tiktokUrl,
          tiktok_video_id: tiktokUrl.match(/\/video\/(\d+)/)?.[1] || '',
          creator_name: authData.user.user_metadata?.full_name || 'Reviewer',
          creator_handle: authData.user.email?.split('@')[0] || 'reviewer',
          creator_followers: 0,
          video_status: 'pending',
          payment_amount: 0,
          payment_status: 'demo',
        });

        if (ugcError) {
          console.warn('UGC submission warning:', ugcError);
          // Don't fail the whole review if UGC fails
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {reviewType === 'trip' ? 'Review This Trip' : 'Review This Guide'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-gray-900 font-semibold mb-3">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 'Best experience of my life!'"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-gray-900 font-semibold mb-2">
              Your Review
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience... What was great? Any suggestions?"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
              required
            />
            <p className="text-gray-600 text-xs mt-1">Minimum 10 characters</p>
          </div>

          {/* TikTok UGC Upload */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-gray-900 font-semibold mb-2">
              🎬 Share Your TikTok Video (Optional)
            </label>
            <input
              type="url"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@username/video/123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
            <p className="text-gray-600 text-xs mt-2">
              Paste your TikTok video link to feature your experience. Earn $100-500 if featured!
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !body.trim() || body.trim().length < 10}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Submitting...' : 'Post Review'}
            </button>
          </div>

          {tiktokUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm font-medium">
                ✅ TikTok video will be submitted for approval. You could earn money!
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
