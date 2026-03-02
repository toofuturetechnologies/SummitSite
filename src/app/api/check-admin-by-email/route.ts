/**
 * Debug: Check admin status by email (no auth required)
 * GET /api/check-admin-by-email?email=...
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'email parameter required' });
    }

    console.log(`[CHECK-ADMIN] Querying profiles for email: ${email}`);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    console.log(`[CHECK-ADMIN] Query result:`, { profile, error });

    if (error) {
      console.error('[CHECK-ADMIN] Error:', error);
      return NextResponse.json({
        error: error.message,
        email,
      });
    }

    if (!profile) {
      return NextResponse.json({
        error: 'Profile not found',
        email,
      });
    }

    return NextResponse.json({
      email: profile.email,
      admin_role: profile.admin_role,
      isAdmin: profile.admin_role !== null,
      admin_role_type: typeof profile.admin_role,
      admin_role_null: profile.admin_role === null,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
