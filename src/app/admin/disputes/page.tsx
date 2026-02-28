/**
 * Admin Disputes Resolution Page
 * Handle customer disputes and refund requests
 */

'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Dispute {
  id: string;
  booking_id: string;
  initiator_name: string;
  initiator_email: string;
  reason: string;
  status: string;
  resolution: string | null;
  refund_amount: number | null;
  booking_amount: number;
  created_at: string;
  resolved_at: string | null;
}

const DisputesPage = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState<'approved' | 'denied'>('approved');
  const [refundAmount, setRefundAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/disputes?page=${page}&limit=${limit}`);
        
        if (res.ok) {
          const data = await res.json();
          setDisputes(data.disputes);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('Failed to fetch disputes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  const handleResolve = async () => {
    if (!selectedDispute) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/disputes/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispute_id: selectedDispute.id,
          resolution,
          refund_amount: resolution === 'approved' ? parseFloat(refundAmount) : 0,
          notes,
        }),
      });

      if (res.ok) {
        alert(`Dispute ${resolution}!`);
        setSelectedDispute(null);
        setPage(1);
      } else {
        alert('Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Error resolving dispute');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
          Dispute Resolution
        </h1>
        <p className="text-sky-600 dark:text-sky-400">
          Manage customer disputes and refund requests
        </p>
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="text-center p-8 text-sky-600 dark:text-sky-400">
          Loading disputes...
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center p-8 text-sky-600 dark:text-sky-400">
          No open disputes
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedDispute(dispute);
                  setRefundAmount(dispute.refund_amount?.toString() || dispute.booking_amount.toString());
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-sky-900 dark:text-sky-100">
                      {dispute.initiator_name}
                    </h3>
                    <p className="text-sm text-sky-600 dark:text-sky-400">
                      {dispute.initiator_email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      dispute.status === 'open'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                        : dispute.status === 'resolved'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {dispute.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sky-600 dark:text-sky-400">Reason:</span>
                    <span className="font-medium text-sky-900 dark:text-sky-100">
                      {dispute.reason}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sky-600 dark:text-sky-400">Amount:</span>
                    <span className="font-medium text-sky-900 dark:text-sky-100">
                      ${dispute.booking_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-sky-500 dark:text-sky-400">
                    <span>Submitted:</span>
                    <span>{new Date(dispute.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {dispute.status === 'open' && (
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
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full">
            <div className="p-6">
              {/* Close */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-sky-900 dark:text-sky-100">
                  Resolve Dispute
                </h2>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-sky-400 hover:text-sky-600 dark:hover:text-sky-300"
                >
                  ✕
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6 p-4 bg-sky-50 dark:bg-sky-900/10 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sky-600 dark:text-sky-400">Customer:</span>
                  <span className="font-medium text-sky-900 dark:text-sky-100">
                    {selectedDispute.initiator_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600 dark:text-sky-400">Reason:</span>
                  <span className="font-medium text-sky-900 dark:text-sky-100">
                    {selectedDispute.reason}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-600 dark:text-sky-400">Booking Amount:</span>
                  <span className="font-medium text-sky-900 dark:text-sky-100">
                    ${selectedDispute.booking_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Resolution Form */}
              <div className="space-y-4">
                {/* Resolution Type */}
                <div>
                  <label className="block text-sm font-medium text-sky-900 dark:text-sky-100 mb-2">
                    Resolution
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="approved"
                        checked={resolution === 'approved'}
                        onChange={(e) => setResolution(e.target.value as 'approved' | 'denied')}
                      />
                      <span className="text-sky-700 dark:text-sky-300">Approve Refund</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="denied"
                        checked={resolution === 'denied'}
                        onChange={(e) => setResolution(e.target.value as 'approved' | 'denied')}
                      />
                      <span className="text-sky-700 dark:text-sky-300">Deny Refund</span>
                    </label>
                  </div>
                </div>

                {/* Refund Amount (if approved) */}
                {resolution === 'approved' && (
                  <div>
                    <label className="block text-sm font-medium text-sky-900 dark:text-sky-100 mb-2">
                      Refund Amount
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-sky-900 dark:text-sky-100"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-sky-900 dark:text-sky-100 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for documentation..."
                    className="w-full px-3 py-2 border border-sky-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-sky-900 dark:text-sky-100 placeholder-sky-400 dark:placeholder-sky-500"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedDispute(null)}
                    className="flex-1 px-4 py-2 border border-sky-200 dark:border-slate-700 rounded-lg text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={processing}
                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                      resolution === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {processing ? 'Processing...' : resolution === 'approved' ? 'Approve Refund' : 'Deny Refund'}
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

export default DisputesPage;
