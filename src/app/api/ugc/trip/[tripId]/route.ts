import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { data: videos, error } = await supabase
      .from('ugc_videos')
      .select('id, tiktok_url, tiktok_video_id, creator_name, creator_handle, creator_followers, engagement_views, engagement_likes')
      .eq('trip_id', params.tripId)
      .eq('video_status', 'published')
      .order('published_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching UGC videos:', error);
      return Response.json(
        { error: 'Failed to fetch UGC videos' },
        { status: 500 }
      );
    }

    return Response.json({ videos: videos || [] });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
