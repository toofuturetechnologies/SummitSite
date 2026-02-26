'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BookingData {
  id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  trips: {
    title: string;
    description: string;
  };
  participant_count: number;
  total_price: number;
}

interface ExistingReview {
  rating: number;
  comment: string;
  behavior_notes: string;
  professionalism_rating: number;
}

interface Props {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GuideReviewCustomerModal({
  bookingId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    behaviorNotes: '',
    professionalismRating: 5,
  });

  useEffect(() => {
    if (!isOpen || !bookingId) return;

    const loadBookingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/guide-reviews/booking/${bookingId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load booking');
          return;
        }

        setBooking(data.booking);
        if (data.existingReview) {
          setExistingReview(data.existingReview);
          setFormData({
            rating: data.existingReview.rating || 5,
            comment: data.existingReview.comment || '',
            behaviorNotes: data.existingReview.behavior_notes || '',
            professionalismRating: data.existingReview.professionalism_rating || 5,
          });
        }
      } catch (err) {
        setError('Failed to load booking details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [isOpen, bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/guide-reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating: parseInt(String(formData.rating)),
          comment: formData.comment,
          behaviorNotes: formData.behaviorNotes,
          professionalismRating: parseInt(String(formData.professionalismRating)),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit review');
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to submit review');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Customer</h2>
            <p className="text-gray-600 text-sm mt-1">Share your experience with this customer</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : booking ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    <span className="font-medium">Name:</span> {booking.profiles.full_name}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Trip:</span> {booking.trips.title}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Participants:</span> {booking.participant_count}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-gray-900 font-semibold mb-3">
                  Overall Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-3xl transition ${
                        star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Rating: <span className="font-semibold">{formData.rating}/5</span>
                </p>
              </div>

              {/* Professionalism Rating */}
              <div>
                <label className="block text-gray-900 font-semibold mb-3">
                  Professionalism & Conduct
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, professionalismRating: star })
                      }
                      className={`text-3xl transition ${
                        star <= formData.professionalismRating
                          ? 'text-blue-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Rating: <span className="font-semibold">{formData.professionalismRating}/5</span>
                </p>
              </div>

              {/* Behavior Notes */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Behavior & Conduct Notes (Optional)
                </label>
                <textarea
                  value={formData.behaviorNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, behaviorNotes: e.target.value })
                  }
                  placeholder="Any observations about the customer's behavior, professionalism, or fitness level during the trip?"
                  className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <p className="text-gray-500 text-xs mt-1">
                  This helps you remember important details about the customer
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder="Share any additional feedback about this customer..."
                  className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
                >
                  {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
