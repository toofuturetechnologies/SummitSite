export const dynamic = 'force-dynamic';

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_ACCOUNT || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('📩 Stripe Account Event:', event.type);

  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        
        // Check if account is now charges_enabled (ready to accept payments)
        if (account.charges_enabled) {
          console.log('✅ Account charges enabled:', account.id);

          // Find guide with this Stripe account ID
          const { data: guide, error: guideError } = await supabase
            .from('guides')
            .select('id, user_id')
            .eq('stripe_account_id', account.id)
            .single();

          if (guideError || !guide) {
            console.log('Guide not found for account:', account.id);
            break;
          }

          // Mark onboarding as complete
          const { error: updateError } = await supabase
            .from('guides')
            .update({
              stripe_onboarding_complete: true,
            })
            .eq('id', guide.id);

          if (updateError) {
            console.error('Failed to update guide:', updateError);
          } else {
            console.log('✅ Guide onboarding marked complete:', guide.id);
          }
        }
        break;
      }

      case 'account.external_account.created':
      case 'account.external_account.updated': {
        console.log('💳 External account updated');
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing error' },
      { status: 500 }
    );
  }
}
