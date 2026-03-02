/**
 * Admin Check API
 * GET /api/admin/check
 * 
 * Verifies if current user is an admin and returns admin role
 * Uses session from cookies (not SERVICE_ROLE_KEY)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { handleError, ApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    // Create server client with cookies from request
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Get authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Admin check: No authenticated user');
      throw new ApiError('Unauthorized', 401, 'NOT_AUTHENTICATED');
    }

    console.log('Admin check: User found:', user.id, user.email);

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, admin_role, admin_since')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('Admin check: Profile error:', profileError);
      throw new ApiError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    if (!profile) {
      console.log('Admin check: No profile found for user:', user.id);
      throw new ApiError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    console.log('Admin check: Profile found, admin_role:', profile.admin_role);

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
    console.error('Admin check error:', error);
    return handleError(error);
  }
}
