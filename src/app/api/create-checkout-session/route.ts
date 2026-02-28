export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  parseRequestJson,
  validateRequired,
  validateContentType,
  handleError,
  parseNumber,
  ApiError,
} from '@/lib/api-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const DOMAIN =
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    validateContentType(request);
    const {
      amount,
      tripId,
      tripName,
      guideName,
      userId,
      tripDateId,
      participantCount,
      referralUserId,
    } = await parseRequestJson(request);

    validateRequired(
      { amount, tripId },
      ['amount', 'tripId']
    );

    // Validate amount is a positive number
    const validAmount = parseNumber(amount, 'amount', { min: 0.01 });
    const validParticipants = participantCount
      ? parseNumber(participantCount, 'participantCount', { min: 1 })
      : 1;

    // Calculate fees (in cents for Stripe)
    // Commission: 12% of amount + $1 hosting fee
    const amountInCents = Math.round(validAmount * 100);
    const commissionInCents = Math.round(validAmount * 100 * 0.12 + 100); // 12% + $1 in cents
    const guidePayoutInCents = amountInCents - commissionInCents;
    const guidePayout = guidePayoutInCents; // Keep in cents for metadata
    const commission = commissionInCents; // Keep in cents for metadata

    if (guidePayoutInCents <= 0) {
      throw new ApiError(
        'Amount too small after commission and fees',
        400,
        'AMOUNT_TOO_SMALL',
        { minAmount: 1.01 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tripName || `Trip ${tripId}`,
              description: `Adventure${guideName ? ` with ${guideName}` : ''}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}/bookings/confirmed?trip=${tripId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/trips/${tripId}`,
      metadata: {
        tripId,
        userId: userId || '',
        tripDateId: tripDateId || '',
        participantCount: validParticipants.toString(),
        commission: commission.toString(),
        guidePayout: guidePayout.toString(),
        referralUserId: referralUserId || '',
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    return handleError(error);
  }
}
