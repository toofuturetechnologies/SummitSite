/**
 * Guide Reviews Dashboard
 * /dashboard/reviews
 * 
 * Allows guides to view their reviews and ratings
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import ReviewsSection from '@/components/ReviewsSection';
import { Star } from 'lucide-react';

const supabase = createClient();

interface Guide {
  id: string;
  display_name: string;
  average_rating?: number;
  total_reviews?: number;
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      setUser(authUser);

      // Get guide info
      const { data: guideData, error: guideError } = await supabase
        .from('guides')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (guideError || !guideData) {
        setError('You are not registered as a guide');
        setLoading(false);
        return;
      }

      setGuide(guideData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No guide found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Your Reviews
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View feedback from your customers and your overall rating
        </p>
      </div>

      {/* Rating Summary Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg border border-amber-200 dark:border-amber-800 p-8">
        <div className="flex items-end gap-4">
          <div>
            <div className="text-6xl font-bold text-amber-600 dark:text-amber-400">
              {guide.average_rating ? guide.average_rating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              out of 5 stars
            </p>
          </div>
          <div className="flex-1">
            {guide.average_rating ? (
              <>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(guide.average_rating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {guide.total_reviews || 0} review{(guide.total_reviews || 0) !== 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <p className="text-amber-800 dark:text-amber-200">
                No reviews yet. Complete your first booking to get started!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Tips for great reviews
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <li>• Be responsive to customer messages before and after the trip</li>
          <li>• Go above and beyond on each trip to exceed expectations</li>
          <li>• Encourage satisfied customers to leave reviews</li>
          <li>• Respond professionally to feedback, even if it's critical</li>
          <li>• Keep your profile up-to-date with photos and trip details</li>
        </ul>
      </div>

      {/* Reviews List */}
      {guide.id && <ReviewsSection guideId={guide.id} guideName={guide.display_name} />}
    </div>
  );
}
