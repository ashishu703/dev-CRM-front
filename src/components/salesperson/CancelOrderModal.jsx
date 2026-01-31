import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import Toast from '../../utils/Toast';

export default function CancelOrderModal({ item, onClose, onCancelRequested }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const quotationId = item?.quotationData?.id ?? item?.quotationData?.quotationId ?? null;

  useEffect(() => {
    if (!quotationId) {
      setLoadingStatus(false);
      return;
    }
    let cancelled = false;
    apiClient
      .get(API_ENDPOINTS.ORDER_CANCEL_BY_QUOTATION(quotationId))
      .then((res) => {
        if (cancelled) return;
        setExistingRequest(res?.data ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setExistingRequest(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingStatus(false);
      });
    return () => { cancelled = true; };
  }, [quotationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quotationId) {
      Toast.error('Quotation not found.');
      return;
    }
    if (existingRequest?.status === 'pending') {
      Toast.info('Cancel request is already pending. Wait for department head approval.');
      return;
    }
    if (existingRequest?.status === 'approved') {
      Toast.info('Order is already cancelled.');
      onClose();
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ORDER_CANCEL_REQUEST(), {
        quotationId,
        reason: reason.trim() || undefined
      });
      if (res?.data?.success) {
        Toast.success(res.data.message || 'Cancel request submitted. Pending department head approval.');
        onCancelRequested?.();
        onClose();
      } else {
        Toast.error(res?.data?.message || 'Failed to submit cancel request.');
      }
    } catch (err) {
      const msg = err?.data?.message ?? err?.message ?? 'Failed to submit cancel request.';
      Toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPending = existingRequest?.status === 'pending';
  const isApproved = existingRequest?.status === 'approved';
  const isRejected = existingRequest?.status === 'rejected';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Cancel Order
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loadingStatus ? (
            <div className="text-center py-6 text-gray-500">Loading...</div>
          ) : !quotationId ? (
            <p className="text-gray-600">Quotation not found for this item.</p>
          ) : isApproved ? (
            <p className="text-green-700 font-medium">This order is already cancelled.</p>
          ) : isPending ? (
            <p className="text-amber-700 font-medium">
              A cancel request is already pending. Department head approval is required.
            </p>
          ) : isRejected ? (
            <p className="text-gray-700">
              Previous cancel request was rejected.
              {existingRequest?.rejection_reason && (
                <span className="block mt-2 text-sm text-gray-600">
                  Reason: {existingRequest.rejection_reason}
                </span>
              )}
              You can submit a new request below.
            </p>
          ) : null}

          {quotationId && !isApproved && !isPending && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <p className="text-sm text-gray-600">
                Order cancel requires approval from the department head. Submit the reason below.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={3}
                  placeholder="e.g. Customer cancelled at last moment"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Cancel Request'}
                </button>
              </div>
            </form>
          )}

          {(isApproved || isPending) && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
