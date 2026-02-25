# Stripe Webhook Setup for Account Events

## Quick Setup (2 minutes)

### Step 1: Get Your Stripe Secret Key
1. Go to **https://dashboard.stripe.com/apikeys**
2. Make sure you're viewing **Secret Key** (not Publishable Key)
3. Copy the key (starts with `sk_test_` or `sk_live_`)

### Step 2: Run the Setup Script

From the project root:

```bash
cd /home/ubuntu/.openclaw/workspace/vercel-summit

# Replace sk_test_XXX with your actual Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_XXX node scripts/setup-stripe-webhook.js
```

This script will:
- ✅ List your existing webhooks
- ✅ Create a new webhook endpoint for account events
- ✅ Output the webhook signing secret
- ✅ Show you exactly what to add to Vercel

### Step 3: Add Webhook Secret to Vercel

The script will output something like:
```
✅ Webhook created successfully!
   Secret: whsec_1234567890...

📝 Add this to your Vercel environment variables:
   STRIPE_WEBHOOK_SECRET_ACCOUNT=whsec_1234567890...
```

Then:
1. Go to **https://vercel.com/toofuturetechnologies/summitsite/settings/environment-variables**
2. Click **Add New**
3. Name: `STRIPE_WEBHOOK_SECRET_ACCOUNT`
4. Value: Paste the secret from the script output
5. Click **Save**

### Step 4: Redeploy

```bash
cd /home/ubuntu/.openclaw/workspace/vercel-summit
git add STRIPE-WEBHOOK-SETUP.md
git commit -m "docs: Add Stripe webhook setup guide"
git push origin main
```

Vercel will auto-redeploy with the new env var.

---

## Verify Webhook is Working

### Option A: Stripe Test Event
1. Go to **https://dashboard.stripe.com/webhooks**
2. Click on your new endpoint (`/api/stripe-webhook-account`)
3. Click **"Send test event"**
4. Select **"account.updated"**
5. Click **"Send test event"**
6. You should see a green checkmark ✅

### Option B: Manual Test

```bash
# Get your current webhook endpoint ID
curl https://api.stripe.com/v1/webhook_endpoints \
  -u sk_test_YOUR_KEY: \
  | grep -A 5 "stripe-webhook-account"
```

### Option C: Check Logs in Vercel
1. Go to **https://vercel.com/toofuturetechnologies/summitsite/logs**
2. Look for requests to `/api/stripe-webhook-account`
3. Should show `200 OK { received: true }`

---

## What the Webhook Does

When a guide connects their bank account via Stripe Connect:

1. **Guide clicks** "Connect Bank Account" → Redirected to Stripe onboarding
2. **Guide enters** banking details in Stripe (not on our site)
3. **Stripe verifies** the account (instant to 2 business days)
4. **Webhook fires** `account.updated` event with `charges_enabled: true`
5. **Our system** receives webhook and marks guide as ready for payouts
6. **Next booking** payout uses Stripe Transfers to send money directly

---

## Events Configured

The webhook listens for:
- `account.updated` — Main event when guide account is verified
- `account.external_account.created` — When bank account added
- `account.external_account.updated` — When bank account updated

---

## Troubleshooting

### Webhook Not Receiving Events?
1. Check the endpoint is active: `https://dashboard.stripe.com/webhooks`
2. Verify URL is correct: `https://summit-site-seven.vercel.app/api/stripe-webhook-account`
3. Check signing secret is set in `.env` locally or Vercel env vars
4. Look for errors in Vercel logs

### "Invalid Signature" Error?
- The `STRIPE_WEBHOOK_SECRET_ACCOUNT` might be wrong
- Go back to Stripe dashboard → click webhook → copy `Signing secret` again
- Update Vercel env var
- Redeploy

### Can't Find Stripe API Key?
- If you're on a team account, you might not have access to keys
- Ask the account owner to share the **Restricted API Key** with webhook management permissions
- Or create a new **Restricted Key** specifically for webhooks

---

## After Setup

Once the webhook is live:
- ✅ Guides can connect Stripe accounts
- ✅ System automatically marks them as ready
- ✅ Bookings will auto-payout to their account
- ✅ No manual payout transfers needed

---

**Need help?** Check the webhook logs in:
1. **Stripe Dashboard** → Webhooks → Your endpoint → Logs
2. **Vercel Dashboard** → Logs → Filter for "stripe-webhook-account"
3. **Local testing** → Check `/tmp/openclaw/openclaw-*.log`

---

## Files Related to This Setup

- **Webhook Handler:** `src/app/api/stripe-webhook-account/route.ts`
- **Setup Script:** `scripts/setup-stripe-webhook.js`
- **Payout Creator:** `src/app/api/create-payout/route.ts`
- **Environment:** `.env.local`, Vercel settings
