/**
 * Activity Feed Component
 * Shows timeline of activities (like Facebook feed)
 */

'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Loader } from 'lucide-react';

interface Activity {
  id: string;
  type: 'trip_completed' | 'review_posted' | 'guide_milestone' | 'photo_posted' | 'bio_update';
  title: string;
  description: string;
  image?: string;
  createdAt: string;
  likes?: number;
  comments?: number;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  userId: string;
  isGuide?: boolean;
  onlyGuideActivity?: boolean;
}

export default function ActivityFeed({
  userId,
  isGuide,
  onlyGuideActivity,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedActivities, setLikedActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // This would fetch from an API endpoint
      // For now, showing mock data structure
      setActivities([
        {
          id: '1',
          type: 'trip_completed',
          title: 'Completed a mountain adventure',
          description: 'Led an amazing 3-day trek through the Colorado Rockies',
          image: undefined,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 12,
          comments: 3,
        },
        {
          id: '2',
          type: 'review_posted',
          title: 'Received 5-star review',
          description: '"An absolutely incredible guide! Highly recommend to anyone!"',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          likes: 24,
          comments: 2,
        },
      ]);
      setLoading(false);
    } catch (err) {
      setError('Failed to load activities');
      setLoading(false);
    }
  };

  const handleLike = (activityId: string) => {
    setLikedActivities((prev) => {
      const newLikes = new Set(prev);
      if (newLikes.has(activityId)) {
        newLikes.delete(activityId);
      } else {
        newLikes.add(activityId);
      }
      return newLikes;
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'trip_completed':
        return '🏔️';
      case 'review_posted':
        return '⭐';
      case 'guide_milestone':
        return '🎉';
      case 'photo_posted':
        return '📸';
      case 'bio_update':
        return '✏️';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No activities yet</p>
        <p className="text-sm">Activities will appear here as you complete trips and receive reviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Activity Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getActivityIcon(activity.type)}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {activity.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Content */}
          <div className="p-4">
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {activity.description}
            </p>

            {activity.image && (
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-700">
                <img
                  src={activity.image}
                  alt="Activity"
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Activity Stats */}
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-slate-700">
              <span>{activity.likes || 0} likes</span>
              <span>{activity.comments || 0} comments</span>
            </div>
          </div>

          {/* Activity Actions */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 flex gap-2 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => handleLike(activity.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                likedActivities.has(activity.id)
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Heart className={`h-5 w-5 ${likedActivities.has(activity.id) ? 'fill-current' : ''}`} />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <Share2 className="h-5 w-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
