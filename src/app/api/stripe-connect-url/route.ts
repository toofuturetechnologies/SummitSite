import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { guideId, userId } = await request.json();

    if (!guideId || !userId) {
      return NextResponse.json(
        { error: 'Missing guideId or userId' },
        { status: 400 }
      );
    }

    // Get current user from auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: `guide-${guideId}@summit.local`,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Store Stripe Connect account ID in guides table
    const { error: updateError } = await supabase
      .from('guides')
      .update({ stripe_connect_account_id: account.id })
      .eq('id', guideId);

    if (updateError) {
      console.error('Failed to save Stripe account ID:', updateError);
      return NextResponse.json(
        { error: 'Failed to link Stripe account' },
        { status: 500 }
      );
    }

    // Create onboarding link
    const link = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe-connect`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe-connect?success=true`,
    });

    return NextResponse.json({
      url: link.url,
      accountId: account.id,
    });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}
