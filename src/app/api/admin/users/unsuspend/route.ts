/**
 * Admin Unsuspend User API
 * POST /api/admin/users/unsuspend
 * 
 * Body:
 *   - user_id: UUID of user to unsuspend
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

    const { user_id, notes } = await parseRequestJson(request);

    validateRequired({ user_id }, ['user_id']);
    validateUUID(user_id, 'user_id');

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if user is actually suspended
    const { data: activeSuspension } = await supabase
      .from('suspension_history')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (!activeSuspension) {
      throw new ApiError('User is not currently suspended', 400, 'NOT_SUSPENDED');
    }

    // Lift suspension
    const { error: updateError } = await supabase
      .from('suspension_history')
      .update({
        status: 'lifted',
        lifted_by: adminId,
        lifted_at: new Date().toISOString(),
      })
      .eq('user_id', user_id)
      .eq('status', 'active');

    if (updateError) {
      throw new Error(`Failed to unsuspend user: ${updateError.message}`);
    }

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_action: 'user_unsuspended',
      p_target_type: 'user',
      p_target_id: user_id,
      p_details: null,
      p_notes: notes || null,
    }).catch(e => console.warn('Failed to log activity:', e));

    return NextResponse.json({
      success: true,
      message: 'User suspension lifted',
      user: {
        id: user_id,
        name: user.name,
        email: user.email,
        status: 'active',
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
