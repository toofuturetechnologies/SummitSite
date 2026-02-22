import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmationEmail(
  customerEmail: string,
  tripTitle: string,
  guideeName: string,
  amount: number,
  bookingDate: string
) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Summit <noreply@summit.local>',
      to: customerEmail,
      subject: '✅ Booking Confirmed - Summit Adventure',
      html: `
        <h2>Your Booking is Confirmed!</h2>
        <p>Great news! Your adventure booking has been confirmed.</p>
        
        <h3>Booking Details</h3>
        <ul>
          <li><strong>Trip:</strong> ${tripTitle}</li>
          <li><strong>Guide:</strong> ${guideeName}</li>
          <li><strong>Date:</strong> ${bookingDate}</li>
          <li><strong>Amount Paid:</strong> $${amount.toFixed(2)}</li>
        </ul>
        
        <p>Your guide will be in touch shortly with more details about your upcoming adventure.</p>
        
        <p>Questions? Contact support at support@summit.local</p>
        
        <p>Happy adventuring!<br/>The Summit Team</p>
      `,
    });

    console.log('Booking confirmation email sent to:', customerEmail);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
  }
}

export async function sendPayoutNotificationEmail(
  guideEmail: string,
  guideName: string,
  tripTitle: string,
  payout: number,
  hostingFee: number
) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Summit <noreply@summit.local>',
      to: guideEmail,
      subject: '💰 New Booking - Payout Coming Your Way',
      html: `
        <h2>New Booking Confirmed!</h2>
        <p>Hi ${guideName},</p>
        
        <p>A customer just booked your trip!</p>
        
        <h3>Booking Details</h3>
        <ul>
          <li><strong>Trip:</strong> ${tripTitle}</li>
          <li><strong>Gross Amount:</strong> $${payout + hostingFee + (payout + hostingFee) * 0.12}</li>
          <li><strong>Platform Fee (12%):</strong> -$${((payout + hostingFee) * 0.12).toFixed(2)}</li>
          <li><strong>Hosting Fee:</strong> -$${hostingFee.toFixed(2)}</li>
          <li><strong>Your Payout:</strong> <strong>$${payout.toFixed(2)}</strong></li>
        </ul>
        
        <p>Your payout will be transferred to your bank account within 2-3 business days.</p>
        
        <p>Keep up the great work!<br/>The Summit Team</p>
      `,
    });

    console.log('Payout notification email sent to:', guideEmail);
  } catch (error) {
    console.error('Failed to send payout notification email:', error);
  }
}

export async function sendRefundEmail(
  customerEmail: string,
  tripTitle: string,
  refundAmount: number
) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Summit <noreply@summit.local>',
      to: customerEmail,
      subject: '💳 Refund Processed - Summit Adventure',
      html: `
        <h2>Your Refund Has Been Processed</h2>
        <p>We've successfully refunded your booking for <strong>${tripTitle}</strong>.</p>
        
        <h3>Refund Details</h3>
        <ul>
          <li><strong>Amount Refunded:</strong> $${refundAmount.toFixed(2)}</li>
          <li><strong>Status:</strong> Processed</li>
          <li><strong>Timeline:</strong> 3-5 business days to appear in your account</li>
        </ul>
        
        <p>If you have any questions, please contact us at support@summit.local</p>
        
        <p>Thanks for using Summit!<br/>The Summit Team</p>
      `,
    });

    console.log('Refund email sent to:', customerEmail);
  } catch (error) {
    console.error('Failed to send refund email:', error);
  }
}

export async function sendPaymentFailedEmail(
  customerEmail: string,
  tripTitle: string,
  guideEmail?: string
) {
  try {
    // Customer notification
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Summit <noreply@summit.local>',
      to: customerEmail,
      subject: '❌ Payment Failed - Please Try Again',
      html: `
        <h2>Payment Failed</h2>
        <p>Unfortunately, your payment for <strong>${tripTitle}</strong> could not be processed.</p>
        
        <h3>What to Do Next</h3>
        <ul>
          <li>Check your card details and try again</li>
          <li>Use a different payment method</li>
          <li>Contact your bank if issues persist</li>
        </ul>
        
        <p><a href="https://summit.local/bookings" style="display: inline-block; padding: 10px 20px; background-color: #17a69a; color: white; text-decoration: none; border-radius: 5px;">Retry Payment</a></p>
        
        <p>Questions? Contact support@summit.local</p>
        
        <p>The Summit Team</p>
      `,
    });

    console.log('Payment failed email sent to customer:', customerEmail);

    // Guide notification (optional)
    if (guideEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Summit <noreply@summit.local>',
        to: guideEmail,
        subject: '⚠️ Booking Payment Failed - Action Needed',
        html: `
          <h2>Booking Payment Failed</h2>
          <p>A customer's payment failed for your trip <strong>${tripTitle}</strong>.</p>
          
          <p>The customer will receive a notification and can retry their payment. You don't need to take any action at this time.</p>
          
          <p>The Summit Team</p>
        `,
      });
      console.log('Payment failed notification sent to guide:', guideEmail);
    }
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
  }
}
