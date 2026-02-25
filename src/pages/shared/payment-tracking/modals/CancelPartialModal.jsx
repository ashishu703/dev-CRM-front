import React from 'react';
import { XCircle, Scissors } from 'lucide-react';

/**
 * Modal to submit a partial order cancellation request.
 */
export default function CancelPartialModal({
  open,
  onClose,
  reason,
  onReasonChange,
  onSubmit,
  loading,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4">
        <div className="flex items-center justify-between mb-3 border-b pb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Scissors className="h-5 w-5 text-gray-600" /> Cancel Partial Order
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Submit a partial cancellation request. Department head approval required.
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-gray-500"
          rows={3}
          placeholder="e.g. Partial items cancelled"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
