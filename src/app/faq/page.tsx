/**
 * FAQ Page - Frequently Asked Questions
 * SEO-optimized with collapsible answers
 */

'use client';

import { Metadata } from 'next';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

// Note: Metadata in 'use client' requires a separate server component wrapper
// For now, we'll handle metadata differently

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I book a trip?',
    answer: 'Browse available trips, select your preferred date and guide, and complete the booking through our secure checkout. You\'ll receive a confirmation email with all trip details and guide contact information.',
  },
  {
    category: 'Getting Started',
    question: 'What makes Summit different from other adventure platforms?',
    answer: 'Summit connects you directly with verified, experienced guides who share your passion for adventure. We prioritize safety, personalization, and authentic local experiences with transparent pricing and direct communication.',
  },
  {
    category: 'Getting Started',
    question: 'Do I need experience to join a trip?',
    answer: 'Most trips are available at different difficulty levels. Whether you\'re a beginner or an experienced climber, you\'ll find guides and trips suited to your skill level. Always check the difficulty rating and requirements before booking.',
  },

  // Safety
  {
    category: 'Safety',
    question: 'How are guides verified?',
    answer: 'All guides on Summit go through a thorough vetting process including background checks, experience verification, and certification review. Guides must maintain excellent safety records and customer reviews above 4.5 stars.',
  },
  {
    category: 'Safety',
    question: 'What safety equipment is provided?',
    answer: 'Guides provide essential safety equipment including ropes, harnesses, helmets, and first aid kits. Specific equipment varies by trip type. Always confirm what\'s included in your trip details and ask your guide about any additional equipment you should bring.',
  },
  {
    category: 'Safety',
    question: 'What if the weather is bad?',
    answer: 'Your guide will monitor weather conditions and decide whether to proceed, reschedule, or cancel your trip. Safety is the priority. If a trip is cancelled due to weather, you can reschedule for another date at no additional cost or receive a full refund.',
  },

  // Pricing & Payments
  {
    category: 'Pricing & Payments',
    question: 'What\'s included in the trip price?',
    answer: 'Trip prices include the guide\'s expertise, basic safety equipment, and local transportation. Check each trip listing for specific inclusions and exclusions (e.g., meals, accommodation, transportation from major cities).',
  },
  {
    category: 'Pricing & Payments',
    question: 'Is travel insurance required?',
    answer: 'While not required, we strongly recommend travel insurance that covers adventure activities. Most trips require participants to sign a liability waiver, and insurance protects you in case of unexpected accidents or cancellations.',
  },
  {
    category: 'Pricing & Payments',
    question: 'What\'s your cancellation policy?',
    answer: 'Cancellations made 14+ days before the trip receive a full refund. Cancellations 7-13 days before receive 50% refund. Less than 7 days: no refund. Guides can offer refunds at their discretion. Weather-related cancellations are always refundable.',
  },

  // Guides
  {
    category: 'For Guides',
    question: 'How do I become a guide on Summit?',
    answer: 'Sign up for a guide account, complete your profile with certifications and experience, list your first trip, and pass our verification process. It typically takes 3-5 business days. You\'ll need liability insurance and relevant certifications.',
  },
  {
    category: 'For Guides',
    question: 'How much can I earn?',
    answer: 'Earnings depend on trip price, duration, and demand. Most guides earn $200-$500 per trip. Summit takes a 12% platform commission plus a $1 hosting fee per booking. Payouts are made weekly to your bank account or Stripe account.',
  },
  {
    category: 'For Guides',
    question: 'What certifications do I need?',
    answer: 'Required certifications vary by activity type. Mountain guides need IFMGA or equivalent certification. Rock climbing guides need certified climbing instructor credentials. Always check local regulations. First aid/CPR certification is required for all guides.',
  },

  // Technical
  {
    category: 'Technical',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and bank transfers. Payments are processed securely through Stripe and encrypted end-to-end.',
  },
  {
    category: 'Technical',
    question: 'Is my data secure?',
    answer: 'Yes. We use industry-standard encryption, secure databases, and comply with GDPR and CCPA regulations. Your payment information is never stored on our servers—Stripe handles all payment processing securely.',
  },
  {
    category: 'Technical',
    question: 'Can I message my guide before the trip?',
    answer: 'Yes. The in-app messaging system lets you communicate with your guide before and after your trip. Use it to ask questions, confirm details, or arrange pickup times.',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(FAQ_ITEMS.map(item => item.category)))];

function FAQContent() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFAQs = FAQ_ITEMS.filter(
    item => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-sky-100">
            Find answers to common questions about Summit
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              isExpanded={expandedIndex === index}
              onToggle={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
            />
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our support team is here to help. Contact us anytime.
          </p>
          <a
            href="mailto:support@summit.local"
            className="inline-block px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

interface FAQItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQItem({ item, isExpanded, onToggle }: FAQItemProps) {
  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="text-left">
          <span className="text-xs font-medium text-sky-600 dark:text-sky-400 uppercase tracking-wide">
            {item.category}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            {item.question}
          </h3>
        </div>
        <ChevronDown
          size={24}
          className={clsx(
            'flex-shrink-0 ml-4 text-gray-600 dark:text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <div className="px-6 py-4 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default FAQContent;
