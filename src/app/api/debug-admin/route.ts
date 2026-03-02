/**
 * Debug Admin Check
 * GET /api/debug-admin
 * 
 * Logs everything about the admin check for debugging
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  const logs: any[] = [];

  try {
    logs.push('=== DEBUG ADMIN CHECK ===');

    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    logs.push(`Auth header present: ${!!authHeader}`);
    if (authHeader) {
      logs.push(`Auth header value: ${authHeader.substring(0, 50)}...`);
    }

    if (!authHeader?.startsWith('Bearer ')) {
      logs.push('ERROR: No valid Authorization header');
      return NextResponse.json({ logs, error: 'No auth header' });
    }

    const token = authHeader.substring(7);
    logs.push(`Token length: ${token.length}`);

    // Decode JWT
    const parts = token.split('.');
    logs.push(`JWT parts: ${parts.length}`);

    if (parts.length !== 3) {
      logs.push('ERROR: Invalid JWT format');
      return NextResponse.json({ logs, error: 'Invalid JWT format' });
    }

    let userId: string;
    let payload: any;
    try {
      payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
      userId = payload.sub;
      logs.push(`Decoded JWT - userId: ${userId}`);
      logs.push(`Payload keys: ${Object.keys(payload).join(', ')}`);
    } catch (e) {
      logs.push(`ERROR decoding JWT: ${e}`);
      return NextResponse.json({ logs, error: 'JWT decode error' });
    }

    if (!userId) {
      logs.push('ERROR: No sub in JWT');
      return NextResponse.json({ logs, error: 'No user in JWT' });
    }

    // Try to query the profile
    logs.push(`Querying profiles where id = '${userId}'...`);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      logs.push(`ERROR querying profile: ${profileError.message}`);
      logs.push(`Error details: ${JSON.stringify(profileError)}`);
      return NextResponse.json({ logs, error: profileError.message });
    }

    logs.push(`Profile found: ${!!profile}`);
    if (profile) {
      logs.push(`Profile id: ${profile.id}`);
      logs.push(`Profile email: ${profile.email}`);
      logs.push(`Profile admin_role: ${profile.admin_role}`);
      logs.push(`Admin role is null: ${profile.admin_role === null}`);
      logs.push(`Admin role type: ${typeof profile.admin_role}`);
    }

    return NextResponse.json({
      logs,
      userId,
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        admin_role: profile.admin_role,
      } : null,
    });
  } catch (error) {
    logs.push(`UNEXPECTED ERROR: ${error}`);
    return NextResponse.json({ logs, error: String(error) });
  }
}
