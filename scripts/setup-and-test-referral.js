#!/usr/bin/env node

/**
 * Setup and Test Referral System
 * Creates guide, trip, dates, and test referral booking all in one go
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Environment variables not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const GUIDE_EMAIL = 'alex.mountain@example.com';
const REFERRER_EMAIL = 'jane.traveler@example.com';
const CUSTOMER_EMAIL = 'john.explorer@example.com';

async function setupAndTest() {
  console.log('🔄 Setting Up Referral Test Environment...\n');

  try {
    // Step 1: Get profiles
    console.log('📋 Step 1: Fetching profiles...');
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('email', [GUIDE_EMAIL, REFERRER_EMAIL, CUSTOMER_EMAIL]);

    if (profileError || !profiles || profiles.length < 3) {
      console.error('❌ Could not find all required profiles');
      return;
    }

    const guideProfile = profiles.find(p => p.email === GUIDE_EMAIL);
    const referrerProfile = profiles.find(p => p.email === REFERRER_EMAIL);
    const customerProfile = profiles.find(p => p.email === CUSTOMER_EMAIL);

    console.log(`✅ Guide: ${guideProfile.full_name}`);
    console.log(`✅ Referrer: ${referrerProfile.full_name}`);
    console.log(`✅ Customer: ${customerProfile.full_name}\n`);

    // Step 2: Get or create guide record
    console.log('📋 Step 2: Getting/Creating guide record...');
    
    let guide = null;
    const { data: existingGuides } = await supabase
      .from('guides')
      .select('id')
      .eq('user_id', guideProfile.id);

    if (existingGuides && existingGuides.length > 0) {
      guide = existingGuides[0];
      console.log(`✅ Found existing guide: ${guide.id.substring(0, 8)}...\n`);
    } else {
      const { data: newGuide, error: createError } = await supabase
        .from('guides')
        .insert([{
          user_id: guideProfile.id,
          slug: `alex-mountain-${Date.now()}`,
          display_name: guideProfile.full_name,
          rating: 4.9,
          review_count: 10,
          is_verified: true,
          is_active: true,
        }])
        .select();

      if (createError) {
        console.error('❌ Error creating guide:', createError.message);
        return;
      }

      guide = newGuide[0];
      console.log(`✅ Created guide: ${guide.id.substring(0, 8)}...\n`);
    }

    // Step 3: Get or create a trip
    console.log('📋 Step 3: Getting/Creating trip...');
    
    let trip = null;
    const { data: existingTrips } = await supabase
      .from('trips')
      .select('id, title')
      .eq('guide_id', guide.id)
      .eq('is_active', true)
      .limit(1);

    if (existingTrips && existingTrips.length > 0) {
      trip = existingTrips[0];
      console.log(`✅ Found trip: "${trip.title}"\n`);
    } else {
      const { data: newTrip, error: tripError } = await supabase
        .from('trips')
        .insert([{
          guide_id: guide.id,
          slug: `test-trip-${Date.now()}`,
          title: 'Mountain Adventure Test Trip',
          activity: 'hiking',
          difficulty: 'intermediate',
          description: 'Test trip for referral system',
          duration_days: 3,
          price_per_person: 500,
          min_group_size: 1,
          max_group_size: 8,
          country: 'USA',
          region: 'Colorado',
          is_active: true,
          is_instant_book: true,
          referral_payout_percent: 1.5,
        }])
        .select();

      if (tripError) {
        console.error('❌ Error creating trip:', tripError.message);
        return;
      }

      trip = newTrip[0];
      console.log(`✅ Created trip: "${trip.title}"\n`);
    }

    // Step 4: Get or create trip dates
    console.log('📋 Step 4: Getting/Creating trip dates...');
    
    let tripDate = null;
    const { data: existingDates } = await supabase
      .from('trip_dates')
      .select('id')
      .eq('trip_id', trip.id)
      .eq('is_available', true)
      .limit(1);

    if (existingDates && existingDates.length > 0) {
      tripDate = existingDates[0];
      console.log(`✅ Found available date\n`);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endDate = new Date(tomorrow);
      endDate.setDate(endDate.getDate() + 3);

      const { data: newDate, error: dateError } = await supabase
        .from('trip_dates')
        .insert([{
          trip_id: trip.id,
          start_date: tomorrow.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          spots_total: 8,
          spots_available: 8,
          is_available: true,
        }])
        .select();

      if (dateError) {
        console.error('❌ Error creating date:', dateError.message);
        return;
      }

      tripDate = newDate[0];
      console.log(`✅ Created trip dates\n`);
    }

    // Step 5: Create booking with referral
    console.log('📋 Step 5: Creating booking with referral...');
    
    // Generate a UGC code for the booking (max 32 chars)
    const random = Math.random().toString(36).substring(2, 8);
    const ugcCode = `TRIP-${trip.id.substring(0, 8)}-${random}`;
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        trip_id: trip.id,
        trip_date_id: tripDate.id,
        user_id: customerProfile.id,
        guide_id: guide.id,
        participant_count: 2,
        total_price: 500.00,
        commission_amount: 60.00,
        hosting_fee: 1.00,
        guide_payout: 439.00,
        status: 'confirmed',
        payment_status: 'paid',
        referral_user_id: referrerProfile.id,
        referral_payout_amount: 7.50,
        ugc_code: ugcCode,
      }])
      .select();

    if (bookingError) {
      console.error('❌ Error creating booking:', bookingError.message);
      return;
    }

    console.log(`✅ Booking created\n`);

    // Step 6: Create referral earnings
    console.log('📋 Step 6: Creating referral earnings...');
    
    const { error: earningsError } = await supabase
      .from('referral_earnings')
      .insert([{
        referrer_user_id: referrerProfile.id,
        booking_id: booking[0].id,
        trip_id: trip.id,
        earnings_amount: 7.50,
        status: 'paid',
      }]);

    if (earningsError) {
      console.error('❌ Error creating earnings:', earningsError.message);
      return;
    }

    console.log(`✅ Referral earnings created\n`);

    // Success!
    console.log('════════════════════════════════════════════');
    console.log('✨ TEST ENVIRONMENT READY\n');
    
    console.log('📊 Setup Complete:');
    console.log(`  Guide: ${guideProfile.full_name}`);
    console.log(`  Trip: "${trip.title}"`);
    console.log(`  Customer: ${customerProfile.full_name}`);
    console.log(`  Referrer: ${referrerProfile.full_name}\n`);

    console.log('💰 Referral Data:');
    console.log(`  Booking Amount: $500.00`);
    console.log(`  Commission Rate: 1.5%`);
    console.log(`  Referrer Earning: $7.50\n`);

    console.log('🧪 Next Steps:');
    console.log(`  1. Sign in as: ${GUIDE_EMAIL}`);
    console.log(`  2. Go to: /dashboard/referral-earnings`);
    console.log(`  3. Should see: ${referrerProfile.full_name} earned $7.50\n`);

    console.log('════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupAndTest();
