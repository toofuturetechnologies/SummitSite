/**
 * UGC Referral Settings API
 * 
 * Allows guides to set referral payout percentages (0.0-2.0%) for their trips
 * 
 * GET /api/ugc/referral-settings?tripId={tripId}
 *   - Fetch current settings for a trip
 *   
 * PUT /api/ugc/referral-settings
 *   - Update referral payout percent for a trip
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const tripId = request.nextUrl.searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId parameter required' },
        { status: 400 }
      );
    }

    // Get trip with guide and referral settings
    const { data, error } = await supabase
      .from('trips')
      .select('id, title, referral_payout_percent')
      .eq('id', tripId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      trip_id: data.id,
      title: data.title,
      referral_payout_percent: data.referral_payout_percent || 1.0,
    });
  } catch (error) {
    console.error('Error fetching referral settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { tripId, referralPayoutPercent } = await request.json();

    if (!tripId || referralPayoutPercent === undefined) {
      return NextResponse.json(
        { error: 'tripId and referralPayoutPercent required' },
        { status: 400 }
      );
    }

    // Validate percentage is between 0.0 and 2.0
    const percent = parseFloat(referralPayoutPercent);
    if (isNaN(percent) || percent < 0.0 || percent > 2.0) {
      return NextResponse.json(
        { error: 'Referral payout percent must be between 0.0 and 2.0' },
        { status: 400 }
      );
    }

    // Get current user to verify they own the trip
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is the guide for this trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, guides(user_id)')
      .eq('id', tripId)
      .single();

    if (tripError || !trip || trip.guides?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this trip' },
        { status: 403 }
      );
    }

    // Update the referral payout percent
    const { error: updateError } = await supabase
      .from('trips')
      .update({ referral_payout_percent: percent })
      .eq('id', tripId);

    if (updateError) {
      console.error('Failed to update referral settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trip_id: tripId,
      referral_payout_percent: percent,
    });
  } catch (error) {
    console.error('Error updating referral settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
