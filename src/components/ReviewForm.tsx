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
  const [socialLinks, setSocialLinks] = useState({
    youtube: '',
    instagram: '',
    tiktok: '',
  });
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

      // Create review with social media links
      const { error: reviewError } = await supabase.from('reviews').insert({
        trip_id: tripId,
        guide_id: guideId,
        reviewer_id: profileId,
        rating,
        title,
        body,
        review_type: reviewType,
        youtube_url: socialLinks.youtube || null,
        instagram_url: socialLinks.instagram || null,
        tiktok_url: socialLinks.tiktok || null,
      });

      if (reviewError) throw reviewError;

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
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {reviewType === 'trip' ? 'Review This Trip' : 'Review This Guide'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 transition"
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
            <label className="block text-gray-900 dark:text-gray-100 font-semibold mb-3">
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
            <label className="block text-gray-900 dark:text-gray-100 font-semibold mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 'Best experience of my life!'"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-gray-900 dark:text-gray-100 font-semibold mb-2">
              Your Review
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience... What was great? Any suggestions?"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              required
            />
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Minimum 10 characters</p>
          </div>

          {/* Social Media Links */}
          <div>
            <label className="block text-gray-900 dark:text-gray-100 font-semibold mb-3">
              📱 Share Your Content (Optional)
            </label>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Link your YouTube, Instagram, or TikTok content from this trip. Help showcase the adventure!
            </p>
            <div className="space-y-2">
              <input
                type="url"
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                placeholder="YouTube video URL (optional)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100 text-sm"
              />
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="Instagram post URL (optional)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100 text-sm"
              />
              <input
                type="url"
                value={socialLinks.tiktok}
                onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                placeholder="TikTok video URL (optional)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition"
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
        </form>
      </div>
    </div>
  );
}
