export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const DOMAIN =
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      tripId,
      tripName,
      guideName,
      userId,
      tripDateId,
      participantCount,
    } = await request.json();

    if (!amount || !tripId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate fees
    const commission = Math.round(amount * 0.12 + 100); // 12% + $1
    const guidePayout = Math.round(amount * 100) - commission;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tripName,
              description: `Adventure with ${guideName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}/bookings/confirmed?trip=${tripId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/trips/${tripId}`,
      metadata: {
        tripId,
        userId,
        tripDateId,
        participantCount: participantCount?.toString() || '1',
        commission: commission.toString(),
        guidePayout: guidePayout.toString(),
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
