'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

const supabase = createClient();

export default function LeaveReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!bookingId) {
          setError('No booking ID provided');
          setLoading(false);
          return;
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        setUser(user);

        // Get booking details
        const { data: bookingData, error: bookingError } = await (supabase as any)
          .from('bookings')
          .select('*, trips(title, id)')
          .eq('id', bookingId)
          .single();

        if (bookingError || !bookingData) {
          setError('Booking not found');
          setLoading(false);
          return;
        }

        // Check if user is the customer for this booking
        if (bookingData.user_id !== user.id) {
          setError('You can only review your own bookings');
          setLoading(false);
          return;
        }

        // Check if review already exists
        const { data: existingReview } = await (supabase as any)
          .from('reviews')
          .select('id')
          .eq('booking_id', bookingId)
          .single();

        if (existingReview) {
          setError('You have already reviewed this booking');
          setLoading(false);
          return;
        }

        setBooking(bookingData);
        setTrip(bookingData.trips);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error loading');
        setLoading(false);
      }
    };

    loadData();
  }, [bookingId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.rating) {
        throw new Error('Please select a rating');
      }

      if (!formData.title.trim()) {
        throw new Error('Please enter a review title');
      }

      // Insert review
      const { error: reviewError } = await (supabase as any)
        .from('reviews')
        .insert({
          booking_id: bookingId,
          trip_id: trip.id,
          guide_id: booking.guide_id,
          customer_id: user.id,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        });

      if (reviewError) {
        throw reviewError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/trips/${trip.id}`);
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/50 text-red-100 p-6 rounded-lg mb-6">
            <h2 className="font-bold mb-2">Error</h2>
            <p className="mb-4">{error}</p>
            <Link href="/dashboard/bookings" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded inline-block">
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">✅ Thank You!</h1>
          <p className="text-green-200 mb-6">Your review has been posted. Redirecting to trip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/bookings" className="text-summit-400 hover:text-summit-300 mb-8 inline-block">
          ← Back to Bookings
        </Link>

        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Leave a Review</h1>
          <p className="text-summit-300 mb-8">Tell us about your experience on <strong>{trip?.title}</strong></p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-summit-200 font-medium mb-3">How was your experience? ⭐</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`text-3xl transition ${
                      formData.rating >= star ? 'text-yellow-400' : 'text-summit-700 hover:text-yellow-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-summit-400 text-sm mt-2">{formData.rating} star{formData.rating !== 1 ? 's' : ''}</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-summit-200 font-medium mb-2">Review Title</label>
              <input
                type="text"
                placeholder="e.g., 'Amazing experience!' or 'Good but could be better'"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={100}
                className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              />
              <p className="text-summit-400 text-sm mt-1">{formData.title.length}/100</p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-summit-200 font-medium mb-2">Your Review (Optional)</label>
              <textarea
                placeholder="Tell other adventurers what you liked about this trip..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                maxLength={500}
                rows={5}
                className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
              />
              <p className="text-summit-400 text-sm mt-1">{formData.comment.length}/500</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !formData.rating || !formData.title}
              className="w-full bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
            >
              {submitting ? '📤 Submitting...' : '✅ Submit Review'}
            </button>
          </form>

          <div className="mt-8 bg-summit-900/50 p-4 rounded-lg">
            <p className="text-summit-300 text-sm">
              💡 <strong>Help other adventurers:</strong> Be honest and specific about your experience. Reviews help improve the platform for everyone!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
