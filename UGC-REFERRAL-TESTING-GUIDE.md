# UGC Referral System - Testing Guide

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- Database migration applied to Supabase (see below)
- Demo accounts already created
- Vercel deployment live

### 🔴 CRITICAL: Apply Database Migration First

Before testing, you MUST run this SQL in Supabase:

1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor"
4. Click "New query"
5. Copy entire content from: `supabase/migrations/007_add_ugc_referral_system.sql`
6. Paste into query editor
7. Click "Run"
8. Check console for success message

**If this isn't done, all features will fail with "column does not exist" errors.**

---

## 🧪 Test Flows (In Order)

### Test 1: Guide Sets Referral Commission (5 min)

**Goal:** Verify guides can set referral % per trip

1. Go to https://summit-site-seven.vercel.app/auth/login
2. Login as **guide:**
   - Email: `alex.mountain@example.com`
   - Password: `DemoPassword123!`

3. Click "🎬 UGC" button (top right)

4. You should see:
   - ✅ List of all your trips
   - ✅ Current commission % shown
   - ✅ Expandable cards

5. Expand a trip → Set commission to **1.5%** → Click "Save"

6. Verify:
   - ✅ Success message appears
   - ✅ Percentage updates on card
   - ✅ Example payout shows $450 × 1.5% = $6.75

**Expected:** Green "Save" button changes to "Saving..." then back to "Save"

---

### Test 2: Customer Books Trip + Gets UGC Code (10 min)

**Goal:** Verify booking code generated and displayed

1. Go to https://summit-site-seven.vercel.app/trips

2. Click any trip

3. Click "Book Now" → Select date & participants → "Proceed to Checkout"

4. **On checkout page:**
   - Try "Who Referred You?" search → Search "alex" → Select "Alex Mountain"
   - Verify referrer card shows
   - Click "Proceed to Payment"

5. **Use Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/26`
   - CVC: `123`
   - ZIP: `12345`
   - Click "Pay"

6. **After payment:**
   - ✅ Redirected to confirmation page
   - ✅ Large green checkmark
   - ✅ **"Your UGC Code" section visible**
   - ✅ Code displayed (format: `TRIP-XXXXXXX-XXXXXXX-XXXXXX`)
   - ✅ Copy button works

7. **Copy the code** for next test

**Expected:** Code appears in blue box with copy button

---

### Test 3: Creator Submits UGC (10 min)

**Goal:** Verify UGC submission with code validation

1. Go to https://summit-site-seven.vercel.app/creators/ugc

2. Paste the UGC code from Test 2 into "Your UGC Code" field

3. Click "Validate"

4. Verify:
   - ✅ Code accepted
   - ✅ Green box shows: "✅ Code Verified!" with trip name
   - ✅ Form changes to accept TikTok URL

5. **Paste a real TikTok URL:**
   - Example: `https://www.tiktok.com/@tiktok/video/7172339832013720850`
   - Or any real TikTok video link

6. Click "Submit UGC"

7. Verify:
   - ✅ Green success message: "✅ UGC Submitted!"
   - ✅ Form resets
   - ✅ Message says "The guide will review your content soon"

**Expected:** Button shows "Submitting..." then success message appears

---

### Test 4: Referrer Views Earnings (5 min)

**Goal:** Verify earnings dashboard shows referral

1. Go to https://summit-site-seven.vercel.app/auth/login

2. Login as the **referrer you selected in Test 2:**
   - Email: `alex.mountain@example.com`  (if you selected Alex)
   - Password: `DemoPassword123!`

3. **From guide dashboard, click "📊 Analytics"** (or navigate to `/dashboard/referral-earnings` directly)

4. Verify earnings dashboard shows:
   - ✅ "Total Earnings" card with amount
   - ✅ "Pending Payout" card (should be > $0)
   - ✅ "Paid to Account" card
   - ✅ Per-trip breakdown section
   - ✅ Detailed payout history table

5. Check earnings amount:
   - Trip price × referral % from Test 1
   - Example: $450 × 1.5% = $6.75

**Expected:** Earnings appear in table with "pending" status

