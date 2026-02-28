/**
 * Admin Report Resolution API
 * POST /api/admin/reports/[id]/resolve
 * 
 * Body:
 *   - report_id: UUID of report
 *   - action: 'none' | 'warning' | 'remove_content' | 'suspend_user'
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

    const { report_id, action, notes } = await parseRequestJson(request);

    validateRequired({ report_id, action }, ['report_id', 'action']);
    validateUUID(report_id, 'report_id');

    const validActions = ['none', 'warning', 'remove_content', 'suspend_user'];
    if (!validActions.includes(action)) {
      throw new ApiError(`Action must be one of: ${validActions.join(', ')}`, 400, 'INVALID_ACTION');
    }

    // Get report
    const { data: report, error: reportError } = await supabase
      .from('content_reports')
      .select('id, ugc_id, trip_id, status')
      .eq('id', report_id)
      .single();

    if (reportError || !report) {
      throw new ApiError('Report not found', 404, 'REPORT_NOT_FOUND');
    }

    // Update report status
    const { error: updateError } = await supabase
      .from('content_reports')
      .update({
        status: 'resolved',
        action_taken: action,
        moderator_id: adminId,
        moderator_notes: notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', report_id);

    if (updateError) {
      throw new Error(`Failed to resolve report: ${updateError.message}`);
    }

    // If action is remove_content, update the content
    if (action === 'remove_content') {
      if (report.ugc_id) {
        await supabase
          .from('ugc_videos')
          .update({ video_status: 'removed' })
          .eq('id', report.ugc_id);
      } else if (report.trip_id) {
        await supabase
          .from('trips')
          .update({ status: 'removed' })
          .eq('id', report.trip_id);
      }
    }

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_action: 'report_resolved',
      p_target_type: 'report',
      p_target_id: report_id,
      p_details: { action, content_type: report.ugc_id ? 'ugc' : 'trip' },
      p_notes: notes || null,
    }).catch(e => console.warn('Failed to log activity:', e));

    return NextResponse.json({
      success: true,
      message: `Report resolved: ${action}`,
      report: {
        id: report_id,
        status: 'resolved',
        action_taken: action,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
