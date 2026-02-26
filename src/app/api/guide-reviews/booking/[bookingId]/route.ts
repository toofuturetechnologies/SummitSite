import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // Get authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify guide
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('id')
      .eq('user_id', authData.user.id)
      .single();

    if (guideError || !guide) {
      return NextResponse.json({ error: 'Only guides can access this' }, { status: 403 });
    }

    // Get booking details with customer and trip info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `id,
         status,
         user_id,
         trip_id,
         participant_count,
         total_price,
         created_at,
         profiles!user_id(id, full_name, email),
         trips!trip_id(id, title, description),
         guide_reviews_of_customers(id, rating, comment, behavior_notes, professionalism_rating)`
      )
      .eq('id', params.bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify guide owns this trip
    if (booking.trips.guide_id !== guide.id) {
      return NextResponse.json({ error: 'You can only review bookings from your own trips' }, { status: 403 });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Can only review completed trips',
        booking,
      }, { status: 400 });
    }

    // Get existing review if it exists
    const existingReview = booking.guide_reviews_of_customers?.[0] || null;

    return NextResponse.json({
      booking,
      existingReview,
      canReview: booking.status === 'completed',
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
