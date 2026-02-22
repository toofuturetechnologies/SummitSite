# Stripe Payment Integration - Setup Guide

## Overview

Summit now has Stripe payment integration built in. This allows customers to pay for bookings securely with credit cards.

## Features Implemented

✅ **Payment Intent Creation** (`/api/create-payment-intent`)
- Backend endpoint to create Stripe payment intents
- Accepts booking details (amount, trip info, customer info)
- Returns client secret for frontend payment

✅ **Payment Form Component** (`PaymentForm.tsx`)
- Reusable React component for payment UI
- Uses Stripe Embedded Checkout
- Handles payment success/failure
- Mobile-responsive design

✅ **Environment Configuration**
- Stripe keys in `.env.local`
- Production and test key support

## Setup Steps

### Step 1: Get Stripe API Keys

1. Go to: https://dashboard.stripe.com/apikeys
2. Copy these keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

### Step 2: Add Keys to `.env.local`

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

**Important:**
- Use **test keys** for development
- Use **live keys** for production
- Never commit secret keys to git

### Step 3: Deploy to Vercel

1. Go to: https://vercel.com/dashboard/toofuturetechnologies/summit-site-seven
2. Settings → Environment Variables
3. Add both keys:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_xxx
   STRIPE_SECRET_KEY = sk_test_xxx
   ```
4. Redeploy

### Step 4: Set Up Webhooks (Optional - for future)

To handle payment confirmation webhooks:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add Endpoint"
3. URL: `https://yourdomain.com/api/stripe-webhook`
4. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy Webhook Secret to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

## How It Works

### Payment Flow

```
Customer clicks "Book Now"
        ↓
Server creates Payment Intent (/api/create-payment-intent)
        ↓
Frontend receives clientSecret
        ↓
Stripe Embedded Checkout loads
        ↓
Customer enters payment details
        ↓
Stripe processes payment
        ↓
Success → Booking confirmed + redirect to /bookings/confirmed
Failure → Error message displayed
```

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── create-payment-intent/
│   │       └── route.ts          # Backend: Create payment intent
│   └── trips/
│       └── [id]/
│           └── page.tsx          # Frontend: Trip booking page
├── components/
│   └── PaymentForm.tsx           # Reusable payment form component
```

## Integration Points

### Creating a Payment Intent

**Backend Route:** `POST /api/create-payment-intent`

```json
Request:
{
  "amount": 450.00,
  "tripId": "abc123",
  "bookingId": "booking-123",
  "tripName": "Mount Elbert Summit",
  "guideName": "Alex Mountain"
}

Response:
{
  "clientSecret": "pi_xxx_secret_xxx",
  "publishableKey": "pk_test_xxx"
}
```

### Using PaymentForm Component

```jsx
import { PaymentForm } from '@/components/PaymentForm';

<PaymentForm
  amount={450.00}
  tripId="abc123"
  tripName="Mount Elbert Summit"
  guideName="Alex Mountain"
  onSuccess={() => {
    // Booking confirmed
    window.location.href = '/bookings/confirmed';
  }}
  onError={(error) => {
    setError(error);
  }}
/>
```

## Testing

### Test Cards

Use these test card numbers in development:

| Card | Number | Exp | CVC |
|------|--------|-----|-----|
| Success | 4242 4242 4242 4242 | 12/25 | 123 |
| Decline | 4000 0000 0000 0002 | 12/25 | 123 |
| 3D Secure | 4000 0025 0000 3155 | 12/25 | 123 |

### Testing Payment Flow

1. Go to trip detail page
2. Select date, participants
3. Click "Book Now"
4. Enter test card details
5. Confirm payment

Expected: Redirect to `/bookings/confirmed`

## Current Implementation Status

### ✅ Completed
- Backend payment intent creation
- Frontend payment form component
- Environment configuration
- Test mode support

### ⏳ TODO (Next Phase)
1. **Booking Integration**
   - Update booking status after payment
   - Store payment intent ID in database
   - Handle payment failures gracefully

2. **Webhook Handling**
   - Listen for `payment_intent.succeeded`
   - Auto-update booking status
   - Send confirmation emails

3. **Refunds**
   - Implement refund API endpoint
   - Handle cancellation refunds
   - Track payout timing

4. **Payout Management**
   - Set up Stripe Connect (guide payouts)
   - Handle commission splits
   - Track guide earnings

5. **Error Handling**
   - Better error messages
   - Retry logic
   - Card decline handling

6. **Analytics**
   - Track payment success rate
   - Revenue metrics
   - Failed payment analysis

## Stripe Connect (For Future)

To automatically pay guides:

1. Set up Stripe Connect: https://dashboard.stripe.com/connect/accounts/overview
2. Guides authorize their Stripe account
3. Platform takes 12% commission, pays 88% to guide
4. Payouts handled automatically

```jsx
// Future: Create payment with payout
await stripe.paymentIntents.create({
  amount: 45000, // $450
  currency: 'usd',
  application_fee_amount: 5400, // 12% = $54
  stripe_account: guideStripeAccountId, // Pays to guide
});
```

## Security Notes

- ✅ Secret key never exposed to frontend
- ✅ Amount verified on backend
- ✅ PCI compliance via Stripe
- ✅ HTTPS only (Vercel enforces)
- ⚠️ Webhook signing required (implement soon)

## Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)
- [Embedded Checkout](https://stripe.com/docs/payments/quickstart)
- [Testing Guide](https://stripe.com/docs/testing)

## Troubleshooting

### "Publishable key not found"
- Check `.env.local` has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Restart dev server after adding env vars
- Verify key starts with `pk_`

### Payment form not loading
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Verify Stripe key is valid

### "Invalid client_secret"
- Check backend is returning correct clientSecret
- Verify payment intent was created successfully
- Check API key permissions

### Cards declining in test mode
- Use test card numbers from Testing section
- Use any future expiry date and CVC
- Stripe automatically declines some test numbers

## Next Steps

1. ✅ Add your Stripe keys to `.env.local`
2. ✅ Test payment flow with test cards
3. ⏳ Implement booking status update after payment
4. ⏳ Set up webhooks for payment confirmations
5. ⏳ Add Stripe Connect for guide payouts
