# Referral System - Quick Test Scenarios

Copy/paste these SQL snippets into Supabase SQL Editor to test specific scenarios.

---

## Scenario 1: Basic Referral ($500 booking, 1.5% commission)

```sql
-- Get user IDs
WITH users AS (
  SELECT 
    (SELECT id FROM profiles WHERE email = 'alex.mountain@example.com') as guide_id,
    (SELECT id FROM guides WHERE user_id = (SELECT id FROM profiles WHERE email = 'alex.mountain@example.com')) as guide_record_id,
    (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com') as referrer_id,
    (SELECT id FROM profiles WHERE email = 'john.explorer@example.com') as customer_id
)
INSERT INTO bookings (
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
  t.id,
  users.customer_id,
  users.guide_record_id,
  (SELECT id FROM trip_dates WHERE trip_id = t.id AND is_available LIMIT 1),
  2,
  500.00,
  60.00,
  1.00,
  439.00,
  'confirmed',
  'paid',
  users.referrer_id,
  7.50,
  NOW()
FROM trips t, users
WHERE t.guide_id = users.guide_record_id
  AND t.is_active = true
LIMIT 1;

-- Create earnings record
INSERT INTO referral_earnings (
  referrer_user_id,
  booking_id,
  trip_id,
  earnings_amount,
  status,
  created_at
)
SELECT
  users.referrer_id,
  b.id,
  b.trip_id,
  7.50,
  'paid',
  NOW()
FROM bookings b, users
WHERE b.referral_user_id = users.referrer_id
  AND b.referral_payout_amount = 7.50
LIMIT 1;

-- View results
SELECT 'Created booking with $7.50 referral (1.5% of $500)' as message;
```

---

## Scenario 2: High Commission Rate ($600 booking, 2% commission)

```sql
-- Get user IDs
WITH users AS (
  SELECT 
    (SELECT id FROM guides WHERE user_id = (SELECT id FROM profiles WHERE email = 'alex.mountain@example.com')) as guide_id,
    (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com') as referrer_id,
    (SELECT id FROM profiles WHERE email = 'john.explorer@example.com') as customer_id
)
INSERT INTO bookings (
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
  t.id,
  users.customer_id,
  users.guide_id,
  (SELECT id FROM trip_dates WHERE trip_id = t.id AND is_available LIMIT 1),
  3,
  600.00,
  72.00,
  1.00,
  527.00,
  'confirmed',
  'paid',
  users.referrer_id,
  12.00,
  NOW()
FROM trips t, users
WHERE t.guide_id = users.guide_id
  AND t.is_active = true
LIMIT 1;

-- Create earnings record
INSERT INTO referral_earnings (
  referrer_user_id,
  booking_id,
  trip_id,
  earnings_amount,
  status
)
SELECT
  users.referrer_id,
  b.id,
  b.trip_id,
  12.00,
  'paid'
FROM bookings b, users
WHERE b.referral_user_id = users.referrer_id
  AND b.referral_payout_amount = 12.00
LIMIT 1;

SELECT 'Created booking with $12.00 referral (2% of $600)' as message;
```

---

## Scenario 3: Zero Commission (Testing 0% rate)

```sql
-- Get user IDs
WITH users AS (
  SELECT 
    (SELECT id FROM guides WHERE user_id = (SELECT id FROM profiles WHERE email = 'alex.mountain@example.com')) as guide_id,
    (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com') as referrer_id,
    (SELECT id FROM profiles WHERE email = 'john.explorer@example.com') as customer_id
)
INSERT INTO bookings (
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
  t.id,
  users.customer_id,
  users.guide_id,
  (SELECT id FROM trip_dates WHERE trip_id = t.id AND is_available LIMIT 1),
  1,
  400.00,
  48.00,
  1.00,
  351.00,
  'confirmed',
  'paid',
  users.referrer_id,
  0.00,
  NOW()
FROM trips t, users
WHERE t.guide_id = users.guide_id
  AND t.is_active = true
LIMIT 1;

SELECT 'Created booking with $0.00 referral (0% of $400)' as message;
```

---

## Scenario 4: View All Referral Earnings

```sql
SELECT
  re.id,
  re.earnings_amount,
  re.status,
  re.created_at,
  (SELECT full_name FROM profiles WHERE id = re.referrer_user_id) as referrer_name,
  (SELECT title FROM trips WHERE id = re.trip_id) as trip_title,
  (SELECT total_price FROM bookings WHERE id = re.booking_id) as booking_amount
FROM referral_earnings re
WHERE re.referrer_user_id = (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com')
ORDER BY re.created_at DESC;
```

---

## Scenario 5: View Referrer Dashboard Summary

