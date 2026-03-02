/**
 * Admin Utility Functions
 * Helpers for bulk operations, reporting, and data management
 * 
 * These utilities enable admins to perform complex operations efficiently
 */

import { createClient } from '@supabase/supabase-js';

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: { id: string; error: string }[];
}

export interface AdminReport {
  period: string;
  total_users: number;
  new_users: number;
  active_guides: number;
  total_bookings: number;
  total_revenue: number;
  disputes: number;
  reports: number;
  suspended_users: number;
}

/**
 * Bulk suspend users
 * Suspends multiple users with the same reason
 */
export async function bulkSuspendUsers(
  supabase: ReturnType<typeof createClient>,
  userIds: string[],
  reason: string,
  adminId: string,
  expiresAt?: string
): Promise<BulkOperationResult> {
  const errors: { id: string; error: string }[] = [];
  let processed = 0;

  for (const userId of userIds) {
    try {
      const { error } = await supabase.rpc('suspend_user' as any, {
        p_user_id: userId,
        p_reason: reason,
        p_suspended_by: adminId,
        p_expires_at: expiresAt || null,
      } as any);

      if (error) throw error;
      processed++;
    } catch (err) {
      errors.push({
        id: userId,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return {
    success: errors.length === 0,
    processed,
    failed: errors.length,
    errors,
  };
}

/**
 * Bulk unsuspend users
 */
export async function bulkUnsuspendUsers(
  supabase: ReturnType<typeof createClient>,
  userIds: string[],
  adminId: string
): Promise<BulkOperationResult> {
  const errors: { id: string; error: string }[] = [];
  let processed = 0;

  for (const userId of userIds) {
    try {
      const { error } = await supabase.rpc('lift_suspension' as any, {
        p_user_id: userId,
        p_lifted_by: adminId,
        p_notes: 'Bulk unsuspension',
      } as any);

      if (error) throw error;
      processed++;
    } catch (err) {
      errors.push({
        id: userId,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return {
    success: errors.length === 0,
    processed,
    failed: errors.length,
    errors,
  };
}

/**
 * Bulk approve UGC videos
 */
export async function bulkApproveUGC(
  supabase: ReturnType<typeof createClient>,
  videoIds: string[],
  adminId: string
): Promise<BulkOperationResult> {
  const errors: { id: string; error: string }[] = [];
  let processed = 0;

  for (const videoId of videoIds) {
    try {
      const { error } = await supabase
        .from('ugc_videos')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', videoId);

      if (error) throw error;

      // Log activity (optional, ignore errors)
      try {
        await supabase.rpc('log_admin_activity' as any, {
          p_admin_id: adminId,
          p_action: 'ugc_approved',
          p_target_type: 'ugc',
          p_target_id: videoId,
          p_details: { bulk_operation: true },
        } as any);
      } catch {
        // Silently ignore logging errors
      }

      processed++;
    } catch (err) {
      errors.push({
        id: videoId,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return {
    success: errors.length === 0,
    processed,
    failed: errors.length,
    errors,
  };
}

/**
 * Bulk reject UGC videos
 */
export async function bulkRejectUGC(
  supabase: ReturnType<typeof createClient>,
  videoIds: string[],
  reason: string,
  adminId: string
): Promise<BulkOperationResult> {
  const errors: { id: string; error: string }[] = [];
  let processed = 0;

  for (const videoId of videoIds) {
    try {
      const { error } = await supabase
        .from('ugc_videos')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', videoId);

      if (error) throw error;

      // Log activity (optional, ignore errors)
      try {
        await supabase.rpc('log_admin_activity' as any, {
          p_admin_id: adminId,
          p_action: 'ugc_rejected',
          p_target_type: 'ugc',
          p_target_id: videoId,
          p_details: { reason, bulk_operation: true },
        } as any);
      } catch {
        // Silently ignore logging errors
      }

      processed++;
    } catch (err) {
      errors.push({
        id: videoId,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return {
    success: errors.length === 0,
    processed,
    failed: errors.length,
    errors,
  };
}

/**
 * Generate admin report
 */
export async function generateAdminReport(
  supabase: ReturnType<typeof createClient>,
  startDate: string,
  endDate: string
): Promise<AdminReport | null> {
  try {
    const { data, error } = await supabase.rpc('get_admin_report' as any, {
      p_start_date: startDate,
      p_end_date: endDate,
    } as any);

    if (error) throw error;
    return data as AdminReport;
  } catch (err) {
    console.error('Failed to generate report:', err);
    return null;
  }
}

/**
 * Export user data for GDPR compliance
 */
export async function exportUserData(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  try {
    const [profileRes, bookingsRes, reviewsRes, paymentsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('bookings').select('*').eq('user_id', userId),
      supabase.from('guide_reviews').select('*').eq('reviewer_id', userId),
      supabase.from('bookings').select('*').eq('user_id', userId),
    ]);

    return {
      profile: profileRes.data,
      bookings: bookingsRes.data,
      reviews: reviewsRes.data,
      exportDate: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to export user data:', err);
    return null;
  }
}

/**
 * Get top performing guides
 */
export async function getTopGuides(
  supabase: ReturnType<typeof createClient>,
  limit: number = 10
) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        photo_url,
        guide_reviews(count),
        bookings(count),
        trips(count)
      `)
      .eq('is_guide', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to fetch top guides:', err);
    return [];
  }
}

/**
 * Get dispute statistics
 */
export async function getDisputeStats(supabase: ReturnType<typeof createClient>) {
  try {
    const { data: byStatus, error: statusError } = await supabase
      .from('disputes')
      .select('status')
      .then((res: any) => ({
        data: res.data?.reduce((acc: any, d: any) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, {}),
        error: res.error,
      }));

    if (statusError) throw statusError;

    const { data: byResolution, error: resError } = await supabase
      .from('disputes')
      .select('resolution')
      .then((res: any) => ({
        data: res.data?.reduce((acc: any, d: any) => {
          acc[d.resolution || 'pending'] = (acc[d.resolution || 'pending'] || 0) + 1;
          return acc;
        }, {}),
        error: res.error,
      }));

    if (resError) throw resError;

    return {
      byStatus,
      byResolution,
      totalDisputes: Object.values(byStatus || {}).reduce((a: any, b: any) => a + b, 0),
    };
  } catch (err) {
    console.error('Failed to fetch dispute stats:', err);
    return null;
  }
}

/**
 * Get content report statistics
 */
export async function getReportStats(supabase: ReturnType<typeof createClient>) {
  try {
    const { data, error } = await supabase
      .from('content_reports')
      .select('status, reason')
      .then((res: any) => {
        const byStatus: Record<string, number> = {};
        const byReason: Record<string, number> = {};

        res.data?.forEach((d: any) => {
          byStatus[d.status] = (byStatus[d.status] || 0) + 1;
          byReason[d.reason] = (byReason[d.reason] || 0) + 1;
        });

        return {
          data: { byStatus, byReason, total: res.data?.length || 0 },
          error: res.error,
        };
      });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to fetch report stats:', err);
    return null;
  }
}

/**
 * Get revenue breakdown
 */
export async function getRevenueBreakdown(
  supabase: ReturnType<typeof createClient>,
  startDate: string,
  endDate: string
) {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, amount, status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
    const platformCommission = totalRevenue * 0.12; // 12%
    const hostingFees = (bookings?.length || 0) * 1; // $1 per booking
    const guidePayouts = totalRevenue - platformCommission - hostingFees;

    return {
      totalRevenue,
      platformCommission,
      hostingFees,
      guidePayouts,
      bookingCount: bookings?.length || 0,
      averageBookingValue: bookings?.length ? totalRevenue / bookings.length : 0,
    };
  } catch (err) {
    console.error('Failed to fetch revenue breakdown:', err);
    return null;
  }
}

/**
 * Check system health
 */
export async function checkSystemHealth(supabase: ReturnType<typeof createClient>) {
  try {
    const healthChecks = {
      database: { status: 'healthy', latency: 0 },
      auth: { status: 'healthy', latency: 0 },
      storage: { status: 'healthy', latency: 0 },
    };

    // Test database connection
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
    healthChecks.database.latency = Date.now() - dbStart;
    healthChecks.database.status = dbError ? 'unhealthy' : 'healthy';

    // Test auth
    const authStart = Date.now();
    const { error: authError } = await supabase.auth.getUser();
    healthChecks.auth.latency = Date.now() - authStart;
    healthChecks.auth.status = authError ? 'unhealthy' : 'healthy';

    return healthChecks;
  } catch (err) {
    console.error('Health check failed:', err);
    return null;
  }
}
