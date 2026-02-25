export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    stripeKey: !!process.env.STRIPE_SECRET_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  const allGood = Object.entries(checks)
    .filter(([key]) => key !== 'timestamp' && key !== 'nodeEnv')
    .every(([, value]) => value === true);

  return NextResponse.json(
    {
      status: allGood ? 'healthy' : 'degraded',
      checks,
      message: allGood ? 'All systems operational' : 'Some services misconfigured',
    },
    { status: allGood ? 200 : 503 }
  );
}