```sql
WITH referrer_data AS (
  SELECT 
    (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com') as referrer_id
)
SELECT
  'Total Earned' as metric,
  (SELECT SUM(earnings_amount) FROM referral_earnings WHERE referrer_user_id = referrer_data.referrer_id)::TEXT as amount,
  COUNT(*) as count
FROM referral_earnings, referrer_data
WHERE referrer_user_id = referrer_data.referrer_id

UNION ALL

SELECT
  'Paid Earnings' as metric,
  (SELECT SUM(earnings_amount) FROM referral_earnings WHERE referrer_user_id = referrer_data.referrer_id AND status = 'paid')::TEXT,
  (SELECT COUNT(*) FROM referral_earnings WHERE referrer_user_id = referrer_data.referrer_id AND status = 'paid')
FROM referral_earnings, referrer_data

UNION ALL

SELECT
  'Pending Earnings' as metric,
  (SELECT SUM(earnings_amount) FROM referral_earnings WHERE referrer_user_id = referrer_data.referrer_id AND status = 'pending')::TEXT,
  (SELECT COUNT(*) FROM referral_earnings WHERE referrer_user_id = referrer_data.referrer_id AND status = 'pending')
FROM referral_earnings, referrer_data;
```

---

## Scenario 6: Test Trip-Specific Validation

```sql
-- Show referrer's ugc_codes by trip
SELECT
  b.trip_id,
  (SELECT title FROM trips WHERE id = b.trip_id) as trip_name,
  COUNT(*) as bookings_with_code,
  SUM(CASE WHEN b.ugc_code IS NOT NULL THEN 1 ELSE 0 END) as active_ugc_codes
FROM bookings b
WHERE b.user_id = (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com')
GROUP BY b.trip_id
ORDER BY trip_id;
```

---

## Scenario 7: Multiple Referrers (Advanced)

For testing when multiple users refer the same trip:

```sql
-- Create two bookings with different referrers
WITH users AS (
  SELECT 
    (SELECT id FROM guides WHERE user_id = (SELECT id FROM profiles WHERE email = 'alex.mountain@example.com')) as guide_id,
    (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com') as referrer1_id,
    (SELECT id FROM profiles WHERE email = 'john.explorer@example.com') as referrer2_id,
    (SELECT id FROM profiles WHERE email = 'alex.mountain@example.com') as customer_id
)
INSERT INTO bookings (
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
  referral_payout_amount
)
SELECT
  t.id,
  users.customer_id,
  users.guide_id,
  (SELECT id FROM trip_dates WHERE trip_id = t.id AND is_available LIMIT 1),
  2,
  500.00,
  60.00,
  1.00,
  439.00,
  'confirmed',
  'paid',
  users.referrer1_id,
  7.50
FROM trips t, users
WHERE t.guide_id = users.guide_id
  AND t.is_active = true
LIMIT 1;

-- View referrer earnings separately
SELECT 
  (SELECT full_name FROM profiles WHERE id = re.referrer_user_id) as referrer,
  SUM(re.earnings_amount) as total_earned,
  COUNT(*) as referral_count
FROM referral_earnings re
WHERE re.referrer_user_id IN (
  SELECT id FROM profiles WHERE email IN ('jane.traveler@example.com', 'john.explorer@example.com')
)
GROUP BY re.referrer_user_id
ORDER BY total_earned DESC;
```

---

## Cleanup: Delete Test Data

```sql
-- Delete all test referral earnings
DELETE FROM referral_earnings
WHERE referrer_user_id = (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com');

-- Clear referral data from bookings
UPDATE bookings
SET referral_user_id = NULL, referral_payout_amount = 0
WHERE referral_user_id = (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com');

SELECT 'Test data cleaned up' as message;
```

---

## Verification Queries

### Check Total Referral Value

```sql
SELECT 
  SUM(earnings_amount) as total_referral_value,
  COUNT(*) as total_referrals,
  AVG(earnings_amount) as avg_per_referral,
  MIN(earnings_amount) as min_referral,
  MAX(earnings_amount) as max_referral
FROM referral_earnings;
```

### Show Earnings by Status

```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(earnings_amount) as total
FROM referral_earnings
GROUP BY status;
```

### Referrer Performance Ranking

```sql
SELECT 
  (SELECT full_name FROM profiles WHERE id = re.referrer_user_id) as referrer_name,
  SUM(re.earnings_amount) as total_earned,
  COUNT(*) as referral_count,
  AVG(re.earnings_amount) as avg_per_referral
FROM referral_earnings re
GROUP BY re.referrer_user_id
ORDER BY total_earned DESC;
```

---

## Notes

- All scenarios use test accounts from the demo setup
- Adjust email addresses if your test accounts differ
- Amounts are in dollars (will be stored/displayed correctly)
- Status is always 'paid' for test data (matches webhook behavior)
- To test with different users, replace email addresses in the WITH clause

