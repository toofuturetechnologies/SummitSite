'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient();

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎯 [Dashboard] Component mounted!');
    
    const loadData = async () => {
      try {
        console.log('👤 [Dashboard] Getting user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('❌ [Dashboard] User error:', userError.message);
        }
        
        console.log('👤 [Dashboard] User result:', { id: user?.id, email: user?.email });

        if (!user) {
          console.log('❌ [Dashboard] No user, redirecting to login');
          router.push('/auth/login?returnTo=/dashboard');
          return;
        }

        // Try to load guide
        console.log('📋 [Dashboard] Loading guide...');
        const { data: guide, error: guideError } = await (supabase as any)
          .from('guides')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('📋 [Dashboard] Guide result:', { id: guide?.id, name: guide?.display_name, error: guideError?.message });

        if (guideError || !guide) {
          console.log('ℹ️ [Dashboard] Not a guide');
          router.push('/trips');
          return;
        }

        // Load trips
        console.log('🎯 [Dashboard] Loading trips...');
        const { data: trips, error: tripsError } = await (supabase as any)
          .from('trips')
          .select('*')
          .eq('guide_id', guide.id);

        console.log('🎯 [Dashboard] Trips result:', { count: trips?.length, error: tripsError?.message });

        setData({ user, guide, trips: trips || [] });
        setLoading(false);
      } catch (err) {
        console.error('❌ [Dashboard] Catch error:', err);
        setError(err instanceof Error ? err.message : 'Error');
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 text-red-100 p-6 rounded-lg">
          <p className="font-bold mb-2">Error</p>
          <p className="mb-4">{error}</p>
          <Link href="/auth/login" className="bg-white text-red-900 px-4 py-2 rounded">
            Login Again
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 flex items-center justify-center p-4">
        <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-8 text-center">
          <p className="text-white mb-4">No data</p>
          <Link href="/auth/login" className="bg-summit-600 hover:bg-summit-500 text-white px-6 py-2 rounded">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-summit-700 to-summit-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{data.guide.display_name}</h1>
          <p className="text-summit-300">{data.guide.tagline}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-300 text-sm mb-2">Trips</p>
            <p className="text-3xl font-bold text-white">{data.trips.length}</p>
          </div>
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-300 text-sm mb-2">Rating</p>
            <p className="text-3xl font-bold text-white">{data.guide.rating || 'N/A'}</p>
          </div>
          <div className="bg-summit-800/50 border border-summit-700 rounded-lg p-6">
            <p className="text-summit-300 text-sm mb-2">User Email</p>
            <p className="text-sm text-white">{data.user.email}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/');
          }}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
