# Referral System Testing Guide

## Overview

This guide provides comprehensive test data generation and testing procedures for the referral system.

---

## Test Data Options

### Option 1: Node.js Script (Recommended - Automated)

The easiest way to generate test data:

```bash
cd vercel-summit
node scripts/generate-referral-test-data.js
```

**What it does:**
- Creates a booking from john.explorer with referral from jane.traveler
- Sets referral payout amount to $7.50 (1.5% of $500)
- Creates referral earnings record
- Configures trip with 1.5% commission rate
- Displays summary of created data

**Requirements:**
- `.env.local` must have Supabase credentials
- All migrations applied (including 008)
- Test accounts created:
  - alex.mountain@example.com (guide)
  - jane.traveler@example.com (referrer/customer)
  - john.explorer@example.com (customer)

### Option 2: SQL Script (Manual)

Run the SQL script directly in Supabase:

```
supabase/test-data/010_referral_system_test_data.sql
```

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. New Query
3. Copy/paste the SQL file
4. Click Run

---

## Test Data Structure

### Scenario 1: Basic Referral (Included by Default)

**Setup:**
- Guide: alex.mountain@example.com
- Referrer: jane.traveler@example.com (has completed trip, has ugc_code)
- Booking Customer: john.explorer@example.com
- Trip: First active trip from guide
- Referral Rate: 1.5%

**Data Created:**
- 1 Booking: $500 total, referral user set
- 1 Referral Earnings: $7.50 earned
- Trip config: 1.5% commission rate

**Verification:**
- Referrer can see $7.50 in `/dashboard/referral-earnings`
- Earnings status: "paid"
- Booking tracked with referral_payout_amount

---

## Testing Procedures

### Test 1: Verify Referral Earnings Display

**Goal:** Confirm referrer can see earnings in dashboard

**Steps:**
1. Run: `node scripts/generate-referral-test-data.js`
2. Sign in as guide: alex.mountain@example.com
3. Go to `/dashboard/referral-earnings`
4. Should see:
   - Total Earned: $7.50+
   - Pending: $0 (marked as paid)
   - Paid: $7.50+
   - Referral count: 1+

**Expected Result:**
✅ Referral earnings display with correct amounts

### Test 2: Verify Referral Earnings Calculation

**Goal:** Confirm math is correct (1.5% of booking amount)

**Calculation:**
- Booking amount: $500
- Commission rate: 1.5%
- Expected payout: $500 × 0.015 = $7.50

**Steps:**
1. After test data created, check `/dashboard/referral-earnings`
2. Click "View Details" on referral earning
3. Verify:
   - Booking amount: $500
   - Commission rate: 1.5%
   - Earned: $7.50

**Expected Result:**
✅ Math correct, no rounding errors

### Test 3: Test Different Commission Rates

**Goal:** Verify system handles 0%, 1%, and 2% rates

**Setup Additional Test Data:**
```sql
-- Test with 0% commission
INSERT INTO bookings (...) VALUES (
  trip_id, customer_id, referrer_id, 300, 0, ...
);

-- Test with 1% commission
INSERT INTO bookings (...) VALUES (
  trip_id, customer_id, referrer_id, 400, 4.00, ...
);

-- Test with 2% commission
INSERT INTO bookings (...) VALUES (
  trip_id, customer_id, referrer_id, 600, 12.00, ...
);
```

**Expected Results:**
- 0% rate: $0 earned
- 1% of $400: $4.00
- 2% of $600: $12.00

### Test 4: Test Multiple Referrers for Same Trip

**Goal:** Verify multiple referrers can earn from same trip

**Steps:**
1. Create additional test accounts if needed
2. Create bookings for each with different referrers
3. Verify each referrer sees their own earnings
4. Confirm no cross-contamination of earnings

**Expected Result:**
✅ Each referrer sees only their earnings

### Test 5: Trip-Specific Validation

**Goal:** Verify referrer must have ugc_code for exact trip

**Setup:**
```sql
-- Referrer has ugc_code for Trip A only
UPDATE bookings 
SET ugc_code = 'TRIP-aaa-bbb-ccc'
WHERE trip_id = trip_a_id AND user_id = referrer_id;

-- Create booking for Trip B with same referrer
INSERT INTO bookings (
  trip_id=trip_b_id, 
  referral_user_id=referrer_id, 
  ...
);
```

**Expected Result:**
✅ Only Trip A booking generates referral earnings
❌ Trip B booking does NOT generate earnings (no ugc_code for that trip)

### Test 6: Status Tracking

**Goal:** Verify referral earnings status transitions

**Steps:**
1. Create booking with referral
2. Check `/dashboard/referral-earnings`
3. Status should be: "paid" (immediate upon payment)
4. Verify no "pending" status

**Expected Result:**
✅ Status shows "paid" immediately

### Test 7: Auto-Rating Updates

**Goal:** Verify customer avg_guide_rating updates from referral

