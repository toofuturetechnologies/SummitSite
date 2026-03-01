/**
 * Email Service Integration
 * Handles email sending with templates
 * Provider: Resend (https://resend.com)
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  name: string;
  subject: string;
  variables: Record<string, string>;
}

/**
 * Send transactional email with template
 */
export async function sendEmail(
  to: string,
  templateName: string,
  variables: Record<string, string>
) {
  try {
    const template = getTemplate(templateName, variables);

    const result = await resend.emails.send({
      from: 'Summit <noreply@summit.local>',
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`[Email] Sent ${templateName} to ${to}:`, result.data?.id);
    return result.data;
  } catch (error) {
    console.error(`[Email] Failed to send ${templateName}:`, error);
    throw error;
  }
}

/**
 * Get template with variables filled in
 */
function getTemplate(
  templateName: string,
  variables: Record<string, string>
): { subject: string; html: string; text: string } {
  switch (templateName) {
    case 'booking-confirmation':
      return {
        subject: `Booking Confirmed: ${variables.trip_name}`,
        html: renderBookingConfirmation(variables),
        text: renderBookingConfirmationText(variables),
      };

    case 'payment-receipt':
      return {
        subject: `Payment Receipt - ${variables.receipt_id}`,
        html: renderPaymentReceipt(variables),
        text: renderPaymentReceiptText(variables),
      };

    case 'guide-payout':
      return {
        subject: `Payout Processed - $${variables.net_payout}`,
        html: renderGuidePayout(variables),
        text: renderGuidePayoutText(variables),
      };

    case 'review-reminder':
      return {
        subject: `Share Your Experience - ${variables.trip_name}`,
        html: renderReviewReminder(variables),
        text: renderReviewReminderText(variables),
      };

    case 'dispute-resolved':
      return {
        subject: `Dispute Resolved: ${variables.resolution_status}`,
        html: renderDisputeResolved(variables),
        text: renderDisputeResolvedText(variables),
      };

    default:
      throw new Error(`Unknown template: ${templateName}`);
  }
}

// ============================================
// HTML Templates
// ============================================

function renderBookingConfirmation(vars: Record<string, string>): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">✓ Booking Confirmed!</h1>
      </div>
      <div style="padding: 30px;">
        <p>Hi ${vars.customer_name},</p>
        <p>Your booking with Summit has been confirmed! Get ready for an amazing adventure.</p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #0284c7;">Booking Details</h2>
          <div style="margin: 10px 0;"><strong>Trip:</strong> ${vars.trip_name}</div>
          <div style="margin: 10px 0;"><strong>Location:</strong> ${vars.trip_location}</div>
          <div style="margin: 10px 0;"><strong>Date:</strong> ${vars.trip_date}</div>
          <div style="margin: 10px 0;"><strong>Participants:</strong> ${vars.participant_count}</div>
          <div style="margin: 10px 0; font-size: 18px; color: #0284c7;"><strong>Total: $${vars.total_price}</strong></div>
        </div>

        <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Guide: ${vars.guide_name}</h3>
          <p style="margin: 5px 0; color: #666;">⭐ ${vars.guide_rating} (${vars.guide_reviews} reviews)</p>
          <p style="margin: 10px 0; color: #666;">Message your guide to coordinate final details.</p>
        </div>

        <p><a href="${vars.dashboard_url}" style="display: inline-block; background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Booking Details</a></p>

        <p style="color: #666; font-size: 14px;">Happy adventuring,<br><strong>The Summit Team</strong></p>
      </div>
    </div>
  `;
}

function renderPaymentReceipt(vars: Record<string, string>): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">💳 Payment Receipt</h1>
      </div>
      <div style="padding: 30px;">
        <p>Hi ${vars.customer_name},</p>
        <p>Thank you for your payment. Here's your receipt:</p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span>Receipt Number:</span>
            <strong>${vars.receipt_id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span>Trip:</span>
            <strong>${vars.trip_name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span>Participants:</span>
            <strong>${vars.participant_count}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; color: #0284c7; border-top: 2px solid #e2e8f0;">
            <span>Total Paid:</span>
            <span>$${vars.total_paid}</span>
          </div>
        </div>

        <p><strong>Payment Method:</strong> ${vars.payment_method}<br><strong>Transaction ID:</strong> ${vars.transaction_id}</p>

        <p style="color: #666; font-size: 14px;">Your booking is confirmed. You should receive a separate email with your guide's contact information.</p>
      </div>
    </div>
  `;
}

