/**
 * Admin Suspend User API
 * POST /api/admin/users/suspend
 * 
 * Body:
 *   - user_id: UUID of user to suspend
 *   - reason: reason for suspension
 *   - expires_at: (optional) when suspension expires (null = permanent)
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

    const { user_id, reason, expires_at, notes } = await parseRequestJson(request);

    validateRequired({ user_id, reason }, ['user_id', 'reason']);
    validateUUID(user_id, 'user_id');

    if (!reason || reason.trim().length === 0) {
      throw new ApiError('Reason cannot be empty', 400, 'EMPTY_REASON');
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if user is already suspended
    const { data: existingSuspension } = await supabase
      .from('suspension_history')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (existingSuspension) {
      throw new ApiError('User is already suspended', 400, 'ALREADY_SUSPENDED');
    }

    // Create suspension record
    const { data: suspension, error: suspensionError } = await supabase
      .from('suspension_history')
      .insert({
        user_id,
        reason,
        suspended_by: adminId,
        expires_at: expires_at || null,
        status: 'active',
      })
      .select()
      .single();

    if (suspensionError) {
      throw new Error(`Failed to suspend user: ${suspensionError.message}`);
    }

    // Log activity
    try {
      await supabase.rpc('log_admin_activity', {
        p_admin_id: adminId,
        p_action: 'user_suspended',
        p_target_type: 'user',
        p_target_id: user_id,
        p_details: { reason, expires_at, permanent: !expires_at },
        p_notes: notes || null,
      });
    } catch (e) {
      console.warn('Failed to log activity:', e);
    }

    return NextResponse.json({
      success: true,
      suspension: {
        id: suspension.id,
        user_id: suspension.user_id,
        reason: suspension.reason,
        suspended_at: suspension.suspended_at,
        expires_at: suspension.expires_at,
        is_permanent: !suspension.expires_at,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
