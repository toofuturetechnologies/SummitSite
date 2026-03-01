/**
 * Admin UGC Moderation API
 * GET /api/admin/ugc - List all UGC videos for moderation
 * 
 * Query params:
 *   - page (default: 1)
 *   - limit (default: 50)
 *   - status (pending, published, rejected, removed)
 *   - sort (created_at, reports)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleError, ApiError, parseNumber } from '@/lib/api-utils';

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

export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseNumber(searchParams.get('page') || '1', 'page', { min: 1 });
    const limit = parseNumber(searchParams.get('limit') || '50', 'limit', { min: 1, max: 500 });
    const status = searchParams.get('status') || 'pending';
    const sort = searchParams.get('sort') || 'created_at';

    const offset = (page - 1) * limit;

    // Get UGC videos
    let query = supabase
      .from('ugc_videos')
      .select(`
        id,
        trip_id,
        creator_user_id,
        tiktok_url,
        tiktok_video_id,
        video_status,
        created_at,
        profiles!creator_user_id(name, email),
        trips(id, title, guide_id)
      `, { count: 'exact' });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('video_status', status);
    }

    // Apply sorting
    const sortMap: Record<string, string> = {
      'created_at': 'created_at.desc',
      'oldest': 'created_at.asc',
      'title': 'trips->title.asc',
    };
    const sortBy = sortMap[sort] || 'created_at.desc';
    const [field, direction] = sortBy.split('.');
    query = query.order(field, { ascending: direction === 'asc' });

    // Apply pagination
    const { data: videos, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch UGC videos: ${error.message}`);
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Get report counts for each video
    const videoIds = videos?.map((v: any) => v.id) || [];
    let reportCounts: Record<string, number> = {};

    if (videoIds.length > 0) {
      const { data: reports } = await supabase
        .from('content_reports')
        .select('ugc_id')
        .in('ugc_id', videoIds)
        .eq('status', 'pending');

      reports?.forEach((r: any) => {
        reportCounts[r.ugc_id] = (reportCounts[r.ugc_id] || 0) + 1;
      });
    }

    // Format response
    const formattedVideos = videos?.map((v: any) => ({
      id: v.id,
      trip_id: v.trip_id,
      trip_title: v.trips?.title || 'Unknown',
      creator_name: v.profiles?.name || 'Unknown',
      creator_email: v.profiles?.email,
      tiktok_url: v.tiktok_url,
      tiktok_video_id: v.tiktok_video_id,
      video_status: v.video_status,
      reports_count: reportCounts[v.id] || 0,
      created_at: v.created_at,
    })) || [];

    // Log activity
    try {
      await supabase.rpc('log_admin_activity', {
        p_admin_id: adminId,
        p_action: 'ugc_listed',
        p_target_type: 'ugc',
        p_target_id: adminId,
        p_details: { page, limit, status, total: count },
      });
    } catch (e) {
      console.warn('Failed to log activity:', e);
    }

    return NextResponse.json({
      videos: formattedVideos,
      total: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages,
      pending_count: count || 0,
    });
  } catch (error) {
    return handleError(error);
  }
}
