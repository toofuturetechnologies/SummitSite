# Deployment Steps - Payment Webhook Integration

## 📋 Checklist

### Step 1: Database Migration ⚠️ MANUAL REQUIRED

**Location:** Supabase SQL Editor  
**URL:** https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl/sql/templates

1. Click **"Create a New Query"** or **"New Query"**
2. **Copy and paste this SQL:**

```sql
-- Add missing payment fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS hosting_fee DECIMAL(10,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed'));
```

3. Click **"Execute"** or **Ctrl+Enter**
4. Wait for success message (should see "0 rows affected" or column creation confirmation)

**Verify Success:**

Run this query in the same editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name IN ('hosting_fee', 'payment_status');
```

Should return 2 rows with:
- `hosting_fee` (numeric)
- `payment_status` (text)

---

### Step 2: Stripe Webhook Configuration ⚠️ MANUAL REQUIRED

**Location:** Stripe Dashboard  
**URL:** https://dashboard.stripe.com/test/webhooks

#### 2a. Create Webhook Endpoint

1. Click **"Add an endpoint"**
2. Enter URL: `https://summit-site-seven.vercel.app/api/stripe-webhook`
3. Under "Events to send," search and select:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
4. Click **"Add endpoint"**

#### 2b. Copy Webhook Secret

1. Click on your new endpoint in the webhooks list
2. Scroll to **"Signing secret"**
3. Click **"Click to reveal"**
4. Copy the secret (starts with `whsec_test_...`)
5. **Save this value** — you'll need it for Vercel

---

### Step 3: Vercel Environment Variables ⚠️ MANUAL REQUIRED

**Location:** Vercel Dashboard → Project Settings → Environment Variables  
**URL:** https://vercel.com/dashboard/project/summit-site

#### Add/Update These Variables:

