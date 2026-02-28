/**
 * Admin UGC Moderation Page
 * Review and moderate user-generated content (TikTok videos)
 */

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Video {
  id: string;
  trip_id: string;
  trip_title: string;
  creator_name: string;
  creator_email: string;
  tiktok_url: string;
  tiktok_video_id: string;
  video_status: string;
  reports_count: number;
  created_at: string;
}

const UGCPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/ugc?page=${page}&limit=${limit}&status=${status}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page, status, limit]);

  const totalPages = Math.ceil(total / limit);

  const handleApprove = async (videoId: string) => {
    setActionInProgress(true);
    try {
      const res = await fetch('/api/admin/ugc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: videoId }),
      });

      if (res.ok) {
        alert('Video approved!');
        setSelectedVideo(null);
        setPage(1);
      } else {
        alert('Failed to approve video');
      }
    } catch (error) {
      console.error('Error approving video:', error);
      alert('Error approving video');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (videoId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    setActionInProgress(true);
    try {
      const res = await fetch('/api/admin/ugc/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          reason,
        }),
      });

      if (res.ok) {
        alert('Video rejected');
        setSelectedVideo(null);
        setPage(1);
      } else {
        alert('Failed to reject video');
      }
    } catch (error) {
      console.error('Error rejecting video:', error);
      alert('Error rejecting video');
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
          Content Moderation
        </h1>
        <p className="text-sky-600 dark:text-sky-400">
          Review and approve user-generated TikTok videos
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['pending', 'published', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              status === s
                ? 'bg-sky-600 dark:bg-sky-700 text-white border-sky-600 dark:border-sky-700'
                : 'bg-white dark:bg-slate-800 border-sky-200 dark:border-slate-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({status === s ? total : '?'})
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="text-center p-8 text-sky-600 dark:text-sky-400">
          Loading videos...
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center p-8 text-sky-600 dark:text-sky-400">
          No {status} videos
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-sky-200 to-sky-300 dark:from-sky-900 dark:to-sky-800 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-sky-600 dark:text-sky-300">TikTok Video</p>
                    <p className="text-xs text-sky-500 dark:text-sky-400 mt-1">Click to view</p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="font-medium text-sky-900 dark:text-sky-100 truncate">
                    {video.creator_name}
                  </p>
                  <p className="text-sm text-sky-600 dark:text-sky-400 truncate">
                    {video.trip_title}
                  </p>

                  {/* Status Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded font-medium ${
                        video.video_status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                          : video.video_status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {video.video_status}
                    </span>

                    {video.reports_count > 0 && (
                      <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {video.reports_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded border border-sky-200 dark:border-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sky-700 dark:text-sky-300">
              {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded border border-sky-200 dark:border-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Close */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-sky-900 dark:text-sky-100">
                  Review Video
                </h2>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-sky-400 hover:text-sky-600 dark:hover:text-sky-300"
                >
                  ✕
                </button>
              </div>

              {/* Video Embed */}
              <div className="mb-6 aspect-square bg-gradient-to-br from-sky-200 to-sky-300 dark:from-sky-900 dark:to-sky-800 rounded-lg flex items-center justify-center">
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${selectedVideo.tiktok_video_id}`}
                  width="100%"
                  height="100%"
                  style={{ display: 'flex', borderRadius: '8px' }}
                />
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-sky-600 dark:text-sky-400">Creator</p>
                  <p className="font-medium text-sky-900 dark:text-sky-100">
                    {selectedVideo.creator_name} ({selectedVideo.creator_email})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-sky-600 dark:text-sky-400">Trip</p>
                  <p className="font-medium text-sky-900 dark:text-sky-100">
                    {selectedVideo.trip_title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-sky-600 dark:text-sky-400">Submitted</p>
                  <p className="font-medium text-sky-900 dark:text-sky-100">
                    {new Date(selectedVideo.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedVideo.reports_count > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700 rounded">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {selectedVideo.reports_count} report(s) for this video
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedVideo.video_status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedVideo.id)}
                    disabled={actionInProgress}
                    className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedVideo.id)}
                    disabled={actionInProgress}
                    className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UGCPage;
