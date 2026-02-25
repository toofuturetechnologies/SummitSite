import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function extractVideoId(url: string): string {
  // Extract video ID from TikTok URL
  // https://www.tiktok.com/@username/video/1234567890 → 1234567890
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : '';
}

function validateTikTokUrl(url: string): boolean {
  return url.includes('tiktok.com') && url.includes('/video/');
}

export async function POST(request: Request) {
  try {
    const { guideId, tripId, tiktokUrl, creatorInfo } = await request.json();

    // Validate inputs
    if (!guideId || !tripId || !tiktokUrl || !creatorInfo) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate TikTok URL format
    if (!validateTikTokUrl(tiktokUrl)) {
      return Response.json(
        { error: 'Invalid TikTok URL. Must be a valid TikTok video link.' },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoId = extractVideoId(tiktokUrl);
    if (!videoId) {
      return Response.json(
        { error: 'Could not extract video ID from TikTok URL' },
        { status: 400 }
      );
    }

    // Check if URL already submitted
    const { data: existing } = await supabase
      .from('ugc_videos')
      .select('id')
      .eq('tiktok_url', tiktokUrl)
      .single();

    if (existing) {
      return Response.json(
        { error: 'This video has already been submitted' },
        { status: 409 }
      );
    }

    // Save to database
    const { data, error } = await supabase
      .from('ugc_videos')
      .insert({
        guide_id: guideId,
        trip_id: tripId,
        tiktok_url: tiktokUrl,
        tiktok_video_id: videoId,
        creator_name: creatorInfo.name,
        creator_handle: creatorInfo.handle,
        creator_followers: creatorInfo.followers || 0,
        payment_amount: creatorInfo.payment || 150,
        video_status: 'pending',
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return Response.json(
        { error: 'Failed to submit video' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Video submitted successfully! Awaiting guide approval.',
      videoId: data[0]?.id,
    });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
