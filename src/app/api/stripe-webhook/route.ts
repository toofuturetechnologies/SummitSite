import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  sendBookingConfirmationEmail,
  sendPayoutNotificationEmail,
  sendRefundEmail,
  sendPaymentFailedEmail,
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

  // If no signature, this might be a health check or test from Stripe during endpoint creation
  if (!sig) {
    console.warn('No stripe-signature header');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // If webhook secret not configured, log and return 200 (Stripe needs to see success during setup)
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured - webhook cannot verify');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    // Return 400 only after secret is configured
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

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

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Return 200 to acknowledge receipt, log the error for investigation
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  const { tripId, userId, participantCount, tripDateId, commission, guidePayout } =
    session.metadata || {};

  if (!tripId || !userId) {
    console.warn('Missing metadata for checkout session:', session.id);
    return;
  }

  if (!session.payment_status || session.payment_status !== 'paid') {
    console.log('Session not paid yet:', session.id);
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

    const amount = (session.amount_total || 0) / 100; // Convert cents to dollars
    const platformCommission = parseInt(commission || '0') / 100;
    const hostingFee = amount - parseFloat(guidePayout || '0');
    const guidePayoutAmount = parseFloat(guidePayout || '0');

    // Create booking with payment confirmation
    const { error: bookingError, data: bookingData } = await supabase
      .from('bookings')
      .insert({
        trip_id: tripId,
        trip_date_id: tripDateId,
        user_id: userId,
        guide_id: trip.guide_id,
        participant_count: parseInt(participantCount || '1'),
        total_price: amount,
        commission_amount: platformCommission,
        hosting_fee: hostingFee,
        guide_payout: guidePayoutAmount,
        status: 'confirmed',
        payment_status: 'paid',
        stripe_payment_intent_id: session.payment_intent?.toString(),
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
        guidePayoutAmount,
        hostingFee
      );
    }

    // Log payment for analytics
    console.log('Payment processed:', {
      bookingId: bookingData?.[0]?.id,
      amount,
      platformRevenue: platformCommission + hostingFee,
      guidePayout: guidePayoutAmount,
    });
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
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
        guide_id: trip.guide_id,
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

  const { tripId, userId } = paymentIntent.metadata || {};

  if (!tripId || !userId) {
    console.warn('Missing metadata for failed payment intent:', paymentIntent.id);
    return;
  }

  try {
    // Fetch trip and guide info
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*, guides(display_name, user_id)')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      console.error('Trip not found for failed payment:', tripId);
      return;
    }

    // Get customer email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user?.email) {
      console.error('User not found for failed payment:', userId);
      return;
    }

    // Get guide email (optional)
    const { data: guide, error: guideError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', trip.guides.user_id)
      .single();

    // Send failure notifications
    await sendPaymentFailedEmail(
      user.email,
      trip.title,
      guide?.email
    );

    console.log('Payment failed notifications sent:', { tripId, userId });
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
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
