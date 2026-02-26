import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const tripId = searchParams.get('tripId');
    const currentUserId = searchParams.get('currentUserId');

    if (!handle || !tripId) {
      return NextResponse.json(
        { error: 'handle and tripId required' },
        { status: 400 }
      );
    }

    // Validate handle format
    if (!handle.startsWith('@')) {
      return NextResponse.json(
        { error: 'Handle must start with @' },
        { status: 400 }
      );
    }

    // Prevent self-referral
    if (currentUserId) {
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUserId)
        .single();

      if (currentUser) {
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('handle', handle)
          .single();

        if (referrerProfile?.id === currentUserId) {
          return NextResponse.json(
            { error: 'Cannot refer yourself' },
            { status: 400 }
          );
        }
      }
    }

    // CRITICAL: Validate referrer eligibility
    // 1. Find user by handle
    const { data: referrerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, handle')
      .eq('handle', handle)
      .single();

    if (profileError || !referrerProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 2. Verify referrer has COMPLETED a trip (booking status = 'completed')
    const { data: completedTrips, error: tripsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', referrerProfile.id)
      .eq('trip_id', tripId)
      .eq('status', 'completed')
      .limit(1);

    if (tripsError || !completedTrips || completedTrips.length === 0) {
      return NextResponse.json(
        {
          error: 'Referrer has not completed this trip',
          details: 'To refer someone to this trip, you must have booked and completed it first.',
        },
        { status: 403 }
      );
    }

    // 3. Verify referrer has UGC_CODE for this trip
    // UGC code proves the trip was completed and guide was paid
    const { data: ugcBooking, error: ugcError } = await supabase
      .from('bookings')
      .select('id, ugc_code')
      .eq('user_id', referrerProfile.id)
      .eq('trip_id', tripId)
      .eq('status', 'completed')
      .not('ugc_code', 'is', null) // Must have ugc_code
      .single();

    if (ugcError || !ugcBooking || !ugcBooking.ugc_code) {
      return NextResponse.json(
        {
          error: 'Referrer has not received completion ID for this trip',
          details: 'The referrer must have a completion ID (UGC code) for this trip to refer others.',
        },
        { status: 403 }
      );
    }

    // SUCCESS: Referrer is eligible
    return NextResponse.json({
      success: true,
      referrer: {
        id: referrerProfile.id,
        name: referrerProfile.full_name,
        handle: referrerProfile.handle,
      },
      verification: {
        tripCompleted: true,
        ugcCodeExists: true,
        ugcCode: ugcBooking.ugc_code, // Return the UGC code to link bookings
      },
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
