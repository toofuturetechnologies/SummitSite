/**
 * Webhook Handler - Main entry point for all Summit webhooks
 * Validates signatures, routes to handlers, manages retries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';

export const runtime = 'nodejs';

interface WebhookEvent {
  id: string;
  type: string;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * Verify webhook signature (HMAC-SHA256)
 */
function verifySignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

/**
 * Log webhook event
 */
async function logWebhookEvent(
  event: WebhookEvent,
  status: 'received' | 'processed' | 'failed',
  error?: string
) {
  try {
    // Could store in database for audit trail
    console.log(`[Webhook] ${event.type} - ${status}`, {
      id: event.id,
      timestamp: event.timestamp,
      error,
    });
  } catch (err) {
    console.error('Failed to log webhook:', err);
  }
}

/**
 * Route webhook to appropriate handler
 */
async function routeWebhook(event: WebhookEvent): Promise<void> {
  switch (event.type) {
    case 'payment.succeeded':
      await handlePaymentSucceeded(event.data);
      break;

    case 'booking.created':
      await handleBookingCreated(event.data);
      break;

    case 'booking.confirmed':
      await handleBookingConfirmed(event.data);
      break;

    case 'booking.cancelled':
      await handleBookingCancelled(event.data);
      break;

    case 'review.submitted':
      await handleReviewSubmitted(event.data);
      break;

    case 'dispute.created':
      await handleDisputeCreated(event.data);
      break;

    case 'dispute.resolved':
      await handleDisputeResolved(event.data);
      break;

    case 'ugc.approved':
      await handleUGCApproved(event.data);
      break;

    case 'ugc.rejected':
      await handleUGCRejected(event.data);
      break;

    case 'user.suspended':
      await handleUserSuspended(event.data);
      break;

    default:
      console.warn(`Unknown webhook type: ${event.type}`);
  }
}

// ============================================
// Webhook Handlers
// ============================================

async function handlePaymentSucceeded(data: any) {
  console.log('[Payment] Payment succeeded:', data.booking_id);
  // TODO: Send confirmation email, update analytics, notify guide
}

async function handleBookingCreated(data: any) {
  console.log('[Booking] Created:', data.booking_id);
  // TODO: Notify guide, send customer confirmation
}

async function handleBookingConfirmed(data: any) {
  console.log('[Booking] Confirmed:', data.booking_id);
  // TODO: Send to both parties, unlock guide calendar
}

async function handleBookingCancelled(data: any) {
  console.log('[Booking] Cancelled:', data.booking_id);
  // TODO: Process refund, release calendar, send notifications
}

async function handleReviewSubmitted(data: any) {
  console.log('[Review] Submitted:', data.review_id);
  // TODO: Update guide rating, notify guide, send thank you email
}

async function handleDisputeCreated(data: any) {
  console.log('[Dispute] Created:', data.dispute_id);
  // TODO: Alert support team, log case
}

async function handleDisputeResolved(data: any) {
  console.log('[Dispute] Resolved:', data.dispute_id);
  // TODO: Process refund if approved, notify both parties
}

async function handleUGCApproved(data: any) {
  console.log('[UGC] Approved:', data.ugc_id);
  // TODO: Notify creator, publish to feed, share on socials
}

async function handleUGCRejected(data: any) {
  console.log('[UGC] Rejected:', data.ugc_id);
  // TODO: Notify creator with reason, suggest improvements
}

async function handleUserSuspended(data: any) {
  console.log('[User] Suspended:', data.user_id);
  // TODO: Disable account access, notify user, alert support
}

// ============================================
// Main Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Get signature from header
    const signature = request.headers.get('x-webhook-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Verify signature
    const secret = process.env.WEBHOOK_SECRET || '';
    if (!secret) {
      console.error('WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    if (!verifySignature(body, signature, secret)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse event
    const event: WebhookEvent = JSON.parse(body);

    // Log receipt
    await logWebhookEvent(event, 'received');

    // Return 200 immediately (don't wait for processing)
    const response = NextResponse.json({ received: true }, { status: 200 });

    // Process asynchronously
    routeWebhook(event)
      .then(async () => {
        await logWebhookEvent(event, 'processed');
      })
      .catch(async (error) => {
        console.error('Webhook processing failed:', error);
        await logWebhookEvent(event, 'failed', error.message);
      });

    return response;
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/webhooks',
    version: '1.0',
  });
}
