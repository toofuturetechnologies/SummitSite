/**
 * UGC Submit API - Creator Flow
 *
 * POST /api/ugc/submit
 * Validates UGC code and creates UGC submission record
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const {
      trip_id,
      tiktok_url,
      tiktok_video_id,
      ugc_code,
      booking_id,
    } = await request.json();

    // Validate required fields
    if (!trip_id || !tiktok_url || !tiktok_video_id || !ugc_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate UGC code
    console.log(`🔍 Validating UGC code: ${ugc_code} for trip: ${trip_id}`);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, user_id, trip_id, status')
      .eq('ugc_code', ugc_code)
      .eq('trip_id', trip_id)
      .single();

    if (bookingError || !booking) {
      console.warn('❌ Invalid UGC code or trip mismatch');
      return NextResponse.json(
        { error: 'Invalid UGC code for this trip' },
        { status: 400 }
      );
    }

    // Verify user owns the booking
    if (booking.user_id !== user.id) {
      console.warn('❌ User does not own this booking');
      return NextResponse.json(
        { error: 'You do not own this booking' },
        { status: 403 }
      );
    }

    // Get trip info (for guide_id)
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, guide_id')
      .eq('id', trip_id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Check if UGC already exists for this code
    const { data: existingUGC, error: checkError } = await supabase
      .from('ugc_videos')
      .select('id')
      .eq('ugc_code', ugc_code)
      .eq('trip_id', trip_id)
      .single();

    if (existingUGC) {
      return NextResponse.json(
        { error: 'UGC already submitted for this booking' },
        { status: 400 }
      );
    }

    // Create UGC video record
    console.log(`✅ Creating UGC record for user: ${user.id}, trip: ${trip_id}`);

    const { data: ugcData, error: ugcError } = await supabase
      .from('ugc_videos')
      .insert({
        trip_id,
        guide_id: trip.guide_id,
        creator_user_id: user.id,
        booking_id: booking.id,
        ugc_code: ugc_code,
        tiktok_url,
        tiktok_video_id,
        video_status: 'pending', // Awaiting guide approval
        payment_status: 'unpaid',
      })
      .select();

    if (ugcError) {
      console.error('❌ Failed to create UGC record:', ugcError);
      return NextResponse.json(
        { error: 'Failed to create UGC record' },
        { status: 500 }
      );
    }

    console.log('✅ UGC submitted successfully:', ugcData?.[0]?.id);

    return NextResponse.json({
      success: true,
      ugc_id: ugcData?.[0]?.id,
      message: 'UGC submitted successfully. The guide will review your content soon.',
    });
  } catch (error) {
    console.error('Error submitting UGC:', error);
    return NextResponse.json(
      { error: 'Failed to submit UGC' },
      { status: 500 }
    );
  }
}
