import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import Stripe from 'stripe';

const supabase = createClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    // Get authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, guide_id, status, referral_user_id, referral_payout_amount')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify guide owns this booking
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('user_id')
      .eq('id', booking.guide_id)
      .single();

    if (guideError || guide?.user_id !== authData.user.id) {
      return NextResponse.json(
        { error: 'Only the guide can complete trips' },
        { status: 403 }
      );
    }

    // Update booking status to completed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to complete booking' },
        { status: 500 }
      );
    }

    // Mark referral earnings as PAID (trip completed + guide paid)
    if (booking.referral_user_id) {
      const { error: earningsError } = await supabase
        .from('referral_earnings')
        .update({ status: 'paid' })
        .eq('booking_id', bookingId)
        .eq('status', 'pending'); // Only update if still pending

      if (earningsError) {
        console.warn('⚠️ Warning: Could not update referral earnings:', earningsError);
        // Don't fail the entire operation if this fails
      } else {
        console.log('✅ Referral earnings marked as paid for booking:', bookingId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Trip completed successfully',
      booking: {
        id: bookingId,
        status: 'completed',
        referralPaid: booking.referral_user_id ? true : false,
      },
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
