# Stripe Webhooks & Payouts Setup - Complete Payment System

## Overview

This completes the payment phase with:
- ✅ Payment confirmation via webhooks
- ✅ Automatic email notifications
- ✅ Hosting fee tracking ($1 per trip)
- ✅ Guide payout calculations
- ✅ Refund processing

## Fee Structure

```
Customer Pays: $450
├─ Platform Commission (12%): $54
├─ Hosting Fee: $1
└─ Guide Payout: $395
```

**Per Trip Revenue:**
- Platform: $55 ($54 commission + $1 hosting)
- Guide: $395

## Setup Steps

### Step 1: Set Up Stripe Webhooks

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks

2. **Create New Endpoint:**
   - Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
   - For testing: Use ngrok to tunnel: `https://xyz123.ngrok.io/api/stripe-webhook`

3. **Select Events:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

4. **Copy Webhook Secret:**
   - Will look like: `whsec_xxxx...`

### Step 2: Add Webhook Secret to Environment

**Local Development:**
```env
STRIPE_WEBHOOK_SECRET=whsec_test_xxxx...
RESEND_API_KEY=re_xxxx...
RESEND_FROM_EMAIL=Summit <hello@summit.local>
```

**Vercel Environment Variables:**
```
STRIPE_WEBHOOK_SECRET = whsec_live_xxxx...
RESEND_API_KEY = re_xxxx...
RESEND_FROM_EMAIL = Summit <hello@summit.local>
```

### Step 3: Set Up Resend (Email Service)

1. **Create Account:**
   - https://resend.com

2. **Get API Key:**
   - Go to Settings → API Keys
   - Copy API key

3. **Create Email Address:**
   - Verify your domain or use `noreply@resend.dev`
   - This is your `RESEND_FROM_EMAIL`

### Step 4: Deploy to Vercel

1. Go to: https://vercel.com/dashboard/toofuturetechnologies/summit-site-seven
2. Settings → Environment Variables
3. Add:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_live_xxxx...
   SUPABASE_SERVICE_ROLE_KEY = sbp_xxxx...
   RESEND_API_KEY = re_xxxx...
   RESEND_FROM_EMAIL = Summit <hello@summit.local>
   ```
4. Redeploy

## How It Works

### Payment Flow

```
Customer submits payment
        ↓
Stripe processes payment
        ↓
Webhook called: payment_intent.succeeded
        ↓
Backend creates booking with fees:
  ├─ commission_amount: 12% of total
  ├─ hosting_fee: $1
  └─ guide_payout: remainder
        ↓
Emails sent:
  ├─ Booking confirmation → Customer
  └─ Payout notification → Guide
        ↓
Booking marked as 'confirmed' + 'paid'
```

### Refund Flow

```
Guide or customer requests refund
        ↓
Stripe processes refund
        ↓
Webhook called: charge.refunded
        ↓
Backend updates booking:
  ├─ status: 'cancelled'
  └─ payment_status: 'refunded'
        ↓
Refund confirmation email → Customer
```

## Files Created/Updated

```
src/app/api/stripe-webhook/route.ts   - Webhook handler
src/lib/emails.ts                      - Email notifications
src/app/bookings/checkout/page.tsx     - Updated checkout UI
src/bookings/error/page.tsx            - Error handling
```

## Email Templates

### 1. Booking Confirmation (Customer)
```
Subject: ✅ Booking Confirmed - Summit Adventure

Content:
- Trip details
- Guide name
- Booking date
- Amount paid
- Next steps
```

### 2. Payout Notification (Guide)
```
Subject: 💰 New Booking - Payout Coming Your Way

Content:
- Trip details
- Gross amount
- Fee breakdown:
  * Platform commission (12%)
  * Hosting fee ($1)
  * Guide payout
- Payout timeline
```

### 3. Refund Confirmation (Customer)
```
Subject: 💳 Refund Processed - Summit Adventure

Content:
- Refund amount
- Processing status
- Timeline (3-5 business days)
- Support contact
```

## Testing Payment Flow

### Test Webhook Locally

**Option 1: Using Stripe CLI**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Authenticate
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Keep terminal open and trigger events from Stripe dashboard
```

**Option 2: Using ngrok**
```bash
# Install ngrok
brew install ngrok

# Tunnel local port to public URL
ngrok http 3000

# Copy URL (e.g., https://xyz123.ngrok.io)
# Add webhook: https://xyz123.ngrok.io/api/stripe-webhook
```

