-- Test Data for Referral System
-- This script populates test data to thoroughly test the referral system
-- Run this AFTER migration 008 is applied

-- NOTE: This uses the demo accounts from the system
-- Guide: alex.mountain@example.com (guide_id = from guides table)
-- Customer/Referrer: jane.traveler@example.com (user_id = from profiles table)
-- Another Customer: john.explorer@example.com (user_id = from profiles table)

-- TEST SCENARIO 1: Jane books a trip, gets referral code, earns commission
-- Assuming:
-- - jane.traveler@example.com has user_id and has completed a trip
-- - john.explorer@example.com wants to book the same trip
-- - alex.mountain@example.com is the guide

-- First, let's set up referral codes for Jane's previous bookings
-- (These would normally be generated automatically, but we'll create them for testing)

-- Get the guide ID for alex.mountain
-- Get the trip ID and customer IDs
-- This is a template - adjust the UUIDs based on your actual data

-- Test Data - Scenario 1: Referrer Jane has already booked and earned a code
UPDATE bookings 
SET ugc_code = 'TRIP-abc12345-2dn8q5-xyz123'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com')
  AND status = 'completed'
  LIMIT 1;

-- Test Data - Scenario 2: Create a new booking with referral
-- This inserts a booking for john.explorer, referred by jane.traveler
INSERT INTO bookings (
  id,
  trip_id,
  user_id,
  guide_id,
  trip_date_id,
  participant_count,
  total_price,
  commission_amount,
  hosting_fee,
  guide_payout,
  status,
  payment_status,
  referral_user_id,
  referral_payout_amount,
  created_at
)
SELECT
  gen_random_uuid(),
  t.id,
  (SELECT id FROM profiles WHERE email = 'john.explorer@example.com'),
  g.id,
  td.id,
  2,
  500.00,
  60.00,
  1.00,
  439.00,
  'confirmed',
  'paid',
  (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com'),
  7.50,
  NOW()
FROM trips t
JOIN guides g ON t.guide_id = g.id
JOIN trip_dates td ON t.id = td.trip_id
WHERE g.user_id = (SELECT id FROM profiles WHERE email = 'alex.mountain@example.com')
  AND t.is_active = true
  AND td.is_available = true
LIMIT 1;

-- Test Data - Scenario 3: Create referral earnings record
-- This would normally be created by the webhook, but we're creating it manually for testing
INSERT INTO referral_earnings (
  id,
  referrer_user_id,
  booking_id,
  trip_id,
  earnings_amount,
  status,
  created_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com'),
  b.id,
  b.trip_id,
  b.referral_payout_amount,
  'paid',
  NOW()
FROM bookings b
WHERE b.referral_user_id = (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com')
  AND b.referral_payout_amount > 0
  LIMIT 1;

-- Test Data - Scenario 4: Set referral payout percent for trips
-- (This is normally set by guides, but we're creating it for testing)
UPDATE trips
SET referral_payout_percent = 1.5
WHERE guide_id = (SELECT id FROM guides WHERE user_id = (SELECT id FROM profiles WHERE email = 'alex.mountain@example.com'))
LIMIT 1;

-- Verify the test data
SELECT 'Test Data Summary' as section;
SELECT 'Referrer Information' as item,
       email,
       full_name,
       (SELECT COUNT(*) FROM bookings WHERE user_id = profiles.id AND ugc_code IS NOT NULL) as trips_with_ugc_code,
       (SELECT COUNT(*) FROM referral_earnings WHERE referrer_user_id = profiles.id) as referral_earnings_count
FROM profiles 
WHERE email = 'jane.traveler@example.com';

SELECT 'Booking with Referral' as item,
       b.id as booking_id,
       b.total_price,
       b.referral_payout_amount,
       b.status,
       (SELECT full_name FROM profiles WHERE id = b.user_id) as customer_name,
       (SELECT full_name FROM profiles WHERE id = b.referral_user_id) as referrer_name
FROM bookings b
WHERE b.referral_user_id IS NOT NULL
LIMIT 5;

SELECT 'Referral Earnings Records' as item,
       re.id,
       re.earnings_amount,
       re.status,
       (SELECT full_name FROM profiles WHERE id = re.referrer_user_id) as referrer,
       (SELECT title FROM trips WHERE id = re.trip_id) as trip_title
FROM referral_earnings re
LIMIT 5;
