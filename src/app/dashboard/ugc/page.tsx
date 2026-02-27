'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Save, AlertCircle } from 'lucide-react';

const supabase = createClient();

interface Trip {
  id: string;
  title: string;
  referral_payout_percent: number;
}

export default function UGCReferralSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [percentages, setPercentages] = useState<{ [tripId: string]: string }>({});
  const [saving, setSaving] = useState<{ [tripId: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const loadTrips = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Get guide
      const { data: guideData, error: guideError } = await supabase
        .from('guides')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (guideError || !guideData) {
        router.push('/trips');
        return;
      }

      // Get trips with referral settings
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('id, title, referral_payout_percent')
        .eq('guide_id', guideData.id)
        .order('title');

      if (tripError) {
        setError('Failed to load trips');
        return;
      }

      setTrips(tripData || []);

      // Initialize percentage state
      const percentagesMap: { [key: string]: string } = {};
      tripData?.forEach((trip: Trip) => {
        percentagesMap[trip.id] = (trip.referral_payout_percent || 1.0).toString();
      });
      setPercentages(percentagesMap);

      setLoading(false);
    } catch (err) {
      console.error('Error loading trips:', err);
      setError('An error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const toggleTrip = (tripId: string) => {
    const newExpanded = new Set(expandedTrips);
    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
    }
    setExpandedTrips(newExpanded);
  };

  const updatePercentage = (tripId: string, value: string) => {
    // Only allow valid decimal numbers
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setPercentages({ ...percentages, [tripId]: value });
    }
  };

  const savePercentage = async (tripId: string) => {
    try {
      setSaving({ ...saving, [tripId]: true });

      const percent = parseFloat(percentages[tripId] || '1.0');

      if (isNaN(percent) || percent < 0.0 || percent > 2.0) {
        setError('Referral payout must be between 0.0% and 2.0%');
        setSaving({ ...saving, [tripId]: false });
        return;
      }

      const response = await fetch('/api/ugc/referral-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          referralPayoutPercent: percent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to save settings');
        return;
      }

      // Update local state
      const updatedTrips = trips.map((trip) =>
        trip.id === tripId
          ? { ...trip, referral_payout_percent: percent }
          : trip
      );
      setTrips(updatedTrips);

      setError(null);
    } catch (err) {
      console.error('Error saving:', err);
      setError('An error occurred while saving');
    } finally {
      setSaving({ ...saving, [tripId]: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center pt-20 lg:pt-24">
        <p className="text-gray-900 dark:text-gray-100 text-lg">Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 pt-20 lg:pt-24 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🎬 UGC Referral Settings
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Set the referral commission percentage (0.0% - 2.0%) for each of your trips. Users who book your trips and post TikTok content will earn this percentage when referred by someone.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any trips yet.</p>
            <Link
              href="/dashboard/create-trip"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Create Your First Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleTrip(trip.id)}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:bg-slate-900 transition"
                >
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{trip.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current commission: {trip.referral_payout_percent}%
                    </p>
                  </div>
                  {expandedTrips.has(trip.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                {expandedTrips.has(trip.id) && (
                  <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 bg-gray-50 dark:bg-slate-900">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Referral Commission Rate
                      </label>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max="2"
                              step="0.1"
                              value={percentages[trip.id] || ''}
                              onChange={(e) => updatePercentage(trip.id, e.target.value)}
                              className="flex-1 outline-none text-gray-900 dark:text-gray-100 font-semibold text-lg"
                              disabled={saving[trip.id]}
                            />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">%</span>
                          </div>
                        </div>
                        <button
                          onClick={() => savePercentage(trip.id)}
                          disabled={saving[trip.id]}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Range: 0.0% (no commission) to 2.0% (max commission)
                      </p>
                    </div>

                    {/* Example calculation */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <p className="text-xs text-blue-900 font-semibold mb-2">
                        📊 Example Payout
                      </p>
                      <div className="text-xs text-blue-800 space-y-1">
                        <p>
                          If someone books at $450 with a referrer:
                        </p>
                        <p>
                          Referrer gets:{' '}
                          <span className="font-bold">
                            ${(450 * (parseFloat(percentages[trip.id] || '1.0') / 100)).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
