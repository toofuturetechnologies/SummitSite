'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ACTIVITIES = [
  'mountaineering',
  'rock_climbing',
  'hiking',
  'ski_touring',
  'alpine_climbing',
  'ice_climbing',
  'canyoneering',
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('trips')
          .select('*, guides(display_name, rating)')
          .eq('is_active', true)
          .limit(50);

        if (fetchError) throw fetchError;

        setTrips(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Filter trips
  useEffect(() => {
    let filtered = [...trips];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trip) =>
          trip.title.toLowerCase().includes(query) ||
          trip.description?.toLowerCase().includes(query) ||
          trip.guides?.display_name.toLowerCase().includes(query)
      );
    }

    // Activity filter
    if (selectedActivity) {
      filtered = filtered.filter((trip) => trip.activity === selectedActivity);
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((trip) => trip.difficulty === selectedDifficulty);
    }

    // Price range filter
    filtered = filtered.filter(
      (trip) =>
        trip.price_per_person >= priceRange[0] &&
        trip.price_per_person <= priceRange[1]
    );

    setFilteredTrips(filtered);
  }, [trips, searchQuery, selectedActivity, selectedDifficulty, priceRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Trips</h1>
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg">
            Error loading trips: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Available Trips</h1>
          <p className="text-summit-100">Find your next adventure</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-summit-400" />
            <input
              type="text"
              placeholder="Search trips by title, location, or guide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-summit-800/50 border border-summit-700 text-white rounded-lg placeholder-summit-400 focus:border-summit-500 focus:outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-summit-700 hover:bg-summit-600 text-white rounded-lg transition"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-summit-800/30 border border-summit-700 rounded-lg p-4">
              {/* Activity */}
              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Activity
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="w-full bg-summit-900 border border-summit-600 text-white px-3 py-2 rounded-lg focus:border-summit-500 focus:outline-none text-sm"
                >
                  <option value="">All Activities</option>
                  {ACTIVITIES.map((activity) => (
                    <option key={activity} value={activity}>
                      {activity.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-summit-900 border border-summit-600 text-white px-3 py-2 rounded-lg focus:border-summit-500 focus:outline-none text-sm"
                >
                  <option value="">All Levels</option>
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-summit-200 text-sm font-medium mb-2">
                  Max Price
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="flex-1"
                  />
                  <span className="text-white text-sm font-medium whitespace-nowrap">
                    ${priceRange[1]}
                  </span>
                </div>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedActivity('');
                    setSelectedDifficulty('');
                    setPriceRange([0, 1000]);
                  }}
                  className="w-full bg-summit-700 hover:bg-summit-600 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <p className="text-summit-300 text-sm">
            Showing {filteredTrips.length} of {trips.length} trips
          </p>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-12 text-center">
            <p className="text-summit-200 text-lg mb-4">No trips match your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedActivity('');
                setSelectedDifficulty('');
                setPriceRange([0, 1000]);
              }}
              className="inline-block bg-summit-600 hover:bg-summit-500 text-white px-6 py-3 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip: any) => (
              <div
                key={trip.id}
                className="bg-summit-800/50 border border-summit-700 rounded-lg overflow-hidden hover:border-summit-600 transition"
              >
                {trip.image_url && (
                  <img
                    src={trip.image_url}
                    alt={trip.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex gap-2 mb-2">
                    <span className="bg-summit-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {trip.activity.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="bg-summit-700 text-white px-2 py-1 rounded text-xs font-medium">
                      {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">
                    {trip.title}
                  </h3>

                  <p className="text-summit-300 text-sm mb-3">
                    {trip.description?.substring(0, 80)}...
                  </p>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-summit-100 font-bold">
                      ${trip.price_per_person}
                    </span>
                    <span className="text-summit-300 text-sm">
                      {trip.duration_days} days
                    </span>
                  </div>

                  {trip.guides && (
                    <p className="text-summit-300 text-xs mb-4">
                      {trip.guides.display_name} • ⭐ {trip.guides.rating || 'N/A'}
                    </p>
                  )}

                  <Link
                    href={`/trips/${trip.id}`}
                    className="block w-full text-center bg-summit-600 hover:bg-summit-500 text-white py-2 rounded transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
