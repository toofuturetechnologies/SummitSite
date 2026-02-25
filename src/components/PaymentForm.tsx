'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface PaymentFormProps {
  amount: number;
  tripId: string;
  tripName: string;
  guideName: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PaymentForm({
  amount,
  tripId,
  tripName,
  guideName,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          tripId,
          tripName,
          guideName,
          bookingId: `${tripId}-${Date.now()}`, // Temporary ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment setup failed');
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-white font-semibold">${amount.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 text-sm">
            Secure payment powered by Stripe
          </p>
        </div>
        <button
          onClick={createPaymentIntent}
          disabled={loading}
          className="w-full bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Setting up payment...' : 'Proceed to Payment'}
        </button>
      </div>
    );
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        onComplete: () => {
          onSuccess();
        },
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
