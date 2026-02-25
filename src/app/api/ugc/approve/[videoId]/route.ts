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

export async function POST(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { guideId, action } = await request.json();

    if (!guideId || !action) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return Response.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get video and verify ownership
    const { data: video, error: fetchError } = await supabase
      .from('ugc_videos')
      .select('id, guide_id, video_status, payment_amount, tiktok_url')
      .eq('id', params.videoId)
      .single();

    if (fetchError || !video) {
      return Response.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.guide_id !== guideId) {
      return Response.json(
        { error: 'Unauthorized - you can only manage your own videos' },
        { status: 403 }
      );
    }

    if (action === 'approve') {
      // Update status to published
      const { error: updateError } = await supabase
        .from('ugc_videos')
        .update({
          video_status: 'published',
          published_at: new Date().toISOString(),
          payment_status: 'pending', // Mark as pending for payment processing
        })
        .eq('id', params.videoId);

      if (updateError) {
        console.error('Update error:', updateError);
        return Response.json(
          { error: 'Failed to approve video' },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        message: 'Video approved and published! Creator will receive payment.',
      });
    } else {
      // Reject video
      const { rejectionReason } = await request.json();

      const { error: updateError } = await supabase
        .from('ugc_videos')
        .update({
          video_status: 'rejected',
          rejected_reason: rejectionReason || 'Not provided',
          payment_status: 'failed',
        })
        .eq('id', params.videoId);

      if (updateError) {
        console.error('Update error:', updateError);
        return Response.json(
          { error: 'Failed to reject video' },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        message: 'Video rejected. Creator has been notified.',
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
