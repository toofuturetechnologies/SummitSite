/**
 * Admin Check API
 * GET /api/admin/check
 * 
 * Verifies if current user is an admin and returns admin role
 * Uses token to create authenticated Supabase client
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
    const authHeader = request.headers.get('authorization');
    console.log('[ADMIN-CHECK] Auth header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[ADMIN-CHECK] ERROR: No valid Authorization header');
      return NextResponse.json(
        { 
          error: 'Unauthorized - no auth header', 
          isAdmin: false,
          debug: { authHeader: authHeader ? 'present but invalid' : 'missing' }
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('[ADMIN-CHECK] Token length:', token.length);

    // Decode JWT manually
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[ADMIN-CHECK] ERROR: Invalid JWT format (expected 3 parts, got', parts.length + ')');
      return NextResponse.json(
        { error: 'Invalid token format', isAdmin: false, debug: { parts: parts.length } },
        { status: 401 }
      );
    }

    let userId: string;
    let userEmail: string;
    let payload: any;
    try {
      payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      );
      userId = payload.sub;
      userEmail = payload.email;
      console.log('[ADMIN-CHECK] Decoded JWT, userId:', userId, 'email:', userEmail);

      if (!userId || !userEmail) {
        console.log('[ADMIN-CHECK] ERROR: Missing sub or email in JWT payload');
        return NextResponse.json(
          { error: 'No user data in token', isAdmin: false, debug: { payload: Object.keys(payload) } },
          { status: 401 }
        );
      }
    } catch (decodeError) {
      console.error('[ADMIN-CHECK] ERROR: Failed to decode JWT:', decodeError);
      return NextResponse.json(
        { error: 'Invalid token', isAdmin: false, debug: { decodeError: String(decodeError) } },
        { status: 401 }
      );
    }

    console.log('[ADMIN-CHECK] Querying profiles table for email:', userEmail);

    // Query by email (more reliable than user ID in case of mismatch)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    console.log('[ADMIN-CHECK] Profile query result:');
    console.log('  - error:', profileError?.message);
    console.log('  - profile exists:', !!profile);
    if (profile) {
      console.log('  - profile.id:', profile.id);
      console.log('  - profile.email:', profile.email);
      console.log('  - profile.admin_role:', profile.admin_role);
      console.log('  - admin_role type:', typeof profile.admin_role);
      console.log('  - admin_role !== null:', profile.admin_role !== null);
    }

    if (profileError) {
      console.error('[ADMIN-CHECK] ERROR: Profile query failed:', profileError.message);
      return NextResponse.json(
        { 
          error: `Profile query failed: ${profileError.message}`, 
          isAdmin: false,
          debug: { userEmail, error: profileError.message }
        },
        { status: 404 }
      );
    }

    if (!profile) {
      console.log('[ADMIN-CHECK] ERROR: No profile found for email:', userEmail);
      return NextResponse.json(
        { error: 'Profile not found', isAdmin: false, debug: { userEmail } },
        { status: 404 }
      );
    }

    const isAdmin = profile.admin_role !== null;
    console.log('[ADMIN-CHECK] FINAL RESULT: isAdmin =', isAdmin, '(admin_role =', profile.admin_role + ')');

    return NextResponse.json({
      isAdmin,
      role: profile.admin_role || 'user',
      user_id: userId,
      profile_id: profile.id,
      name: profile.name,
      email: profile.email,
      admin_since: profile.admin_since,
    });
  } catch (error) {
    console.error('[ADMIN-CHECK] UNEXPECTED ERROR:', error);
    return NextResponse.json(
      { error: 'Server error', isAdmin: false, debug: { error: String(error) } },
      { status: 500 }
    );
  }
}
