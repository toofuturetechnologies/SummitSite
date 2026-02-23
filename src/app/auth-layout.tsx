'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };

    getUser();

    const { data } = supabase.auth.onAuthStateChange(
      (event: any, session: any) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}
