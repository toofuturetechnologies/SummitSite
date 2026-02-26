import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export async function POST(request: NextRequest) {
  try {
    const { bookingId, rating, comment, behaviorNotes, professionalismRating } = await request.json();

    // Get authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify guide and get guide info
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('id, user_id')
      .eq('user_id', authData.user.id)
      .single();

    if (guideError || !guide) {
      return NextResponse.json({ error: 'Only guides can leave reviews of customers' }, { status: 403 });
    }

    // Get booking details to verify guide owns the trip and booking is completed
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, trip_id, guide_id, customer_id, status, user_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify guide is the one who led this trip
    if (booking.guide_id !== guide.id) {
      return NextResponse.json({ error: 'You can only review customers from your own trips' }, { status: 403 });
    }

    // Verify booking is completed
    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed trips' }, { status: 400 });
    }

    // Check if review already exists for this booking
    const { data: existingReview } = await supabase
      .from('guide_reviews_of_customers')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (existingReview) {
      // Update existing review
      const { error: updateError } = await supabase
        .from('guide_reviews_of_customers')
        .update({
          rating,
          comment,
          behavior_notes: behaviorNotes,
          professionalism_rating: professionalismRating,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Review updated successfully',
      });
    }

    // Create new review
    const { error: insertError, data: reviewData } = await supabase
      .from('guide_reviews_of_customers')
      .insert({
        booking_id: bookingId,
        guide_id: guide.id,
        customer_id: booking.user_id, // The customer being reviewed
        trip_id: booking.trip_id,
        rating,
        comment,
        behavior_notes: behaviorNotes,
        professionalism_rating: professionalismRating,
      })
      .select();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      review: reviewData?.[0],
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
