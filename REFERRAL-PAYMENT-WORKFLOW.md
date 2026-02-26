# Referral Payment Workflow

## Overview

The referral earning payment has a **two-stage workflow**:

1. **Stage 1: PENDING** - When booking is confirmed (customer paid)
2. **Stage 2: PAID** - When trip is completed AND guide is paid

---

## Detailed Workflow

### Stage 1: Booking Confirmed (Payment Received)

**Timeline:** Immediately after customer completes payment

**What Happens:**
1. Customer completes Stripe payment
2. Stripe webhook triggered (`/api/stripe-webhook`)
3. Booking created with status = 'confirmed'
4. **Referral earnings created with status = 'PENDING'**
5. Referrer sees earnings in dashboard but marked as "Pending"

**Business Logic:**
- Referrer has earned the commission
- Payment not yet released to referrer
- Trip hasn't happened yet
- Protects against customer cancellations

**Database State:**
```sql
referral_earnings {
  status: 'pending',
  earnings_amount: 7.50,
  created_at: NOW()
}
```

**Customer View:**
- Dashboard shows: "$7.50 Pending"
- Not included in "Paid Earnings" total
- Waiting for trip completion

---

### Stage 2: Trip Completed (Guide Paid)

**Timeline:** When guide marks trip as completed AND receives payout

**What Happens:**
1. Guide completes trip (marks booking status = 'completed')
2. Call `/api/bookings/complete` endpoint
3. Booking status updated to 'completed'
4. **Referral earnings status updated to 'PAID'**
5. Referrer payout processed to referrer
6. Referrer sees earnings in "Paid Earnings"

**Business Logic:**
- Trip confirmed to have happened
- Guide received their payment (Stripe transfer successful)
- Safe to pay referrer commission
- Reduces fraud/chargeback risk

**Database State:**
```sql
referral_earnings {
  status: 'paid',
  earnings_amount: 7.50,
  updated_at: NOW(),
  paid_at: NOW()
}
```

**Customer View:**
- Dashboard shows: "$7.50 Paid"
- Included in "Paid Earnings" total
- Money available for withdrawal/payout

---

## API Endpoints

### 1. Create Booking (Webhook - Automatic)

**Endpoint:** `/api/stripe-webhook`  
**Trigger:** Stripe payment success  
**Action:** Create referral_earnings with status='pending'

```typescript
// Webhook creates referral earning as PENDING
const { error: earningsError } = await supabase
  .from('referral_earnings')
  .insert({
    referrer_user_id: referralUserId,
    booking_id: booking.id,
    trip_id: tripId,
    earnings_amount: 7.50,
    status: 'pending', // ← PENDING until trip completion
  });
```

### 2. Complete Booking (Manual - Guide Action)

**Endpoint:** `/api/bookings/complete`  
**Method:** POST  
**Trigger:** Guide marks trip as completed  
**Action:** Update referral_earnings to status='paid'

**Request:**
```json
{
  "bookingId": "uuid-of-booking"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip completed successfully",
  "booking": {
    "id": "uuid",
    "status": "completed",
    "referralPaid": true
  }
}
```

**Code:**
```typescript
// API marks referral earning as PAID
const { error: earningsError } = await supabase
  .from('referral_earnings')
  .update({ status: 'paid' })
  .eq('booking_id', bookingId)
  .eq('status', 'pending'); // Only update if still pending
```

---

## Dashboard Display

### Customer Referral Earnings Dashboard

**URL:** `/dashboard/referral-earnings`

**Shows:**
- **Total Earned:** Sum of all (pending + paid)
- **Pending Earnings:** Sum where status='pending'
- **Paid Earnings:** Sum where status='paid'

**Example:**
```
Total Earned: $22.50
Pending: $7.50 (1 booking awaiting completion)
Paid: $15.00 (2 completed trips)
```

**Per-Booking View:**
```
Jane's Mountain Adventure
- Amount: $500
- Your Commission: $7.50
- Status: ⏳ PENDING (Trip scheduled for Feb 28)
- Status: ✅ PAID (Trip completed on Mar 1)
```

---

## Status Transitions

### Valid Status Changes

```
pending → paid (when trip marked complete)
pending → cancelled (if booking cancelled)
paid → (no further changes)
```

### Invalid Transitions

```
paid → pending ❌ (cannot reverse)
cancelled → pending ❌ (cannot revert)
```

---

## Testing the Workflow

### Test Scenario 1: Basic Workflow

**Setup:**
```bash
node scripts/setup-and-test-referral.js
```

**Verify:**
1. Referral earnings created with status='pending'
2. Dashboard shows "Pending: $7.50"
3. Call `/api/bookings/complete` with booking ID
4. Dashboard updates to show "Paid: $7.50"

### Test Scenario 2: Cancel Booking Before Completion

