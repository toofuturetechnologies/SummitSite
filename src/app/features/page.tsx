/**
 * Features Page - Platform features showcase
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
  Users,
  Shield,
  DollarSign,
  MessageSquare,
  Star,
  Map,
  CheckCircle,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features | Summit - Find Your Guide',
  description: 'Discover Summit features: Direct guide connections, secure payments, real reviews, and adventure planning tools.',
};

export default function FeaturesPage() {
  const features = [
    {
      icon: Users,
      title: 'Direct Guide Connection',
      description: 'Connect directly with verified, experienced guides. No middlemen, just you and your guide.',
    },
    {
      icon: Shield,
      title: 'Verified Guides',
      description: 'Every guide is vetted, certified, and verified. Safety is our top priority.',
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Communication',
      description: 'Message guides before and during your trip. Ask questions, confirm details, coordinate meetups.',
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'No hidden fees. See exactly what customers pay and what guides earn.',
    },
    {
      icon: Star,
      title: 'Verified Reviews',
      description: 'Read genuine reviews from past customers. Rate guides after your trip to help others.',
    },
    {
      icon: Map,
      title: 'Diverse Destinations',
      description: 'Adventures in mountains, deserts, rivers, and coasts. From beginner-friendly to extreme.',
    },
    {
      icon: CheckCircle,
      title: 'Flexible Booking',
      description: 'Book specific dates, choose your group size, and customize your experience.',
    },
    {
      icon: Zap,
      title: 'Instant Confirmations',
      description: 'Get confirmed within hours. Receive instant payment confirmation and booking details.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Platform Features</h1>
          <p className="text-lg text-sky-100">
            Everything you need to find your perfect guide and plan your adventure.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Icon className="text-sky-600 dark:text-sky-400" size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* For Customers Section */}
        <div className="mb-16 border-t border-gray-200 dark:border-slate-800 pt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            For Customers
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Browse & Book
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Filter trips by difficulty level
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Search by location and season
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Compare guides and prices
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Read verified customer reviews
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Book with just a few clicks
                </li>
              </ul>
            </div>

            <div className="p-8 bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Communicate & Plan
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Message your guide directly
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Ask questions before booking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Confirm meeting times and places
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Get pre-trip tips and advice
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Manage your bookings in one place
                </li>
              </ul>
            </div>

            <div className="p-8 bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Secure Payment
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Secure Stripe payment processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Multiple payment methods accepted
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Instant payment confirmation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Refund protection policy
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Dispute resolution support
                </li>
              </ul>
            </div>

            <div className="p-8 bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                After Your Trip
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Submit and read reviews
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Share photos and videos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Rate your guide experience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Download booking receipts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Rebook with your favorite guides
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* For Guides Section */}
        <div className="border-t border-gray-200 dark:border-slate-800 pt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            For Guides
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-green-50 dark:bg-slate-900 rounded-lg border border-green-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create Your Profile
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Showcase your certifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Highlight your experience
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Upload professional photos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Write your guide bio
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  List your specialties
                </li>
              </ul>
            </div>

            <div className="p-8 bg-green-50 dark:bg-slate-900 rounded-lg border border-green-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Manage Trips
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Create unlimited trip listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Set your own prices
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Manage trip availability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Edit trip details anytime
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  View booking requests
                </li>
              </ul>
            </div>

            <div className="p-8 bg-green-50 dark:bg-slate-900 rounded-lg border border-green-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Earn & Get Paid
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Keep 87-88% of booking price
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Weekly automatic payouts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Direct bank transfers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Detailed payment reporting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Tax-friendly documentation
                </li>
              </ul>
            </div>

            <div className="p-8 bg-green-50 dark:bg-slate-900 rounded-lg border border-green-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Build Your Reputation
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Earn customer reviews
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Build your rating
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Get featured on Summit
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Increase bookings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  Achieve guide badges
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 text-center border border-sky-200 dark:border-slate-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to explore or start guiding?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join the Summit community today
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/trips"
              className="px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
            >
              Browse Trips
            </Link>
            <Link
              href="/help"
              className="px-8 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 font-semibold rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
