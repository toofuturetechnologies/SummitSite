/**
 * Revenue Analytics
 * GET /api/analytics/revenue
 * 
 * Fetches platform revenue analytics for admin dashboard
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get('period') || '30'; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get all bookings in period
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .gte('created_at', daysAgo.toISOString());

    if (bookingsError) {
      throw bookingsError;
    }

    // Calculate revenue metrics
    const totalGMV = bookings?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;
    const totalCommission = bookings?.reduce((sum: number, b: any) => sum + (b.commission_amount || 0), 0) || 0;
    const totalHostingFees = bookings?.filter((b: any) => b.status === 'completed').length || 0; // $1 per completed trip
    const totalRefunds = bookings?.reduce((sum: number, b: any) => sum + (b.refund_amount || 0), 0) || 0;
    const totalBookings = bookings?.length || 0;
    const completedBookings = bookings?.filter((b: any) => b.status === 'completed').length || 0;

    // Revenue breakdown
    const guidePayouts = totalGMV - totalCommission - totalHostingFees;
    const platformRevenue = totalCommission + totalHostingFees;
    const netRevenue = platformRevenue - totalRefunds;

    // Booking stats by status
    const statusBreakdown = {
      pending: bookings?.filter((b: any) => b.status === 'pending').length || 0,
      confirmed: bookings?.filter((b: any) => b.status === 'confirmed').length || 0,
      completed: completedBookings,
      cancelled: bookings?.filter((b: any) => b.status === 'cancelled').length || 0,
    };

    // Top guides
    const guideRevenue: Record<string, number> = {};
    bookings?.forEach((b: any) => {
      guideRevenue[b.guide_id] = (guideRevenue[b.guide_id] || 0) + b.total_amount;
    });

    const topGuides = Object.entries(guideRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([guideId, revenue]) => ({ guideId, revenue }));

    // Daily revenue trend
    const dailyRevenue: Record<string, number> = {};
    bookings?.forEach((b: any) => {
      const date = new Date(b.created_at).toLocaleDateString();
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (b.commission_amount || 0);
    });

    const trend = Object.entries(dailyRevenue)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, revenue]) => ({ date, revenue }));

    return NextResponse.json({
      period: parseInt(period),
      summary: {
        total_gmv: totalGMV,
        total_bookings: totalBookings,
        completed_bookings: completedBookings,
        conversion_rate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      },
      revenue: {
        total_commission: totalCommission,
        hosting_fees: totalHostingFees,
        platform_revenue: platformRevenue,
        guide_payouts: guidePayouts,
        refunds: totalRefunds,
        net_revenue: netRevenue,
        gross_margin: totalGMV > 0 ? (platformRevenue / totalGMV) * 100 : 0,
      },
      bookings: statusBreakdown,
      top_guides: topGuides,
      trend,
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
