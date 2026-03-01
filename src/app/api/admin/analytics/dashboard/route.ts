/**
 * Admin Analytics Dashboard API
 * GET /api/admin/analytics/dashboard
 * 
 * Returns high-level platform metrics
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleError, ApiError } from '@/lib/api-utils';

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

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active guides (profiles with guide_id in guides table)
    const { count: activeGuides } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true });

    // Get total bookings
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    // Get monthly revenue (this month's commissions)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyBookings, error: monthlyError } = await supabase
      .from('bookings')
      .select('commission_amount')
      .gte('created_at', startOfMonth.toISOString());

    const monthlyRevenue = monthlyBookings?.reduce((sum: number, b) => sum + (b.commission_amount || 0), 0) || 0;

    // Get pending disputes
    const { count: pendingDisputes } = await supabase
      .from('disputes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    // Get pending UGC reviews
    const { count: pendingReviews } = await supabase
      .from('ugc_videos')
      .select('*', { count: 'exact', head: true })
      .eq('video_status', 'pending');

    return NextResponse.json({
      total_users: totalUsers || 0,
      active_guides: activeGuides || 0,
      total_bookings: totalBookings || 0,
      monthly_revenue: monthlyRevenue,
      pending_disputes: pendingDisputes || 0,
      pending_reviews: pendingReviews || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}
