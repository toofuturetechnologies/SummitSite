'use client';

import { useEffect, useState } from 'react';

// Declare TikTok window type
declare global {
  interface Window {
    tiktok?: {
      embed?: {
        lib?: {
          render: (element: HTMLElement) => void;
        };
      };
    };
  }
}

interface TikTokVideo {
  id: string;
  tiktok_url: string;
  tiktok_video_id: string;
  creator_name: string;
  creator_handle: string;
  creator_followers: number;
  engagement_views?: number;
  engagement_likes?: number;
}

function extractVideoId(url: string): string {
  // Extract video ID from TikTok URL
  // https://www.tiktok.com/@username/video/1234567890 → 1234567890
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : '';
}

export default function TikTokUGCWidget({ tripId }: { tripId: string }) {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUGC = async () => {
      try {
        const res = await fetch(`/api/ugc/trip/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
          
          // Reload TikTok's embed script to process new embeds
          if (typeof window !== 'undefined' && window.tiktok?.embed?.lib?.render) {
            window.tiktok.embed.lib.render(document.body);
          }
        }
      } catch (error) {
        console.error('Failed to fetch UGC videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUGC();
  }, [tripId]);

  // Load TikTok embed script (only once per component)
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-2xl p-8 shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 rounded w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 rounded-lg h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-2">What Adventurers Say</h2>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400">Real experiences from real travelers on TikTok</p>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {videos.map((video) => (
          <div key={video.id} className="flex flex-col items-center">
            {/* TikTok Native Embed */}
            <div className="w-full max-w-sm">
              <blockquote
                className="tiktok-embed"
                cite={video.tiktok_url}
                data-unique-id={video.tiktok_video_id}
              >
                <section>
                  <a target="_blank" rel="noopener noreferrer" href={video.tiktok_url}>
                    View on TikTok
                  </a>
                </section>
              </blockquote>
            </div>

            {/* Creator Info Card */}
            <div className="mt-4 w-full bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 dark:border-slate-700 dark:border-slate-700">
              <a
                href={`https://www.tiktok.com/@${video.creator_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition group mb-3"
              >
                {/* Creator Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {video.creator_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 text-sm group-hover:text-blue-600 transition">
                    {video.creator_name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 text-xs">@{video.creator_handle}</p>
                </div>
              </a>

              {/* Follower Count */}
              {video.creator_followers > 0 && (
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 text-xs ml-13">
                  {(video.creator_followers / 1000).toFixed(0)}k followers
                </p>
              )}

              {/* Engagement Stats (optional) */}
              {(video.engagement_views || video.engagement_likes) && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 dark:border-slate-700 text-xs">
                  {video.engagement_views && (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-500">👁</span>
                      <span className="text-gray-700 dark:text-gray-300 dark:text-gray-300 font-medium">
                        {(video.engagement_views / 1000).toFixed(1)}k views
                      </span>
                    </div>
                  )}
                  {video.engagement_likes && (
                    <div className="flex items-center gap-1">
                      <span className="text-red-500">❤</span>
                      <span className="text-gray-700 dark:text-gray-300 dark:text-gray-300 font-medium">
                        {(video.engagement_likes / 1000).toFixed(1)}k likes
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl p-8 text-center border border-blue-200">
        <p className="text-gray-900 dark:text-gray-100 dark:text-gray-100 font-semibold mb-4">Want to be featured?</p>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 text-sm mb-6">
          Share your adventure on TikTok, tag us @SummitAdventures and use #SummitAdventures
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://www.tiktok.com/@summitadventures"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            <span>🎵</span>
            Follow @SummitAdventures
          </a>
          <a
            href="mailto:creators@summitadventures.com"
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 dark:border-slate-600 text-gray-900 dark:text-gray-100 dark:text-gray-100 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900 dark:bg-slate-900 transition"
          >
            <span>💌</span>
            Creator Inquiry
          </a>
        </div>
      </div>
    </div>
  );
}
