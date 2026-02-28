'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { ReviewFormWithTikTok } from '@/components/ReviewFormWithTikTok';
import { extractTikTokVideoId } from '@/lib/tiktok-utils';

const supabase = createClient();

function LeaveReviewPageInner() {
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

  const handleSubmit = async (formData: {
    rating: number;
    title: string;
    comment: string;
    tiktokUrl?: string;
    videoId?: string;
  }) => {
    setSubmitting(true);
    setError(null);

    try {
      // Extract video ID if TikTok URL provided
      let videoId = formData.videoId;
      if (formData.tiktokUrl && !videoId) {
        videoId = extractTikTokVideoId(formData.tiktokUrl) || undefined;
      }

      // Insert review with TikTok fields
      const { error: reviewError } = await (supabase as any)
        .from('reviews')
        .insert({
          booking_id: bookingId,
          trip_id: trip.id,
          guide_id: booking.guide_id,
          reviewer_id: user.id,
          rating: formData.rating,
          title: formData.title,
          body: formData.comment,
          tiktok_url: formData.tiktokUrl || null,
          video_id: videoId || null,
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
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-gray-900 dark:text-gray-100">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
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
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">✅ Thank You!</h1>
          <p className="text-green-200 mb-6">Your review has been posted. Redirecting to trip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/bookings" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition mb-8 inline-block">
          ← Back to Bookings
        </Link>

        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leave a Review</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Tell us about your experience on <strong>{trip?.title}</strong></p>

          <ReviewFormWithTikTok
            tripTitle={trip?.title || ''}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default function LeaveReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    }>
      <LeaveReviewPageInner />
    </Suspense>
  );
}
