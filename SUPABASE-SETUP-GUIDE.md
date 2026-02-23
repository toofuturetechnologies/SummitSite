# Supabase Setup Guide

## ⚠️ CRITICAL: Migrations Must Be Applied Manually

The database migrations are stored in `/supabase/migrations/` but **do not auto-apply** to your Supabase project. You must manually run them.

---

## Migration 1: Initial Schema (001_initial_schema.sql)

This is the **foundation** migration. It should already be applied (since the app is working). But verify it:

**Go to:** https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl/sql/templates

**Click "New Query" and run:**
```sql
-- Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'profiles'
);
```

If it returns `true`, migration 1 is applied. ✅

If `false`, copy the entire contents of `/supabase/migrations/001_initial_schema.sql` and run it.

---

## Migration 2: Payment Fields (002_add_payment_fields.sql)

**CRITICAL FOR PAYMENTS** — Adds `hosting_fee` and `payment_status` columns to bookings table.

**Run this SQL:**
```sql
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS hosting_fee DECIMAL(10,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' 
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed'));
```

**Verify it worked:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name IN ('hosting_fee', 'payment_status');
```

Should return 2 rows. ✅

---

## Auth Setup: Email Confirmation

The app uses Supabase Auth for user signups. By default, email confirmation is **required**.

### Option A: Disable Email Confirmation (Recommended for Testing)

1. Go to: **https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl/auth/providers**
2. Find **"Email Confirmations"** setting
3. Toggle to **OFF** (or set to optional)
4. Save

This allows users to sign up and use the app immediately.

### Option B: Keep Email Confirmation (Production)

If you want to keep email verification:
1. Configure email provider (SendGrid, Mailgun, etc.)
2. Users will receive confirmation emails
3. Click the link to verify and use the app

---

## Environment Variables (Vercel)

Make sure these are configured in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://nqczucpdkccbkydbzytl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your anon key]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]
```

**Get these from:** https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl/settings/api

---

## Stripe Setup (Payment Processing)

### 1. Enable Stripe in Supabase

Supabase has built-in Stripe integration. Optional but recommended.

### 2. Configure Stripe Keys in Vercel

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Get these from:** https://dashboard.stripe.com/apikeys

### 3. Configure Webhook

**In Stripe Dashboard:**
1. Go to **Webhooks**
2. Click **Add endpoint**
3. URL: `https://summit-site-seven.vercel.app/api/stripe-webhook`
4. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Save and copy the **Signing Secret**

**Add to Vercel:** `STRIPE_WEBHOOK_SECRET=[signing secret]`

---

## Email Setup (Resend)

The app sends transactional emails via Resend API.

### 1. Create Resend Account

Go to: https://resend.com/

### 2. Get API Key

1. Dashboard → API Keys
2. Copy your API key
3. Add to Vercel: `RESEND_API_KEY=[api_key]`
4. Add sender: `RESEND_FROM_EMAIL=noreply@summit.local` (or your domain)

### 3. Verify Domain (Optional)

For production, configure your domain's email sender in Resend.

---

## Database Schema Overview

### Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `auth.users` | Supabase auth | id, email, password |
| `profiles` | User info | id, full_name, user_type (traveler/guide) |
| `guides` | Guide-specific | user_id, display_name, specialties, rating |
| `trips` | Adventure trips | id, guide_id, title, price_per_person |
| `trip_dates` | Availability | trip_id, start_date, spots_available |
| `bookings` | Customer bookings | trip_id, user_id, payment_status, guide_payout |
| `reviews` | Trip reviews | booking_id, rating, comment |

### Key Constraints

- `profiles.user_type` must be: `'traveler'`, `'guide'`, or `'admin'`
- `bookings.payment_status` must be: `'unpaid'`, `'paid'`, `'refunded'`, or `'failed'`
- Foreign keys cascade on delete

---

## Troubleshooting

### Signup Error: "Database error saving new user"

**Cause:** Profile creation failed (trigger missing or profile insert failed)

**Fix:**
1. Check if migration 001 was applied
2. Check if the trigger exists:
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```
3. If missing, create it:
   ```sql
   CREATE OR REPLACE FUNCTION handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO profiles (id, full_name, email, user_type)
     VALUES (
       NEW.id,
       COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
       NEW.email,
       COALESCE(NEW.raw_user_meta_data->>'user_type', 'traveler')
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION handle_new_user();
   ```

### Payment Not Processing

1. Verify `STRIPE_WEBHOOK_SECRET` is in Vercel
2. Verify webhook endpoint in Stripe dashboard
3. Check Vercel logs for webhook errors
4. Check Stripe event log for delivery status

### Email Not Sending

1. Verify `RESEND_API_KEY` in Vercel
2. Verify `RESEND_FROM_EMAIL` is set
3. Check Resend dashboard for bounces/errors
4. Domain verification may be required for production

---

## Setup Checklist

- [ ] Migration 001 applied (profiles, guides, trips tables)
- [ ] Migration 002 applied (hosting_fee, payment_status columns)
- [ ] Email confirmation disabled OR email provider configured
- [ ] Supabase keys in Vercel
- [ ] Stripe keys in Vercel
- [ ] Stripe webhook configured
- [ ] Resend API key in Vercel
- [ ] Test signup: create customer account
- [ ] Test booking: book a trip
- [ ] Test payment: use test card 4242 4242 4242 4242

---

## Production Checklist

- [ ] Enable email confirmation with real provider
- [ ] Swap test Stripe keys for live keys
- [ ] Configure Stripe Connect for automatic guide payouts
- [ ] Set up domain email for Resend
- [ ] Enable RLS (Row Level Security) on sensitive tables
- [ ] Set up monitoring/alerts
- [ ] Configure backups and disaster recovery

---

## Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl
- **Stripe Dashboard:** https://dashboard.stripe.com/test/overview
- **Vercel Dashboard:** https://vercel.com/dashboard/project/summit-site
- **Resend Dashboard:** https://resend.com/dashboard
