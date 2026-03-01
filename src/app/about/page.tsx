/**
 * About Page - Company story and mission
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Users, Globe, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Summit | Find Your Guide',
  description: 'Learn about Summit\'s mission to connect adventurers with guides and create meaningful experiences.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Summit</h1>
          <p className="text-lg text-sky-100">
            Connecting adventurers with expert guides to create unforgettable experiences.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Summit exists to democratize adventure. We believe that unforgettable experiences shouldn't be limited by location, budget, or geography. By connecting adventurers directly with local experts, we make it possible for anyone to reach their peak—literally or figuratively.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              We're not just a booking platform. We're a community of passionate people united by the love of adventure, exploration, and personal growth.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our vision: A world where anyone can find a trusted guide for any adventure, anywhere.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-slate-800">
              <Heart className="text-red-500 mb-3" size={32} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Passion for Adventure
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We celebrate the spirit of exploration and the joy of reaching new summits—both literal and personal.
              </p>
            </div>

            <div className="p-6 bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-slate-800">
              <Users className="text-blue-500 mb-3" size={32} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Community First
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We build a welcoming community where adventurers and guides support each other on their journeys.
              </p>
            </div>

            <div className="p-6 bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-slate-800">
              <Globe className="text-green-500 mb-3" size={32} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Global Access
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Adventure shouldn't be limited by borders. We connect people worldwide to experiences they'll never forget.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="border-t border-gray-200 dark:border-slate-800 pt-16 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Our Values
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Safety First
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every guide is verified and certified. We maintain rigorous safety standards, comprehensive insurance coverage, and 24/7 support. Your safety is our top priority.
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Transparency
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No hidden fees. No surprises. We're upfront about pricing, commissions, and policies. What you see is what you get.
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Trust & Verification
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real reviews from real customers. Verified certifications and credentials. We help you make informed decisions.
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Empowerment
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Guides set their own prices and control their schedules. Customers choose their adventures. Everyone has agency.
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Sustainability
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're committed to responsible tourism and environmental stewardship. Adventure today should enable adventure tomorrow.
              </p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Inclusion
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Adventure is for everyone. We celebrate guides and adventurers from all backgrounds and skill levels.
              </p>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="border-t border-gray-200 dark:border-slate-800 pt-16 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Our Story
          </h2>

          <div className="space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              Summit was founded by a group of passionate mountaineers and adventure enthusiasts who believed there had to be a better way to connect adventurers with guides. We'd spent years planning trips, searching through dozens of websites, and struggling to find trustworthy guides in different regions.
            </p>

            <p>
              In 2024, we decided to build the platform we wished existed: simple, transparent, and built on trust. We started by connecting with guides in popular destinations, listening to their needs, and building tools to help them grow their businesses.
            </p>

            <p>
              Today, Summit connects thousands of adventurers with guides around the world. From beginner hiking trips to extreme mountaineering expeditions, from rock climbing to river rafting—Summit enables people to have the adventure of a lifetime.
            </p>

            <p>
              But we're just getting started. We're committed to expanding to new destinations, adding new adventure types, and building features that make adventure planning easier and safer.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 py-12 mb-16 border-t border-b border-gray-200 dark:border-slate-800">
          <div className="text-center">
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
              1000+
            </div>
            <p className="text-gray-600 dark:text-gray-400">Active Guides</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
              50+
            </div>
            <p className="text-gray-600 dark:text-gray-400">Destinations</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
              10000+
            </div>
            <p className="text-gray-600 dark:text-gray-400">Adventures Completed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
              4.8/5
            </div>
            <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 text-center border border-sky-200 dark:border-slate-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join the Summit Community
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Whether you're seeking adventure or sharing your expertise, there's a place for you on Summit.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/trips"
              className="px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
            >
              Explore Adventures
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 font-semibold rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors"
            >
              Become a Guide
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Questions? We'd Love to Hear From You
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Reach out to our team anytime at{' '}
            <a href="mailto:hello@summit.local" className="text-sky-600 dark:text-sky-400 hover:underline">
              hello@summit.local
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
