'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { isValidTikTokUrl, extractTikTokVideoId } from '@/lib/tiktok-utils';
import { TikTokReviewEmbed } from './TikTokReviewEmbed';

interface ReviewFormWithTikTokProps {
  onSubmit: (formData: {
    rating: number;
    title: string;
    comment: string;
    tiktokUrl?: string;
    videoId?: string;
  }) => Promise<void>;
  tripTitle: string;
  isSubmitting?: boolean;
  error?: string | null;
}

/**
 * Enhanced review form with TikTok video embedding
 * Allows customers to attach TikTok videos to their trip reviews
 */
export function ReviewFormWithTikTok({
  onSubmit,
  tripTitle,
  isSubmitting = false,
  error: initialError,
}: ReviewFormWithTikTokProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [tiktokError, setTiktokError] = useState<string | null>(null);
  const [tiktokSuccess, setTiktokSuccess] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  const handleTikTokUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setTiktokUrl(url);
    setTiktokError(null);
    setTiktokSuccess(false);
    setVideoId(null);

    if (!url.trim()) {
      return;
    }

    // Validate URL
    if (!isValidTikTokUrl(url)) {
      setTiktokError('Please enter a valid TikTok URL (e.g., https://www.tiktok.com/@creator/video/123456789)');
      return;
    }

    // Extract video ID
    const id = extractTikTokVideoId(url);
    if (!id) {
      setTiktokError('Could not extract video ID from URL. Try the full video URL (not shortened).');
      return;
    }

    setVideoId(id);
    setTiktokSuccess(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a review title');
      return;
    }

    try {
      await onSubmit({
        rating,
        title,
        comment,
        tiktokUrl: tiktokUrl.trim() || undefined,
        videoId: videoId || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-100 p-4 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3">
          How was your experience? ⭐
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition ${
                rating >= star ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          {rating} star{rating !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Review Title
        </label>
        <input
          type="text"
          placeholder="e.g., 'Amazing experience!' or 'Best adventure ever!'"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:border-sky-500 focus:outline-none"
        />
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{title.length}/100</p>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Your Review (Optional)
        </label>
        <textarea
          placeholder="Tell other adventurers what you liked about this trip..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={5}
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:border-sky-500 focus:outline-none resize-none"
        />
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{comment.length}/500</p>
      </div>

      {/* TikTok URL Input */}
      <div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-5">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <span>Attach TikTok Video (Optional)</span>
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">NEW</span>
        </label>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          Share a TikTok video from your adventure! Paste the full URL below.
        </p>

        <input
          type="url"
          placeholder="https://www.tiktok.com/@yourusername/video/1234567890"
          value={tiktokUrl}
          onChange={handleTikTokUrlChange}
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:border-sky-500 focus:outline-none"
        />

        {/* TikTok Error */}
        {tiktokError && (
          <div className="mt-3 flex gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{tiktokError}</span>
          </div>
        )}

        {/* TikTok Success & Preview */}
        {tiktokSuccess && videoId && (
          <div className="mt-4">
            <div className="flex gap-2 text-green-600 dark:text-green-400 text-sm mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Video found! Preview below:</span>
            </div>
            <TikTokReviewEmbed videoId={videoId} tiktokUrl={tiktokUrl} compact={true} />
          </div>
        )}

        <p className="text-gray-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">
          💡 <strong>Tips:</strong> Use the full video URL (not shortened URLs). Your TikTok credit will be visible in the embedded video. 
          Guides love seeing adventure content from customers!
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !rating || !title}
        style={{
          backgroundColor: isSubmitting ? '#94a3b8' : '#F97316',
          opacity: isSubmitting || !rating || !title ? 0.6 : 1,
        }}
        className="w-full text-white font-bold py-3 rounded-lg transition disabled:cursor-not-allowed"
      >
        {isSubmitting ? '📤 Submitting Review...' : '✅ Submit Review'}
      </button>

      {/* Info Box */}
      <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          💡 <strong>Help the community:</strong> Be honest and specific. If you include a video, make sure it's from 
          your actual adventure—it helps other adventurers see what to expect!
        </p>
      </div>
    </form>
  );
}

export default ReviewFormWithTikTok;
