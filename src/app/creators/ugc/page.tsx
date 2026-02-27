'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Check, Loader } from 'lucide-react';

const supabase = createClient();

interface TripInfo {
  id: string;
  title: string;
  guide_id: string;
}

interface BookingInfo {
  id: string;
  trip_id: string;
  ugc_code: string;
  trip: TripInfo;
}

export default function CreatorUGCPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ugcCode, setUgcCode] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/auth/login');
        return;
      }

      setCurrentUser(user);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Validate UGC code and get booking info
  const validateCode = async () => {
    if (!ugcCode.trim()) {
      setError('Please enter your UGC code');
      return;
    }

    try {
      setValidating(true);
      setError(null);

      // Find booking by UGC code
      const { data, error: queryError } = await supabase
        .from('bookings')
        .select('id, trip_id, ugc_code, trip:trip_id(id, title, guide_id)')
        .eq('ugc_code', ugcCode.toUpperCase())
        .eq('user_id', currentUser?.id)
        .single();

      if (queryError || !data) {
        setError('Invalid UGC code or booking not found. Please check your booking confirmation email.');
        setBooking(null);
        return;
      }

      setBooking(data as BookingInfo);
    } catch (err) {
      console.error('Validation error:', err);
      setError('An error occurred while validating your code');
    } finally {
      setValidating(false);
    }
  };

  // Extract video ID from TikTok URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w\.]+\/video\/(\d+)/,
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/v\/(\d+)/,
      /(?:https?:\/\/)?vt\.tiktok\.com\/(\w+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Submit UGC video
  const submitUGC = async () => {
    if (!booking) {
      setError('No booking selected');
      return;
    }

    if (!tiktokUrl.trim()) {
      setError('Please enter a TikTok URL');
      return;
    }

    const videoId = extractVideoId(tiktokUrl);
    if (!videoId) {
      setError('Invalid TikTok URL. Please use a full TikTok link.');
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);

      // Submit UGC video
      const response = await fetch('/api/ugc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: booking.trip_id,
          tiktok_url: tiktokUrl,
          tiktok_video_id: videoId,
          ugc_code: booking.ugc_code,
          booking_id: booking.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to submit UGC');
        return;
      }

      setSuccess(true);
      setTiktokUrl('');
      setUgcCode('');
      setBooking(null);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Submission error:', err);
      setError('An error occurred while submitting your UGC');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center pt-20">
        <p className="text-gray-900 dark:text-gray-100 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 pt-20 lg:pt-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-8 inline-block font-medium">
          ← Back to Summit
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">🎬 Post Your Adventure</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Share your TikTok content from your booked trip and earn referral commissions when others book!
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">✅ UGC Submitted!</p>
                <p className="text-green-700 text-sm">The guide will review your content and publish it soon.</p>
              </div>
            </div>
          )}

          {!booking ? (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-900 dark:text-gray-100 font-semibold mb-2">
                  Your UGC Code
                </label>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  Find this code in your booking confirmation email. It proves you booked this trip.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ugcCode}
                    onChange={(e) => setUgcCode(e.target.value.toUpperCase())}
                    placeholder="e.g., TRIP-ABC123-XYZ456"
                    className="flex-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && validateCode()}
                  />
                  <button
                    onClick={validateCode}
                    disabled={validating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition font-medium flex items-center gap-2"
                  >
                    {validating && <Loader className="w-4 h-4 animate-spin" />}
                    {validating ? 'Validating...' : 'Validate'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm">
                  <strong>Don't have a code?</strong> You must have booked and paid for a trip to submit UGC. The code is in your confirmation email.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Booking Confirmed */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-semibold mb-2">✅ Code Verified!</p>
                <p className="text-green-800 text-sm">
                  Booking for <strong>{booking.trip?.title}</strong>
                </p>
              </div>

              {/* TikTok URL Input */}
              <div>
                <label className="block text-gray-900 dark:text-gray-100 font-semibold mb-2">
                  TikTok Video URL
                </label>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  Paste the link to your TikTok video about this adventure.
                </p>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@yourname/video/123456789"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Pricing Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-semibold mb-2">💰 Your Earnings</p>
                <p className="text-blue-800 text-sm">
                  When someone books this trip and mentions they saw your video, you'll earn a commission set by the guide (0.0% - 2.0%).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setBooking(null);
                    setUgcCode('');
                    setError(null);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-lg transition font-medium"
                >
                  Use Different Code
                </button>
                <button
                  onClick={submitUGC}
                  disabled={bookingLoading || !tiktokUrl.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  {bookingLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {bookingLoading ? 'Submitting...' : 'Submit UGC'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">FAQ</h2>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What's a UGC code?</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Your UGC code is a unique identifier generated when you book a trip. It proves you booked and paid for that adventure, allowing you to submit UGC (user-generated content) and earn referral commissions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How much can I earn?</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Each guide sets a referral commission rate (0.0% - 2.0%) for their trips. When someone books using your referral link, you earn that percentage of the booking price.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What kind of content should I post?</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Post authentic TikTok content about your experience on the trip. Highlight the adventure, the guide, the scenery, and your experience. Authentic content performs best!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
