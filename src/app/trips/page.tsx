'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Search, Filter, MapPin, Clock, Users, Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const supabase = createClient();

const ACTIVITIES = [
  { id: 'mountaineering', label: 'Mountaineering', emoji: '⛰️' },
  { id: 'rock_climbing', label: 'Rock Climbing', emoji: '🧗' },
  { id: 'ice_climbing', label: 'Ice Climbing', emoji: '🧊' },
  { id: 'ski_touring', label: 'Ski Touring', emoji: '⛷️' },
  { id: 'alpine_climbing', label: 'Alpine Climbing', emoji: '🏔️' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'canyoneering', label: 'Canyoneering', emoji: '🏜️' },
  { id: 'via_ferrata', label: 'Via Ferrata', emoji: '⛓️' },
  { id: 'glacier_travel', label: 'Glacier Travel', emoji: '🌨️' },
];

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', emoji: '🟢' },
  { id: 'intermediate', label: 'Intermediate', emoji: '🟡' },
  { id: 'advanced', label: 'Advanced', emoji: '🟠' },
  { id: 'expert', label: 'Expert', emoji: '🔴' },
];

const ACTIVITY_IMAGES: Record<string, string> = {
  mountaineering: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&fit=crop',
  rock_climbing: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80&fit=crop',
  ice_climbing: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80&fit=crop',
  ski_touring: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop',
  backcountry_skiing: 'https://images.unsplash.com/photo-1517805686688-47dd930554a5?w=800&q=80&fit=crop',
  hiking: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop',
  canyoneering: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f?w=800&q=80&fit=crop',
  alpine_climbing: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop',
  via_ferrata: 'https://images.unsplash.com/photo-1544966748-b0a3e4c9a68b?w=800&q=80&fit=crop',
  glacier_travel: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80&fit=crop',
  other: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  advanced: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  expert: 'bg-red-500/20 text-red-300 border-red-500/30',
};

