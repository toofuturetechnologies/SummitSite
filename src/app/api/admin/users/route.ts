/**
 * Admin Users API
 * GET /api/admin/users - List all users
 * 
 * Query params:
 *   - page (default: 1)
 *   - limit (default: 50)
 *   - search (name/email)
 *   - role (guide, customer, creator)
 *   - status (active, suspended)
 *   - sort (name, joined, earnings)
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
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'created_at';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        profile_type,
        rating,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('profile_type', role);
    }

    // Get suspended users if requested
    let suspended_ids: string[] = [];
    if (status === 'suspended') {
      const { data: suspensions } = await supabase
        .from('suspension_history')
        .select('user_id')
        .eq('status', 'active')
        .not('expires_at', 'lt', new Date().toISOString());
      
      suspended_ids = suspensions?.map(s => s.user_id) || [];
      
      if (suspended_ids.length === 0) {
        return NextResponse.json({
          users: [],
          total: 0,
          page,
          totalPages: 0,
        });
      }
      
      query = query.in('id', suspended_ids);
    } else if (status === 'active') {
      const { data: suspensions } = await supabase
        .from('suspension_history')
        .select('user_id')
        .eq('status', 'active')
        .not('expires_at', 'lt', new Date().toISOString());
      
      suspended_ids = suspensions?.map(s => s.user_id) || [];
      
      if (suspended_ids.length > 0) {
        query = query.not('id', 'in', `(${suspended_ids.join(',')})`);
      }
    }

    // Apply sorting
    const sortMap: Record<string, string> = {
      'name': 'name.asc',
      'joined': 'created_at.desc',
      'earnings': 'rating.desc',
    };

    const sortBy = sortMap[sort] || 'created_at.desc';
    query = query.order(sortBy.split('.')[0], { ascending: sortBy.endsWith('asc') });

    // Apply pagination
    const { data: users, count, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_action: 'users_listed',
      p_target_type: 'users',
      p_target_id: adminId,
      p_details: { page, limit, search, role, status },
    });

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    return handleError(error);
  }
}
