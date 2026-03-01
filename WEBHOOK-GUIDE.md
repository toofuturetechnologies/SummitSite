# Webhook Integration Guide

Complete documentation for integrating with Summit webhooks.

---

## Overview

Webhooks allow you to receive real-time notifications when events happen on Summit. When an event occurs, we send an HTTP POST request to your configured webhook URL with event data.

**Use Cases:**
- Sync bookings to your CRM
- Send confirmation emails
- Update inventory management
- Generate invoices
- Monitor disputes and refunds
- Trigger third-party integrations

---

## Getting Started

### 1. Configure Your Webhook URL

Go to **Settings → Webhooks** in your Summit dashboard:

```
https://summit-site-seven.vercel.app/dashboard/webhooks
```

- Add your webhook endpoint URL
- Select which events you want to receive
- Test the webhook (we'll send a test event)
- Save and activate

### 2. Webhook URL Requirements

Your endpoint must:
- **Be publicly accessible** (HTTPS only)
- **Accept POST requests**
- **Respond within 30 seconds** with a 2xx status code
- **Validate webhook signatures** (see Security section below)

---

## Events

### 1. payment.succeeded
**When:** Customer completes payment for a booking

```json
{
  "id": "evt_1234567890",
  "type": "payment.succeeded",
  "timestamp": "2026-03-01T10:30:00Z",
  "data": {
    "booking_id": "uuid",
    "trip_id": "uuid",
    "customer_id": "uuid",
    "guide_id": "uuid",
    "amount": 450.00,
    "currency": "usd",
    "payment_method": "card",
    "stripe_charge_id": "ch_1234567890"
  }
}
```

**Use For:** Trigger confirmation email, update CRM, log transaction

---

### 2. booking.created
**When:** New booking is made (before payment)

```json
{
  "id": "evt_1234567891",
  "type": "booking.created",
  "timestamp": "2026-03-01T10:25:00Z",
  "data": {
    "booking_id": "uuid",
    "trip_id": "uuid",
    "customer_id": "uuid",
    "guide_id": "uuid",
    "participants": 2,
    "trip_date": "2026-04-15",
    "status": "pending",
    "amount": 450.00
  }
}
```

**Use For:** Notify guide, update availability, send reminder email

---

### 3. booking.confirmed
**When:** Booking payment confirmed and status = confirmed

```json
{
  "id": "evt_1234567892",
  "type": "booking.confirmed",
  "timestamp": "2026-03-01T10:30:30Z",
  "data": {
    "booking_id": "uuid",
    "trip_id": "uuid",
    "customer_id": "uuid",
    "guide_id": "uuid",
    "trip_date": "2026-04-15",
    "participants": 2,
    "amount": 450.00
  }
}
```

**Use For:** Send confirmation SMS, unlock guide's calendar, notify both parties

---

### 4. booking.cancelled
**When:** Booking is cancelled

```json
{
  "id": "evt_1234567893",
  "type": "booking.cancelled",
  "timestamp": "2026-03-02T14:00:00Z",
  "data": {
    "booking_id": "uuid",
    "trip_id": "uuid",
    "customer_id": "uuid",
    "guide_id": "uuid",
    "cancellation_reason": "customer_request",
    "refund_amount": 450.00,
    "refund_status": "initiated"
  }
}
```

**Use For:** Process refund, release guide's calendar, send cancellation email

---

### 5. review.submitted
**When:** Customer submits review after trip

```json
{
  "id": "evt_1234567894",
  "type": "review.submitted",
  "timestamp": "2026-03-05T16:00:00Z",
  "data": {
    "review_id": "uuid",
    "booking_id": "uuid",
    "guide_id": "uuid",
    "customer_id": "uuid",
    "rating": 5,
    "comment": "Amazing experience!",
    "trip_id": "uuid"
  }
}
```

**Use For:** Update review count, notify guide, trigger recommendation email

---

### 6. dispute.created
**When:** Customer files a dispute

```json
{
  "id": "evt_1234567895",
  "type": "dispute.created",
  "timestamp": "2026-03-06T10:00:00Z",
  "data": {
    "dispute_id": "uuid",
    "booking_id": "uuid",
    "customer_id": "uuid",
    "guide_id": "uuid",
    "reason": "quality",
    "description": "Guide did not meet expectations",
    "amount": 450.00
  }
}
```

**Use For:** Alert support team, log dispute, notify both parties

---

### 7. dispute.resolved
**When:** Admin resolves a dispute

```json
{
  "id": "evt_1234567896",
  "type": "dispute.resolved",
  "timestamp": "2026-03-10T12:00:00Z",
  "data": {
    "dispute_id": "uuid",
    "booking_id": "uuid",
    "customer_id": "uuid",
    "guide_id": "uuid",
    "resolution": "approved",
    "refund_amount": 450.00,
    "reason": "Quality of service not met"
  }
}
```

**Use For:** Process refund, update customer records, notify both parties

---

### 8. ugc.approved
**When:** Admin approves UGC content

```json
{
  "id": "evt_1234567897",
  "type": "ugc.approved",
  "timestamp": "2026-03-01T09:00:00Z",
  "data": {
    "ugc_id": "uuid",
    "trip_id": "uuid",
    "creator_id": "uuid",
    "guide_id": "uuid",
    "tiktok_url": "https://www.tiktok.com/@user/video/123456"
  }
}
```

**Use For:** Notify creator, share on social media, update featured content

---

### 9. ugc.rejected
**When:** Admin rejects UGC content

```json
{
  "id": "evt_1234567898",
  "type": "ugc.rejected",
  "timestamp": "2026-03-01T10:00:00Z",
  "data": {
    "ugc_id": "uuid",
    "trip_id": "uuid",
    "creator_id": "uuid",
    "reason": "inappropriate",
    "rejection_reason": "Contains prohibited content"
  }
}
```

**Use For:** Notify creator, log for moderation review, request resubmission

---

### 10. user.suspended
**When:** Admin suspends user account

```json
{
  "id": "evt_1234567899",
  "type": "user.suspended",
  "timestamp": "2026-03-15T14:00:00Z",
  "data": {
    "user_id": "uuid",
    "reason": "violating_terms",
    "suspended_by": "admin_id",
    "expires_at": null,
    "permanent": true
  }
}
```

**Use For:** Disable account in your system, notify user, block from platform

---

## Security

### Verify Webhook Signatures

All webhook requests include a signature header: `X-Webhook-Signature`

**To verify:**

1. Get the webhook secret from your dashboard
2. Combine webhook secret with request body
3. Generate HMAC-SHA256 hash
4. Compare with signature header

**Example (Node.js):**

```javascript
const crypto = require('crypto');

function verifyWebhook(body, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return hash === signature;
}

// In your handler:
app.post('/webhooks/summit', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const body = req.body;

  if (!verifyWebhook(JSON.stringify(body), signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook...
  res.status(200).json({ success: true });
});
```

**Example (Python):**

```python
import hmac
import hashlib
import json

def verify_webhook(body, signature, secret):
    hash = hmac.new(
        secret.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(hash, signature)

# In your handler:
@app.route('/webhooks/summit', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    body = request.get_data(as_text=True)

    if not verify_webhook(body, signature, os.environ.get('WEBHOOK_SECRET')):
        return jsonify({'error': 'Invalid signature'}), 401

    # Process webhook...
    return jsonify({'success': True}), 200
```

---

## Handling Webhooks

### Best Practices

1. **Always verify the signature** - Prevents spoofed events
2. **Respond quickly** - Return 2xx within 30 seconds
3. **Queue for processing** - Don't do heavy work in the handler
4. **Idempotency** - Handle duplicate events gracefully
5. **Log everything** - Store webhook logs for debugging
6. **Retry strategy** - We retry failed webhooks 5 times

### Retry Logic

If your endpoint doesn't return a 2xx status code:
- Retry 1: 1 minute later
- Retry 2: 5 minutes later
- Retry 3: 30 minutes later
- Retry 4: 2 hours later
- Retry 5: 24 hours later

### Example Handler (Express.js)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Webhook handler
app.post('/webhooks/summit', async (req, res) => {
  const event = req.body;
  const signature = req.headers['x-webhook-signature'];

  // Verify signature
  if (!verifyWebhook(JSON.stringify(event), signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Return 200 immediately
  res.status(200).json({ received: true });

  // Process asynchronously
  await processEvent(event).catch(err => {
    console.error('Webhook processing failed:', err);
    // Log for manual review
  });
});

async function processEvent(event) {
  switch (event.type) {
    case 'payment.succeeded':
      await sendConfirmationEmail(event.data.customer_id);
      await updateCRM(event.data);
      break;

    case 'booking.confirmed':
      await notifyGuide(event.data.guide_id);
      await updateCalendar(event.data);
      break;

    case 'dispute.resolved':
      await processRefund(event.data);
      break;

    // Handle other events...
  }
}

app.listen(3000, () => console.log('Webhook server running'));
```

---

## Testing Webhooks

### Manual Testing

1. Go to **Settings → Webhooks** in your dashboard
2. Find your webhook URL
3. Click **Send Test Event**
4. Choose event type
5. Review the JSON payload
6. Verify your endpoint receives and processes it

### Using ngrok for Local Testing

```bash
# Terminal 1: Start your local server
npm start

# Terminal 2: Expose to internet
ngrok http 3000

# Use ngrok URL in dashboard
# https://abc123.ngrok.io/webhooks/summit
```

---

## Troubleshooting

### Webhook Not Triggering

1. Check webhook is enabled in dashboard
2. Verify URL is publicly accessible (test with curl)
3. Check firewall/network settings
4. Review webhook logs in dashboard

### Signature Verification Failing

1. Double-check secret from dashboard
2. Ensure you're hashing the raw request body (not parsed JSON)
3. Use `request.get_data(as_text=True)` (Python) or similar
4. Test with example signature provided in dashboard

### Webhook Timing Out

1. Return 200 immediately, then process
2. Use background jobs for heavy work
3. Increase timeout settings if possible
4. Check for database performance issues

---

## Support

For webhook issues or questions:
- Email: webhooks@summit.local
- Docs: https://docs.summit.local/webhooks
- Status: https://status.summit.local
