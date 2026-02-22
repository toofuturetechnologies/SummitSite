# Payment Webhook Setup - Summit Platform

## Status
✅ **Payment system complete** — Webhook handlers, email notifications, and fee calculations all implemented.
⏳ **Remaining:** Database migration + Webhook secret configuration

## Database Migration (REQUIRED)

The bookings table needs two new columns: `hosting_fee` and `payment_status`.

### Step 1: Run Migration in Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl/sql/templates
2. Click "Create a New Query"
3. Paste this SQL:

```sql
-- Add missing payment fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS hosting_fee DECIMAL(10,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed'));
```

4. Click **Execute**
5. Confirm success

### Step 2: Verify Columns

Run this query to verify:
```sql
SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'bookings';
```

Look for:
- `hosting_fee` (numeric)
- `payment_status` (text)

## Environment Variables (Verify in Vercel)

Check that these are configured in Vercel dashboard → Settings → Environment Variables:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...     # ⚠️ REQUIRED - See "Get Webhook Secret" below
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@summit.local
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Get Webhook Secret

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://summit-site-seven.vercel.app/api/stripe-webhook` (or your Vercel domain)
4. Events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Create endpoint
6. Click on the endpoint to view details
7. Copy the **Signing Secret** (starts with `whsec_`)
8. Add to Vercel env: `STRIPE_WEBHOOK_SECRET=whsec_...`
9. Redeploy to Vercel

## Webhook Handlers Implemented

### ✅ `handlePaymentSucceeded()`
- Extracts metadata from payment intent
- Calculates platform commission (12%) + hosting fee ($1)
- Creates booking with `payment_status: 'paid'`
- Sends confirmation email to customer
- Sends payout breakdown email to guide

### ✅ `handlePaymentFailed()`
- Fetches trip and user details
- Sends failure notification to customer (retry instructions)
- Notifies guide of payment failure (no action needed)

### ✅ `handleChargeRefunded()`
- Updates booking to `status: 'cancelled'`, `payment_status: 'refunded'`
- Sends refund confirmation email to customer

## Email Templates

All emails use Resend API with the following templates:

### 1. Customer Booking Confirmation
- Trip details
- Guide name
- Amount paid
- Booking date

### 2. Guide Payout Notification
- Trip title
- Gross amount
- Platform fee breakdown (12% + $1 hosting)
- Net payout to guide

### 3. Customer Payment Failed
- Retry instructions
- Card troubleshooting tips
- Link to retry payment

### 4. Customer Refund Confirmation
- Refund amount
- Timeline (3-5 business days)
- Support contact info

## Testing the Webhook

### Option A: Stripe CLI (Local Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhook events to your local dev server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Copy the webhook signing secret and set it locally
# export STRIPE_WEBHOOK_SECRET=whsec_test_...

# In another terminal, test an event:
stripe trigger payment_intent.succeeded
```

### Option B: Vercel Production

1. Configure webhook secret in Vercel (see above)
2. Redeploy
3. Test with actual test card: `4242 4242 4242 4242`
4. Check Vercel logs for webhook events
5. Verify booking was created in Supabase dashboard
6. Verify emails were sent (check Resend dashboard)

## Payment Flow (Complete)

```
1. Customer clicks "Book Now" on trip detail page
   ↓
2. Redirects to /bookings/checkout?trip=...&date=...&participants=...
   ↓
3. Checkout page fetches trip details + creates Stripe PaymentIntent
   - Metadata includes: tripId, userId, tripDateId, participantCount
   ↓
4. Stripe Embedded Checkout displayed
   ↓
5. Customer enters card (test: 4242 4242 4242 4242 / 12/25 / 123 / any ZIP)
   ↓
6. Payment processes
   ↓
7. Stripe sends webhook event: payment_intent.succeeded
   ↓
8. Webhook handler (`/api/stripe-webhook`):
   - Creates booking in Supabase
   - Calculates fees:
     * Customer pays: $X
     * Platform gets: X × 0.12 + $1
     * Guide gets: X - (X × 0.12 + $1)
   - Sets payment_status: 'paid'
   - Sends confirmation email to customer
   - Sends payout email to guide
   ↓
9. Checkout page receives onComplete callback
   ↓
10. Redirects to /bookings/confirmed?trip=...
    ↓
11. Confirmation page displayed to customer
    ↓
12. Guide sees new booking in /dashboard/bookings
```

## Next Steps (Phase 3+)

1. **Stripe Connect** — Automatic guide payouts to bank accounts
   - Guides connect their Stripe account
   - Payouts sent automatically 2-3 days after booking confirmed
   - No manual transfers needed

2. **Payout Dashboard** — Guides can track earnings
   - See pending, completed, and scheduled payouts
   - Download payout history

3. **Refund Management** — Admin/guide-initiated refunds
   - Refund API endpoint
   - Refund approval workflow
   - Automatic reversal of guide payout

4. **Payment Analytics** — Platform revenue tracking
   - Total commission collected
   - Total payouts to guides
   - Growth metrics

5. **Dispute Resolution** — Handle payment disputes
   - Chargeback tracking
   - Evidence upload
   - Automatic booking cancellation on chargeback

## Stripe Test Cards

| Card | Status | Use Case |
|------|--------|----------|
| `4242 4242 4242 4242` | Success | Normal payment |
| `4000 0000 0000 0002` | Declined | Test decline |
| `4000 0025 0000 3155` | 3D Secure | Test 3D Secure |
| `3782 822463 10005` | Amex | Test American Express |

Expiry: Any future date (e.g., 12/25)  
CVV: Any 3 digits  
ZIP: Any value

## Files Modified

### Created
- `/src/app/api/stripe-webhook/route.ts` — Webhook handler with all event types
- `/src/lib/emails.ts` — Email service with 4 template functions
- `/supabase/migrations/002_add_payment_fields.sql` — Database columns

### Updated
- `/src/app/bookings/checkout/page.tsx` — Fee disclosure + metadata passing
- `/src/app/api/create-payment-intent/route.ts` — Metadata in payment intent

## Deployment Checklist

- [ ] Run database migration in Supabase SQL editor
- [ ] Configure Stripe webhook in Stripe dashboard
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel environment
- [ ] Redeploy to Vercel
- [ ] Test webhook with test card
- [ ] Verify booking created in Supabase
- [ ] Verify emails sent (check Resend dashboard)
- [ ] Test refund workflow
- [ ] Go live with live Stripe keys (when ready)
