'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function StripeConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guide, setGuide] = useState<any>(null);

  const success = searchParams.get('success');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          router.push('/auth/login');
          return;
        }

        // Get guide info
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('stripe_connect_account_id, display_name')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError) {
          setError('Guide profile not found');
          return;
        }

        setGuide(guideData);
        setConnected(!!guideData.stripe_connect_account_id);

        if (success === 'true') {
          setConnected(true);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();
  }, [router, success]);

  const handleConnectStripe = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push('/auth/login');
        return;
      }

      const { data: guideData } = await supabase
        .from('guides')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();

      if (!guideData) {
        setError('Guide profile not found');
        return;
      }

      // Get auth token
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      const response = await fetch('/api/stripe-connect-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          guideId: guideData.id,
          userId: authData.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get Stripe Connect URL');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900">
      <div className="max-w-2xl mx-auto p-8">
        {/* Header */}
        <Link
          href="/dashboard"
          className="text-summit-400 hover:text-summit-300 mb-8 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Stripe Payouts</h1>
        <p className="text-summit-300 mb-8">
          Connect your Stripe account to receive automatic payouts from bookings
        </p>

        {success === 'true' && (
          <div className="bg-green-900/50 text-green-100 p-4 rounded-lg mb-8 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span>Stripe account connected successfully! You&apos;ll now receive automatic payouts.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Connection Status */}
        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Connection Status</h2>

          {connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-white">Connected ✓</p>
                  <p className="text-green-300 text-sm">
                    Your Stripe account is ready to receive payouts
                  </p>
                </div>
              </div>

              <div className="bg-summit-900/50 rounded-lg p-4 space-y-2">
                <p className="text-summit-300 text-sm">
                  <strong>Payout Timeline:</strong> 2-3 business days after booking
                </p>
                <p className="text-summit-300 text-sm">
                  <strong>Fee Structure:</strong> You receive 88% of booking price minus platform fees
                </p>
                <p className="text-summit-300 text-sm">
                  <strong>Example:</strong> $450 booking → You get $395 (88% - $1 hosting fee)
                </p>
              </div>

              <Link
                href="/dashboard/earnings"
                className="block w-full bg-summit-600 hover:bg-summit-500 text-white font-medium py-3 rounded-lg transition text-center"
              >
                View Earnings Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-summit-300 mb-4">
                Connect your Stripe account to start receiving automatic payouts from your bookings.
              </p>

              <div className="bg-summit-900/50 rounded-lg p-4 space-y-2 mb-6">
                <p className="text-summit-300 text-sm">
                  <strong>What you&apos;ll need:</strong>
                </p>
                <ul className="text-summit-400 text-sm space-y-1 list-disc list-inside">
                  <li>Valid government ID (driver&apos;s license or passport)</li>
                  <li>Bank account for payouts</li>
                  <li>SSN (last 4 digits)</li>
                </ul>
              </div>

              <button
                onClick={handleConnectStripe}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-4 rounded-lg transition"
              >
                {loading ? 'Connecting...' : 'Connect Stripe Account'}
              </button>

              <p className="text-summit-400 text-xs text-center">
                Stripe is PCI-compliant and secure. You control your account details.
              </p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">How Payouts Work</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-summit-600 rounded-full text-white font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-white">Customer Books Your Trip</h3>
                <p className="text-summit-300 text-sm">
                  They pay through secure Stripe checkout
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-summit-600 rounded-full text-white font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-white">Platform Takes Commission</h3>
                <p className="text-summit-300 text-sm">
                  12% commission + $1 hosting fee per booking
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-summit-600 rounded-full text-white font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-white">You Get Paid</h3>
                <p className="text-summit-300 text-sm">
                  88% automatically transfers to your bank account (2-3 days)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-summit-600 rounded-full text-white font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-white">Track Earnings</h3>
                <p className="text-summit-300 text-sm">
                  View all payouts in your earnings dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StripeConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
          <p className="text-white text-lg">Loading...</p>
        </div>
      }
    >
      <StripeConnectContent />
    </Suspense>
  );
}
