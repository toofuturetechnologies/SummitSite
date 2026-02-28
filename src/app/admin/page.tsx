/**
 * Admin Dashboard
 * Main entry point showing key metrics and quick actions
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  Clock,
} from 'lucide-react';

interface DashboardData {
  total_users: number;
  active_guides: number;
  total_bookings: number;
  monthly_revenue: number;
  pending_disputes: number;
  pending_reviews: number;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  highlight?: boolean;
}

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/analytics/dashboard');
        
        if (res.ok) {
          const dashData = await res.json();
          setData(dashData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set default values
        setData({
          total_users: 0,
          active_guides: 0,
          total_bookings: 0,
          monthly_revenue: 0,
          pending_disputes: 0,
          pending_reviews: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 dark:border-slate-700 border-t-sky-500"></div>
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      label: 'Total Users',
      value: data?.total_users || 0,
      icon: <Users className="h-6 w-6" />,
      href: '/admin/users',
    },
    {
      label: 'Active Guides',
      value: data?.active_guides || 0,
      icon: <TrendingUp className="h-6 w-6" />,
      href: '/admin/users',
    },
    {
      label: 'Total Bookings',
      value: data?.total_bookings || 0,
      icon: <Clock className="h-6 w-6" />,
    },
    {
      label: 'Monthly Revenue',
      value: `$${(data?.monthly_revenue || 0).toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
    },
    {
      label: 'Pending Disputes',
      value: data?.pending_disputes || 0,
      icon: <AlertCircle className="h-6 w-6" />,
      href: '/admin/disputes',
      highlight: (data?.pending_disputes || 0) > 0,
    },
    {
      label: 'Pending Reviews',
      value: data?.pending_reviews || 0,
      icon: <FileText className="h-6 w-6" />,
      href: '/admin/ugc',
      highlight: (data?.pending_reviews || 0) > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sky-600 dark:text-sky-400">
          Welcome back. Here's an overview of your platform.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
              stat.highlight
                ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700'
                : 'bg-white dark:bg-slate-800 border-sky-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${
                  stat.highlight
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-sky-600 dark:text-sky-400'
                }`}>
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${
                  stat.highlight
                    ? 'text-red-900 dark:text-red-100'
                    : 'text-sky-900 dark:text-sky-100'
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.highlight
                  ? 'bg-red-200 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
              }`}>
                {stat.icon}
              </div>
            </div>
            {stat.href && (
              <Link
                href={stat.href}
                className="inline-block mt-4 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
              >
                View details →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/users"
            className="p-4 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors"
          >
            <Users className="h-6 w-6 text-sky-600 dark:text-sky-400 mb-2" />
            <p className="font-medium text-sky-900 dark:text-sky-100">Manage Users</p>
            <p className="text-sm text-sky-600 dark:text-sky-400">View, suspend, manage accounts</p>
          </Link>

          <Link
            href="/admin/ugc"
            className="p-4 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors"
          >
            <FileText className="h-6 w-6 text-sky-600 dark:text-sky-400 mb-2" />
            <p className="font-medium text-sky-900 dark:text-sky-100">Review Content</p>
            <p className="text-sm text-sky-600 dark:text-sky-400">Approve, reject, remove videos</p>
          </Link>

          <Link
            href="/admin/disputes"
            className={`p-4 rounded-lg border transition-colors ${
              (data?.pending_disputes || 0) > 0
                ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/20'
                : 'bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/20'
            }`}
          >
            <AlertCircle className={`h-6 w-6 mb-2 ${
              (data?.pending_disputes || 0) > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-sky-600 dark:text-sky-400'
            }`} />
            <p className={`font-medium ${
              (data?.pending_disputes || 0) > 0
                ? 'text-red-900 dark:text-red-100'
                : 'text-sky-900 dark:text-sky-100'
            }`}>
              Resolve Disputes
            </p>
            <p className={`text-sm ${
              (data?.pending_disputes || 0) > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-sky-600 dark:text-sky-400'
            }`}>
              {data?.pending_disputes || 0} pending
            </p>
          </Link>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-sky-50 dark:bg-sky-900/10 rounded-lg border border-sky-200 dark:border-sky-700 p-6">
        <h2 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-2">
          Need Help?
        </h2>
        <p className="text-sky-600 dark:text-sky-400 mb-4">
          Check the admin documentation for guides on user management, content moderation, and dispute resolution.
        </p>
        <button className="px-4 py-2 bg-sky-600 dark:bg-sky-700 text-white rounded-lg hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors">
          View Documentation
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
