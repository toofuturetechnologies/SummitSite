/**
 * Admin Content Reports API
 * GET /api/admin/reports - List content reports
 * 
 * Query params:
 *   - page (default: 1)
 *   - limit (default: 50)
 *   - status (pending, reviewed, resolved)
 *   - type (ugc, trip)
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
    const type = searchParams.get('type');

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('content_reports')
      .select(`
        id,
        ugc_id,
        trip_id,
        reporter_id,
        reason,
        description,
        status,
        action_taken,
        created_at,
        profiles!reporter_id(name, email)
      `, { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (type === 'ugc') {
      query = query.not('ugc_id', 'is', null);
    } else if (type === 'trip') {
      query = query.not('trip_id', 'is', null);
    }

    // Sort by created_at desc
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const { data: reports, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Format response
    const formatted = reports?.map((r: any) => ({
      id: r.id,
      ugc_id: r.ugc_id,
      trip_id: r.trip_id,
      content_type: r.ugc_id ? 'ugc' : 'trip',
      reporter_name: r.profiles?.name || 'Unknown',
      reporter_email: r.profiles?.email,
      reason: r.reason,
      description: r.description,
      status: r.status,
      action_taken: r.action_taken,
      created_at: r.created_at,
    })) || [];

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_action: 'reports_listed',
      p_target_type: 'reports',
      p_target_id: adminId,
      p_details: { page, limit, status, total: count },
    }).catch(e => console.warn('Failed to log activity:', e));

    return NextResponse.json({
      reports: formatted,
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