function renderGuidePayout(vars: Record<string, string>): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">💰 Payout Processed</h1>
      </div>
      <div style="padding: 30px;">
        <p>Hi ${vars.guide_name},</p>
        <p>Great news! Your payout has been processed and is on its way to you.</p>

        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payout Details</h3>
          <div style="margin: 15px 0;"><strong>Period:</strong> ${vars.payout_period}</div>
          <div style="margin: 15px 0;"><strong>Bookings:</strong> ${vars.booking_count} trips</div>

          <div style="background: #ffffff; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Gross Earnings:</span>
              <strong>$${vars.gross_earnings}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span>Platform Commission (12%):</span>
              <strong>-$${vars.commission}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #e5e7eb; padding-top: 8px; margin-top: 10px;">
              <span style="font-weight: bold;">Your Payout:</span>
              <strong style="color: #10b981; font-size: 18px;">$${vars.net_payout}</strong>
            </div>
          </div>

          <div style="font-size: 13px; color: #666; margin-top: 15px;">
            <strong>Expected Arrival:</strong> ${vars.arrival_date} (1-3 business days)<br>
            <strong>Bank Account:</strong> ${vars.bank_account_last4}
          </div>
        </div>

        <p>Thank you for being an amazing guide on Summit! 🏔️</p>
      </div>
    </div>
  `;
}

function renderReviewReminder(vars: Record<string, string>): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">⭐ How Was Your Adventure?</h1>
      </div>
      <div style="padding: 30px;">
        <p>Hi ${vars.customer_name},</p>
        <p>We hope you had an amazing time on your ${vars.trip_name} with ${vars.guide_name}! We'd love to hear about your experience.</p>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Review Helps Others</h3>
          <p>Verified reviews help future adventurers find the perfect guide.</p>
          <a href="${vars.review_url}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Leave a Review</a>
        </div>

        <h3>What to Include</h3>
        <ul style="color: #666;">
          <li><strong>Safety:</strong> Did the guide prioritize safety?</li>
          <li><strong>Knowledge:</strong> How knowledgeable was the guide?</li>
          <li><strong>Professionalism:</strong> Was the guide organized and punctual?</li>
          <li><strong>Friendliness:</strong> Did you enjoy the guide's personality?</li>
          <li><strong>Value:</strong> Did you feel the trip was worth the price?</li>
        </ul>
      </div>
    </div>
  `;
}

function renderDisputeResolved(vars: Record<string, string>): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">✓ Dispute Resolved</h1>
      </div>
      <div style="padding: 30px;">
        <p>Hi ${vars.customer_name},</p>
        <p>Your dispute regarding booking ${vars.booking_id} has been reviewed and resolved.</p>

        <div style="background: ${vars.resolution_status === 'Approved' ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${vars.resolution_status === 'Approved' ? '#10b981' : '#ef4444'}; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: ${vars.resolution_status === 'Approved' ? '#10b981' : '#ef4444'};">Resolution: ${vars.resolution_status}</h3>
          
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <div style="margin: 8px 0;"><strong>Trip:</strong> ${vars.trip_name}</div>
            <div style="margin: 8px 0;"><strong>Original Amount:</strong> $${vars.booking_amount}</div>
            
            ${vars.resolution_status === 'Approved' ? `
            <div style="margin: 15px 0; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <div style="margin: 8px 0; color: #10b981; font-weight: bold;">✓ Refund Approved</div>
              <div style="margin: 8px 0;"><strong>Refund Amount:</strong> $${vars.refund_amount}</div>
              <div style="margin: 8px 0;"><strong>Status:</strong> Processing (1-3 business days)</div>
            </div>
            ` : `
            <div style="margin: 15px 0; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <div style="margin: 8px 0; color: #ef4444;">✗ Refund Denied</div>
              <div style="margin: 8px 0;"><strong>Reason:</strong> ${vars.denial_reason}</div>
            </div>
            `}
          </div>

          <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 15px 0; font-size: 13px; color: #666;">
            <strong>Notes:</strong><br>
            ${vars.support_notes}
          </div>
        </div>

        <p style="color: #666; font-size: 14px;">If you have questions, please <a href="${vars.contact_url}" style="color: #3b82f6;">contact our support team</a>.</p>
      </div>
    </div>
  `;
}

// ============================================
// Text Templates
// ============================================

function renderBookingConfirmationText(vars: Record<string, string>): string {
  return `
