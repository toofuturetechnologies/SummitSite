#!/usr/bin/env node

/**
 * Generate Test Data for Referral System
 * This script creates realistic test data for the referral system
 * Run after all migrations are applied
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

// Test email accounts
const GUIDE_EMAIL = 'alex.mountain@example.com';
const REFERRER_EMAIL = 'jane.traveler@example.com';
const CUSTOMER_EMAIL = 'john.explorer@example.com';

async function generateReferralTestData() {
  console.log('🔄 Generating Referral System Test Data...\n');

  try {
    // Step 1: Get user IDs
    console.log('📋 Step 1: Fetching user IDs...');
    
    const { data: guideProfile, error: guideError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', GUIDE_EMAIL)
      .single();

    if (guideError || !guideProfile) {
      console.error(`❌ Guide not found: ${GUIDE_EMAIL}`);
      return;
    }

    const { data: referrerProfile, error: referrerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', REFERRER_EMAIL)
      .single();

    if (referrerError || !referrerProfile) {
      console.error(`❌ Referrer not found: ${REFERRER_EMAIL}`);
      return;
    }

    const { data: customerProfile, error: customerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', CUSTOMER_EMAIL)
      .single();

    if (customerError || !customerProfile) {
      console.error(`❌ Customer not found: ${CUSTOMER_EMAIL}`);
      return;
    }

    console.log(`✅ Guide ID: ${guideProfile.id.substring(0, 8)}...`);
    console.log(`✅ Referrer ID: ${referrerProfile.id.substring(0, 8)}...`);
    console.log(`✅ Customer ID: ${customerProfile.id.substring(0, 8)}...\n`);

    // Step 2: Get guide record
    console.log('📋 Step 2: Fetching guide record...');
    
    const { data: guide, error: guideInfoError } = await supabase
      .from('guides')
      .select('id')
      .eq('user_id', guideProfile.id)
      .single();

    if (guideInfoError || !guide) {
      console.error('❌ Guide record not found');
      return;
    }

    console.log(`✅ Guide record found: ${guide.id.substring(0, 8)}...\n`);

    // Step 3: Get a trip to use for testing
    console.log('📋 Step 3: Finding a test trip...');
    
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, title')
      .eq('guide_id', guide.id)
      .eq('is_active', true)
      .single();

    if (tripError || !trip) {
      console.error('❌ Active trip not found for guide');
      return;
    }

    console.log(`✅ Trip found: "${trip.title}" (${trip.id.substring(0, 8)}...)\n`);

    // Step 4: Get trip dates
    console.log('📋 Step 4: Finding available trip dates...');
    
    const { data: tripDate, error: tripDateError } = await supabase
      .from('trip_dates')
      .select('id')
      .eq('trip_id', trip.id)
      .eq('is_available', true)
      .single();

    if (tripDateError || !tripDate) {
      console.error('❌ No available trip dates found');
      return;
    }

    console.log(`✅ Trip date found: ${tripDate.id.substring(0, 8)}...\n`);

    // Step 5: Create test booking with referral
    console.log('📋 Step 5: Creating test booking with referral...');
    
    const testBooking = {
      trip_id: trip.id,
      user_id: customerProfile.id,
      guide_id: guide.id,
      trip_date_id: tripDate.id,
      participant_count: 2,
      total_price: 500.00,
      commission_amount: 60.00,
      hosting_fee: 1.00,
      guide_payout: 439.00,
      status: 'confirmed',
      payment_status: 'paid',
      referral_user_id: referrerProfile.id,
      referral_payout_amount: 7.50, // 1.5% of $500
      created_at: new Date().toISOString(),
    };

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert([testBooking])
      .select();

    if (bookingError) {
      console.error(`❌ Error creating booking: ${bookingError.message}`);
      return;
    }

    const booking = bookingData[0];
    console.log(`✅ Booking created: ${booking.id.substring(0, 8)}...\n`);

    // Step 6: Create referral earnings record
    console.log('📋 Step 6: Creating referral earnings record...');
    
    const referralEarnings = {
      referrer_user_id: referrerProfile.id,
      booking_id: booking.id,
      trip_id: trip.id,
      earnings_amount: 7.50,
      status: 'paid',
      created_at: new Date().toISOString(),
    };

    const { error: earningsError } = await supabase
      .from('referral_earnings')
      .insert([referralEarnings])
      .select();

    if (earningsError) {
      console.error(`❌ Error creating referral earnings: ${earningsError.message}`);
      return;
    }

    console.log(`✅ Referral earnings record created\n`);

    // Step 7: Set referral payout percent for the trip
    console.log('📋 Step 7: Updating trip referral settings...');
    
    const { error: tripUpdateError } = await supabase
      .from('trips')
      .update({ referral_payout_percent: 1.5 })
      .eq('id', trip.id);

    if (tripUpdateError) {
      console.error(`❌ Error updating trip: ${tripUpdateError.message}`);
      return;
    }

    console.log(`✅ Trip referral payout set to 1.5%\n`);

    // Step 8: Display summary
    console.log('════════════════════════════════════════════');
    console.log('✨ TEST DATA CREATED SUCCESSFULLY\n');
    
    console.log('📊 Booking Details:');
    console.log(`  ID: ${booking.id}`);
    console.log(`  Customer: ${CUSTOMER_EMAIL}`);
    console.log(`  Referrer: ${REFERRER_EMAIL}`);
    console.log(`  Trip: "${trip.title}"`);
    console.log(`  Amount: $${booking.total_price}`);
    console.log(`  Referral Payout: $${booking.referral_payout_amount}\n`);

    console.log('💰 Referral Earnings:');
    console.log(`  Referrer: ${REFERRER_EMAIL}`);
    console.log(`  Earnings: $${referralEarnings.earnings_amount}`);
    console.log(`  Status: ${referralEarnings.status}`);
    console.log(`  Commission Rate: 1.5%\n`);

    console.log('🧪 What to Test:');
    console.log('  1. Sign in as guide: alex.mountain@example.com');
    console.log('  2. Go to /dashboard/referral-earnings');
    console.log('  3. Should see Jane earned $7.50');
    console.log('  4. Click "View Details" to see booking info');
    console.log('  5. Verify referral payout calculation (1.5% of $500)\n');

    console.log('📈 Additional Test Scenarios:');
    console.log('  - Create more bookings with different referral percentages');
    console.log('  - Test with multiple referrers for same trip');
    console.log('  - Test with 0% and 2% commission rates');
    console.log('  - Run booking flow through checkout to generate codes\n');

    console.log('════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

// Run the script
generateReferralTestData();
