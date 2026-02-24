'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export default function HomePage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTrips = async () => {
      const { data } = await (supabase as any)
        .from('trips')
        .select('*, guides(display_name, avg_rating, review_count)')
        .eq('is_active', true)
        .limit(3);
      setTrips(data || []);
      setLoading(false);
    };
    fetchFeaturedTrips();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-900 via-summit-800 to-summit-900">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-mountains.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
          <div className="inline-block bg-summit-700/50 text-summit-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🏔️ The Adventure Marketplace for Mountain Guides
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Find Your<br />
            <span className="bg-gradient-to-r from-blue-400 to-summit-300 bg-clip-text text-transparent">
              Perfect Summit
            </span>
          </h1>
          <p className="text-xl text-summit-200 max-w-2xl mx-auto mb-10">
            Connect with expert mountain guides for world-class alpine adventures.
            From beginner hikes to expert expeditions — your mountain awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/trips"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg"
            >
              🏕️ Browse Trips
            </Link>
            <Link
              href="/auth/signup"
              className="bg-summit-700/80 hover:bg-summit-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition border border-summit-600"
            >
              🏔️ Become a Guide
            </Link>
          </div>
          <p className="text-summit-400 text-sm mt-6">
            Trusted by 500+ adventurers · Expert-verified guides · Secure payments
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-summit-800/50 border-y border-summit-700">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+', label: 'Expert Guides' },
            { value: '200+', label: 'Adventures' },
            { value: '4.9★', label: 'Avg Rating' },
            { value: '$0', label: 'Booking Fees' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-summit-300 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          How Summit Works
        </h2>
        <p className="text-summit-300 text-center mb-12 max-w-xl mx-auto">
          Book your dream adventure in minutes — no middlemen, no hassle
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              icon: '🔍',
              title: 'Find Your Adventure',
              description: 'Browse trips by activity, difficulty, location, and price. Read reviews from real adventurers.',
            },
            {
              step: '2',
              icon: '📅',
              title: 'Book Instantly',
              description: 'Select your dates, choose participants, and book securely with Stripe. Instant confirmation.',
            },
            {
              step: '3',
              icon: '🏔️',
              title: 'Summit Together',
              description: 'Meet your expert guide and experience the adventure of a lifetime. Leave a review when you return!',
            },
          ].map((item) => (
            <div key={item.step} className="relative bg-summit-800/50 border border-summit-700 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-summit-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Trips */}
      <div className="bg-summit-800/30 border-y border-summit-700 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Adventures</h2>
              <p className="text-summit-300">Top-rated trips from expert guides</p>
            </div>
            <Link href="/trips" className="text-blue-400 hover:text-blue-300 font-medium">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="text-summit-300 text-center py-12">Loading trips...</div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-summit-300 mb-4">No trips yet — be the first guide!</p>
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
                Join as a guide →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips.map((trip: any) => (
                <Link key={trip.id} href={`/trips/${trip.id}`} className="group block">
                  <div className="bg-summit-800/70 border border-summit-700 rounded-2xl overflow-hidden hover:border-summit-500 transition">
                    {/* Trip Card Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-summit-700 to-summit-900 flex items-center justify-center">
                      <span className="text-6xl">
                        {trip.activity === 'mountaineering' ? '⛰️' :
                         trip.activity === 'rock_climbing' ? '🧗' :
                         trip.activity === 'hiking' ? '🥾' :
                         trip.activity === 'ski_touring' ? '⛷️' : '🏔️'}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-summit-600/50 text-summit-200 text-xs px-3 py-1 rounded-full capitalize">
                          {trip.activity?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-summit-400 text-xs capitalize">{trip.difficulty}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition">
                        {trip.title}
                      </h3>

                      <p className="text-summit-400 text-sm mb-4 line-clamp-2">
                        {trip.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-bold text-lg">
                            ${trip.price_per_person}
                            <span className="text-summit-400 text-sm font-normal"> /person</span>
                          </p>
                          <p className="text-summit-400 text-xs">{trip.guides?.display_name}</p>
                        </div>
                        {trip.guides?.avg_rating > 0 && (
                          <div className="text-right">
                            <p className="text-yellow-400 text-sm">★ {trip.guides.avg_rating}</p>
                            <p className="text-summit-400 text-xs">{trip.guides.review_count} reviews</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* For Guides Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-summit-700/50 to-blue-900/30 border border-summit-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Are You a Mountain Guide?
          </h2>
          <p className="text-summit-200 text-lg max-w-2xl mx-auto mb-8">
            Join hundreds of professional guides on Summit. Create your profile, list your trips,
            and get paid automatically. Zero upfront costs — we only earn when you do.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: '💰', title: 'Keep 88%', desc: 'You keep 88% of every booking. We take 12% + $1 to run the platform.' },
              { icon: '🏦', title: 'Auto Payouts', desc: 'Connect your bank account and get paid automatically after every trip.' },
              { icon: '📊', title: 'Your Dashboard', desc: 'Track bookings, earnings, and customer reviews all in one place.' },
            ].map((item) => (
              <div key={item.title} className="bg-summit-800/50 rounded-xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-summit-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/auth/signup"
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-bold px-10 py-4 rounded-xl text-lg transition"
          >
            Start Guiding Today — It's Free
          </Link>
          <p className="text-summit-400 text-sm mt-4">No credit card required · Setup in 5 minutes</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-summit-900 border-t border-summit-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-black text-white mb-3">🏔️ Summit</h3>
              <p className="text-summit-400 text-sm max-w-sm">
                The adventure marketplace connecting expert mountain guides with passionate adventurers worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Explore</h4>
              <ul className="space-y-2 text-summit-400 text-sm">
                <li><Link href="/trips" className="hover:text-white transition">Browse Trips</Link></li>
                <li><Link href="/guides" className="hover:text-white transition">Find Guides</Link></li>
                <li><Link href="/auth/signup-customer" className="hover:text-white transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Guides</h4>
              <ul className="space-y-2 text-summit-400 text-sm">
                <li><Link href="/auth/signup" className="hover:text-white transition">Become a Guide</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition">Guide Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-summit-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-summit-500 text-sm">© 2026 Summit. All rights reserved.</p>
            <p className="text-summit-500 text-sm mt-2 md:mt-0">
              Secure payments by Stripe · Built for adventurers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