**Steps:**
1. Check customer avg_guide_rating before referral
2. Create referral earnings with rating = 4
3. Query profiles table for that customer
4. avg_guide_rating should update to 4.0

**SQL Check:**
```sql
SELECT id, full_name, avg_guide_rating, guide_review_count
FROM profiles 
WHERE email = 'john.explorer@example.com';
```

**Expected Result:**
✅ avg_guide_rating shows value from referral

---

## Test Data Management

### View Generated Test Data

**Referral Earnings:**
```sql
SELECT * FROM referral_earnings 
WHERE referrer_user_id = (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com')
ORDER BY created_at DESC;
```

**Bookings with Referrals:**
```sql
SELECT id, total_price, referral_payout_amount, referral_user_id, status
FROM bookings 
WHERE referral_user_id IS NOT NULL
ORDER BY created_at DESC;
```

**Referrer Profile:**
```sql
SELECT id, email, avg_guide_rating, guide_review_count
FROM profiles 
WHERE email = 'jane.traveler@example.com';
```

### Reset Test Data

**Delete all test referrals:**
```sql
DELETE FROM referral_earnings 
WHERE referrer_user_id = (SELECT id FROM profiles WHERE email = 'jane.traveler@example.com');

UPDATE bookings 
SET referral_user_id = NULL, referral_payout_amount = 0
WHERE user_id = (SELECT id FROM profiles WHERE email = 'john.explorer@example.com');
```

---

## Real-World Testing Flow

For a complete end-to-end test:

### 1. Complete Trip as Guide
```
Sign in as guide: alex.mountain@example.com
Go to /dashboard/bookings
Mark a booking as "completed"
```

### 2. Review Customer (Optional)
```
Click "Review Customer" button
Fill review form with ratings
Submit review
Verify in /dashboard/guide-reviews
```

### 3. Create Referral
```
Run: node scripts/generate-referral-test-data.js
Or manually insert booking with referral_user_id
```

### 4. Verify Earnings
```
Sign in as customer: jane.traveler@example.com
Go to /dashboard/referral-earnings
Verify earnings appear with correct amount
```

### 5. Test Trip Booking Flow (Advanced)
```
Sign in as customer: jane.traveler@example.com
Go to /trips
Browse and find referrer's trip
Complete checkout flow
Verify:
  - Referral code generated
  - Earnings created on webhook
  - Amount calculated correctly (% based)
```

---

## Troubleshooting

### Issue: Script says "User not found"

**Solution:**
1. Verify test accounts exist in Supabase
2. Check email spelling matches exactly
3. Create accounts if missing:
   - alex.mountain@example.com (guide)
   - jane.traveler@example.com (customer)
   - john.explorer@example.com (customer)

### Issue: "No active trip found"

**Solution:**
1. Verify guide has trips created
2. Check trip is_active = true
3. Verify trip has available dates (is_available = true)
4. Create sample trip if needed

### Issue: Referral earnings not showing

**Solution:**
1. Verify migration 008 applied (guide_reviews_of_customers table exists)
2. Check RLS policies are enabled
3. Verify referral_earnings table has data:
   ```sql
   SELECT COUNT(*) FROM referral_earnings;
   ```
4. Check user_id matches authenticated user

### Issue: Wrong payout amount

**Solution:**
1. Verify math: booking_amount × (rate / 100)
2. Check referral_payout_amount in booking record
3. Verify trip.referral_payout_percent is set
4. Test with simpler numbers (e.g., $100 at 1% = $1.00)

---

## Performance Considerations

### Test Data Volume

**Safe limits:**
- 100 referral earnings: No performance impact
- 1,000 earnings: Minimal impact
- 10,000+ earnings: Consider pagination/indexing

**Current indexing:**
- `idx_referral_earnings_referrer_user_id` (included)
- `idx_referral_earnings_booking_id` (included)
- Queries optimized with pagination

### Load Testing Queries

```sql
-- Query performance: Should return in <100ms
SELECT * FROM referral_earnings 
WHERE referrer_user_id = '<user_id>'
ORDER BY created_at DESC
LIMIT 50;

-- Dashboard load: Should aggregate in <200ms
SELECT 
  SUM(earnings_amount) as total_earned,
  SUM(CASE WHEN status = 'paid' THEN earnings_amount ELSE 0 END) as paid,
  COUNT(*) as referral_count
FROM referral_earnings 
WHERE referrer_user_id = '<user_id>';
```

---

## Test Checklist

- [ ] Generated test data successfully
- [ ] Referrer can see earnings in dashboard
- [ ] Earnings amount is correct (% calculation)
- [ ] Status shows "paid"
- [ ] Multiple referrers don't see each other's earnings
- [ ] Trip-specific validation works (ugc_code required)
- [ ] Customer avg_guide_rating updates
- [ ] Real booking flow generates referrals
- [ ] Referrer lookup works in checkout
- [ ] Referral codes generated on booking confirmation

---

## Support

For issues or questions:
1. Check browser console (F12) for errors
2. Review SQL error messages
3. Verify all migrations applied
4. Check test account emails are exact match