// ─── Trip Card ─────────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: any }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = imgError
    ? ACTIVITY_IMAGES.other
    : (ACTIVITY_IMAGES[trip.activity] || ACTIVITY_IMAGES.other);

  return (
    <Link href={`/trips/${trip.id}`} className="group block h-full">
      <div className="bg-gray-900 border border-summit-800 rounded-2xl overflow-hidden hover:border-sky-300 hover:-translate-y-1 transition-all duration-300 h-full shadow-xl hover:shadow-2xl flex flex-col">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-200 shrink-0">
          <img
            src={imgSrc}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-summit-900/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="inline-block bg-white/80 backdrop-blur-sm text-sky-700 text-xs px-3 py-1.5 rounded-lg capitalize font-medium">
              {trip.activity?.replace(/_/g, ' ')}
            </span>
          </div>
          {trip.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="inline-block bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                ⭐ Featured
              </span>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-block text-xs px-3 py-1.5 rounded-lg font-medium border capitalize ${DIFFICULTY_COLORS[trip.difficulty] || DIFFICULTY_COLORS.beginner}`}>
              {trip.difficulty}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-white font-bold text-base mb-2 leading-tight group-hover:text-sky-300 transition-colors line-clamp-2">
            {trip.title}
          </h3>
          <p className="text-summit-500 text-xs mb-4 line-clamp-2 leading-relaxed flex-1">
            {trip.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-summit-500 text-xs mb-4 pt-3 border-t border-summit-800">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {trip.duration_days}d
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Max {trip.max_group_size}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {trip.region}
            </div>
          </div>

          {/* Price + Guide */}
          <div className="flex items-center justify-between pt-3 border-t border-summit-800">
            <div>
              <span className="text-xl font-black text-white">${trip.price_per_person}</span>
              <span className="text-summit-500 text-xs"> /person</span>
            </div>
            <div className="text-right">
              <p className="text-sky-600 text-xs font-medium">{trip.guides?.display_name}</p>
              {trip.guides?.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-400 text-xs justify-end mt-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  {Number(trip.guides.rating).toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Inner Page (uses useSearchParams) ────────────────────────────────────────

function TripsPageInner() {
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(searchParams?.get('activity') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('trips')
          .select('*, guides(display_name, rating, review_count)')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .limit(100);

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

  // Filter logic
  useEffect(() => {
    let filtered = [...trips];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.region?.toLowerCase().includes(q) ||
          t.guides?.display_name?.toLowerCase().includes(q)
      );
    }

    if (selectedActivity) {
      filtered = filtered.filter((t) => t.activity === selectedActivity);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((t) => t.difficulty === selectedDifficulty);
    }

    filtered = filtered.filter((t) => t.price_per_person <= maxPrice);

    setFilteredTrips(filtered);
  }, [trips, searchQuery, selectedActivity, selectedDifficulty, maxPrice]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedActivity('');
    setSelectedDifficulty('');
    setMaxPrice(2000);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-sky-900 mb-4">Browse Adventures</h1>
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-6 rounded-xl">
            Error loading trips: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="pt-24 pb-12 px-6 border-b border-summit-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-sky-900 mb-3">
            Browse All Adventures
          </h1>
          <p className="text-sky-600 text-lg mb-8">
            {loading ? '...' : `${trips.length} world-class guided trips across the American West`}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-summit-500" />
            <input
              type="text"
              placeholder="Search trips by name, guide, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-summit-800 text-white rounded-xl placeholder-summit-500 focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filter Toggle */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-summit-800 hover:border-sky-200 text-white rounded-lg transition font-medium text-sm"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {showFilters && (
            <div className="mt-6 bg-sky-50 border border-summit-800 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Activity */}
                <div>
                  <label className="block text-sky-900 text-sm font-semibold mb-3">Activity</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedActivity('')}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedActivity === '' ? 'bg-sky-500 text-white' : 'text-sky-900 hover:bg-gray-200'}`}
                    >
                      All Activities
                    </button>
                    {ACTIVITIES.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => setSelectedActivity(act.id)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedActivity === act.id ? 'bg-sky-500 text-white' : 'text-sky-900 hover:bg-gray-200'}`}
                      >
                        {act.emoji} {act.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sky-900 text-sm font-semibold mb-3">Difficulty</label>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedDifficulty('')}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedDifficulty === '' ? 'bg-sky-500 text-white' : 'text-sky-900 hover:bg-gray-200'}`}
                    >
                      All Levels
                    </button>
                    {DIFFICULTIES.map((diff) => (
                      <button
                        key={diff.id}
                        onClick={() => setSelectedDifficulty(diff.id)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedDifficulty === diff.id ? 'bg-sky-500 text-white' : 'text-sky-900 hover:bg-gray-200'}`}
                      >
                        {diff.emoji} {diff.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sky-900 text-sm font-semibold mb-3">
                    Max Price: ${maxPrice.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-summit-500 text-xs mt-1">
                    <span>$0</span>
                    <span>$2,000</span>
                  </div>
                </div>

                {/* Reset */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-sky-900 rounded-lg transition text-sm font-medium"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sky-600 text-sm">
            Showing{' '}
            <span className="text-white font-semibold">{filteredTrips.length}</span>{' '}
            of{' '}
            <span className="text-white font-semibold">{trips.length}</span>{' '}
            trips
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-summit-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-gray-900 border border-summit-800 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🏔️</div>
            <p className="text-white text-lg font-semibold mb-2">No trips match your filters</p>
            <p className="text-sky-600 mb-6">Try adjusting your search or clearing filters</p>
            <button
              onClick={clearFilters}
              className="inline-block bg-sky-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page Export (wrapped in Suspense for useSearchParams) ────────────────────

export default function TripsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sky-600">Loading trips...</p>
      </div>
    }>
      <TripsPageInner />
    </Suspense>
  );
}
