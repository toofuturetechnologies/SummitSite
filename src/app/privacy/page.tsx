/**
 * Privacy Policy Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Summit',
  description: 'Read our privacy policy and learn how we protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sky-100 mt-2">Last updated: March 1, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Summit ("we", "us", or "our") operates the Summit platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Name, email, phone number, address</li>
                  <li>Payment information (processed securely by Stripe)</li>
                  <li>Profile photos and biographical information</li>
                  <li>Certifications and qualifications (for Guides)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Usage Information
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Pages visited, time spent on Platform</li>
                  <li>Device information (browser, OS, IP address)</li>
                  <li>Search queries and trip preferences</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Communication Data
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Messages between Customers and Guides</li>
                  <li>Support tickets and correspondence</li>
                  <li>Feedback and survey responses</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              We use the collected information for:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Processing bookings and payments</li>
              <li>Personalizing your experience</li>
              <li>Communicating trip details and updates</li>
              <li>Responding to customer support requests</li>
              <li>Improving our Platform and services</li>
              <li>Compliance with legal obligations</li>
              <li>Detecting and preventing fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Data Sharing & Third Parties
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We do NOT sell your personal data. We only share information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
              <li>
                <strong>Payment Processors</strong>: Stripe (for secure payment processing)
              </li>
              <li>
                <strong>Guides</strong>: Your name, email, and trip details (only for booked trips)
              </li>
              <li>
                <strong>Service Providers</strong>: Email (Resend), hosting (Vercel)
              </li>
              <li>
                <strong>Legal Requirements</strong>: When required by law or court order
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
              <li>HTTPS encryption for all data in transit</li>
              <li>Database encryption at rest</li>
              <li>Secure authentication and session management</li>
              <li>Regular security audits and updates</li>
              <li>Compliance with GDPR and CCPA regulations</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              However, no system is 100% secure. We cannot guarantee absolute data security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Your Rights & Choices
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li>Access your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Manage cookie preferences</li>
              <li>Request a data export</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              To exercise these rights, email privacy@summit.local
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Cookies & Tracking
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We use cookies for:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-4">
              <li>Maintaining login sessions</li>
              <li>Remembering preferences</li>
              <li>Analytics (Google Analytics)</li>
              <li>Preventing fraud</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              You can disable cookies in your browser settings, but this may affect Platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Data Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We retain personal data for as long as necessary to provide services and comply with legal obligations. You can request deletion at any time, except where legally required to retain data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Summit is not intended for users under 18 years of age. We do not knowingly collect data from minors. If we become aware of such data, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your data may be transferred to and stored in countries outside your residence. By using Summit, you consent to such transfers subject to this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Changes to Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this Privacy Policy periodically. Significant changes will be notified via email or prominent notice on the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Questions about your privacy? Contact us at privacy@summit.local
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
