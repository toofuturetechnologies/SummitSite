/**
 * Test Admin Check Endpoint
 * Simple test to verify auth flow
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json({
      test: 'no auth header',
      headers: Array.from(request.headers.entries()).map(([k, v]) => `${k}: ${v.substring(0, 50)}`),
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ test: 'invalid auth header format' });
  }

  const token = authHeader.substring(7);
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    return NextResponse.json({ test: 'invalid jwt parts', parts: parts.length });
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return NextResponse.json({
      test: 'success',
      userId: payload.sub,
      email: payload.email,
      payloadKeys: Object.keys(payload),
    });
  } catch (e) {
    return NextResponse.json({ test: 'decode error', error: String(e) });
  }
}
