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

const DOMAIN =
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const { guideId, guideName, userEmail } = await request.json();

    if (!guideId || !guideName || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🔗 Creating Stripe Connect account for guide:', guideId);

    // Check if guide already has a connected account
    const { data: existingGuide, error: guideError } = await supabase
      .from('guides')
      .select('stripe_account_id')
      .eq('id', guideId)
      .single();

    if (guideError) {
      console.error('Guide fetch error:', guideError);
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }

    // If already connected, just generate a refresh link
    if (existingGuide?.stripe_account_id) {
      console.log('✅ Guide already has Stripe account:', existingGuide.stripe_account_id);
      
      const link = await stripe.accountLinks.create({
        account: existingGuide.stripe_account_id,
        type: 'account_onboarding',
        refresh_url: `${DOMAIN}/dashboard/stripe-connect?status=refresh`,
        return_url: `${DOMAIN}/dashboard/stripe-connect?status=success`,
      });

      return NextResponse.json({
        onboardingLink: link.url,
        accountId: existingGuide.stripe_account_id,
      });
    }

    // Create new Stripe Connected Account
    const account = await stripe.accounts.create({
      type: 'express',
      email: userEmail,
      settings: {
        payouts: {
          debit_negative_balances: true,
        },
      },
    });

    console.log('✅ Stripe account created:', account.id);

    // Store the account ID in the database
    const { error: updateError } = await supabase
      .from('guides')
      .update({
        stripe_account_id: account.id,
      })
      .eq('id', guideId);

    if (updateError) {
      console.error('Failed to update guide with Stripe account ID:', updateError);
      // Account was created but we couldn't save it - not ideal but continue
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      refresh_url: `${DOMAIN}/dashboard/stripe-connect?status=refresh`,
      return_url: `${DOMAIN}/dashboard/stripe-connect?status=success`,
    });

    console.log('📤 Onboarding link created');

    return NextResponse.json({
      onboardingLink: accountLink.url,
      accountId: account.id,
    });
  } catch (error) {
    console.error('❌ Stripe Connect error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}
