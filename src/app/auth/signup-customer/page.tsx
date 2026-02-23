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

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/bookings/checkout';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Create auth user as customer
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            user_type: 'customer',
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('User creation failed');

      const userId = authData.user.id;

      // 2. Create profile (as customer, NOT as guide)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          user_type: 'customer',
        });

      if (profileError) throw profileError;

      // Success - redirect back to booking or dashboard
      router.push(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
      <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-summit-300 mb-6">Book your next adventure</p>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-summit-200 text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-summit-200 text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-summit-400 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-summit-300 hover:text-white">
            Sign in
          </Link>
        </p>

        <p className="text-summit-400 text-sm text-center mt-4">
          Want to become a guide?{' '}
          <Link href="/auth/signup" className="text-summit-300 hover:text-white">
            Create a guide account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpCustomerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
          <p className="text-white text-lg">Loading...</p>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
