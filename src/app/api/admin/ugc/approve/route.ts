/**
 * Admin UGC Approve API
 * POST /api/admin/ugc/[id]/approve
 * 
 * Body:
 *   - video_id: UUID of video to approve
 *   - notes: (optional) admin notes
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleError, ApiError, parseRequestJson, validateRequired, validateUUID } from '@/lib/api-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function requireAdmin(request: NextRequest) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new ApiError('Unauthorized', 401, 'NOT_AUTHENTICATED');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('admin_role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.admin_role) {
    throw new ApiError('Admin access required', 403, 'NOT_ADMIN');
  }

  return user.id;
}

export async function POST(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);

    const { video_id, notes } = await parseRequestJson(request);

    validateRequired({ video_id }, ['video_id']);
    validateUUID(video_id, 'video_id');

    // Get video details
    const { data: video, error: videoError } = await supabase
      .from('ugc_videos')
      .select('id, trip_id, creator_user_id, tiktok_url')
      .eq('id', video_id)
      .single();

    if (videoError || !video) {
      throw new ApiError('Video not found', 404, 'VIDEO_NOT_FOUND');
    }

    // Update video status
    const { error: updateError } = await supabase
      .from('ugc_videos')
      .update({
        video_status: 'published',
        published_at: new Date().toISOString(),
        payment_status: 'pending',
      })
      .eq('id', video_id);

    if (updateError) {
      throw new Error(`Failed to approve video: ${updateError.message}`);
    }

    // Log activity
    try {
      await supabase.rpc('log_admin_activity', {
        p_admin_id: adminId,
        p_action: 'ugc_approved',
        p_target_type: 'ugc',
        p_target_id: video_id,
        p_details: { trip_id: video.trip_id, creator_id: video.creator_user_id },
        p_notes: notes || null,
      });
    } catch (e) {
      console.warn('Failed to log activity:', e);
    }

    // TODO: Send notification to creator
    // await sendNotification(video.creator_user_id, 'Your video was approved!');

    return NextResponse.json({
      success: true,
      message: 'Video approved and published',
      video: {
        id: video_id,
        status: 'published',
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
