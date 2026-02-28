export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  parseRequestJson,
  validateRequired,
  validateContentType,
  handleError,
  parseNumber,
  validateUUID,
} from '@/lib/api-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    validateContentType(request);
    const {
      amount,
      tripId,
      bookingId,
      guideName,
      tripName,
      userId,
      tripDateId,
      participantCount,
    } = await parseRequestJson(request);

    validateRequired(
      { amount, tripId, bookingId },
      ['amount', 'tripId', 'bookingId']
    );

    validateUUID(tripId, 'tripId');
    validateUUID(bookingId, 'bookingId');
    const validAmount = parseNumber(amount, 'amount', { min: 0.01 });

    // Create payment intent with metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validAmount * 100), // Convert to cents
      currency: 'usd',
      description: `Booking for ${tripName || 'trip'} with ${guideName || 'guide'}`,
      metadata: {
        tripId,
        bookingId,
        userId: userId || '',
        tripDateId: tripDateId || '',
        participantCount: participantCount ? parseNumber(participantCount, 'participantCount', { min: 1 }).toString() : '1',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    return handleError(error);
  }
}
