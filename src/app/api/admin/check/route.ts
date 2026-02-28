/**
 * Admin Check API
 * GET /api/admin/check
 * 
 * Verifies if current user is an admin and returns admin role
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleError, ApiError } from '@/lib/api-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new ApiError('Unauthorized', 401, 'NOT_AUTHENTICATED');
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, admin_role, admin_since')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new ApiError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    const isAdmin = profile.admin_role !== null;
    const role = profile.admin_role || 'user';

    return NextResponse.json({
      isAdmin,
      role,
      user_id: user.id,
      name: profile.name,
      email: profile.email,
      admin_since: profile.admin_since,
    });
  } catch (error) {
    return handleError(error);
  }
}
