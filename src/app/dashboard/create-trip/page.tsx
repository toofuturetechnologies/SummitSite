'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient();

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

export default function CreateTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData.user) {
          router.push('/auth/login');
          return;
        }

        // Fetch guide
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      if (!guideId) throw new Error('Guide not found');

      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

      // Parse itinerary from day fields
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

      // Parse arrays from comma-separated strings
      const highlights = formData.highlights
        ? formData.highlights.split('\n').filter(h => h.trim())
        : [];
      const inclusions = formData.inclusions
        ? formData.inclusions.split('\n').filter(i => i.trim())
        : [];
      const exclusions = formData.exclusions
        ? formData.exclusions.split('\n').filter(e => e.trim())
        : [];

      const { error: insertError } = await supabase
        .from('trips')
        .insert({
          guide_id: guideId,
          title: formData.title,
          slug,
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
          is_active: true,
        });

      if (insertError) throw insertError;

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center pt-20 lg:pt-24">
        <p className="text-gray-900 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-20 lg:pt-24">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Trip</h1>
        <p className="text-gray-600 mb-8">List your next adventure on Summit</p>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Trip Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  placeholder="e.g., Mount Elbert Summit Experience"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Activity Type *
                  </label>
                  <select
                    name="activity"
                    value={formData.activity}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  >
                    {ACTIVITIES.map(act => (
                      <option key={act} value={act}>
                        {act.replace(/_/g, ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
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
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                  rows={4}
                  placeholder="Describe your trip in detail. What will participants experience?"
                />
              </div>
            </div>
          </div>

          {/* Duration & Pricing */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Duration & Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Price Per Person (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-600">$</span>
                  <input
                    type="number"
                    name="price_per_person"
                    value={formData.price_per_person}
                    onChange={handleChange}
                    min="0"
                    step="50"
                    required
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 pl-8 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Min Group Size
                </label>
                <input
                  type="number"
                  name="min_group_size"
                  value={formData.min_group_size}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Max Group Size
                </label>
                <input
                  type="number"
                  name="max_group_size"
                  value={formData.max_group_size}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Location</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Region/State
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                    placeholder="e.g., Colorado"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.0001"
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Highlights</h2>

            <label className="block text-gray-700 text-sm font-medium mb-2">
              Key Highlights (one per line)
            </label>
            <textarea
              name="highlights"
              value={formData.highlights}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Amazing views&#10;Professional guide&#10;Small groups&#10;Safety equipment included"
            />
            <p className="text-gray-600 text-xs mt-2">
              Enter each highlight on a new line
            </p>
          </div>

          {/* Itinerary */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Itinerary (Day-by-Day)</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-gray-700 font-medium mb-3">Day 1</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="day1_title"
                    value={formData.day1_title}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                    placeholder="Day title (e.g., Trailhead to Base Camp)"
                  />
                  <textarea
                    name="day1_description"
                    value={formData.day1_description}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Detailed description of Day 1"
                  />
                </div>
              </div>

              {formData.duration_days >= 2 && (
                <div>
                  <h3 className="text-gray-700 font-medium mb-3">Day 2</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="day2_title"
                      value={formData.day2_title}
                      onChange={handleChange}
                      className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                      placeholder="Day title (e.g., Summit Day)"
                    />
                    <textarea
                      name="day2_description"
                      value={formData.day2_description}
                      onChange={handleChange}
                      className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                      rows={2}
                      placeholder="Detailed description of Day 2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Inclusions</h2>
              <textarea
                name="inclusions"
                value={formData.inclusions}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Professional guide&#10;Safety equipment&#10;Route planning&#10;Meals (one per line)"
              />
              <p className="text-gray-600 text-xs mt-2">
                One inclusion per line
              </p>
            </div>

            <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Exclusions</h2>
              <textarea
                name="exclusions"
                value={formData.exclusions}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Travel to trailhead&#10;Meals not listed&#10;Personal gear (one per line)"
              />
              <p className="text-gray-600 text-xs mt-2">
                One exclusion per line
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Options</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_instant_book"
                checked={formData.is_instant_book}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 bg-gray-900"
              />
              <span className="text-gray-700">
                Enable Instant Book (customers can book without approval)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={creating}
              className="bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              {creating ? 'Creating...' : 'Create Trip'}
            </button>
            <Link
              href="/dashboard"
              className="bg-gray-200 hover:bg-summit-600 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
