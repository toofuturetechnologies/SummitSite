/**
 * Cancel Booking
 * POST /api/bookings/cancel
 * 
 * Cancels a booking and initiates refund process
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface CancelRequest {
  bookingId: string;
  userId: string;
  reason: string;
  isGuide: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, userId, reason, isGuide }: CancelRequest = await request.json();

    if (!bookingId || !userId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (reason.length < 5 || reason.length > 500) {
      return NextResponse.json(
        { error: 'Reason must be between 5 and 500 characters' },
        { status: 400 }
      );
    }

    // Get booking details
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

    // Check authorization
    if (booking.customer_id !== userId && booking.guide_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this booking' },
        { status: 403 }
      );
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    // Check if trip date has passed
    const tripDate = new Date(booking.trip_date);
    if (tripDate < new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel trips that have already occurred' },
        { status: 400 }
      );
    }

    // Calculate refund based on cancellation policy
    const daysUntilTrip = Math.ceil((tripDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    let refundPercentage = 0;

    if (daysUntilTrip > 7) {
      refundPercentage = 100; // Full refund
    } else if (daysUntilTrip > 3) {
      refundPercentage = 50; // 50% refund
    } else if (daysUntilTrip > 0) {
      refundPercentage = 0; // No refund
    }

    const refundAmount = Math.round((booking.total_amount * refundPercentage) / 100);

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        cancelled_by: isGuide ? 'guide' : 'customer',
        refund_amount: refundAmount,
        refund_status: refundAmount > 0 ? 'pending' : 'none',
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }

    // Create cancellation record
    const { data: cancellation } = await supabase
      .from('cancellations')
      .insert({
        booking_id: bookingId,
        initiated_by: isGuide ? 'guide' : 'customer',
        reason,
        refund_amount: refundAmount,
        refund_percentage: refundPercentage,
        days_until_trip: daysUntilTrip,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        status: 'cancelled',
        refund_amount: refundAmount,
        refund_percentage: refundPercentage,
        refund_status: refundAmount > 0 ? 'pending' : 'none',
      },
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
