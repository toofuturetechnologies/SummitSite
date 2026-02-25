'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

const supabase = createClient();

interface TripDate {
  id: string;
  start_date: string;
  end_date: string;
  spots_total: number;
  spots_available: number;
  price_override?: number;
  is_available: boolean;
}

export default function TripDatesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tripTitle, setTripTitle] = useState('');
  const [dates, setDates] = useState<TripDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    spots_total: 6,
    price_override: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData.user) {
          router.push('/auth/login');
          return;
        }

        // Get guide ID
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError) {
          setError('Guide profile not found');
          return;
        }

        // Get trip
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('id, title, guide_id')
          .eq('id', params.id)
          .single();

        if (tripError) {
          setError('Trip not found');
          return;
        }

        if (tripData.guide_id !== guideData.id) {
          setError('You do not have permission to manage this trip');
          return;
        }

        setTripTitle(tripData.title);

        // Fetch dates
        const { data: datesData, error: datesError } = await supabase
          .from('trip_dates')
          .select('*')
          .eq('trip_id', tripData.id)
          .order('start_date', { ascending: true });

        if (!datesError && datesData) {
          setDates(datesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAdding(true);

    try {
      if (!formData.start_date || !formData.end_date) {
        throw new Error('Please fill in all required fields');
      }

      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        throw new Error('End date must be after start date');
      }

      const { error: insertError } = await supabase
        .from('trip_dates')
        .insert({
          trip_id: params.id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          spots_total: formData.spots_total,
          spots_available: formData.spots_total,
          price_override: formData.price_override ? parseFloat(formData.price_override) : null,
          is_available: true,
        });

      if (insertError) throw insertError;

      // Refresh dates
      const { data: datesData } = await supabase
        .from('trip_dates')
        .select('*')
        .eq('trip_id', params.id)
        .order('start_date', { ascending: true });

      if (datesData) {
        setDates(datesData);
      }

      // Reset form
      setFormData({
        start_date: '',
        end_date: '',
        spots_total: 6,
        price_override: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add date');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    if (!confirm('Are you sure you want to delete this date?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('trip_dates')
        .delete()
        .eq('id', dateId);

      if (deleteError) throw deleteError;

      setDates(dates.filter(d => d.id !== dateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete date');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/dashboard/trip/${params.id}`}
            className="text-gray-600 hover:text-gray-600"
          >
            ← Back to Trip
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{tripTitle}</h1>
        <p className="text-gray-600 mb-8">Add dates when this trip is available</p>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add Date Form */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Add Availability Date</h2>

          <form onSubmit={handleAddDate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Number of Spots
                </label>
                <input
                  type="number"
                  name="spots_total"
                  value={formData.spots_total}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Special Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-600">$</span>
                  <input
                    type="number"
                    name="price_override"
                    value={formData.price_override}
                    onChange={handleChange}
                    min="0"
                    step="50"
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 pl-8 rounded-lg focus:border-summit-500 focus:outline-none"
                    placeholder="Leave empty for standard price"
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">
                  Override the trip&apos;s base price for this date
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
            >
              {adding ? 'Adding...' : 'Add Availability Date'}
            </button>
          </form>
        </div>

        {/* Existing Dates */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Availability Dates ({dates.length})
          </h2>

          {dates.length === 0 ? (
            <p className="text-gray-600">No dates added yet. Add one above to get started!</p>
          ) : (
            <div className="space-y-3">
              {dates.map(date => (
                <div
                  key={date.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200/50"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium">
                      {new Date(date.start_date).toLocaleDateString()} to{' '}
                      {new Date(date.end_date).toLocaleDateString()}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {date.spots_available}/{date.spots_total} spots available
                      {date.price_override && ` • $${date.price_override}/person`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDate(date.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
