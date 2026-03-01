/**
 * Blog Page - Travel guides and adventure tips
 * SEO-optimized with structured data
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Search,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Summit Blog - Adventure Guides & Travel Tips | Find Your Guide',
  description: 'Expert travel guides, safety tips, and adventure inspiration from experienced mountain guides. Learn how to prepare for your perfect summit experience.',
  openGraph: {
    type: 'website',
    url: 'https://summit-site-seven.vercel.app/blog',
    title: 'Summit Blog - Adventure Guides & Travel Tips',
    description: 'Expert travel guides and adventure tips from mountain guides.',
    images: [
      {
        url: 'https://summit-site-seven.vercel.app/og-blog.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  author: string;
  date: string;
  slug: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '10 Essential Tips for Your First Mountain Trek',
    excerpt: 'New to mountain trekking? Learn the essential preparation steps, gear recommendations, and mental tips to make your first summit experience unforgettable.',
    category: 'Beginner Guide',
    readTime: '8 min read',
    image: '/blog/mountain-trek.jpg',
    author: 'Alex Mountain',
    date: 'Mar 1, 2026',
    slug: 'first-mountain-trek',
  },
  {
    id: '2',
    title: 'Altitude Sickness: What You Need to Know',
    excerpt: 'Understanding altitude sickness can save your adventure. Discover symptoms, prevention strategies, and when to descend safely.',
    category: 'Health & Safety',
    readTime: '6 min read',
    image: '/blog/altitude-sickness.jpg',
    author: 'Dr. Jordan Rivers',
    date: 'Feb 28, 2026',
    slug: 'altitude-sickness-guide',
  },
  {
    id: '3',
    title: 'Best Time to Visit Popular Mountain Peaks',
    excerpt: 'Planning your summit? Season, weather, and crowd patterns vary by location. This guide helps you pick the perfect time.',
    category: 'Planning',
    readTime: '7 min read',
    image: '/blog/mountain-seasons.jpg',
    author: 'Sarah Peak',
    date: 'Feb 25, 2026',
    slug: 'best-seasons-peaks',
  },
  {
    id: '4',
    title: 'Gear Checklist for High-Altitude Expeditions',
    excerpt: 'From base camp to summit, every item counts. Here\'s the ultimate packing list for serious mountain expeditions.',
    category: 'Gear Guide',
    readTime: '10 min read',
    image: '/blog/gear-checklist.jpg',
    author: 'Alex Mountain',
    date: 'Feb 20, 2026',
    slug: 'gear-checklist-expedition',
  },
  {
    id: '5',
    title: 'Training Regimen for Mountain Climbers',
    excerpt: 'Physical preparation is key. Learn the training schedule used by professional guides to build endurance and strength.',
    category: 'Training',
    readTime: '9 min read',
    image: '/blog/training-regimen.jpg',
    author: 'Coach Marcus',
    date: 'Feb 18, 2026',
    slug: 'training-regimen',
  },
  {
    id: '6',
    title: 'Photography Tips for Mountain Expeditions',
    excerpt: 'Capture stunning summit moments while staying safe. Tips for camera gear, settings, and when to focus on the climb.',
    category: 'Photography',
    readTime: '5 min read',
    image: '/blog/mountain-photography.jpg',
    author: 'Photo Expert Kim',
    date: 'Feb 15, 2026',
    slug: 'mountain-photography',
  },
];

const CATEGORIES = ['All', 'Beginner Guide', 'Health & Safety', 'Planning', 'Gear Guide', 'Training', 'Photography'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Adventure Blog</h1>
          <p className="text-lg text-sky-100">
            Expert guides, safety tips, and inspiration for your next summit
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full transition-colors ${
                  category === 'All'
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="flex flex-col h-full border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="h-48 bg-gray-300 dark:bg-slate-800 flex items-center justify-center text-gray-500">
                <MapPin size={40} />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-block px-3 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post.readTime}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-sky-600 dark:hover:text-sky-400">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.author}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {post.date}
                    </p>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Your Summit Journey?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect with experienced guides and book your next adventure today
          </p>
          <Link
            href="/guides"
            className="inline-block px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
          >
            Explore Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
