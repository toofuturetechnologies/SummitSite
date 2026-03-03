/**
 * Stripe Connect Authorization
 * POST /api/stripe-connect/authorize
 * 
 * Initiates Stripe Connect onboarding for a guide
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface AuthorizeRequest {
  guideId: string;
  guideName: string;
  email: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { guideId, guideName, email, phone }: AuthorizeRequest = await request.json();

    if (!guideId || !guideName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if guide already has Stripe account
    const { data: guide } = await supabase
      .from('guides')
      .select('stripe_account_id')
      .eq('id', guideId)
      .single();

    if (guide?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Stripe account already connected' },
        { status: 400 }
      );
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: guideName,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/guide/${guideId}`,
      },
      settings: {
        payouts: {
          debit_negative_balances: true,
        },
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe-return?account_id=${account.id}`,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stripe-refresh?account_id=${account.id}`,
    });

    // Save Stripe account ID to database
    await supabase
      .from('guides')
      .update({ stripe_account_id: account.id })
      .eq('id', guideId);

    return NextResponse.json({
      success: true,
      onboarding_url: accountLink.url,
      stripe_account_id: account.id,
    });
  } catch (error) {
    console.error('Stripe Connect authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}