Booking Confirmed!

Hi ${vars.customer_name},

Your booking with Summit has been confirmed!

BOOKING DETAILS:
Trip: ${vars.trip_name}
Location: ${vars.trip_location}
Date: ${vars.trip_date}
Participants: ${vars.participant_count}
Total: $${vars.total_price}

Your Guide: ${vars.guide_name}
Rating: ⭐ ${vars.guide_rating} (${vars.guide_reviews} reviews)

Message your guide to coordinate final details.

View your booking: ${vars.dashboard_url}

Happy adventuring!
The Summit Team
  `;
}

function renderPaymentReceiptText(vars: Record<string, string>): string {
  return `
Payment Receipt

Hi ${vars.customer_name},

Thank you for your payment.

Receipt Number: ${vars.receipt_id}
Trip: ${vars.trip_name}
Participants: ${vars.participant_count}
Total Paid: $${vars.total_paid}

Payment Method: ${vars.payment_method}
Transaction ID: ${vars.transaction_id}

Your booking is confirmed. You should receive a separate email with your guide's contact information.
  `;
}

function renderGuidePayoutText(vars: Record<string, string>): string {
  return `
Payout Processed

Hi ${vars.guide_name},

Your payout has been processed!

Period: ${vars.payout_period}
Bookings: ${vars.booking_count} trips

Gross Earnings: $${vars.gross_earnings}
Platform Commission (12%): -$${vars.commission}
Your Payout: $${vars.net_payout}

Expected Arrival: ${vars.arrival_date} (1-3 business days)
Bank Account: ${vars.bank_account_last4}

Thank you for being an amazing guide!
The Summit Team
  `;
}

function renderReviewReminderText(vars: Record<string, string>): string {
  return `
How Was Your Adventure?

Hi ${vars.customer_name},

We hope you had an amazing time on your ${vars.trip_name} with ${vars.guide_name}!

Your Review Helps Others:
Leave a review to help future adventurers find the perfect guide.

Review URL: ${vars.review_url}

What to Include:
- Safety: Did the guide prioritize safety?
- Knowledge: How knowledgeable was the guide?
- Professionalism: Was the guide organized?
- Friendliness: Did you enjoy the guide?
- Value: Was it worth the price?

Thank you!
The Summit Team
  `;
}

function renderDisputeResolvedText(vars: Record<string, string>): string {
  return `
Dispute Resolved

Hi ${vars.customer_name},

Your dispute for booking ${vars.booking_id} has been reviewed.

Trip: ${vars.trip_name}
Original Amount: $${vars.booking_amount}

Resolution: ${vars.resolution_status}

${vars.resolution_status === 'Approved' ? `
Refund Amount: $${vars.refund_amount}
Status: Processing (1-3 business days)
` : `
Refund Denied
Reason: ${vars.denial_reason}
`}

Notes: ${vars.support_notes}

Contact support if you have questions: ${vars.contact_url}

The Summit Team
  `;
}