**Setup:**
```sql
UPDATE bookings SET status='cancelled' WHERE id='booking-id';
UPDATE referral_earnings SET status='cancelled' WHERE booking_id='booking-id';
```

**Result:**
- Referrer doesn't see earnings in "Pending" or "Paid"
- Status shows 'cancelled'

### Test Scenario 3: Multiple Referrals

**Setup:**
```bash
node scripts/setup-and-test-referral.js
# Run 3 times to create 3 separate bookings
```

**Result:**
- Dashboard shows: "Total Earned: $22.50"
- Breakdown: "Pending: $7.50, Paid: $15.00"
- Each booking tracked separately

---

## Database Schema

### referral_earnings table

```sql
Table referral_earnings {
  id UUID PRIMARY KEY
  referrer_user_id UUID FK(profiles)
  booking_id UUID FK(bookings) UNIQUE
  trip_id UUID FK(trips)
  earnings_amount DECIMAL(10,2)
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'cancelled'))
  stripe_transfer_id TEXT -- Payout ID when payment processed
  created_at TIMESTAMPTZ
  paid_at TIMESTAMPTZ -- Set when status='paid'
  updated_at TIMESTAMPTZ
}
```

### Status Values

| Status | Meaning | Show in Dashboard | Paid Out |
|--------|---------|------------------|----------|
| `pending` | Booking confirmed, awaiting trip completion | Yes (Pending) | No |
| `paid` | Trip completed, money paid to referrer | Yes (Paid) | Yes |
| `failed` | Payment processing failed | No | No |
| `cancelled` | Booking cancelled before completion | No | No |

---

## Payout Processing

### When Does Money Actually Transfer?

**Option A: Immediate on Trip Completion** (Current)
- Reference code: `REFERRAL_IMMEDIATE_PAYOUT`
- When: `/api/bookings/complete` called
- Trigger: Stripe transfer to referrer's account
- Status: Updates to 'paid' + includes stripe_transfer_id

**Option B: Batched Monthly Payouts** (Future Enhancement)
- When: First of each month
- Batch all 'paid' earnings from previous month
- Single transfer to referrer account
- More efficient for platform
- Requires separate "payout processing" job

---

## Error Handling

### What If Trip Marked Complete But Referrer Not Paid?

**Current Behavior:**
```typescript
// Mark as paid regardless of payout success
const { error: earningsError } = await supabase
  .from('referral_earnings')
  .update({ status: 'paid' })
  .eq('booking_id', bookingId);

// If payout fails, captured separately in stripe_transfer_id=null
```

**Recommendation:**
- Update referral_earnings to 'paid' after Stripe transfer succeeds
- Add retry logic for failed transfers
- Alert referrer if payout fails

---

## Business Rules

### Who Gets Paid?
- Only referrers with published UGC for that trip
- Requires `ugc_code` in booking record
- Verified through booking data

### When Do They Get Paid?
- After trip marked 'completed' by guide
- After guide receives their payout
- Status changes from 'pending' to 'paid'

### How Much?
- Configurable 0.0% - 2.0% per trip
- Calculation: `booking_amount × (percent / 100)`
- Example: $500 × 1.5% = $7.50

### Payment Method?
- Stripe transfer to referrer's connected Stripe account
- OR future: Monthly batched payout
- Currently: Immediate transfer (same day as trip completion)

---

## Monitoring & Alerts

### For Platform (Admin)
- Total pending referral payouts (liability)
- Failed payout attempts (requires manual intervention)
- Top referrers by earnings

### For Referrer (Customer)
- Earnings transition from pending → paid
- Successful payout confirmation
- Failed payout notification + retry option

---

## Implementation Checklist

- [x] Webhook creates referral_earnings with status='pending'
- [x] API endpoint `/api/bookings/complete` transitions to 'paid'
- [x] Dashboard displays pending/paid breakdown
- [x] Test data generator uses 'pending' status
- [ ] Add stripe_transfer_id tracking for payout
- [ ] Add email notification on status change
- [ ] Add admin monitoring dashboard
- [ ] Add referrer payout processing (if not immediate)
- [ ] Add failed payout retry logic
- [ ] Add audit trail (payout history)

---

## FAQ

**Q: When will my referral earnings be paid out?**
A: Once the trip is marked as completed by the guide. This ensures the trip actually happened before paying out.

**Q: Can I see my pending earnings?**
A: Yes, on `/dashboard/referral-earnings` you'll see breakdown of Pending and Paid amounts.

**Q: What if the customer cancels?**
A: Pending earnings will be cancelled. You won't receive payment.

**Q: Can pending earnings be reversed?**
A: No. Once marked as 'paid', they cannot be reversed.

**Q: How long until paid earnings appear in my account?**
A: Usually within 2-3 business days (Stripe transfer time).

