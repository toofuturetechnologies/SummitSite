/**
 * Admin UGC Reject API
 * POST /api/admin/ugc/[id]/reject
 * 
 * Body:
 *   - video_id: UUID of video to reject
 *   - reason: reason for rejection
 *   - notes: (optional) admin notes
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleError, ApiError, parseRequestJson, validateRequired, validateUUID, sanitizeString } from '@/lib/api-utils';

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

    const { video_id, reason, notes } = await parseRequestJson(request);

    validateRequired({ video_id, reason }, ['video_id', 'reason']);
    validateUUID(video_id, 'video_id');
    sanitizeString(reason, 500, 'reason');

    // Get video details
    const { data: video, error: videoError } = await supabase
      .from('ugc_videos')
      .select('id, trip_id, creator_user_id, video_status')
      .eq('id', video_id)
      .single();

    if (videoError || !video) {
      throw new ApiError('Video not found', 404, 'VIDEO_NOT_FOUND');
    }

    // Update video status
    const { error: updateError } = await supabase
      .from('ugc_videos')
      .update({
        video_status: 'rejected',
        rejected_reason: reason,
        rejected_at: new Date().toISOString(),
        payment_status: 'failed',
      })
      .eq('id', video_id);

    if (updateError) {
      throw new Error(`Failed to reject video: ${updateError.message}`);
    }

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_action: 'ugc_rejected',
      p_target_type: 'ugc',
      p_target_id: video_id,
      p_details: { reason, trip_id: video.trip_id, creator_id: video.creator_user_id },
      p_notes: notes || null,
    }).catch(e => console.warn('Failed to log activity:', e));

    // TODO: Send notification to creator with reason
    // await sendNotification(video.creator_user_id, `Your video was rejected: ${reason}`);

    return NextResponse.json({
      success: true,
      message: 'Video rejected',
      video: {
        id: video_id,
        status: 'rejected',
        reason,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
