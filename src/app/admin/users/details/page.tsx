/**
 * Admin User Details Page
 * View detailed user information and history
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  profile_type: string;
  rating: number;
  created_at: string;
  earnings: number;
}

const UserDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [suspending, setSuspending] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push('/admin/users');
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        // Note: In a real implementation, you'd have an endpoint like /api/admin/users/[id]
        // For now, we'll show a placeholder
        setUser({
          id: userId,
          name: 'User Name',
          email: 'user@example.com',
          profile_type: 'guide',
          rating: 4.8,
          created_at: new Date().toISOString(),
          earnings: 5400,
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 dark:border-slate-700 border-t-sky-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8 text-sky-600 dark:text-sky-400">
        User not found
      </div>
    );
  }

  const handleSuspend = async () => {
    const reason = prompt('Reason for suspension:');
    if (!reason) return;

    setSuspending(true);
    try {
      const res = await fetch('/api/admin/users/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          reason,
        }),
      });

      if (res.ok) {
        alert('User suspended successfully');
        router.push('/admin/users');
      } else {
        alert('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error suspending user');
    } finally {
      setSuspending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/admin/users')}
        className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
            {user.name}
          </h1>
          <p className="text-sky-600 dark:text-sky-400">{user.email}</p>
        </div>
        <button
          onClick={handleSuspend}
          disabled={suspending}
          className="px-4 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Shield className="h-4 w-4" />
          Suspend User
        </button>
      </div>

      {/* User Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <p className="text-sm text-sky-600 dark:text-sky-400 mb-2">Profile Type</p>
          <p className="text-2xl font-bold text-sky-900 dark:text-sky-100 capitalize">
            {user.profile_type}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <p className="text-sm text-sky-600 dark:text-sky-400 mb-2">Rating</p>
          <p className="text-2xl font-bold text-sky-900 dark:text-sky-100">
            {user.rating}★
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <p className="text-sm text-sky-600 dark:text-sky-400 mb-2">Total Earnings</p>
          <p className="text-2xl font-bold text-sky-900 dark:text-sky-100">
            ${user.earnings.toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <p className="text-sm text-sky-600 dark:text-sky-400 mb-2">Member Since</p>
          <p className="text-2xl font-bold text-sky-900 dark:text-sky-100">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Activity & History Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookings History */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4">
            Recent Bookings
          </h3>
          <p className="text-sky-600 dark:text-sky-400 text-sm">
            Bookings history would load here from booking API
          </p>
        </div>

        {/* Suspension History */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Suspension History
          </h3>
          <p className="text-sky-600 dark:text-sky-400 text-sm">
            No active suspensions
          </p>
        </div>

        {/* Reviews Given */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4">
            Reviews Given
          </h3>
          <p className="text-sky-600 dark:text-sky-400 text-sm">
            Reviews would load here from reviews API
          </p>
        </div>

        {/* Account Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4">
            Account Activity
          </h3>
          <p className="text-sky-600 dark:text-sky-400 text-sm">
            Activity log would show here
          </p>
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4">
          Admin Notes
        </h3>
        <textarea
          placeholder="Add notes about this user for future reference..."
          className="w-full px-4 py-3 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-sky-900 dark:text-sky-100 placeholder-sky-400 dark:placeholder-sky-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
          rows={4}
        />
        <button className="mt-3 px-4 py-2 bg-sky-600 dark:bg-sky-700 hover:bg-sky-700 dark:hover:bg-sky-600 text-white rounded-lg font-medium">
          Save Notes
        </button>
      </div>
    </div>
  );
};

export default UserDetailsPage;