---

### Test 5: Invalid Code Handling (5 min)

**Goal:** Verify error handling

1. Go to https://summit-site-seven.vercel.app/creators/ugc

2. Try invalid codes:
   - `INVALID-CODE` → Should show: "Invalid UGC code or booking not found"
   - `TRIP-ABC123-XYZ-999` → Should show error
   - Leave blank → Click Validate → Should show: "Please enter your UGC code"

3. Try TikTok URL without valid code:
   - Paste TikTok URL in first field → Validate
   - Should show: "Code Verified!" with trip name

**Expected:** All error messages appear, form prevents submission without code

---

### Test 6: Referrer Lookup Edge Cases (5 min)

**Goal:** Verify checkout referrer lookup works correctly

1. Go to `/bookings/checkout` (manual URL)

2. Add URL params: `?trip=<any-trip-id>&date=<any-date-id>&participants=1`

3. Try referrer search:
   - Search "alex" → Should NOT show current user (jane)
   - Search "jane" → Should show jane.traveler (if not logged in as jane)
   - Search "nomatch" → Should show no results
   - Select referrer → Should show in green box
   - Click X → Should clear selection

**Expected:** Lookup autocompletes, excludes self, shows/hides results correctly

---

## 🔍 Database Verification

### Check Tables Exist (in Supabase SQL Editor)

```sql
-- Should return columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'referral_earnings';

-- Should return columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name LIKE '%ugc%';

-- Should return columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'trips' AND column_name = 'referral_payout_percent';
```

**Expected:** All tables exist with new columns

### Check UGC Code in Booking

```sql
-- Should show booking with code
SELECT id, user_id, trip_id, ugc_code 
FROM bookings 
WHERE ugc_code IS NOT NULL 
LIMIT 1;
```

**Expected:** Returns row with UGC code

### Check Referral Earnings Created

```sql
-- After Test 2 & 3 complete
SELECT * FROM referral_earnings 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:** Returns row with referrer_user_id, earnings_amount, status='pending'

---

## ⚠️ Common Issues & Fixes

### "Column ugc_code does not exist"
- **Cause:** Migration not applied
- **Fix:** Apply migration 007 in Supabase SQL Editor

### Code validation fails with "Code not found"
- **Cause:** Booking hasn't completed payment yet
- **Fix:** Complete full payment flow (Test 2) before submitting UGC

### Earnings don't appear on dashboard
- **Cause:** Referrer must have PUBLISHED UGC (not just submitted)
- **Fix:** As guide, approve the UGC in dashboard first, then check referrer earnings
- **Current:** UGC shows "pending" until guide approves

### Referrer lookup shows no results
- **Cause:** User hasn't booked or doesn't have referral earnings yet
- **Fix:** Complete Test 2 first (create booking with referrer selected)

### Stripe payment test fails
- **Use official test cards:**
  - Success: `4242 4242 4242 4242`
  - Fail: `4000 0000 0000 0002`
  - See: https://stripe.com/docs/testing#card-numbers

---

## 📊 Success Checklist

After all tests pass:

- [ ] Guide can set referral % per trip
- [ ] UGC code generated on booking
- [ ] Code displayed on confirmation page
- [ ] Creator can validate code + submit TikTok
- [ ] Referral earnings appear on dashboard
- [ ] Error handling works for invalid codes
- [ ] Referrer lookup works on checkout
- [ ] Database tables exist with correct columns

**If all pass: System is PRODUCTION READY ✅**

---

## 🚀 Next: Creator Outreach

Once testing is complete:

1. **Create landing page** at `/creators`
2. **Identify micro-creators** (10k-100k TikTok followers)
3. **Outreach template:** "We'll pay you $150 for every UGC video about our adventure trips"
4. **Content brief:** "Post a 30-second video of your experience on [Trip Name]"
5. **Weekly payouts:** Creators who submit approved UGC get paid automatically

---

**Total Testing Time:** ~45 minutes  
**Difficulty:** Easy (mostly clicking)  
**Help:** If stuck, check console logs (F12 → Console tab)
