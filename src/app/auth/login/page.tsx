'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const supabase = createClient();

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

  console.log('LoginContent component mounted, returnTo:', returnTo);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Form field changed:', e.target.name);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    console.log('handleLogin called!', e.type);
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting login with email:', formData.email);
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log('Auth response:', { authData, signInError });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (!authData.user) {
        console.error('No user returned from auth');
        throw new Error('Authentication failed: no user data');
      }

      console.log('Login successful, user ID:', authData.user.id);
      console.log('Redirecting to:', returnTo);
      
      // Store auth flag in localStorage for dashboard to detect
      try {
        localStorage.setItem('auth_user_id', authData.user.id);
        localStorage.setItem('auth_timestamp', Date.now().toString());
        console.log('✅ Stored auth in localStorage');
      } catch (e) {
        console.warn('⚠️ Could not store auth in localStorage');
      }
      
      // Use window.location for a hard navigation (not Next.js routing)
      setTimeout(() => {
        console.log('⏱️ Hard redirect after 1s delay to:', returnTo);
        window.location.href = returnTo;
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      console.error('Login error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-8 w-full max-w-md shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sign In</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Welcome back to Summit</p>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" onClick={() => console.log('Form clicked')}>
          {/* Debug: Form is mounted and ready */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-300 dark:border-slate-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-300 dark:border-slate-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="Enter your password"
            />
            <div className="text-right mt-2">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="space-y-3 mt-6">
          <p className="text-gray-700 dark:text-gray-300 text-sm text-center font-medium">
            Don&apos;t have an account?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/auth/signup-customer"
              className="block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition text-center"
            >
              🏕️ Book a Trip
            </Link>
            <Link
              href="/auth/signup"
              className="block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition text-center"
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
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
          <p className="text-gray-900 dark:text-gray-100 text-lg font-medium">Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
