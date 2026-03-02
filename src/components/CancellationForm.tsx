/**
 * Cancellation Form Component
 * Allows customers/guides to cancel bookings
 */

'use client';

import { useState } from 'react';
import { AlertCircle, Loader, X } from 'lucide-react';

interface CancellationFormProps {
  bookingId: string;
  tripTitle: string;
  tripDate: string;
  totalAmount: number;
  userId: string;
  isGuide: boolean;
  otherPartyName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CancellationForm({
  bookingId,
  tripTitle,
  tripDate,
  totalAmount,
  userId,
  isGuide,
  otherPartyName,
  onSuccess,
  onCancel,
}: CancellationFormProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refundInfo, setRefundInfo] = useState<any>(null);

  // Calculate days until trip
  const daysUntilTrip = Math.ceil((new Date(tripDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Calculate refund percentage
  let refundPercentage = 0;
  let refundAmount = 0;

  if (daysUntilTrip > 7) {
    refundPercentage = 100;
  } else if (daysUntilTrip > 3) {
    refundPercentage = 50;
  }

  refundAmount = Math.round((totalAmount * refundPercentage) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1: Cancel booking
      const cancelRes = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          userId,
          reason,
          isGuide,
        }),
      });

      const cancelData = await cancelRes.json();

      if (!cancelRes.ok) {
        throw new Error(cancelData.error || 'Failed to cancel booking');
      }

      // Step 2: Process refund if applicable
      if (refundAmount > 0 && !isGuide) {
        const refundRes = await fetch('/api/bookings/refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            reason,
          }),
        });

        const refundData = await refundRes.json();

        if (!refundRes.ok) {
          console.error('Refund failed:', refundData);
          // Don't throw - cancellation was successful
        } else {
          setRefundInfo(refundData.refund);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
          <span className="text-2xl">✓</span> Booking Cancelled
        </h3>
        <p className="text-sm text-green-700 dark:text-green-300 mb-4">
          Your booking has been successfully cancelled.
        </p>

        {refundInfo && (
          <div className="bg-white dark:bg-slate-800 rounded p-4 mb-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Refund Status:</p>
            <p className="font-semibold text-green-700 dark:text-green-300 mb-2">
              ${(refundInfo.amount / 100).toFixed(2)} will be refunded
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Refunds typically appear in 3-5 business days.
            </p>
          </div>
        )}

        {isGuide && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3 text-sm">
            <p className="text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> {otherPartyName} will be notified of the cancellation and will receive a refund if applicable.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {/* Warning */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
            Cancel Booking?
          </h4>
          <p className="text-red-800 dark:text-red-300 mb-2">
            You are about to cancel: <strong>{tripTitle}</strong> on{' '}
            <strong>{new Date(tripDate).toLocaleDateString()}</strong>
          </p>
          <p className="text-red-700 dark:text-red-400 text-xs">
            {otherPartyName} will be notified and may be eligible for a refund.
          </p>
        </div>
      </div>

      {/* Refund Policy Info */}
      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
        <p className="text-sm font-medium text-sky-900 dark:text-sky-100 mb-3">
          Refund Policy
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-sky-800 dark:text-sky-300">Days until trip:</span>
            <span className="font-semibold text-sky-900 dark:text-sky-100">{daysUntilTrip} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sky-800 dark:text-sky-300">Refund percentage:</span>
            <span className="font-semibold text-sky-900 dark:text-sky-100">{refundPercentage}%</span>
          </div>
          <div className="border-t border-sky-200 dark:border-sky-800 pt-2 flex justify-between">
            <span className="font-medium text-sky-900 dark:text-sky-100">Refund amount:</span>
            <span className="font-bold text-lg text-sky-600 dark:text-sky-400">
              ${refundAmount.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="text-xs text-sky-700 dark:text-sky-300 mt-3">
          💡 Cancel more than 7 days in advance for a full refund
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Reason for Cancellation
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please tell us why you're cancelling this booking..."
          rows={4}
          maxLength={500}
          required
          className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-sky-400"
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {reason.length}/500 characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !reason.trim()}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          {loading ? 'Cancelling...' : 'Confirm Cancellation'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Keep Booking
          </button>
        )}
      </div>
    </form>
  );
}
