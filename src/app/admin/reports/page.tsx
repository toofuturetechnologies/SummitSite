/**
 * Admin Content Reports Page
 * Review user-submitted reports of inappropriate content
 */

'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Report {
  id: string;
  ugc_id: string | null;
  trip_id: string | null;
  content_type: string;
  reporter_name: string;
  reporter_email: string;
  reason: string;
  description: string;
  status: string;
  action_taken: string | null;
  created_at: string;
}

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [action, setAction] = useState('none');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/reports?page=${page}&limit=${limit}&status=${status}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page, status, limit]);

  const totalPages = Math.ceil(total / limit);

  const handleResolve = async () => {
    if (!selectedReport) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/reports/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: selectedReport.id,
          action,
          notes,
        }),
      });

      if (res.ok) {
        alert('Report resolved!');
        setSelectedReport(null);
        setPage(1);
      } else {
        alert('Failed to resolve report');
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Error resolving report');
    } finally {
      setProcessing(false);
    }
  };

  const reasonColors: Record<string, string> = {
    'inappropriate': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10',
    'misinformation': 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10',
    'spam': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10',
    'copyright': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10',
    'other': 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/10',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
          Content Reports
        </h1>
        <p className="text-sky-600 dark:text-sky-400">
          Review reports submitted by users about inappropriate content
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['pending', 'reviewed', 'resolved'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              status === s
                ? 'bg-sky-600 dark:bg-sky-700 text-white border-sky-600 dark:border-sky-700'
                : 'bg-white dark:bg-slate-800 border-sky-200 dark:border-slate-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center p-8 text-sky-600 dark:text-sky-400">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center p-8 text-sky-600 dark:text-sky-400">
          No {status} reports
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedReport(report);
                  setAction('none');
                  setNotes('');
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-sky-900 dark:text-sky-100">
                      {report.reporter_name}
                    </h3>
                    <p className="text-sm text-sky-600 dark:text-sky-400">
                      {report.reporter_email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      report.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                        : report.status === 'resolved'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${reasonColors[report.reason] || reasonColors['other']}`}>
                      {report.reason}
                    </div>
                  </div>
                  <p className="text-sky-700 dark:text-sky-300">
                    {report.description}
                  </p>
                  <div className="text-sm text-sky-500 dark:text-sky-400">
                    <span>Content: {report.content_type}</span> • <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {report.status === 'pending' && (
                  <button className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                    Click to review →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded border border-sky-200 dark:border-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sky-700 dark:text-sky-300">
              {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded border border-sky-200 dark:border-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full">
            <div className="p-6">
              {/* Close */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-sky-900 dark:text-sky-100">
                  Resolve Report
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-sky-400 hover:text-sky-600 dark:hover:text-sky-300"
                >
                  ✕
                </button>
              </div>

              {/* Report Details */}
              <div className="space-y-4 mb-6 p-4 bg-sky-50 dark:bg-sky-900/10 rounded-lg">
                <div>
                  <p className="text-sm text-sky-600 dark:text-sky-400">Reason</p>
                  <p className="font-medium text-sky-900 dark:text-sky-100 capitalize">
                    {selectedReport.reason}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-sky-600 dark:text-sky-400">Description</p>
                  <p className="text-sky-800 dark:text-sky-200">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* Action Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-sky-900 dark:text-sky-100 mb-3">
                    Action to Take
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'none', label: 'No Action' },
                      { value: 'warning', label: 'Send Warning' },
                      { value: 'remove_content', label: 'Remove Content' },
                      { value: 'suspend_user', label: 'Suspend User' },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value={opt.value}
                          checked={action === opt.value}
                          onChange={(e) => setAction(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sky-700 dark:text-sky-300">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-sky-900 dark:text-sky-100 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for documentation..."
                    className="w-full px-3 py-2 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-sky-900 dark:text-sky-100"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 px-4 py-2 border border-sky-200 dark:border-slate-700 rounded-lg text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Resolve Report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
