import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  sendBookingConfirmationEmail,
  sendPayoutNotificationEmail,
  sendRefundEmail,
} from '@/lib/emails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  const { tripId, userId, participantCount, tripDateId } = paymentIntent.metadata || {};

  if (!tripId || !userId) {
    console.warn('Missing metadata for payment intent:', paymentIntent.id);
    return;
  }

  try {
    // Fetch trip, guide, and user info
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*, guides(display_name, user_id)')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      console.error('Trip not found:', tripId);
      return;
    }

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userId);
      return;
    }

    const { data: guide, error: guideError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', trip.guides.user_id)
      .single();

    const amount = paymentIntent.amount / 100; // Convert cents to dollars
    const platformCommission = amount * 0.12; // 12%
    const hostingFee = 1; // $1 per trip
    const guidePayout = amount - platformCommission - hostingFee;

    // Create booking with payment confirmation
    const { error: bookingError, data: bookingData } = await supabase
      .from('bookings')
      .insert({
        trip_id: tripId,
        trip_date_id: tripDateId,
        user_id: userId,
        guide_id: trip.id,
        participant_count: parseInt(participantCount || '1'),
        total_price: amount,
        commission_amount: platformCommission,
        hosting_fee: hostingFee,
        guide_payout: guidePayout,
        status: 'confirmed',
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select();

    if (bookingError) {
      console.error('Booking creation failed:', bookingError);
      return;
    }

    console.log('Booking created successfully:', { tripId, userId });

    // Send confirmation emails
    await sendBookingConfirmationEmail(
      user.email,
      trip.title,
      trip.guides.display_name,
      amount,
      new Date().toLocaleDateString()
    );

    if (guide?.email) {
      await sendPayoutNotificationEmail(
        guide.email,
        trip.guides.display_name,
        trip.title,
        guidePayout,
        hostingFee
      );
    }

    // Log payment for analytics
    console.log('Payment processed:', {
      bookingId: bookingData?.[0]?.id,
      amount,
      platformRevenue: platformCommission + hostingFee,
      guidePayout,
    });
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // TODO: Send failure email to customer
  // TODO: Log failed payment for analysis
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id);

  try {
    // Find booking by stripe payment intent ID
    const { data: bookings, error: queryError } = await supabase
      .from('bookings')
      .select('*, trips(title)')
      .eq('stripe_payment_intent_id', charge.payment_intent)
      .limit(1);

    if (queryError || !bookings || bookings.length === 0) {
      console.warn('No booking found for refunded charge:', charge.id);
      return;
    }

    const booking = bookings[0];

    // Update booking status to refunded
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error('Failed to update booking status:', updateError);
      return;
    }

    // Get customer email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', booking.user_id)
      .single();

    if (!userError && user?.email) {
      await sendRefundEmail(user.email, booking.trips.title, booking.total_price);
    }

    console.log('Booking refunded:', booking.id);
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}
