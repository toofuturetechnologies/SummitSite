/**
 * Process Refund
 * POST /api/bookings/refund
 * 
 * Processes a refund for a cancelled booking via Stripe
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface RefundRequest {
  bookingId: string;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, reason }: RefundRequest = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId required' },
        { status: 400 }
      );
    }

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if refund already processed
    if (booking.refund_status === 'completed') {
      return NextResponse.json(
        { error: 'Refund already processed for this booking' },
        { status: 400 }
      );
    }

    // Check if there's an amount to refund
    if (!booking.refund_amount || booking.refund_amount <= 0) {
      return NextResponse.json(
        { error: 'No refund amount for this booking' },
        { status: 400 }
      );
    }

    // Check if we have a payment intent to refund
    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'No payment found to refund' },
        { status: 400 }
      );
    }

    // Create refund in Stripe
    let refund;
    try {
      refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: booking.refund_amount * 100, // Stripe uses cents
        metadata: {
          booking_id: bookingId,
          reason: reason || 'Customer cancellation',
        },
      });

      if (refund.status !== 'succeeded' && refund.status !== 'pending') {
        throw new Error(`Refund failed with status: ${refund.status}`);
      }
    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError);
      return NextResponse.json(
        {
          error: 'Failed to process refund with payment processor',
          details: stripeError instanceof Error ? stripeError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Update booking with refund info
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        refund_status: refund.status === 'succeeded' ? 'completed' : 'pending',
        refund_transaction_id: refund.id,
        refund_processed_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json(
        { error: 'Refund processed but failed to update booking record' },
        { status: 500 }
      );
    }

    // Create refund record in database
    await supabase
      .from('refunds')
      .insert({
        booking_id: bookingId,
        amount: booking.refund_amount,
        stripe_refund_id: refund.id,
        status: refund.status === 'succeeded' ? 'completed' : 'pending',
        reason: reason || 'Customer cancellation',
      });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: booking.refund_amount,
        status: refund.status,
        created: refund.created,
      },
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
