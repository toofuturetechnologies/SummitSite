/**
 * Add Insurance to Booking
 * POST /api/insurance/create
 * 
 * Adds trip insurance to a booking
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface InsuranceRequest {
  bookingId: string;
  tier: 'basic' | 'plus' | 'premium';
  price: number;
  customerId: string;
}

const TIER_PRICES = {
  basic: 25,
  plus: 45,
  premium: 75,
};

export async function POST(request: NextRequest) {
  try {
    const { bookingId, tier, price, customerId }: InsuranceRequest = await request.json();

    if (!bookingId || !tier || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate tier and price
    if (!['basic', 'plus', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid insurance tier' },
        { status: 400 }
      );
    }

    const expectedPrice = TIER_PRICES[tier as keyof typeof TIER_PRICES];
    if (price !== expectedPrice) {
      return NextResponse.json(
        { error: 'Insurance price mismatch' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if insurance already exists
    const { data: existingInsurance } = await supabase
      .from('trip_insurance')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (existingInsurance) {
      return NextResponse.json(
        { error: 'Insurance already added to this booking' },
        { status: 409 }
      );
    }

    // Create insurance record
    const { data: insurance, error: insuranceError } = await supabase
      .from('trip_insurance')
      .insert({
        booking_id: bookingId,
        customer_id: customerId,
        tier,
        price,
        status: 'pending', // Will be activated when booking is confirmed
        policy_number: `SUM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      })
      .select()
      .single();

    if (insuranceError) {
      console.error('Insurance creation error:', insuranceError);
      return NextResponse.json(
        { error: 'Failed to add insurance' },
        { status: 500 }
      );
    }

    // Update booking with insurance info
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        insurance_tier: tier,
        insurance_price: price,
        total_amount: new Float32Array([]).constructor.prototype.concat.call(
          { length: 0 },
          (await supabase
            .from('bookings')
            .select('total_amount')
            .eq('id', bookingId)
            .single()
          ).data?.total_amount || 0,
          price
        ),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      // Insurance was created but booking wasn't updated - this is OK
    }

    return NextResponse.json({
      success: true,
      insurance: {
        id: insurance.id,
        policy_number: insurance.policy_number,
        tier,
        price,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Insurance creation error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
