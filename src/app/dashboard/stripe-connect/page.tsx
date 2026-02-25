'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient();

export default function StripeConnectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login?returnTo=/dashboard/stripe-connect');
          return;
        }

        setUser(user);

        // Get guide
        const { data: guideData, error: guideError } = await (supabase as any)
          .from('guides')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (guideError || !guideData) {
          router.push('/trips');
          return;
        }

        setGuide(guideData);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error loading page');
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleConnectStripe = async () => {
    if (!guide || !user) return;

    try {
      setConnecting(true);
      setError(null);

      console.log('🔗 Creating Stripe Connect account for guide:', guide.id);

      // Call API to create Stripe Connect account and get onboarding link
      const response = await fetch('/api/stripe-connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId: guide.id,
          guideName: guide.display_name,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Stripe account');
      }

      const data = await response.json();
      console.log('✅ Account created, redirecting to onboarding...');

      // Redirect to Stripe onboarding
      if (data.onboardingLink) {
        window.location.href = data.onboardingLink;
      } else {
        throw new Error('No onboarding link returned');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect Stripe');
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Not a guide</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-600 mb-8 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="bg-gray-100 border border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">💰 Stripe Payouts</h1>
          <p className="text-gray-600 mb-8">
            Connect your bank account to receive automatic payouts from bookings
          </p>

          {error && (
            <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
              <p className="font-bold mb-2">Error</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 text-green-100 p-4 rounded-lg mb-6">
              <p className="font-bold mb-2">✅ Success!</p>
              <p>Your Stripe account has been connected. You'll now receive automatic payouts.</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
            <ol className="text-gray-600 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-summit-500 font-bold flex-shrink-0">1.</span>
                <span>Click "Connect Bank Account" below</span>
              </li>
              <li className="flex gap-3">
                <span className="text-summit-500 font-bold flex-shrink-0">2.</span>
                <span>Enter your banking information securely on Stripe's site</span>
              </li>
              <li className="flex gap-3">
                <span className="text-summit-500 font-bold flex-shrink-0">3.</span>
                <span>Stripe verifies your account (usually instant or next business day)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-summit-500 font-bold flex-shrink-0">4.</span>
                <span>
                  When customers book your trips, you receive automatic payouts (88% of booking price - platform fees)
                </span>
              </li>
            </ol>
          </div>

          {guide.stripe_account_id ? (
            <div className="bg-green-900/50 border border-green-700 rounded-lg p-6">
              <p className="text-green-100 font-bold mb-2">✅ Stripe Connected</p>
              <p className="text-green-200 text-sm mb-4">
                Your account ID: <span className="font-mono">{guide.stripe_account_id.substring(0, 20)}...</span>
              </p>
              <p className="text-green-200 text-sm">
                You're all set! Automatic payouts are enabled.
              </p>
            </div>
          ) : (
            <button
              onClick={handleConnectStripe}
              disabled={connecting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
            >
              {connecting ? '🔄 Connecting...' : '🔗 Connect Bank Account'}
            </button>
          )}
        </div>

        <div className="mt-8 bg-gray-200/30 border border-gray-200 rounded-lg p-6">
          <h3 className="text-white font-bold mb-3">❓ FAQ</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="font-bold text-white mb-1">How long does verification take?</p>
              <p>Usually instant or 1-2 business days. You'll receive an email when your account is verified.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">When do I get paid?</p>
              <p>Payouts are processed automatically. Standard bank transfers take 1-2 business days.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">What fees apply?</p>
              <p>You receive 88% of the booking price. Summit keeps 12% + $1 per booking to cover platform costs.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Is it secure?</p>
              <p>Yes! All payment information is processed through Stripe, a PCI-compliant payment processor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
