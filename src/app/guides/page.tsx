'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Star, MapPin, Award, Check, Search } from 'lucide-react';

const supabase = createClient();

export default function GuidesPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('guides')
          .select('id, display_name, tagline, bio, rating, review_count, base_location, specialties, is_verified, years_experience')
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (fetchError) throw fetchError;

        setGuides(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load guides');
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredGuides(guides);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = guides.filter((guide) =>
      guide.display_name.toLowerCase().includes(query) ||
      guide.base_location?.toLowerCase().includes(query) ||
      guide.bio?.toLowerCase().includes(query)
    );
    setFilteredGuides(filtered);
  }, [guides, searchQuery]);

  if (error) {
    return (
      <div className="min-h-screen bg-summit-950 pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Our Guides</h1>
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-6 rounded-xl">
            Error loading guides: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-summit-950">
      {/* Hero */}
      <section className="relative pt-24 pb-12 px-6 border-b border-summit-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
              Expert Mountain Guides
            </h1>
            <p className="text-summit-400 text-lg">
              AMGA & IFMGA certified professionals with decades of experience
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-4 w-5 h-5 text-summit-500" />
            <input
              type="text"
              placeholder="Search guides by name, location, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-summit-900 border border-summit-800 text-white rounded-xl placeholder-summit-500 focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-summit-900 border border-summit-800 rounded-2xl p-6 animate-pulse"
              >
                <div className="w-16 h-16 bg-summit-800 rounded-2xl mb-4" />
                <div className="h-4 bg-summit-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-summit-800 rounded w-full mb-4" />
                <div className="h-2 bg-summit-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="bg-summit-900 border border-summit-800 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-4">🏔️</div>
            <p className="text-white text-lg font-semibold mb-2">No guides found</p>
            <p className="text-summit-400">Try a different search</p>
          </div>
        ) : (
          <div>
            <p className="text-summit-400 text-sm mb-8">
              Found <span className="text-white font-semibold">{filteredGuides.length}</span> guide{filteredGuides.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGuides.map((guide: any) => (
                <div
                  key={guide.id}
                  className="bg-summit-900 border border-summit-800 rounded-2xl overflow-hidden hover:border-summit-600 transition-all duration-300 group"
                >
                  {/* Avatar Section */}
                  <div className="bg-gradient-to-br from-blue-500 to-summit-700 p-6 flex flex-col items-center justify-center min-h-[140px] relative">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black text-white shadow-lg">
                      {guide.display_name.charAt(0)}
                    </div>
                    {guide.is_verified && (
                      <div className="absolute top-3 right-3 bg-blue-400 rounded-full p-1 shadow-lg" title="Verified Guide">
                        <Check className="w-4 h-4 text-blue-900" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-white font-bold text-base leading-tight group-hover:text-blue-300 transition-colors">
                      {guide.display_name}
                    </h3>

                    {guide.tagline && (
                      <p className="text-summit-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {guide.tagline}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-3 mb-3 py-2 border-t border-b border-summit-800">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-sm">{guide.rating > 0 ? guide.rating.toFixed(1) : '—'}</span>
                      </div>
                      <span className="text-summit-500 text-xs">({guide.review_count})</span>
                      {guide.years_experience && (
                        <>
                          <span className="text-summit-700">•</span>
                          <span className="text-summit-500 text-xs">{guide.years_experience}y exp</span>
                        </>
                      )}
                    </div>

                    {/* Location */}
                    {guide.base_location && (
                      <div className="flex items-center gap-1 text-summit-500 text-xs mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {guide.base_location}
                      </div>
                    )}

                    {/* Specialties */}
                    {guide.specialties?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-summit-600 text-xs font-semibold mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {guide.specialties.slice(0, 3).map((s: string) => (
                            <span key={s} className="bg-summit-800 text-summit-300 text-xs px-2 py-1 rounded-full">
                              {s.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bio snippet */}
                    {guide.bio && (
                      <p className="text-summit-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                        {guide.bio}
                      </p>
                    )}

                    {/* View trips button */}
                    <Link
                      href={`/trips?guide=${guide.id}`}
                      className="block w-full text-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 text-xs py-2 rounded-lg transition font-semibold border border-blue-500/30"
                    >
                      View Trips
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
