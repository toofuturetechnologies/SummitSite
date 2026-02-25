# Setup Scripts

Helper scripts for configuring Summit Platform.

## setup-webhook-interactive.sh

**Purpose:** Automated setup of Stripe webhook for account events

**What it does:**
1. ✅ Validates your Stripe Secret Key
2. ✅ Checks your Stripe account
3. ✅ Creates or updates webhook endpoint
4. ✅ Outputs the webhook signing secret
5. ✅ Provides exact env var to add to Vercel

**Usage:**

```bash
# With key in env var
export STRIPE_SECRET_KEY=sk_test_...
./setup-webhook-interactive.sh

# Or interactively (will prompt for key)
./setup-webhook-interactive.sh
```

**Output Example:**
```
✅ Webhook created successfully!
   ID: we_1234567890
   URL: https://summit-site-seven.vercel.app/api/stripe-webhook-account
   Events:
     - account.updated
     - account.external_account.created
     - account.external_account.updated

========================================
📋 ADD THIS TO YOUR VERCEL ENVIRONMENT:
========================================

Variable Name:  STRIPE_WEBHOOK_SECRET_ACCOUNT
Variable Value: whsec_1234567890abcdef...

📍 Go to: https://vercel.com/.../settings/environment-variables
```

**Next Steps:**
1. Copy the `STRIPE_WEBHOOK_SECRET_ACCOUNT` value
2. Go to Vercel → Settings → Environment Variables
3. Add new variable with that name and value
4. Redeploy: `git push origin main`

---

## setup-stripe-webhook.js

**Purpose:** Node.js version of webhook setup (if you prefer Node to bash)

**Usage:**
```bash
STRIPE_SECRET_KEY=sk_test_... node setup-stripe-webhook.js
```

**Same output as the bash script above.**

---

## Getting Your Stripe Secret Key

1. Go to **https://dashboard.stripe.com/apikeys**
2. Make sure you're in **API Keys** section (not webhooks)
3. Under **Secret key**, click **Reveal test key** (or live key)
4. Copy the key (starts with `sk_test_` or `sk_live_`)
5. Don't share this key - it's like a password

---

## After Setup

Your webhook will:
- ✅ Receive events when guides connect bank accounts
- ✅ Mark guides as ready for automatic payouts
- ✅ Enable Stripe Transfers on next booking

**Verify it's working:**
1. Go to **https://dashboard.stripe.com/webhooks**
2. Click your webhook endpoint
3. Click **Send test event**
4. Select **account.updated**
5. Check for a green checkmark ✅

---

## Troubleshooting

### "Invalid Stripe key format"
- Make sure it starts with `sk_test_` or `sk_live_`
- Don't include the key from "Publishable keys"

### "Invalid API Key"
- Key might be wrong or revoked
- Generate a new one from https://dashboard.stripe.com/apikeys

### Webhook not receiving events
- Check URL is exactly: `https://summit-site-seven.vercel.app/api/stripe-webhook-account`
- Verify `STRIPE_WEBHOOK_SECRET_ACCOUNT` is set in Vercel
- Look in Stripe Dashboard → Webhooks → Your endpoint → Logs

### Need help?
- Stripe docs: https://stripe.com/docs/webhooks
- Vercel env vars: https://vercel.com/docs/environment-variables
- Summit docs: See `STRIPE-WEBHOOK-SETUP.md`
