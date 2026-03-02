/**
 * Get Payout History
 * GET /api/payouts/history?guideId=...
 * 
 * Fetches payout history for a guide from Stripe
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const guideId = request.nextUrl.searchParams.get('guideId');
    const limit = request.nextUrl.searchParams.get('limit') || '20';

    if (!guideId) {
      return NextResponse.json(
        { error: 'guideId parameter required' },
        { status: 400 }
      );
    }

    // Get guide's Stripe account ID
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('stripe_account_id')
      .eq('id', guideId)
      .single();

    if (guideError || !guide?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Stripe account not connected' },
        { status: 404 }
      );
    }

    // Fetch payouts from Stripe
    const payouts = await stripe.payouts.list(
      { limit: parseInt(limit) },
      { stripeAccount: guide.stripe_account_id }
    );

    // Fetch balance
    const balance = await stripe.balance.retrieve(
      {},
      { stripeAccount: guide.stripe_account_id }
    );

    // Calculate totals
    const totalPaidOut = payouts.data
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = balance.pending.reduce((sum, b) => sum + b.amount, 0);
    const totalAvailable = balance.available.reduce((sum, b) => sum + b.amount, 0);

    return NextResponse.json({
      payouts: payouts.data.map((p) => ({
        id: p.id,
        amount: p.amount / 100, // Convert from cents
        currency: p.currency.toUpperCase(),
        status: p.status,
        arrival_date: p.arrival_date,
        created: p.created,
        type: p.type,
      })),
      balance: {
        available: totalAvailable / 100,
        pending: totalPending / 100,
        total_paid_out: totalPaidOut / 100,
      },
      has_more: payouts.has_more,
    });
  } catch (error) {
    console.error('Payout history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout history' },
      { status: 500 }
    );
  }
}
