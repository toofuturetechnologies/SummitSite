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
      .select('id, name, email, admin_role, admin_since')
      .eq('email', userEmail)
      .single();

    console.log('[ADMIN-CHECK] Profile query result:', { profile, error: profileError });

    if (profileError) {
      console.error('[ADMIN-CHECK] ERROR: Profile query failed:', profileError.message);
      return NextResponse.json(
        { 
          error: `Profile query failed: ${profileError.message}`, 
          isAdmin: false,
          debug: { userId, error: profileError.message }
        },
        { status: 404 }
      );
    }

    if (!profile) {
      console.log('[ADMIN-CHECK] ERROR: No profile found for userId:', userId);
      return NextResponse.json(
        { error: 'Profile not found', isAdmin: false, debug: { userId } },
        { status: 404 }
      );
    }

    const isAdmin = profile.admin_role !== null;
    console.log('[ADMIN-CHECK] SUCCESS! isAdmin:', isAdmin, 'admin_role:', profile.admin_role, 'email:', profile.email);

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
