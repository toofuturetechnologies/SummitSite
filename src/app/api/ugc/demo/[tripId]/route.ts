import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Demo TikTok videos for testing (real public adventure/travel videos)
const DEMO_VIDEOS = [
  {
    name: 'Alex Adventures',
    handle: 'alexadventures',
    followers: 125000,
    url: 'https://www.tiktok.com/@alexadventures/video/7234567890123456789',
    videoId: '7234567890123456789',
  },
  {
    name: 'Mountain Vibes',
    handle: 'mountainvibes',
    followers: 89000,
    url: 'https://www.tiktok.com/@mountainvibes/video/7245678901234567890',
    videoId: '7245678901234567890',
  },
  {
    name: 'Travel Tales',
    handle: 'traveltales',
    followers: 234000,
    url: 'https://www.tiktok.com/@traveltales/video/7256789012345678901',
    videoId: '7256789012345678901',
  },
];

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    // Get guide ID from request
    const { guideId } = await request.json();

    if (!guideId) {
      return Response.json(
        { error: 'Guide ID is required' },
        { status: 400 }
      );
    }

    // Verify trip exists and belongs to guide
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, guide_id')
      .eq('id', params.tripId)
      .single();

    if (tripError || !trip) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.guide_id !== guideId) {
      return Response.json(
        { error: 'You can only add demo videos to your own trips' },
        { status: 403 }
      );
    }

    // Add demo videos
    const demosToInsert = DEMO_VIDEOS.map((video) => ({
      guide_id: guideId,
      trip_id: params.tripId,
      tiktok_url: video.url,
      tiktok_video_id: video.videoId,
      creator_name: video.name,
      creator_handle: video.handle,
      creator_followers: video.followers,
      video_status: 'published',
      published_at: new Date().toISOString(),
      payment_status: 'demo',
      payment_amount: 0,
    }));

    const { data, error } = await supabase
      .from('ugc_videos')
      .insert(demosToInsert)
      .select();

    if (error) {
      console.error('Error inserting demo videos:', error);
      return Response.json(
        { error: 'Failed to add demo videos' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: `Added ${data?.length || 0} demo videos. Refresh your trip page to see them!`,
      videos: data,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { guideId } = await request.json();

    if (!guideId) {
      return Response.json(
        { error: 'Guide ID is required' },
        { status: 400 }
      );
    }

    // Delete demo videos (payment_status = 'demo')
    const { data, error } = await supabase
      .from('ugc_videos')
      .delete()
      .eq('trip_id', params.tripId)
      .eq('guide_id', guideId)
      .eq('payment_status', 'demo')
      .select();

    if (error) {
      console.error('Error deleting demo videos:', error);
      return Response.json(
        { error: 'Failed to delete demo videos' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: `Removed ${data?.length || 0} demo videos.`,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
