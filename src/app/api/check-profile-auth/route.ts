/**
 * Check if profile ID matches auth user ID
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
    // Get auth user with email
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      return NextResponse.json({ error: usersError.message });
    }

    // Find user with email
    const authUser = users.find(u => u.email === 'toofuturetechnologies@proton.me');
    
    if (!authUser) {
      return NextResponse.json({ error: 'Auth user not found' });
    }

    // Get profile with same email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, admin_role')
      .eq('email', 'toofuturetechnologies@proton.me')
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message });
    }

    return NextResponse.json({
      authUserId: authUser.id,
      profileId: profile?.id,
      email: authUser.email,
      adminRole: profile?.admin_role,
      match: authUser.id === profile?.id,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
