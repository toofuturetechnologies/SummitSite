/**
 * Terms of Service Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Summit',
  description: 'Read our terms of service and legal agreements',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-sky-100 mt-2">Last updated: March 1, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing and using Summit (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Services Description
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Summit is a marketplace that connects adventure seekers (Customers) with experienced guides (Guides). We provide the platform, but are not responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
              <li>The quality, legality, or safety of trips offered by Guides</li>
              <li>Injuries, accidents, or incidents occurring during trips</li>
              <li>Cancellations, delays, or changes to trips</li>
              <li>Communication between Customers and Guides</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities under your account</li>
              <li>Providing accurate information during registration</li>
              <li>Notifying us immediately of unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. User Conduct
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Engage in harassment, discrimination, or abuse</li>
              <li>Post false, defamatory, or misleading content</li>
              <li>Attempt to manipulate ratings or reviews</li>
              <li>Interfere with or disrupt the Platform's operation</li>
              <li>Use automated tools to scrape or extract data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Assumption of Risk & Waivers
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Adventure activities carry inherent risks including serious injury or death. By booking a trip, you acknowledge these risks and assume full responsibility. You will be required to sign liability waivers before participating in any trip.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Cancellation & Refund Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cancellation refunds are as follows:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
              <li>14+ days before trip: Full refund</li>
              <li>7-13 days before trip: 50% refund</li>
              <li>Less than 7 days: No refund (unless Guide approves)</li>
              <li>Weather-related cancellations: Full refund</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Guide-initiated cancellations always receive full refunds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Payment Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
              <span className="block">
                • Payments are processed securely through Stripe
              </span>
              <span className="block">
                • Summit charges a 12% platform commission + $1 hosting fee per booking
              </span>
              <span className="block">
                • Guides receive payment weekly, less commission and fees
              </span>
              <span className="block">
                • Disputed payments are resolved within 30 days
              </span>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              You retain ownership of content you post, but grant Summit a worldwide, royalty-free license to use, display, and distribute it for Platform operations and marketing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To the fullest extent permitted by law, Summit is not liable for:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
              <li>Injuries, deaths, or property damage during trips</li>
              <li>Loss of data or account access</li>
              <li>Indirect or consequential damages</li>
              <li>Service interruptions or unavailability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Summit may update these Terms at any time. Continued use of the Platform constitutes acceptance of updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Questions about these Terms? Contact us at support@summit.local
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
