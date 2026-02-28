/**
 * Admin Revenue Analytics API
 * GET /api/admin/analytics/revenue
 * 
 * Query params:
 *   - period (month, quarter, year)
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

    const period = request.nextUrl.searchParams.get('period') || 'month';

    // Determine date range
    const now = new Date();
    let startDate = new Date();

    if (period === 'month') {
      startDate.setDate(1);
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    startDate.setHours(0, 0, 0, 0);

    // Get all bookings in period
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('amount, commission_amount, created_at, payment_status')
      .gte('created_at', startDate.toISOString());

    if (bookingsError) {
      throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
    }

    // Calculate metrics
    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
    const totalCommission = bookings?.reduce((sum, b) => sum + (b.commission_amount || 0), 0) || 0;
    const guidePayouts = totalRevenue - totalCommission;
    const completedBookings = bookings?.filter(b => b.payment_status === 'completed').length || 0;
    const avgBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;

    // Group by date for chart
    const chartData: Record<string, any> = {};
    bookings?.forEach(b => {
      const date = new Date(b.created_at).toLocaleDateString();
      if (!chartData[date]) {
        chartData[date] = { date, revenue: 0, commission: 0, payouts: 0 };
      }
      chartData[date].revenue += b.amount || 0;
      chartData[date].commission += b.commission_amount || 0;
      chartData[date].payouts += (b.amount || 0) - (b.commission_amount || 0);
    });

    const chart = Object.values(chartData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      period,
      metrics: {
        total_revenue: totalRevenue,
        total_commission: totalCommission,
        guide_payouts: guidePayouts,
        completed_bookings: completedBookings,
        avg_booking_value: avgBookingValue,
      },
      chart,
      summary: {
        commission_rate: totalRevenue > 0 ? ((totalCommission / totalRevenue) * 100).toFixed(1) : 0,
        payout_rate: totalRevenue > 0 ? ((guidePayouts / totalRevenue) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
