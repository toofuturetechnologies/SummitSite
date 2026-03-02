/**
 * Review Form Component
 * Allows customers to submit reviews for completed trips
 */

'use client';

import { useState } from 'react';
import { Star, Loader } from 'lucide-react';

interface ReviewFormProps {
  bookingId: string;
  guideId: string;
  guideName: string;
  tripTitle: string;
  customerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  bookingId,
  guideId,
  guideName,
  tripTitle,
  customerId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          guideId,
          customerId,
          rating,
          title,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">✨</div>
        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
          Thank you for your review!
        </h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          Your feedback helps {guideName} improve their trips.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-sky-900 dark:text-sky-100 mb-1">
          Review Your Trip
        </h2>
        <p className="text-sky-600 dark:text-sky-400">
          How was your experience with {guideName}?
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-sky-900 dark:text-sky-100 mb-3">
          Rating
        </label>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-sky-600 dark:text-sky-400 mt-2">
          {rating === 5 && "Excellent! I'd recommend this trip."}
          {rating === 4 && "Great experience, minor issues."}
          {rating === 3 && "Good trip, room for improvement."}
          {rating === 2 && "Below expectations."}
          {rating === 1 && "Poor experience."}
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-sky-900 dark:text-sky-100 mb-2">
          Review Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Amazing mountain adventure!"
          maxLength={100}
          required
          className="w-full px-4 py-2 bg-sky-50 dark:bg-slate-700 border border-sky-200 dark:border-slate-600 rounded-lg text-sky-900 dark:text-sky-100 placeholder-sky-600 dark:placeholder-sky-400 focus:outline-none focus:border-sky-400"
        />
        <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
          {title.length}/100 characters
        </p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-sky-900 dark:text-sky-100 mb-2">
          Your Review
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell other adventurers about your experience... What was the highlight? Any tips for future guests?"
          rows={6}
          maxLength={2000}
          required
          className="w-full px-4 py-2 bg-sky-50 dark:bg-slate-700 border border-sky-200 dark:border-slate-600 rounded-lg text-sky-900 dark:text-sky-100 placeholder-sky-600 dark:placeholder-sky-400 focus:outline-none focus:border-sky-400"
        />
        <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
          {content.length}/2000 characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-sky-100 dark:bg-slate-700 text-sky-700 dark:text-sky-300 font-medium rounded-lg hover:bg-sky-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
        <p className="text-xs font-medium text-sky-900 dark:text-sky-100 mb-2">
          💡 Tips for a helpful review:
        </p>
        <ul className="text-xs text-sky-700 dark:text-sky-300 space-y-1">
          <li>• Be specific about what you enjoyed</li>
          <li>• Mention the guide's professionalism and knowledge</li>
          <li>• Share any constructive feedback</li>
          <li>• Would you book again? Let others know!</li>
        </ul>
      </div>
    </form>
  );
}
