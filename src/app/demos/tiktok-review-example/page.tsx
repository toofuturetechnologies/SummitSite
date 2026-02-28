'use client';

import { useState } from 'react';
import { ReviewFormWithTikTok } from '@/components/ReviewFormWithTikTok';
import { TikTokReviewEmbed } from '@/components/TikTokReviewEmbed';
import Link from 'next/link';

/**
 * Demo page showing TikTok video embedding in customer reviews
 * Showcases how customers can attach TikTok videos to their trip reviews
 */
export default function TikTokReviewDemo() {
  const [submittedReview, setSubmittedReview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (formData: any) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmittedReview(formData);
    setIsSubmitting(false);
  };

  // Example reviews with TikTok videos
  const exampleReviews = [
    {
      id: 1,
      customerName: 'Sarah Chen',
      rating: 5,
      title: 'Best mountaineering experience of my life!',
      comment:
        'Guide was incredibly knowledgeable and made me feel safe the entire time. The views from the summit were breathtaking. Highly recommend!',
      videoId: '7332445024832916747', // Real adventure TikTok
      tiktokUrl: 'https://www.tiktok.com/@adventurech/video/7332445024832916747',
      createdAt: '2024-12-15',
    },
    {
      id: 2,
      customerName: 'Marcus Rodriguez',
      rating: 4,
      title: 'Amazing rock climbing adventure',
      comment:
        'Had a great time learning new techniques. Would have given 5 stars but could have been better organized schedule-wise.',
      videoId: '7331234567890123456',
      tiktokUrl: 'https://www.tiktok.com/@rockclimber/video/7331234567890123456',
      createdAt: '2024-12-10',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/trips"
          className="text-sky-600 dark:text-sky-400 hover:underline mb-8 inline-block"
        >
          ← Back to Trips
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            TikTok Reviews Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            See how customers can attach TikTok videos to their trip reviews and help inspire other adventurers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Write a Review
              </h2>
              <ReviewFormWithTikTok
                tripTitle="Expert Rock Climbing Course"
                onSubmit={handleSubmitReview}
                isSubmitting={isSubmitting}
              />

              {submittedReview && (
                <div className="mt-6 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-4 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    ✅ Review submitted successfully!
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-xs mt-2">
                    Your review with video will be visible to other adventurers and guides.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Example Reviews */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recent Reviews with Videos
              </h2>
              <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                NEW
              </span>
            </div>

            {exampleReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition"
              >
                {/* Review Header */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {review.customerName}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {review.createdAt}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {review.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                {/* TikTok Embed */}
                <div className="bg-gray-50 dark:bg-slate-800 p-6 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                    📱 Video from the adventure:
                  </p>
                  <TikTokReviewEmbed
                    videoId={review.videoId}
                    tiktokUrl={review.tiktokUrl}
                  />
                </div>

                {/* Review Actions */}
                <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 flex gap-4">
                  <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                    👍 Helpful
                  </button>
                  <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                    💬 Reply
                  </button>
                  <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                    🚩 Report
                  </button>
                </div>
              </div>
            ))}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                💡 How TikTok Reviews Work
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>
                  ✅ <strong>Share Your Story:</strong> Customers can attach TikTok videos from their adventure to 
                  their written review
                </li>
                <li>
                  ✅ <strong>Native Embeds:</strong> Videos use TikTok's official embed API, so creators get full 
                  credit and views
                </li>
                <li>
                  ✅ <strong>Inspire Others:</strong> Video reviews have 5-10x higher engagement than text-only 
                  reviews
                </li>
                <li>
                  ✅ <strong>Build Social Proof:</strong> Real user-generated content builds trust with future 
                  adventurers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
