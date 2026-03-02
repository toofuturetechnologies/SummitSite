/**
 * Admin Revenue Analytics Dashboard
 * /admin/analytics
 * 
 * Platform revenue tracking and metrics
 */

'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, Loader } from 'lucide-react';

interface Analytics {
  period: number;
  summary: {
    total_gmv: number;
    total_bookings: number;
    completed_bookings: number;
    conversion_rate: number;
  };
  revenue: {
    total_commission: number;
    hosting_fees: number;
    platform_revenue: number;
    guide_payouts: number;
    refunds: number;
    net_revenue: number;
    gross_margin: number;
  };
  bookings: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  top_guides: Array<{ guideId: string; revenue: number }>;
  trend: Array<{ date: string; revenue: number }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/revenue?period=${period}`);
      const data = await res.json();
      setAnalytics(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
            Revenue Analytics
          </h1>
          <p className="text-sky-600 dark:text-sky-400">
            Platform performance and financial metrics
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-sky-500 text-white'
                  : 'bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/40'
              }`}
            >
              Last {p} days
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-sky-700 dark:text-sky-300">
              Total GMV
            </h3>
            <DollarSign className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-3xl font-bold text-sky-900 dark:text-sky-100">
            ${(analytics.summary.total_gmv / 100).toFixed(0)}
          </p>
          <p className="text-xs text-sky-600 dark:text-sky-400 mt-2">
            Gross Merchandise Value
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
              Net Revenue
            </h3>
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">
            ${(analytics.revenue.net_revenue / 100).toFixed(0)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            After commissions & refunds
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Bookings
            </h3>
            <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            {analytics.summary.total_bookings}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            {analytics.summary.conversion_rate.toFixed(1)}% completion rate
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Gross Margin
            </h3>
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {analytics.revenue.gross_margin.toFixed(1)}%
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
            Platform margin
          </p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-sky-900 dark:text-sky-100 mb-6">
          Revenue Breakdown
        </h2>

        <div className="space-y-4">
          {[
            { label: 'Commission (12%)', value: analytics.revenue.total_commission, color: 'bg-sky-500' },
            { label: 'Hosting Fees', value: analytics.revenue.hosting_fees, color: 'bg-blue-500' },
            { label: 'Refunds', value: -analytics.revenue.refunds, color: 'bg-red-500' },
          ].map((item) => {
            const percent = (Math.abs(item.value) / analytics.summary.total_gmv) * 100;
            return (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    ${(item.value / 100).toFixed(0)} ({percent.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-sky-900 dark:text-sky-100 mb-6">
            Booking Status
          </h2>

          <div className="space-y-3">
            {[
              { label: 'Pending', value: analytics.bookings.pending, color: 'bg-amber-100 text-amber-700' },
              { label: 'Confirmed', value: analytics.bookings.confirmed, color: 'bg-blue-100 text-blue-700' },
              { label: 'Completed', value: analytics.bookings.completed, color: 'bg-green-100 text-green-700' },
              { label: 'Cancelled', value: analytics.bookings.cancelled, color: 'bg-red-100 text-red-700' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className={`px-3 py-1 rounded-full font-bold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Guides */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-sky-900 dark:text-sky-100 mb-6">
            Top Guides by Revenue
          </h2>

          <div className="space-y-3">
            {analytics.top_guides.slice(0, 5).map((guide, idx) => (
              <div key={guide.guideId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 w-6 text-right">
                    #{idx + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {guide.guideId.substring(0, 8)}...
                  </span>
                </div>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  ${(guide.revenue / 100).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
