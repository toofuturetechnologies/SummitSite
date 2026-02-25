'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

const supabase = createClient();

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
          </p>
          <Link
            href="/auth/login"
            className="block w-full bg-summit-600 hover:bg-summit-500 text-white font-medium py-2 rounded-lg transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-gray-600 mb-6">Enter your email to receive a password reset link</p>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-300 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6">
          <Link
            href="/auth/login"
            className="block text-gray-600 hover:text-gray-600 text-center text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
