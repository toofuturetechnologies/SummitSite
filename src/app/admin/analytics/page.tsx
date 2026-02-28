/**
 * Admin Analytics Dashboard
 * Revenue, growth, and performance metrics
 */

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, BookOpen } from 'lucide-react';

interface RevenueData {
  period: string;
  metrics: {
    total_revenue: number;
    total_commission: number;
    guide_payouts: number;
    completed_bookings: number;
    avg_booking_value: number;
  };
  chart: Array<{
    date: string;
    revenue: number;
    commission: number;
    payouts: number;
  }>;
  summary: {
    commission_rate: string;
    payout_rate: string;
  };
}

const AnalyticsPage = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics/revenue?period=${period}`);
        
        if (res.ok) {
          const analyticsData = await res.json();
          setData(analyticsData);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 dark:border-slate-700 border-t-sky-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-sky-600 dark:text-sky-400">
        Failed to load analytics
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Revenue',
      value: `$${data.metrics.total_revenue.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
    {
      label: 'Platform Commission',
      value: `$${data.metrics.total_commission.toFixed(2)}`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Guide Payouts',
      value: `$${data.metrics.guide_payouts.toFixed(2)}`,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Completed Bookings',
      value: data.metrics.completed_bookings,
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
          Analytics & Metrics
        </h1>
        <p className="text-sky-600 dark:text-sky-400">
          Platform revenue, growth, and performance data
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {['month', 'quarter', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg border transition-colors capitalize ${
              period === p
                ? 'bg-sky-600 dark:bg-sky-700 text-white border-sky-600 dark:border-sky-700'
                : 'bg-white dark:bg-slate-800 border-sky-200 dark:border-slate-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700'
            }`}
          >
            This {p}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
                {metric.label}
              </p>
              <div className={`p-3 rounded-lg ${metric.color}`}>
                {metric.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-sky-900 dark:text-sky-100">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4">
            Commission Rate
          </h3>
          <p className="text-4xl font-bold text-sky-600 dark:text-sky-400 mb-2">
            {data.summary.commission_rate}%
          </p>
          <p className="text-sm text-sky-600 dark:text-sky-400">
            of total revenue
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4">
            Average Booking Value
          </h3>
          <p className="text-4xl font-bold text-sky-600 dark:text-sky-400 mb-2">
            ${data.metrics.avg_booking_value.toFixed(2)}
          </p>
          <p className="text-sm text-sky-600 dark:text-sky-400">
            per completed booking
          </p>
        </div>
      </div>

      {/* Revenue Trend Chart (Simple Table for now) */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-sky-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100">
            Daily Revenue Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sky-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-sky-900 dark:text-sky-100">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-sky-900 dark:text-sky-100">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-sky-900 dark:text-sky-100">
                  Commission
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-sky-900 dark:text-sky-100">
                  Guide Payouts
                </th>
              </tr>
            </thead>
            <tbody>
              {data.chart.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-sky-100 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 font-medium text-sky-900 dark:text-sky-100">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 text-right text-sky-700 dark:text-sky-300">
                    ${row.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sky-700 dark:text-sky-300">
                    ${row.commission.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sky-700 dark:text-sky-300">
                    ${row.payouts.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.chart.length === 0 && (
          <div className="p-8 text-center text-sky-600 dark:text-sky-400">
            No revenue data for selected period
          </div>
        )}
      </div>

      {/* Help */}
      <div className="bg-sky-50 dark:bg-sky-900/10 rounded-lg border border-sky-200 dark:border-sky-700 p-6">
        <h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-2">
          Understanding These Metrics
        </h3>
        <ul className="space-y-2 text-sky-700 dark:text-sky-300 text-sm">
          <li><strong>Total Revenue:</strong> Amount customers paid for bookings</li>
          <li><strong>Platform Commission:</strong> Platform's share (typically 12%)</li>
          <li><strong>Guide Payouts:</strong> Amount paid to guides</li>
          <li><strong>Commission Rate:</strong> Percentage of revenue kept by platform</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPage;