### Test Payment Success

1. Go to trip detail page
2. Select date, participants → "Book Now"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout

**Expected:**
- ✅ Booking created in Supabase
- ✅ `payment_status` set to `'paid'`
- ✅ Fees calculated correctly
- ✅ Emails sent (check Resend dashboard)
- ✅ Redirect to confirmation page

### Test Refund

1. Go to Stripe Dashboard
2. Find the charge
3. Click "Refund"
4. Confirm

**Expected:**
- ✅ Booking status changes to `'cancelled'`
- ✅ `payment_status` set to `'refunded'`
- ✅ Refund email sent to customer

## Monitoring & Analytics

### Webhook Events

Check webhook delivery status:
1. Stripe Dashboard → Webhooks → Your endpoint
2. View delivery attempts
3. Retry failed deliveries

### Payment Metrics

Queries for analytics:

```sql
-- Revenue by day
SELECT 
  DATE(created_at) as date,
  COUNT(*) as bookings,
  SUM(total_price) as gross_revenue,
  SUM(commission_amount + hosting_fee) as platform_revenue,
  SUM(guide_payout) as guide_payouts
FROM bookings
WHERE payment_status = 'paid'
GROUP BY DATE(created_at);

-- Top guides by revenue
SELECT 
  g.display_name,
  COUNT(b.id) as bookings,
  SUM(b.guide_payout) as total_payouts
FROM bookings b
JOIN guides g ON b.guide_id = g.id
WHERE b.payment_status = 'paid'
GROUP BY g.id
ORDER BY total_payouts DESC;

-- Failed payments
SELECT COUNT(*) as failed_count
FROM bookings
WHERE payment_status = 'failed' OR payment_status = 'refunded';
```

## Error Handling

### Webhook Failures

If webhook fails to process:
1. Check webhook delivery logs in Stripe
2. Verify environment variables are set
3. Check server logs
4. Retry manually from Stripe dashboard

### Email Failures

If emails don't send:
1. Check Resend API key
2. Verify email domain
3. Check logs in Resend dashboard
4. Whitelist sender in email provider

## Future: Stripe Connect (Automatic Guide Payouts)

For automatic payouts to guides:

1. **Setup Stripe Connect:**
   - https://dashboard.stripe.com/connect/accounts

2. **Guide Onboarding:**
   - Add connect_account_id field to guides table
   - When guide signs up, request Stripe Connect auth

3. **Automatic Payouts:**
   ```
   // When payment_intent.succeeded:
   paymentIntent = await stripe.paymentIntents.create({
     amount_received: 45000,
     currency: 'usd',
     application_fee_amount: 5500, // 12% + $1
     stripe_account: guideConnectAccount
   });
   ```

4. **Payout Status:**
   - Guide sees payout status in dashboard
   - Auto-transfers to bank account (2-3 days)

## Security Notes

✅ **Secret key never exposed** - Only used on backend
✅ **Webhook signature verified** - Prevents spoofed requests
✅ **PCI compliant** - Stripe handles all card data
✅ **HTTPS only** - Vercel enforces encryption
✅ **Secure email** - Resend authenticates all sends

## Troubleshooting

### "Webhook endpoint failed"
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify endpoint URL is accessible
- Check server logs for errors
- Test locally with Stripe CLI

### "Email not received"
- Verify `RESEND_API_KEY` is correct
- Check email domain verification in Resend
- Look for emails in spam folder
- Test manually from Resend dashboard

### "Booking not created"
- Check Supabase credentials
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check booking creation logs
- Ensure database schema is correct

## Resources

- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Resend Docs](https://resend.com/docs)

## Success Checklist

- [ ] Webhook endpoint created in Stripe
- [ ] Webhook secret added to environment
- [ ] Resend API key added to environment
- [ ] Test payment processed successfully
- [ ] Customer received booking confirmation email
- [ ] Guide received payout notification email
- [ ] Booking created in Supabase with correct fees
- [ ] Test refund processed successfully
- [ ] Refund email received by customer
- [ ] Deployed to Vercel with all env vars

## Next Steps

1. Test the complete payment flow end-to-end
2. Implement Stripe Connect for automatic guide payouts
3. Add refund UI to guide dashboard
4. Add payment history to guide earnings dashboard
5. Analytics dashboard for platform revenue
