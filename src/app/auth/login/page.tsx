'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // Success - redirect to return URL or dashboard
      router.push(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
      <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-summit-300 mb-6">Welcome back to Summit</p>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-summit-200 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-summit-200 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="space-y-3 mt-6">
          <p className="text-summit-300 text-sm text-center">
            Don&apos;t have an account?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/auth/signup-customer"
              className="block bg-summit-700 hover:bg-summit-600 text-summit-100 text-sm font-medium py-2 rounded-lg transition text-center"
            >
              🏕️ Book a Trip
            </Link>
            <Link
              href="/auth/signup"
              className="block bg-summit-700 hover:bg-summit-600 text-summit-100 text-sm font-medium py-2 rounded-lg transition text-center"
            >
              🏔️ Become a Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
          <p className="text-white text-lg">Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
