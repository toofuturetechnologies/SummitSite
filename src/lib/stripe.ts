import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Commission rate (12%)
export const PLATFORM_FEE_PERCENT = 12

interface CreateCheckoutSessionParams {
  tripId: string
  tripDateId: string
  tripTitle: string
  pricePerPerson: number
  participantCount: number
  currency: string
  guideStripeAccountId: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const {
    tripId,
    tripDateId,
    tripTitle,
    pricePerPerson,
    participantCount,
    currency,
    guideStripeAccountId,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata = {},
  } = params

  const totalAmount = pricePerPerson * participantCount
  const applicationFee = Math.round(totalAmount * (PLATFORM_FEE_PERCENT / 100) * 100) // in cents

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: tripTitle,
            description: `${participantCount} participant${participantCount > 1 ? 's' : ''}`,
          },
          unit_amount: Math.round(pricePerPerson * 100), // Convert to cents
        },
        quantity: participantCount,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: guideStripeAccountId,
      },
      metadata: {
        trip_id: tripId,
        trip_date_id: tripDateId,
        ...metadata,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      trip_id: tripId,
      trip_date_id: tripDateId,
      ...metadata,
    },
  })

  return session
}

interface CreateConnectAccountParams {
  email: string
  guideId: string
  returnUrl: string
  refreshUrl: string
}

export async function createConnectAccount(params: CreateConnectAccountParams) {
  const { email, guideId, returnUrl, refreshUrl } = params

  // Create the Connect account
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    metadata: {
      guide_id: guideId,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  }
}

export async function createConnectLoginLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId)
  return loginLink.url
}

export async function getConnectAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  }
}

export async function createRefund(paymentIntentId: string, reason?: string) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: 'requested_by_customer',
    metadata: {
      custom_reason: reason || 'Trip cancelled',
    },
  })
  return refund
}
