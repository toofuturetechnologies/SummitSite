import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Get the auth header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);

    // Try to get user from session
    const { data: { user }, error } = await supabase.auth.admin.getUserById(
      request.headers.get('user-id') || ''
    );

    return NextResponse.json({
      status: 'ok',
      hasAuthHeader: !!authHeader,
      user: user ? { id: user.id, email: user.email } : null,
      error: error ? error.message : null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
