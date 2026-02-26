#!/usr/bin/env node

/**
 * Simple Referral Test Data Generator
 * Generates test data directly without complex joins
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

async function generateTestData() {
  console.log('🔄 Generating Referral Test Data (Simple Mode)...\n');

  try {
    // Step 1: Get user IDs
    console.log('📋 Step 1: Fetching user IDs...');
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('email', [GUIDE_EMAIL, REFERRER_EMAIL, CUSTOMER_EMAIL]);

    if (profileError || !profiles || profiles.length < 3) {
      console.error('❌ Could not find all required profiles');
      console.log('Found:', profiles?.map(p => p.email) || []);
      return;
    }

    const guideProfile = profiles.find(p => p.email === GUIDE_EMAIL);
    const referrerProfile = profiles.find(p => p.email === REFERRER_EMAIL);
    const customerProfile = profiles.find(p => p.email === CUSTOMER_EMAIL);

    console.log(`✅ Guide: ${guideProfile.full_name}`);
    console.log(`✅ Referrer: ${referrerProfile.full_name}`);
    console.log(`✅ Customer: ${customerProfile.full_name}\n`);

    // Step 2: Get a guide record to find their trips
    console.log('📋 Step 2: Finding guide trips...');
    
    const { data: guides, error: guideError } = await supabase
      .from('guides')
      .select('id, user_id, display_name')
      .eq('user_id', guideProfile.id)
      .limit(1);

    let guideId;
    if (!guides || guides.length === 0) {
      console.log('⚠️  No guide record found for this user');
      console.log('   Creating guide record...');
      
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
      
      guideId = newGuide[0].id;
      console.log(`✅ Created guide record: ${guideId.substring(0, 8)}...\n`);
    } else {
      guideId = guides[0].id;
      console.log(`✅ Found guide: ${guides[0].display_name}\n`);
    }

    // Step 3: Find an active trip
    console.log('📋 Step 3: Finding active trip...');
    
    const { data: trips, error: tripError } = await supabase
      .from('trips')
      .select('id, title, guide_id')
      .eq('guide_id', guideId)
      .eq('is_active', true)
      .limit(1);

    if (tripError || !trips || trips.length === 0) {
      console.error('❌ No active trips found for guide');
      console.log('\nℹ️  Guide needs to create a trip first');
      return;
    }

    const trip = trips[0];
    console.log(`✅ Trip: "${trip.title}"\n`);

    // Step 4: Get available trip dates
    console.log('📋 Step 4: Finding available dates...');
    
    const { data: tripDates, error: dateError } = await supabase
      .from('trip_dates')
      .select('id')
      .eq('trip_id', trip.id)
      .eq('is_available', true)
      .limit(1);

    if (dateError || !tripDates || tripDates.length === 0) {
      console.error('❌ No available trip dates');
      return;
    }

    const tripDate = tripDates[0];
    console.log(`✅ Date available\n`);

    // Step 5: Create booking with referral
    console.log('📋 Step 5: Creating booking with referral...');
    
    const bookingData = {
      trip_id: trip.id,
      trip_date_id: tripDate.id,
      user_id: customerProfile.id,
      guide_id: guideId,
      participant_count: 2,
      total_price: 500.00,
      commission_amount: 60.00,
      hosting_fee: 1.00,
      guide_payout: 439.00,
      status: 'confirmed',
      payment_status: 'paid',
      referral_user_id: referrerProfile.id,
      referral_payout_amount: 7.50,
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();

    if (bookingError) {
      console.error('❌ Error creating booking:', bookingError.message);
      return;
    }

    console.log(`✅ Booking created\n`);

    // Step 6: Create referral earnings
    console.log('📋 Step 6: Creating referral earnings...');
    
    const earningsData = {
      referrer_user_id: referrerProfile.id,
      booking_id: booking[0].id,
      trip_id: trip.id,
      earnings_amount: 7.50,
      status: 'paid',
    };

    const { error: earningsError } = await supabase
      .from('referral_earnings')
      .insert([earningsData])
      .select();

    if (earningsError) {
      console.error('❌ Error creating earnings:', earningsError.message);
      return;
    }

    console.log(`✅ Referral earnings record created\n`);

    // Step 7: Update trip referral settings
    console.log('📋 Step 7: Setting referral payout percent...');
    
    const { error: updateError } = await supabase
      .from('trips')
      .update({ referral_payout_percent: 1.5 })
      .eq('id', trip.id);

    if (updateError) {
      console.error('❌ Error updating trip:', updateError.message);
      return;
    }

    console.log(`✅ Trip configured with 1.5% referral rate\n`);

    // Display results
    console.log('════════════════════════════════════════════');
    console.log('✨ TEST DATA CREATED SUCCESSFULLY\n');
    
    console.log('📊 Booking Details:');
    console.log(`  Booking ID: ${booking[0].id}`);
    console.log(`  Customer: ${customerProfile.full_name}`);
    console.log(`  Referrer: ${referrerProfile.full_name}`);
    console.log(`  Trip: "${trip.title}"`);
    console.log(`  Total Amount: $${bookingData.total_price}`);
    console.log(`  Referral Payout: $${bookingData.referral_payout_amount}`);
    console.log(`  Commission Rate: 1.5%\n`);

    console.log('💰 Referral Earnings:');
    console.log(`  Referrer: ${referrerProfile.full_name}`);
    console.log(`  Earnings: $${earningsData.earnings_amount}`);
    console.log(`  Status: ${earningsData.status}\n`);

    console.log('🧪 To Test:');
    console.log(`  1. Sign in as guide: ${GUIDE_EMAIL}`);
    console.log(`  2. Go to /dashboard/referral-earnings`);
    console.log(`  3. Should see ${referrerProfile.full_name} earned $${earningsData.earnings_amount}`);
    console.log(`  4. Verify calculation: $${bookingData.total_price} × 1.5% = $${earningsData.earnings_amount}\n`);

    console.log('════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\nℹ️  Troubleshooting:');
    console.log('  1. Verify .env.local has Supabase credentials');
    console.log('  2. Verify test accounts exist');
    console.log('  3. Verify guide has trips created');
    process.exit(1);
  }
}

generateTestData();