| Variable | Value | Source |
|----------|-------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_test_...` | From Step 2b above ⚠️ CRITICAL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Stripe Dashboard → API Keys |
| `RESEND_API_KEY` | `re_...` | Resend.com → API Keys |
| `RESEND_FROM_EMAIL` | `noreply@summit.local` | Your choice |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase → Project Settings → API |

**Steps:**

1. Go to Vercel dashboard
2. Click your Summit project
3. Click **Settings** → **Environment Variables**
4. For each variable:
   - Click **"Add New"**
   - Enter **Name** (exact match above)
   - Enter **Value** (from sources above)
   - Select **Production** (or all environments)
   - Click **"Save"**

5. Once all added, click **"Redeploy"** to trigger new deployment with env vars

---

### Step 4: Redeploy Vercel

**Location:** Vercel Dashboard

1. Go to Deployments tab
2. Click **"Redeploy"** on the latest commit
3. Wait for build to complete (should be ~2-3 minutes)
4. See the green checkmark when done

---

## ✅ Testing the Payment Flow

### Test 1: Basic Payment Success

1. Go to: https://summit-site-seven.vercel.app/trips
2. Click any trip → **"Book Now"**
3. Select dates and participants → **"Continue to Payment"**
4. Enter test card: `4242 4242 4242 4242`
5. Expiry: `12/25` (any future date)
6. CVC: `123` (any 3 digits)
7. Name: Any name
8. Click **"Pay"**
9. **Expected:** Redirects to confirmation page ✅

### Test 2: Verify Booking Created

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query:

```sql
SELECT id, user_id, trip_id, status, payment_status, total_price, guide_payout, commission_amount, hosting_fee
FROM bookings
ORDER BY created_at DESC
LIMIT 1;
```

**Expected result:**
```
id: [UUID]
status: confirmed
payment_status: paid
total_price: [amount customer paid]
commission_amount: [total_price * 0.12]
guide_payout: [total_price - commission - hosting_fee]
hosting_fee: 1.00
```

### Test 3: Verify Webhook Fired

1. Go to Stripe Dashboard → **Webhooks**
2. Click your endpoint
3. Scroll to **"Recent Events"**
4. Should see `payment_intent.succeeded` with status **200**

Click the event to see full payload (should include metadata with tripId, userId, etc.)

### Test 4: Verify Emails Sent

1. Go to Resend.com Dashboard → **Logs** or **Emails**
2. Should see:
   - Email to customer (booking confirmation)
   - Email to guide (payout notification)

---

## Test Cards for Different Scenarios

| Card Number | Scenario | Expiry | CVC |
|------------|----------|--------|-----|
| `4242 4242 4242 4242` | ✅ Success | 12/25 | 123 |
| `4000 0000 0000 0002` | ❌ Decline | 12/25 | 123 |
| `4000 0025 0000 3155` | 3D Secure Required | 12/25 | 123 |
| `3782 822463 10005` | Amex Success | 12/25 | 1234 |

---

## Troubleshooting

### Issue: "Payment processing not available"

**Cause:** Missing environment variables  
**Fix:**
1. Check all env vars added to Vercel
2. Redeploy
3. Wait 2-3 minutes for deployment to complete

### Issue: Webhook not firing

**Cause:** Webhook secret not configured or endpoint URL wrong  
**Fix:**
1. Verify `STRIPE_WEBHOOK_SECRET` in Vercel env vars
2. Check endpoint URL exactly matches in Stripe webhook settings
3. Redeploy and test again

### Issue: Booking not created after payment

**Cause:** Webhook handler error  
**Fix:**
1. Check Vercel logs: **Logs** → search for `api/stripe-webhook`
2. Check Stripe webhook event details: look for error response
3. Verify Supabase tables have required columns (Step 1)
4. Check `SUPABASE_SERVICE_ROLE_KEY` is correct

### Issue: Emails not sending

**Cause:** Missing Resend API key or email address  
**Fix:**
1. Verify `RESEND_API_KEY` in Vercel env vars
2. Verify `RESEND_FROM_EMAIL` is set
3. Check Resend dashboard for API errors
4. Redeploy

---

## Files Changed This Session

### Created
- `/src/app/api/stripe-webhook/route.ts` — Webhook handler (280 lines)
- `/src/lib/emails.ts` — Email service with 4 template functions (150 lines)
- `/supabase/migrations/002_add_payment_fields.sql` — Database migration
- `/PAYMENT-WEBHOOK-SETUP.md` — Detailed integration guide
- `/DEPLOYMENT-STEPS.md` — This file

### Modified
- `/src/app/bookings/checkout/page.tsx` — Fee disclosure UI
- `/src/app/api/create-payment-intent/route.ts` — Metadata passing

### Committed
```
cff6773 - feat: Complete payment webhook system with email notifications
```

---

## Next Phase Features (Future)

1. **Stripe Connect** — Automatic guide payouts
   - Guides link their Stripe account
   - Payouts auto-transferred within 2-3 days
   - No manual transfers needed

2. **Guide Payout Dashboard**
   - See pending, completed payouts
   - Download payout history
   - Track earnings over time

3. **Refund Management**
   - Guide-initiated refunds
   - Customer-requested cancellations
   - Automatic payout reversals

4. **Payment Analytics**
   - Total commission collected
   - Payouts to guides
   - Revenue growth tracking

5. **Dispute Resolution**
   - Chargeback tracking
   - Evidence upload
   - Automatic booking cancellation

---

## Summary

**What's live now:**
- ✅ Payment processing (Stripe)
- ✅ Webhook event handling
- ✅ Email notifications (Resend)
- ✅ Fee calculations (12% + $1)
- ✅ Booking auto-creation

**What's needed to go live:**
1. Run 3 manual setup steps (DB migration, webhook config, env vars)
2. Test payment flow
3. Verify emails send
4. Redeploy to production

**Estimated time:** 15-20 minutes

---

**Questions?** Check `/PAYMENT-WEBHOOK-SETUP.md` for detailed integration guide or `/STRIPE-SETUP.md` for test card info.
