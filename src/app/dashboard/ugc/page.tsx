'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Plus } from 'lucide-react';

const supabase = createClient();

interface UGCVideo {
  id: string;
  trip_id: string;
  tiktok_url: string;
  creator_name: string;
  creator_handle: string;
  video_status: 'pending' | 'published' | 'rejected';
  payment_status: string;
  payment_amount: number;
  rejected_reason?: string;
}

interface Trip {
  id: string;
  title: string;
}

export default function UGCManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [videos, setVideos] = useState<UGCVideo[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [addingDemo, setAddingDemo] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          router.push('/auth/login');
          return;
        }

        setUser(authData.user);

        // Get guide ID
        const { data: guideData } = await supabase
          .from('guides')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (!guideData) {
          router.push('/dashboard');
          return;
        }

        setGuideId(guideData.id);

        // Get guide's trips
        const { data: tripsData } = await supabase
          .from('trips')
          .select('id, title')
          .eq('guide_id', guideData.id);

        setTrips(tripsData || []);
        if (tripsData && tripsData.length > 0) {
          setSelectedTrip(tripsData[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  useEffect(() => {
    if (selectedTrip) {
      const loadVideos = async () => {
        const { data: videosData } = await supabase
          .from('ugc_videos')
          .select('*')
          .eq('trip_id', selectedTrip)
          .order('created_at', { ascending: false });

        setVideos(videosData || []);
      };

      loadVideos();
    }
  }, [selectedTrip]);

  const handleApproveVideo = async (videoId: string) => {
    if (!guideId) return;

    try {
      setApproving(videoId);
      const res = await fetch(`/api/ugc/approve/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, action: 'approve' }),
      });

      if (res.ok) {
        setVideos((prevVideos) =>
          prevVideos.map((v) =>
            v.id === videoId ? { ...v, video_status: 'published' } : v
          )
        );
      }
    } finally {
      setApproving(null);
    }
  };

  const handleRejectVideo = async (videoId: string) => {
    if (!guideId) return;

    try {
      setApproving(videoId);
      const res = await fetch(`/api/ugc/approve/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId,
          action: 'reject',
          rejectionReason: 'Rejected by guide',
        }),
      });

      if (res.ok) {
        setVideos((prevVideos) =>
          prevVideos.map((v) =>
            v.id === videoId ? { ...v, video_status: 'rejected' } : v
          )
        );
      }
    } finally {
      setApproving(null);
    }
  };

  const handleAddDemoVideos = async () => {
    if (!guideId || !selectedTrip) return;

    try {
      setAddingDemo(true);
      const res = await fetch(`/api/ugc/demo/${selectedTrip}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Reload videos
        const { data: videosData } = await supabase
          .from('ugc_videos')
          .select('*')
          .eq('trip_id', selectedTrip)
          .order('created_at', { ascending: false });

        setVideos(videosData || []);
        alert(data.message);
      }
    } finally {
      setAddingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20 lg:pt-24 flex items-center justify-center">
        <p className="text-gray-900 font-medium text-lg">Loading UGC management...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20 lg:pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UGC Management</h1>
          <p className="text-gray-600">Manage and approve TikTok videos for your trips</p>
        </div>

        {/* Trip Selector */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <label className="block text-gray-900 font-semibold mb-3">Select Trip</label>
          <div className="flex gap-2 flex-wrap">
            {trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => setSelectedTrip(trip.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedTrip === trip.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {trip.title}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Videos Button */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Testing UGC Widget?</h3>
            <p className="text-sm text-gray-600">Add demo videos to see how it looks on your trip page</p>
          </div>
          <button
            onClick={handleAddDemoVideos}
            disabled={addingDemo || !selectedTrip}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus className="w-4 h-4" />
            {addingDemo ? 'Adding...' : 'Add Demo Videos'}
          </button>
        </div>

        {/* Videos List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {videos.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p className="mb-4">No UGC videos yet for this trip.</p>
              <p className="text-sm mb-4">Click "Add Demo Videos" above to see how the UGC widget works!</p>
              <Link
                href={`/trips/${selectedTrip}`}
                className="inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                View Trip Page →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="p-6 flex items-start justify-between hover:bg-gray-50 transition"
                >
                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <a
                      href={video.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm mb-2 block"
                    >
                      @{video.creator_handle} on TikTok ↗
                    </a>
                    <p className="text-gray-600 text-sm mb-2">{video.creator_name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          video.video_status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : video.video_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {video.video_status.charAt(0).toUpperCase() + video.video_status.slice(1)}
                      </span>
                      {video.payment_status === 'demo' && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Demo
                        </span>
                      )}
                      <span>${video.payment_amount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {video.video_status === 'pending' && video.payment_status !== 'demo' && (
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleApproveVideo(video.id)}
                        disabled={approving === video.id}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg font-medium text-sm transition"
                      >
                        <Check className="w-4 h-4" />
                        {approving === video.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectVideo(video.id)}
                        disabled={approving === video.id}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg font-medium text-sm transition"
                      >
                        <X className="w-4 h-4" />
                        {approving === video.id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  )}
                  {video.video_status === 'published' && (
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        ✓ Live
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">How UGC Works</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Demo videos appear immediately on your trip page</li>
            <li>✓ Real creator videos need your approval before publishing</li>
            <li>✓ Approved videos automatically display on your trip page</li>
            <li>✓ Payment is processed when you approve a video</li>
            <li>✓ Visit your trip page to see the TikTokUGCWidget in action</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
