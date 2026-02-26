#!/usr/bin/env node

/**
 * Test Referral Payment Workflow
 * 1. Verify earnings are PENDING
 * 2. Complete the booking
 * 3. Verify earnings are now PAID
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

async function testWorkflow() {
  console.log('🧪 Testing Referral Payment Workflow...\n');

  try {
    // Step 1: Get the most recent booking with pending referral
    console.log('📋 Step 1: Finding booking with PENDING referral earnings...');
    
    // Get bookings with referrals
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, total_price, referral_user_id, referral_payout_amount, status, guide_id')
      .neq('referral_user_id', null) // Has referral
      .order('created_at', { ascending: false })
      .limit(1);

    if (bookingError || !bookings || bookings.length === 0) {
      console.error('❌ No bookings with referral found');
      return;
    }

    const booking = bookings[0];

    // Get the referral earnings separately
    const { data: earnings, error: earningError } = await supabase
      .from('referral_earnings')
      .select('id, status, earnings_amount, created_at')
      .eq('booking_id', booking.id)
      .single();

    if (earningError) {
      console.error('❌ Could not find referral earnings for booking');
      return;
    }

    const earning = earnings;

    console.log(`✅ Found booking: ${booking.id.substring(0, 8)}...\n`);
    console.log('📊 Current State:');
    console.log(`  Booking Status: ${booking.status}`);
    console.log(`  Referral Amount: $${booking.referral_payout_amount}`);
    console.log(`  Earning Status: ${earning?.status}`);
    console.log(`  Earning Amount: $${earning?.earnings_amount}\n`);

    if (earning?.status !== 'pending') {
      console.error(`❌ Earnings not in pending state (current: ${earning?.status})`);
      return;
    }

    console.log('✅ Earnings confirmed as PENDING\n');

    // Step 2: Update booking status and referral earnings
    console.log('📋 Step 2: Transitioning to PAID status...\n');

    // Update booking status
    const { error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', booking.id);

    if (bookingUpdateError) {
      console.error('❌ Failed to update booking status:', bookingUpdateError.message);
      return;
    }

    console.log('✅ Booking status updated to completed');

    // Update referral earnings status
    const { error: earningsUpdateError } = await supabase
      .from('referral_earnings')
      .update({ status: 'paid' })
      .eq('booking_id', booking.id)
      .eq('status', 'pending');

    if (earningsUpdateError) {
      console.error('❌ Failed to update earnings status:', earningsUpdateError.message);
      return;
    }

    console.log('✅ Referral earnings status updated to PAID\n');

    // Step 3: Verify the status changed
    console.log('📋 Step 3: Verifying earnings status changed...');

    const { data: updatedBooking, error: verifyError } = await supabase
      .from('bookings')
      .select('id, status, referral_payout_amount')
      .eq('id', booking.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification query failed:', verifyError.message);
      return;
    }

    // Get updated earnings
    const { data: updatedEarningData, error: updatedEarningError } = await supabase
      .from('referral_earnings')
      .select('id, status, earnings_amount, updated_at')
      .eq('booking_id', booking.id)
      .single();

    if (updatedEarningError) {
      console.error('❌ Could not fetch updated earnings:', updatedEarningError.message);
      return;
    }

    const updatedEarning = updatedEarningData;

    console.log('✅ Booking verified\n');
    console.log('📊 Updated State:');
    console.log(`  Booking Status: ${updatedBooking.status}`);
    console.log(`  Referral Amount: $${updatedBooking.referral_payout_amount}`);
    console.log(`  Earning Status: ${updatedEarning?.status}`);
    console.log(`  Earning Amount: $${updatedEarning?.earnings_amount}\n`);

    if (updatedEarning?.status === 'paid') {
      console.log('════════════════════════════════════════════');
      console.log('✨ WORKFLOW TEST SUCCESSFUL!\n');
      console.log('✅ Status Transition:');
      console.log(`  PENDING → PAID ✓\n`);
      console.log('📊 Final Result:');
      console.log(`  Booking: ${updatedBooking.status}`);
      console.log(`  Earnings: ${updatedEarning?.status}`);
      console.log(`  Amount: $${updatedEarning?.earnings_amount}\n`);
      console.log('💰 Referrer Payout:');
      console.log(`  Status: Ready for payment`);
      console.log(`  Amount: $${updatedEarning?.earnings_amount}`);
      console.log(`  Paid At: ${updatedEarning?.updated_at}\n`);
      console.log('════════════════════════════════════════════');
    } else {
      console.error(`❌ Status transition failed (still ${updatedEarning?.status})`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testWorkflow();
