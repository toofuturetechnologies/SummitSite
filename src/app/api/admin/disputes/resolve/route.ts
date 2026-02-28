/**
 * Admin Resolve Dispute API
 * POST /api/admin/disputes/[id]/resolve
 * 
 * Body:
 *   - dispute_id: UUID of dispute
 *   - resolution: 'approved' | 'denied'
 *   - refund_amount: (optional, for approved)
 *   - notes: (optional) admin notes
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleError, ApiError, parseRequestJson, validateRequired, validateUUID, parseNumber } from '@/lib/api-utils';

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

    const { dispute_id, resolution, refund_amount, notes } = await parseRequestJson(request);

    validateRequired({ dispute_id, resolution }, ['dispute_id', 'resolution']);
    validateUUID(dispute_id, 'dispute_id');

    if (!['approved', 'denied'].includes(resolution)) {
      throw new ApiError('Resolution must be "approved" or "denied"', 400, 'INVALID_RESOLUTION');
    }

    // Get dispute
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('id, booking_id, initiator_id, status, refund_amount')
      .eq('id', dispute_id)
      .single();

    if (disputeError || !dispute) {
      throw new ApiError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');
    }

    if (dispute.status !== 'open') {
      throw new ApiError('Dispute is already resolved', 400, 'DISPUTE_ALREADY_RESOLVED');
    }

    let finalRefundAmount = 0;
    if (resolution === 'approved') {
      finalRefundAmount = refund_amount ? parseNumber(refund_amount, 'refund_amount', { min: 0 }) : dispute.refund_amount || 0;
    }

    // Update dispute
    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        resolution,
        refund_amount: finalRefundAmount,
        admin_id: adminId,
        admin_notes: notes || null,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', dispute_id);

    if (updateError) {
      throw new Error(`Failed to resolve dispute: ${updateError.message}`);
    }

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_action: 'dispute_resolved',
      p_target_type: 'dispute',
      p_target_id: dispute_id,
      p_details: { resolution, refund_amount: finalRefundAmount },
      p_notes: notes || null,
    }).catch(e => console.warn('Failed to log activity:', e));

    // TODO: If approved, create refund transaction
    // TODO: Send notification to both parties

    return NextResponse.json({
      success: true,
      message: `Dispute ${resolution}`,
      dispute: {
        id: dispute_id,
        status: 'resolved',
        resolution,
        refund_amount: finalRefundAmount,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
