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

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing bookingId' },
        { status: 400 }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, guides(stripe_account_id, stripe_onboarding_complete)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if guide has Stripe Connect set up and onboarding complete
    if (!booking.guides.stripe_account_id || !booking.guides.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'Guide has not completed Stripe onboarding' },
        { status: 400 }
      );
    }

    // Check if payout already created
    if (booking.stripe_transfer_id) {
      return NextResponse.json(
        { message: 'Payout already created', transferId: booking.stripe_transfer_id },
        { status: 200 }
      );
    }

    // Create transfer to connected account
    // Guide payout should already be calculated in booking.guide_payout
    const amountInCents = Math.round(booking.guide_payout * 100);

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: booking.currency || 'usd',
      destination: booking.guides.stripe_account_id,
      metadata: {
        booking_id: bookingId,
        trip_id: booking.trip_id,
      },
    });

    console.log('✅ Transfer created:', transfer.id);

    // Update booking with transfer ID
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        stripe_transfer_id: transfer.id,
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to update booking with transfer ID:', updateError);
    }

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: booking.guide_payout,
    });
  } catch (error) {
    console.error('❌ Payout creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payout' },
      { status: 500 }
    );
  }
}
