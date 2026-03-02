/**
 * Guide Education Hub
 * /education
 * 
 * Educational content and resources for guides
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Star, Users, TrendingUp, Shield, MessageSquare } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: number;
  icon: React.ReactNode;
}

const ARTICLES: Article[] = [
  {
    id: 'create-trip',
    title: 'How to Create an Engaging Trip Listing',
    category: 'Trip Management',
    excerpt: 'Learn how to write compelling trip descriptions, set the right prices, and add photos that attract customers.',
    readTime: 8,
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    id: 'photo-tips',
    title: 'Photography Tips for Adventure Guides',
    category: 'Marketing',
    excerpt: 'Master smartphone photography to showcase your trips. Lighting, composition, and editing tips included.',
    readTime: 6,
    icon: <Star className="h-6 w-6" />,
  },
  {
    id: 'customer-communication',
    title: 'Best Practices for Customer Communication',
    category: 'Customer Service',
    excerpt: 'How to respond to inquiries quickly, manage expectations, and build lasting relationships with customers.',
    readTime: 7,
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    id: 'safety-liability',
    title: 'Safety, Insurance, and Legal Requirements',
    category: 'Compliance',
    excerpt: 'Understanding your obligations as a guide, required certifications, and how our insurance protects you.',
    readTime: 12,
    icon: <Shield className="h-6 w-6" />,
  },
  {
    id: 'pricing-strategy',
    title: 'Pricing Your Adventures Competitively',
    category: 'Business',
    excerpt: 'Analyze market rates, calculate costs, and set prices that reflect your expertise and attract customers.',
    readTime: 9,
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    id: 'reviews-ratings',
    title: 'Building a Great Rating & Review Profile',
    category: 'Growth',
    excerpt: 'Strategies to encourage positive reviews, respond to feedback professionally, and improve your reputation.',
    readTime: 8,
    icon: <Star className="h-6 w-6" />,
  },
  {
    id: 'seasonal-planning',
    title: 'Planning Seasonal Adventures',
    category: 'Trip Management',
    excerpt: 'How to plan around weather, manage group sizes, and optimize your calendar for maximum bookings.',
    readTime: 10,
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    id: 'building-community',
    title: 'Building Your Guide Community',
    category: 'Community',
    excerpt: 'Connect with other guides, share experiences, and grow together on the Summit platform.',
    readTime: 6,
    icon: <Users className="h-6 w-6" />,
  },
];

const CATEGORIES = ['All', 'Trip Management', 'Marketing', 'Customer Service', 'Compliance', 'Business', 'Growth', 'Community'];

export default function EducationPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles =
    selectedCategory === 'All'
      ? ARTICLES
      : ARTICLES.filter((article) => article.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Guide Education Hub
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Learn how to succeed on Summit and create amazing adventures for your customers
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-sky-800 p-6 text-center">
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
              {ARTICLES.length}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Articles & Guides</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-sky-800 p-6 text-center">
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
              ~60
            </div>
            <p className="text-gray-600 dark:text-gray-400">Minutes to Read</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-sky-800 p-6 text-center">
            <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
              Free
            </div>
            <p className="text-gray-600 dark:text-gray-400">Exclusive Content</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <Link
              key={article.id}
              href={`/education/${article.id}`}
              className="group bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all hover:border-sky-300 dark:hover:border-sky-700"
            >
              {/* Icon */}
              <div className="mb-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-sky-600 dark:text-sky-400 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors inline-block">
                {article.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                {article.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {article.excerpt}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-slate-700">
                <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded">
                  {article.category}
                </span>
                <span>{article.readTime} min read</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Launch Your Adventure?</h2>
          <p className="mb-6 opacity-90">
            Start creating your first trip and begin earning today
          </p>
          <Link
            href="/dashboard/create-trip"
            className="inline-block px-6 py-3 bg-white text-sky-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Create Your First Trip
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'How much does it cost to use Summit?',
                a: 'Summit charges a 12% commission on each booking plus $1 hosting fee. You keep 88% of the trip price.',
              },
              {
                q: 'Do I need certifications to guide?',
                a: 'In Year 1, we partner exclusively with IFMGA-certified guides. Check our certification requirements page for details.',
              },
              {
                q: 'How do I get paid?',
                a: 'Connect your bank account via Stripe. Payouts happen automatically 2-3 days after booking completion.',
              },
              {
                q: 'What if a customer cancels?',
                a: 'Our smart refund policy handles refunds based on days until the trip. You keep the portion covered by the customer.',
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 cursor-pointer group"
              >
                <summary className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                  {item.q}
                </summary>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
