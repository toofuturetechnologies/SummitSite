/**
 * Pricing Page - Transparent pricing breakdown
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | Summit - Find Your Guide',
  description: 'Transparent pricing for customers and guides. No hidden fees. See what guides earn and what customers pay.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transparent Pricing</h1>
          <p className="text-lg text-sky-100">
            No hidden fees. See exactly what you pay and what guides earn.
          </p>
        </div>
      </div>

      {/* Pricing Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* For Customers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            For Customers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
            You pay the trip price set by the guide. There are no hidden platform fees charged to customers.
          </p>

          <div className="bg-sky-50 dark:bg-slate-900 rounded-lg p-8 border border-sky-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Example: $450 Mountain Trek
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-slate-700">
                <span className="text-gray-900 dark:text-white font-medium">Trip Price (set by guide)</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">$450.00</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-slate-700">
                <span className="text-gray-900 dark:text-white font-medium">Customer Platform Fee</span>
                <span className="text-xl font-bold text-sky-600 dark:text-sky-400">$0.00</span>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-bold text-gray-900 dark:text-white">You Pay</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">$450.00</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-slate-800">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What's Included?</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                Professional guide with expert credentials
              </li>
              <li className="flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                Safety equipment and insurance
              </li>
              <li className="flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                Pre-trip communication with your guide
              </li>
              <li className="flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                Post-trip support and reviews
              </li>
            </ul>
          </div>
        </div>

        {/* For Guides */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            For Guides
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
            You set your own prices. Summit takes a small commission to operate the platform and process payments.
          </p>

          <div className="bg-sky-50 dark:bg-slate-900 rounded-lg p-8 border border-sky-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Example: $450 Mountain Trek Booking
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-slate-700">
                <span className="text-gray-900 dark:text-white font-medium">Customer Pays</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">$450.00</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-slate-700">
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">Platform Commission (12%)</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Covers platform, payment processing, support</p>
                </div>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">-$54.00</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-300 dark:border-slate-700">
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">Hosting Fee</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Covers servers, infrastructure, support</p>
                </div>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">-$1.00</span>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-bold text-gray-900 dark:text-white">You Receive</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">$395.00</span>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 pt-4">
                <strong>Payout Schedule:</strong> Weekly to your bank account (1-3 business days)
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 bg-green-50 dark:bg-slate-900 rounded-lg border border-green-200 dark:border-slate-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Commission Breakdown</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between">
                  <span>Platform commission</span>
                  <span className="font-medium">12%</span>
                </li>
                <li className="flex justify-between">
                  <span>Hosting fee per booking</span>
                  <span className="font-medium">$1.00</span>
                </li>
                <li className="flex justify-between pt-2 border-t border-gray-300 dark:border-slate-700">
                  <span className="font-bold">Effective rate on $450</span>
                  <span className="font-bold">12.2%</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-slate-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Why 12%?</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400">•</span>
                  <span>Payment processing (Stripe): 2.9% + $0.30</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400">•</span>
                  <span>Platform operations: 5%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400">•</span>
                  <span>Customer support: 2.5%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-sky-600 dark:text-sky-400">•</span>
                  <span>Infrastructure: 1.6%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="border-t border-gray-200 dark:border-slate-800 pt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Pricing Questions?
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I set my own price as a guide?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You have complete control over your pricing. Set rates based on difficulty, location, season, and demand. You can also offer discounts for group bookings.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Are there any cancellation fees?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cancellations are customer-controlled. Customers get full refunds if they cancel 14+ days before. You can offer refunds at your discretion for cancellations within 7 days.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                When do I get paid?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Payouts process weekly every Friday. Funds arrive in your bank account within 1-3 business days. You can also use Stripe Connect for faster payouts.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a minimum or maximum price?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No minimums or maximums. Price your trips based on value. Most guides earn $200-$500 per trip. Popular guides charge $500-$2000+ for premium experiences.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How do you calculate taxes?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We recommend consulting a tax professional. In most jurisdictions, guide earnings are subject to income tax. We provide detailed records for your taxes. We don't calculate or withhold taxes.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 text-center border border-sky-200 dark:border-slate-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to book your adventure or start guiding?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join thousands of adventurers on Summit
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/trips"
              className="px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
            >
              Book a Trip
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 font-semibold rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors"
            >
              Become a Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
