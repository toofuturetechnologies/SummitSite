/**
 * Guide Payouts Dashboard
 * /dashboard/payouts
 * 
 * Shows guide payment history and earnings
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const supabase = createClient();

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'in_transit' | 'canceled' | 'failed';
  arrival_date?: number;
  created: number;
  type: string;
}

interface Balance {
  available: number;
  pending: number;
  total_paid_out: number;
}

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [guide, setGuide] = useState<any>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      setUser(authUser);

      // Get guide info
      const { data: guideData } = await supabase
        .from('guides')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (!guideData) {
        setError('You are not registered as a guide');
        setLoading(false);
        return;
      }

      setGuide(guideData);

      // If Stripe not connected, don't fetch payouts
      if (!guideData.stripe_account_id) {
        setLoading(false);
        return;
      }

      // Get payout history
      const res = await fetch(`/api/payouts/history?guideId=${guideData.id}`);
      const data = await res.json();

      if (res.ok) {
        setPayouts(data.payouts);
        setBalance(data.balance);
      } else {
        console.error('Failed to fetch payouts:', data.error);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load payouts');
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!guide) return;

    try {
      const res = await fetch('/api/stripe-connect/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId: guide.id,
          guideName: guide.display_name,
          email: user.email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.onboarding_url) {
        window.location.href = data.onboarding_url;
      } else {
        setError(data.error || 'Failed to connect Stripe');
      }
    } catch (err) {
      setError('Failed to initiate Stripe connection');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Earnings & Payouts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your payment information and view payout history
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Stripe Not Connected */}
      {!guide?.stripe_account_id && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                Connect Your Bank Account
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                Link your bank account via Stripe to receive automatic payouts. Your customers can pay securely, and you'll receive earnings directly.
              </p>
              <button
                onClick={handleConnectStripe}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
              >
                Connect Stripe Account
              </button>
            </div>
            <div className="text-4xl">🏦</div>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      {guide?.stripe_account_id && balance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Available Balance
              </h3>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${balance.available.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Ready to payout
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Balance
              </h3>
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              ${balance.pending.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Processing (1-2 days)
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Paid Out
              </h3>
              <TrendingUp className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
              ${balance.total_paid_out.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              All time
            </p>
          </div>
        </div>
      )}

      {/* Payout History */}
      {guide?.stripe_account_id && payouts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Payout History
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Arrival Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(payout.created * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ${(payout.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          payout.status === 'paid'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : payout.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {payout.arrival_date
                        ? new Date(payout.arrival_date * 1000).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {guide?.stripe_account_id && payouts.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No payouts yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Your payouts will appear here once you've received bookings
          </p>
        </div>
      )}
    </div>
  );
}
