'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ACTIVITIES = [
  'mountaineering',
  'rock_climbing',
  'ice_climbing',
  'ski_touring',
  'backcountry_skiing',
  'hiking',
  'via_ferrata',
  'alpine_climbing',
  'glacier_travel',
  'canyoneering',
  'other',
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

interface Trip {
  id: string;
  guide_id: string;
  title: string;
  activity: string;
  difficulty: string;
  description: string;
  highlights?: string[];
  itinerary?: any[];
  inclusions?: string[];
  exclusions?: string[];
  duration_days: number;
  price_per_person: number;
  max_group_size: number;
  min_group_size: number;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  is_instant_book: boolean;
  is_active: boolean;
}

export default function EditTripPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    activity: 'mountaineering',
    difficulty: 'intermediate',
    description: '',
    highlights: '',
    day1_title: '',
    day1_description: '',
    day2_title: '',
    day2_description: '',
    inclusions: '',
    exclusions: '',
    duration_days: 1,
    price_per_person: 0,
    max_group_size: 6,
    min_group_size: 1,
    country: 'United States',
    region: '',
    latitude: 0,
    longitude: 0,
    is_instant_book: false,
    is_active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
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

        setGuideId(guideData.id);

        // Fetch trip
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', params.id)
          .single();

        if (tripError) {
          setError('Trip not found');
          return;
        }

        // Verify ownership
        if (tripData.guide_id !== guideData.id) {
          setError('You do not have permission to edit this trip');
          return;
        }

        setTrip(tripData);

        // Parse itinerary
        let day1_title = '';
        let day1_description = '';
        let day2_title = '';
        let day2_description = '';

        if (tripData.itinerary && Array.isArray(tripData.itinerary)) {
          const day1 = tripData.itinerary.find((d: any) => d.day === 1);
          const day2 = tripData.itinerary.find((d: any) => d.day === 2);
          if (day1) {
            day1_title = day1.title || '';
            day1_description = day1.description || '';
          }
          if (day2) {
            day2_title = day2.title || '';
            day2_description = day2.description || '';
          }
        }

        // Pre-populate form
        setFormData({
          title: tripData.title,
          activity: tripData.activity,
          difficulty: tripData.difficulty,
          description: tripData.description,
          highlights: (tripData.highlights || []).join('\n'),
          day1_title,
          day1_description,
          day2_title,
          day2_description,
          inclusions: (tripData.inclusions || []).join('\n'),
          exclusions: (tripData.exclusions || []).join('\n'),
          duration_days: tripData.duration_days,
          price_per_person: tripData.price_per_person,
          max_group_size: tripData.max_group_size,
          min_group_size: tripData.min_group_size,
          country: tripData.country,
          region: tripData.region,
          latitude: tripData.latitude,
          longitude: tripData.longitude,
          is_instant_book: tripData.is_instant_book,
          is_active: tripData.is_active,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      if (!trip) throw new Error('Trip not found');

      // Parse itinerary
      const itinerary = [];
      if (formData.day1_title) {
        itinerary.push({
          day: 1,
          title: formData.day1_title,
          description: formData.day1_description,
        });
      }
      if (formData.day2_title) {
        itinerary.push({
          day: 2,
          title: formData.day2_title,
          description: formData.day2_description,
        });
      }

      // Parse arrays
      const highlights = formData.highlights
        ? formData.highlights.split('\n').filter(h => h.trim())
        : [];
      const inclusions = formData.inclusions
        ? formData.inclusions.split('\n').filter(i => i.trim())
        : [];
      const exclusions = formData.exclusions
        ? formData.exclusions.split('\n').filter(e => e.trim())
        : [];

      const { error: updateError } = await supabase
        .from('trips')
        .update({
          title: formData.title,
          activity: formData.activity,
          difficulty: formData.difficulty,
          description: formData.description,
          highlights,
          itinerary,
          inclusions,
          exclusions,
          duration_days: formData.duration_days,
          price_per_person: formData.price_per_person,
          max_group_size: formData.max_group_size,
          min_group_size: formData.min_group_size,
          country: formData.country,
          region: formData.region,
          latitude: formData.latitude,
          longitude: formData.longitude,
          is_instant_book: formData.is_instant_book,
          is_active: formData.is_active,
        })
        .eq('id', trip.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);

    try {
      if (!trip) throw new Error('Trip not found');

      const { error: deleteError } = await supabase
        .from('trips')
        .delete()
        .eq('id', trip.id);

      if (deleteError) throw deleteError;

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trip');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="text-summit-400 hover:text-summit-300"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Edit Trip</h1>
        <p className="text-summit-300 mb-8">Update your trip details</p>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 text-green-100 p-4 rounded-lg mb-6">
            ✅ Trip updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Trip Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-summit-200 text-sm font-medium mb-2">
                    Activity Type *
                  </label>
                  <select
                    name="activity"
                    value={formData.activity}
                    onChange={handleChange}
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  >
                    {ACTIVITIES.map(act => (
                      <option key={act} value={act}>
                        {act.replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-summit-200 text-sm font-medium mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  >
                    {DIFFICULTIES.map(diff => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Duration & Pricing */}
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Duration & Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Price Per Person (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-summit-400">$</span>
                  <input
                    type="number"
                    name="price_per_person"
                    value={formData.price_per_person}
                    onChange={handleChange}
                    min="0"
                    step="50"
                    required
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 pl-8 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Min Group Size
                </label>
                <input
                  type="number"
                  name="min_group_size"
                  value={formData.min_group_size}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Max Group Size
                </label>
                <input
                  type="number"
                  name="max_group_size"
                  value={formData.max_group_size}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Location</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-summit-200 text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-summit-200 text-sm font-medium mb-2">
                    Region/State
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-summit-200 text-sm font-medium mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-summit-200 text-sm font-medium mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Highlights</h2>
            <textarea
              name="highlights"
              value={formData.highlights}
              onChange={handleChange}
              className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
              rows={3}
            />
            <p className="text-summit-400 text-xs mt-2">
              One highlight per line
            </p>
          </div>

          {/* Itinerary */}
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Itinerary</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-summit-200 font-medium mb-3">Day 1</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="day1_title"
                    value={formData.day1_title}
                    onChange={handleChange}
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                  <textarea
                    name="day1_description"
                    value={formData.day1_description}
                    onChange={handleChange}
                    className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {formData.duration_days >= 2 && (
                <div>
                  <h3 className="text-summit-200 font-medium mb-3">Day 2</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="day2_title"
                      value={formData.day2_title}
                      onChange={handleChange}
                      className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                    />
                    <textarea
                      name="day2_description"
                      value={formData.day2_description}
                      onChange={handleChange}
                      className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Inclusions</h2>
              <textarea
                name="inclusions"
                value={formData.inclusions}
                onChange={handleChange}
                className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>

            <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Exclusions</h2>
              <textarea
                name="exclusions"
                value={formData.exclusions}
                onChange={handleChange}
                className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Options */}
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Options</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_instant_book"
                  checked={formData.is_instant_book}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-summit-600 bg-summit-900"
                />
                <span className="text-summit-200">
                  Enable Instant Book
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-summit-600 bg-summit-900"
                />
                <span className="text-summit-200">
                  Active (visible to customers)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <Link
              href={`/dashboard/trip/${trip?.id}/dates`}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Manage Dates
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              {deleting ? 'Deleting...' : 'Delete Trip'}
            </button>

            <Link
              href="/dashboard"
              className="bg-summit-700 hover:bg-summit-600 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-summit-800 border border-summit-700 rounded-lg p-6 max-w-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Delete Trip?</h2>
              <p className="text-summit-300 mb-6">
                This action cannot be undone. All bookings and data associated with this trip will be deleted.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 bg-summit-700 hover:bg-summit-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
