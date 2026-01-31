import React, { useState, useEffect } from 'react';
import { Ban, CheckCircle, XCircle, RefreshCw, AlertTriangle, User, FileText } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import Toast from '../../utils/Toast';

export default function OrderCancelApprovals({ setActiveView }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalId, setRejectModalId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.ORDER_CANCEL_PENDING());
      setList(res?.data?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch pending cancel requests:', err);
      Toast.error(err?.response?.data?.message || 'Failed to load pending requests');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ORDER_CANCEL_APPROVE(id));
      if (res?.data?.success) {
        Toast.success(res.data.message || 'Order cancel approved.');
        fetchPending();
      } else {
        Toast.error(res?.data?.message || 'Failed to approve');
      }
    } catch (err) {
      Toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id) => {
    setRejectingId(id);
    try {
      const res = await apiClient.post(API_ENDPOINTS.ORDER_CANCEL_REJECT(id), {
        rejectionReason: rejectReason || undefined
      });
      if (res?.data?.success) {
        Toast.success(res.data.message || 'Request rejected.');
        setRejectModalId(null);
        setRejectReason('');
        fetchPending();
      } else {
        Toast.error(res?.data?.message || 'Failed to reject');
      }
    } catch (err) {
      Toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
            <Ban className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order Cancel Approvals</h1>
            <p className="text-sm text-gray-500">Approve or reject order cancel requests from salesperson</p>
          </div>
        </div>
        <button
          onClick={fetchPending}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No pending order cancel requests</p>
          <p className="text-sm text-gray-500 mt-1">When a salesperson requests to cancel an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{req.quotation_number || `Quotation ${req.quotation_id}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{req.customer_name || `Customer ${req.customer_id}`}</span>
                  </div>
                  {req.total_amount != null && (
                    <p className="text-sm text-gray-600">Total: ₹{Number(req.total_amount).toLocaleString('en-IN')}</p>
                  )}
                  {req.reason && (
                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <span className="font-medium text-gray-600">Reason: </span>
                      {req.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Requested by {req.requested_by} • {req.created_at ? new Date(req.created_at).toLocaleString('en-IN') : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={approvingId === req.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {approvingId === req.id ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectModalId(req.id)}
                    disabled={rejectingId === req.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject cancel request</h3>
            <p className="text-sm text-gray-600 mb-3">Optional: Add a reason for rejection (visible to salesperson).</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
              rows={3}
              placeholder="e.g. Order already in production"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setRejectModalId(null); setRejectReason(''); }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectModalId)}
                disabled={rejectingId === rejectModalId}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejectingId === rejectModalId ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
