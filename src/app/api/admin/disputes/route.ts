/**
 * Admin Disputes API
 * GET /api/admin/disputes - List all disputes
 * 
 * Query params:
 *   - page (default: 1)
 *   - limit (default: 50)
 *   - status (open, in_review, resolved)
 *   - sort (created_at, status)
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
    const status = searchParams.get('status') || 'open';
    const sort = searchParams.get('sort') || 'created_at';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('disputes')
      .select(`
        id,
        booking_id,
        initiator_id,
        reason,
        status,
        resolution,
        refund_amount,
        created_at,
        resolved_at,
        profiles!initiator_id(name, email),
        bookings(id, amount, guide_id)
      `, { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    const sortMap: Record<string, string> = {
      'created_at': 'created_at.desc',
      'oldest': 'created_at.asc',
      'status': 'status.asc',
    };
    const sortBy = sortMap[sort] || 'created_at.desc';
    const [field, direction] = sortBy.split('.');
    query = query.order(field, { ascending: direction === 'asc' });

    // Apply pagination
    const { data: disputes, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch disputes: ${error.message}`);
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Format response
    const formatted = disputes?.map((d: any) => ({
      id: d.id,
      booking_id: d.booking_id,
      initiator_name: d.profiles?.name || 'Unknown',
      initiator_email: d.profiles?.email,
      reason: d.reason,
      status: d.status,
      resolution: d.resolution,
      refund_amount: d.refund_amount,
      booking_amount: d.bookings?.amount,
      created_at: d.created_at,
      resolved_at: d.resolved_at,
    })) || [];

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_action: 'disputes_listed',
      p_target_type: 'disputes',
      p_target_id: adminId,
      p_details: { page, limit, status, total: count },
    }).catch(e => console.warn('Failed to log activity:', e));

    return NextResponse.json({
      disputes: formatted,
      total: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages,
      open_count: count || 0,
    });
  } catch (error) {
    return handleError(error);
  }
}
