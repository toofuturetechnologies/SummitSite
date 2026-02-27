'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Star, Clock, Users, MapPin, ArrowRight, ChevronRight, Shield, Zap, Award } from 'lucide-react';

const supabase = createClient();

// Curated Unsplash images per activity
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

const ACTIVITY_CATEGORIES = [
  { id: 'mountaineering', label: 'Mountaineering', emoji: '⛰️' },
  { id: 'rock_climbing', label: 'Rock Climbing', emoji: '🧗' },
  { id: 'ice_climbing', label: 'Ice Climbing', emoji: '🧊' },
  { id: 'ski_touring', label: 'Ski Touring', emoji: '⛷️' },
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'canyoneering', label: 'Canyoneering', emoji: '🏜️' },
  { id: 'alpine_climbing', label: 'Alpine Climbing', emoji: '🏔️' },
  { id: 'glacier_travel', label: 'Glacier Travel', emoji: '🧊' },
  { id: 'via_ferrata', label: 'Via Ferrata', emoji: '⛓️' },
];

export default function HomePage() {
  const [featuredTrips, setFeaturedTrips] = useState<any[]>([]);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const [tripsResult, guidesResult] = await Promise.all([
        (supabase as any)
          .from('trips')
          .select('*, guides(display_name, rating, review_count, base_location)')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .limit(9),
        (supabase as any)
          .from('guides')
          .select('id, display_name, tagline, rating, review_count, base_location, specialties, is_verified')
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(4),
      ]);

      const trips = tripsResult.data || [];
      setAllTrips(trips);
      setFeaturedTrips(trips.slice(0, 6));
      setGuides(guidesResult.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getTripImage = (trip: any) => {
    if (imgErrors.has(trip.id)) return ACTIVITY_IMAGES.other;
    return ACTIVITY_IMAGES[trip.activity] || ACTIVITY_IMAGES.other;
  };

  return (
    <div className="min-h-screen bg-white text-white">
      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85&fit=crop')`,
          }}
        />
        {/* Sophisticated gradient overlay - Service Landing Page theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/50 via-sky-900/40 to-sky-50" />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-32">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 backdrop-blur-md border border-sky-400/50 text-sky-900 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            105 Expert Guides · 84+ Adventures · World-Class Experience
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Book Unique Guided
            <br />
            <span className="text-white">Adventures</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with AMGA & IFMGA-certified mountain guides. From Colorado's peaks to international expeditions — 
            verified expertise, secure payments, and life-changing experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 hover:-translate-y-1"
              style={{
                backgroundColor: '#F97316',
                boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.4)',
              }}
            >
              Browse Adventures
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 bg-sky-500/20 backdrop-blur-sm hover:bg-sky-500/30 border border-sky-300 text-sky-900 font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-200"
            >
              Meet Guides
            </Link>
          </div>

          {/* Trust section */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm font-medium mb-4">Trusted by adventurers worldwide</p>
            <div className="flex flex-wrap gap-8 justify-center text-white/80 text-sm">
              {[
                { icon: '⭐', text: '4.9★ Rating', sub: 'Verified reviews' },
                { icon: '🔐', text: 'Certified Guides', sub: 'AMGA & IFMGA' },
                { icon: '💳', text: 'Secure Payments', sub: 'Stripe verified' },
              ].map((badge) => (
                <div key={badge.text} className="text-center">
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-white font-semibold text-sm mt-1">{badge.text}</p>
                  <p className="text-white/60 text-xs">{badge.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <div className="w-px h-8 bg-white/30" />
          <span className="text-xs tracking-widest uppercase">Explore</span>
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────────────────────────────────── */}
      <section className="bg-sky-50 border-b border-sky-200">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '105', label: 'Expert Guides', sub: 'Verified professionals' },
            { value: '84+', label: 'Adventures', sub: 'Worldwide locations' },
            { value: '4.9★', label: 'Avg Rating', sub: 'Trusted reviews' },
            { value: '88%', label: 'Fair Pricing', sub: 'Guides earn more' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-sky-500">{stat.value}</p>
              <p className="text-sky-900 text-sm font-semibold mt-1">{stat.label}</p>
              <p className="text-sky-700 text-xs mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY CHOOSE SUMMIT ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-sky-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-sky-900 mb-4">Why Choose Summit</h2>
            <p className="text-lg text-sky-700 max-w-2xl mx-auto">
              We connect you with the world's best mountain guides. Verified expertise, transparent pricing, and unforgettable experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '✓',
                title: 'Verified & Certified Guides',
                desc: 'Every guide is AMGA or IFMGA certified with proven mountain experience and excellent reviews.',
              },
              {
                icon: '💳',
                title: 'Easy & Secure Booking',
                desc: 'Simple payment process via Stripe. Instant confirmation and 24/7 customer support when you need it.',
              },
              {
                icon: '📍',
                title: '84+ Adventures Worldwide',
                desc: 'From alpine climbing to backcountry skiing. Explore curated experiences across the globe.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-sky-200 rounded-2xl p-8 hover:shadow-lg hover:border-sky-300 transition-all">
                <div className="text-3xl font-bold text-sky-500 mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-sky-900 mb-3">{item.title}</h3>
                <p className="text-sky-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ACTIVITY CATEGORIES ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-900">Browse by Activity</h2>
            <p className="text-sky-700 mt-1">Choose your adventure type</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {ACTIVITY_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/trips?activity=${cat.id}`}
              className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-sky-50 border border-sky-200 hover:border-sky-400 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {cat.emoji}
              </span>
              <span className="text-xs text-sky-700 group-hover:text-sky-600 text-center leading-tight font-medium transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FEATURED TRIPS ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-sky-900">Featured Adventures</h2>
            <p className="text-sky-700 mt-1">Top-rated trips from certified guides</p>
          </div>
          <Link
            href="/trips"
            className="hidden sm:flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium text-sm transition"
          >
            View all {allTrips.length} trips
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse shadow-sm"
              >
                <div className="h-52 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} imgSrc={getTripImage(trip)} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
          >
            View all {allTrips.length} trips <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── POPULAR DESTINATIONS ──────────────────────────────────────────── */}
      <section className="bg-sky-50 py-20 border-y border-sky-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-sky-900 mb-4">Popular Destinations</h2>
            <p className="text-lg text-sky-700 max-w-2xl mx-auto">
              Explore world-class adventures across the most sought-after mountain regions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Alps', description: 'Mont Blanc, Matterhorn, and classic multi-day traverses', count: '12+ trips' },
              { name: 'Colorado Rockies', description: 'Fourteeners, ice climbing, and alpine expeditions', count: '18+ trips' },
              { name: 'Pacific Northwest', description: 'Mt. Rainier, ski touring, and glacier travel', count: '8+ trips' },
              { name: 'South America', description: 'Aconcagua, Patagonia, and tropical expeditions', count: '6+ trips' },
              { name: 'Asia', description: 'Kilimanjaro, Denali, and high-altitude peaks', count: '7+ trips' },
              { name: 'Europe Beyond Alps', description: 'Dolomites, Pyrenees, and remote crags', count: '9+ trips' },
            ].map((dest, i) => (
              <div
                key={i}
                className="bg-white border border-sky-200 rounded-2xl p-8 hover:shadow-lg hover:border-sky-400 transition-all group cursor-pointer"
              >
                <h3 className="text-xl font-bold text-sky-900 mb-2 group-hover:text-sky-600 transition">{dest.name}</h3>
                <p className="text-sky-700 text-sm mb-4">{dest.description}</p>
                <p className="text-sky-600 text-sm font-semibold">{dest.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 border-b border-sky-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-sky-900 mb-3">How Summit Works</h2>
            <p className="text-sky-700 max-w-xl mx-auto text-lg">
              Book your dream adventure in minutes — verified guides, secure payments, instant confirmation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
            {[
              {
                num: '01',
                icon: <Zap className="w-7 h-7" />,
                title: 'Find Your Adventure',
                desc: 'Browse by activity, difficulty, location, and budget. Every guide is AMGA or IFMGA certified.',
              },
              {
                num: '02',
                icon: <Shield className="w-7 h-7" />,
                title: 'Book Securely',
                desc: 'Select your dates, confirm participants, and pay securely via Stripe. Instant confirmation.',
              },
              {
                num: '03',
                icon: <Award className="w-7 h-7" />,
                title: 'Summit Together',
                desc: 'Your guide handles logistics. You focus on the experience. Leave a review when you return.',
              },
            ].map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-center text-sky-500 mb-6 shadow-sm">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-sky-900 mb-3">{step.title}</h3>
                <p className="text-sky-700 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GUIDE PROFILES ──────────────────────────────────────────────────── */}
      {guides.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-sky-900 mb-2">Meet Our Guides</h2>
              <p className="text-sky-700">Certified professionals with decades of combined experience</p>
            </div>
            <Link
              href="/guides"
              className="hidden sm:flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium text-sm transition"
            >
              All guides <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide: any) => (
              <div
                key={guide.id}
                className="bg-white border border-sky-200 rounded-2xl p-6 hover:border-sky-400 hover:shadow-lg transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-2xl font-black text-white mb-4 shadow-lg">
                  {guide.display_name.charAt(0)}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sky-900 font-bold text-base leading-tight group-hover:text-sky-600 transition-colors">
                    {guide.display_name}
                  </h3>
                  {guide.is_verified && (
                    <span className="ml-2 shrink-0 text-sky-500" title="Verified Guide">✓</span>
                  )}
                </div>

                <p className="text-sky-700 text-xs mb-3 line-clamp-2 leading-relaxed">
                  {guide.tagline}
                </p>

                <div className="flex items-center gap-1 text-orange-500 text-sm mb-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold">{guide.rating > 0 ? guide.rating.toFixed(1) : '—'}</span>
                  <span className="text-sky-600 text-xs">({guide.review_count})</span>
                </div>

                {guide.base_location && (
                  <div className="flex items-center gap-1 text-gray-600 text-xs">
                    <MapPin className="w-3 h-3" />
                    {guide.base_location}
                  </div>
                )}

                {guide.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {guide.specialties.slice(0, 2).map((s: string) => (
                      <span key={s} className="bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full">
                        {s.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── FOR GUIDES CTA ──────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full -mr-48 -mt-48" />
          <div className="relative z-10">
            <div className="inline-block bg-sky-500 text-white border border-sky-500 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              For Mountain Guides
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-sky-900 mb-4">
              Grow Your Guiding Business
            </h2>
            <p className="text-sky-700 text-lg max-w-2xl mx-auto mb-12">
              Join Summit and reach thousands of adventurers looking for expert guidance.
              Zero upfront cost — we only earn when you do.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
              {[
                { icon: '💰', title: 'Keep 88%', desc: 'Highest guide payout in the industry. You earn more on every booking.' },
                { icon: '🏦', title: 'Auto Payouts', desc: 'Stripe Connect deposits your earnings directly to your bank account.' },
                { icon: '📊', title: 'Full Dashboard', desc: 'Manage bookings, trips, availability, and earnings in one place.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="text-sky-900 font-bold mb-2">{item.title}</h3>
                  <p className="text-sky-700 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Guiding Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sky-700 text-sm mt-6">No credit card · 5-minute setup · Free forever until you earn</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-sky-900 border-t border-sky-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sky-400 text-2xl">⛰️</span>
                <span className="text-2xl font-black text-white">Summit</span>
              </div>
              <p className="text-sky-300 text-sm leading-relaxed max-w-xs">
                The adventure marketplace connecting expert mountain guides with passionate adventurers worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/trips', label: 'Browse Trips' },
                  { href: '/guides', label: 'Find Guides' },
                  { href: '/auth/signup-customer', label: 'Sign Up' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sky-300 hover:text-white text-sm transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Guides</h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/auth/signup', label: 'Become a Guide' },
                  { href: '/auth/login', label: 'Guide Login' },
                  { href: '/dashboard', label: 'Dashboard' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sky-300 hover:text-white text-sm transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-sky-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sky-400 text-sm">© 2026 Summit. All rights reserved.</p>
            <p className="text-sky-400 text-sm">Secure payments by Stripe · Built for adventurers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TripCard({ trip, imgSrc }: { trip: any; imgSrc: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <div className="bg-white border border-sky-200 rounded-2xl overflow-hidden hover:border-sky-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={imgError ? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop' : imgSrc}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2.5 py-1 rounded-lg capitalize font-semibold">
              {trip.activity?.replace(/_/g, ' ')}
            </span>
          </div>
          {trip.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded-lg font-bold">
                ⭐ Featured
              </span>
            </div>
          )}

          {/* Difficulty pill (bottom) */}
          <div className="absolute bottom-3 left-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-lg font-medium border capitalize ${
                DIFFICULTY_COLORS[trip.difficulty] || DIFFICULTY_COLORS.beginner
              }`}
            >
              {trip.difficulty}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-sky-900 font-bold text-base mb-1 leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
            {trip.title}
          </h3>

          <p className="text-sky-700 text-xs mb-4 line-clamp-2 leading-relaxed">
            {trip.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-sky-600 text-xs mb-4">
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
          <div className="flex items-center justify-between pt-4 border-t border-sky-200">
            <div>
              <span className="text-xl font-black text-orange-500">
                ${trip.price_per_person}
              </span>
              <span className="text-sky-600 text-xs"> /person</span>
            </div>
            <div className="text-right">
              <p className="text-sky-600 text-xs">{trip.guides?.display_name}</p>
              {trip.guides?.rating > 0 && (
                <div className="flex items-center gap-1 text-orange-500 text-xs justify-end">
                  <Star className="w-3 h-3 fill-current" />
                  {trip.guides.rating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
