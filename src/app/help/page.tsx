/**
 * Help & Support Page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageCircle, BookOpen, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help & Support | Summit',
  description: 'Get help with your Summit account, bookings, and adventure trips',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help & Support</h1>
          <p className="text-lg text-sky-100">
            We're here to help. Find answers or contact our support team.
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* FAQ Card */}
          <Link
            href="/faq"
            className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg hover:shadow-lg transition-shadow"
          >
            <BookOpen className="text-sky-600 dark:text-sky-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              FAQ
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse frequently asked questions about booking, guides, safety, and more.
            </p>
          </Link>

          {/* Blog Card */}
          <Link
            href="/blog"
            className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg hover:shadow-lg transition-shadow"
          >
            <BookOpen className="text-sky-600 dark:text-sky-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Adventure Blog
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Read expert guides, safety tips, and preparation advice for your adventure.
            </p>
          </Link>
        </div>

        {/* Contact Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Contact Support
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Support */}
            <div className="p-6 bg-sky-50 dark:bg-slate-900 rounded-lg">
              <Mail className="text-sky-600 dark:text-sky-400 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Email Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Email us anytime. We respond within 24 hours.
              </p>
              <a
                href="mailto:support@summit.local"
                className="inline-block px-4 py-2 bg-sky-600 dark:bg-sky-500 text-white rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
              >
                support@summit.local
              </a>
            </div>

            {/* In-App Chat */}
            <div className="p-6 bg-sky-50 dark:bg-slate-900 rounded-lg">
              <MessageCircle className="text-sky-600 dark:text-sky-400 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                In-App Messaging
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Message your guide directly for trip-specific questions.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-4 py-2 bg-sky-600 dark:bg-sky-500 text-white rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
              >
                Go to Messages
              </Link>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Common Issues & Solutions
          </h2>
          <div className="space-y-4">
            <details className="p-4 border border-gray-200 dark:border-slate-800 rounded-lg">
              <summary className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900 dark:text-white">
                <AlertCircle size={20} className="text-sky-600" />
                I forgot my password
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Click "Forgot password" on the login page. Enter your email, and we'll send a reset link. Check your spam folder if you don't see the email.
              </p>
            </details>

            <details className="p-4 border border-gray-200 dark:border-slate-800 rounded-lg">
              <summary className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900 dark:text-white">
                <AlertCircle size={20} className="text-sky-600" />
                How do I cancel my booking?
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Go to your dashboard, find the booking, and click "Cancel". Refund eligibility depends on how many days before the trip you cancel (see our cancellation policy in FAQ).
              </p>
            </details>

            <details className="p-4 border border-gray-200 dark:border-slate-800 rounded-lg">
              <summary className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900 dark:text-white">
                <AlertCircle size={20} className="text-sky-600" />
                The payment failed. What should I do?
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Common reasons: insufficient funds, expired card, or incorrect CVV. Try a different payment method or contact your bank to ensure the transaction is approved.
              </p>
            </details>

            <details className="p-4 border border-gray-200 dark:border-slate-800 rounded-lg">
              <summary className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900 dark:text-white">
                <AlertCircle size={20} className="text-sky-600" />
                How do I become a guide?
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Sign up as a guide, complete your profile with certifications, and submit your first trip listing. Our verification team will review within 3-5 business days. You need liability insurance and relevant certifications.
              </p>
            </details>

            <details className="p-4 border border-gray-200 dark:border-slate-800 rounded-lg">
              <summary className="flex items-center gap-3 cursor-pointer font-semibold text-gray-900 dark:text-white">
                <AlertCircle size={20} className="text-sky-600" />
                When will I receive my payout?
              </summary>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Payouts are processed weekly to your connected bank account or Stripe account. Timing depends on your bank (typically 1-3 business days).
              </p>
            </details>
          </div>
        </div>

        {/* Legal & Policy Links */}
        <div className="mb-12 p-8 bg-gray-50 dark:bg-slate-900 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Legal & Policies
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/terms"
              className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              Terms of Service →
            </Link>
            <Link
              href="/privacy"
              className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              Privacy Policy →
            </Link>
            <Link
              href="/faq"
              className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              Cancellation Policy →
            </Link>
          </div>
        </div>

        {/* Status Page */}
        <div className="text-center p-8 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Platform Status
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Check our real-time status and incident reports.
          </p>
          <a
            href="https://status.summit.local"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-sky-600 dark:bg-sky-500 text-white rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
          >
            View Status →
          </a>
        </div>
      </div>
    </div>
  );
}
