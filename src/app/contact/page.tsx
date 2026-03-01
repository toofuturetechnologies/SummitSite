/**
 * Contact Page - Get in touch
 */

'use client';

import { Metadata } from 'next';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

// Note: Metadata doesn't work in 'use client', so we'll handle it differently

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In production, this would send to your backend
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 500));
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-900 dark:to-sky-800 text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-sky-100">
            Have questions? We'd love to hear from you. Contact us anytime.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Email */}
          <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg text-center">
            <Mail className="mx-auto text-sky-600 dark:text-sky-400 mb-4" size={40} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Email
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              General inquiries and support
            </p>
            <a
              href="mailto:hello@summit.local"
              className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              hello@summit.local
            </a>
          </div>

          {/* Phone */}
          <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg text-center">
            <Phone className="mx-auto text-sky-600 dark:text-sky-400 mb-4" size={40} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Phone
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Mon-Fri, 9am-6pm MST
            </p>
            <a
              href="tel:+1-800-SUMMIT-1"
              className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              +1 (800) 786-4481
            </a>
          </div>

          {/* Location */}
          <div className="p-6 border border-gray-200 dark:border-slate-800 rounded-lg text-center">
            <MapPin className="mx-auto text-sky-600 dark:text-sky-400 mb-4" size={40} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Headquarters
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Denver, Colorado<br />
              United States
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-white"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Select a subject</option>
                  <option value="booking">Booking Question</option>
                  <option value="guide">Become a Guide</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-white"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-sky-600 dark:bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>

              {submitted && (
                <div className="p-4 bg-green-50 dark:bg-slate-900 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                  ✓ Message sent! We'll get back to you soon.
                </div>
              )}
            </form>
          </div>

          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Common Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Response Time?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We typically respond to emails within 24 hours on weekdays. For urgent issues, call our phone line.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Booking Support?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  For booking-related questions, check your confirmation email or use the Help page for self-service options.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Want to Become a Guide?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Head to the dashboard, sign up as a guide, and submit your information. We'll verify your credentials and get you set up.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Partnership Opportunities?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We're always interested in partnerships with tourism boards, hotels, and adventure companies. Reach out to discuss collaboration opportunities.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Press / Media?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  For press inquiries, please email{' '}
                  <a href="mailto:press@summit.local" className="text-sky-600 dark:text-sky-400 hover:underline">
                    press@summit.local
                  </a>
                </p>
              </div>

              <div className="p-6 bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-200 dark:border-slate-800 mt-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  📍 Office Hours
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM MST</li>
                  <li><strong>Saturday:</strong> 10:00 AM - 4:00 PM MST</li>
                  <li><strong>Sunday:</strong> Closed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
