/**
 * Admin Check API
 * GET /api/admin/check
 * 
 * Verifies if current user is an admin and returns admin role
 * Reads Authorization header with Bearer token
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleError, ApiError } from '@/lib/api-utils';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Get JWT from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Admin check: No Authorization header');
      throw new ApiError('Unauthorized - no auth header', 401, 'NOT_AUTHENTICATED');
    }

    const token = authHeader.substring(7);
    
    // Parse JWT manually (without external library)
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Admin check: Invalid JWT format');
      throw new ApiError('Unauthorized - invalid token', 401, 'INVALID_TOKEN');
    }

    try {
      // Decode the payload (it's base64url encoded)
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      );
      const userId = payload.sub;

      if (!userId) {
        console.log('Admin check: No user id in JWT');
        throw new ApiError('Unauthorized - no user in token', 401, 'NO_USER_IN_TOKEN');
      }

      console.log('Admin check: Extracted userId from JWT:', userId);

      // Query user profile with admin role
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, admin_role, admin_since')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.log('Admin check: Profile not found for user:', userId, profileError);
        throw new ApiError('Profile not found', 404, 'PROFILE_NOT_FOUND');
      }

      console.log('Admin check: Profile found, admin_role:', profile.admin_role, 'email:', profile.email);

      const isAdmin = profile.admin_role !== null;
      const role = profile.admin_role || 'user';

      return NextResponse.json({
        isAdmin,
        role,
        user_id: userId,
        name: profile.name,
        email: profile.email,
        admin_since: profile.admin_since,
      });
    } catch (decodeError) {
      console.error('Admin check: Failed to decode JWT:', decodeError);
      throw new ApiError('Unauthorized - invalid token', 401, 'DECODE_ERROR');
    }
  } catch (error) {
    console.error('Admin check error:', error);
    return handleError(error);
  }
}
