'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    displayName: '',
    tagline: '',
    baseLocation: '',
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
      // 1. Create auth user as guide
      // The database trigger will automatically create the profile
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: 'guide',
          },
        },
      });

      if (signUpError) {
        console.error('SignUp error:', signUpError);
        throw new Error(`Signup failed: ${signUpError.message}`);
      }
      
      if (!authData.user) {
        throw new Error('User creation failed: No user returned');
      }

      const userId = authData.user.id;
      console.log('Auth user created:', userId);

      // Wait for database trigger to create profile
      // Try up to 3 times with 500ms delays
      let profileExists = false;
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
        
        if (profile) {
          profileExists = true;
          console.log('Profile created by trigger');
          break;
        }
        
        if (i === 2) {
          console.error('Profile creation failed after retries');
          console.log('Profile check error:', profileError);
        }
      }

      if (!profileExists) {
        throw new Error('Profile was not created. Please check your email and try again.');
      }

      // 2. Create guide profile
      const slug = formData.displayName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-');

      const { error: guideError } = await supabase
        .from('guides')
        .insert({
          user_id: userId,
          slug: slug,
          display_name: formData.displayName,
          tagline: formData.tagline,
          base_location: formData.baseLocation,
          is_active: true,
        });

      if (guideError) {
        console.error('Guide insert error:', guideError);
        throw new Error(`Guide creation failed: ${guideError.message}`);
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
      <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Become a Guide</h1>
        <p className="text-summit-300 mb-6">Join Summit and share your expertise</p>

        <div className="bg-summit-900/50 border border-summit-700 rounded-lg p-3 mb-6">
          <p className="text-summit-300 text-sm">
            🏔️ <strong>Guide Account:</strong> Create and manage adventure trips. Earn money from bookings.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-summit-200 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-summit-200 text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
              placeholder="How you'll appear to customers"
            />
          </div>

          <div>
            <label className="block text-summit-200 text-sm font-medium mb-2">
              Professional Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g., 'Expert mountaineer with 15+ years'"
              className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-summit-200 text-sm font-medium mb-2">
              Base Location
            </label>
            <input
              type="text"
              name="baseLocation"
              value={formData.baseLocation}
              onChange={handleChange}
              placeholder="e.g., 'Colorado, USA'"
              className="w-full bg-summit-900 border border-summit-600 text-white px-4 py-2 rounded-lg focus:border-summit-500 focus:outline-none"
            />
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
              placeholder="Create a strong password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-summit-600 hover:bg-summit-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-summit-400 text-sm text-center mt-6">
          Looking to book trips instead?{' '}
          <Link href="/auth/signup-customer" className="text-summit-300 hover:text-white font-medium">
            Customer signup
          </Link>
        </p>

        <p className="text-summit-300 text-sm mt-4 text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-summit-400 hover:text-summit-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
