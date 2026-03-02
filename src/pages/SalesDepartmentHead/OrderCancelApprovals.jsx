import React, { useState, useEffect, useMemo } from 'react';
import { Ban, CheckCircle, XCircle, RefreshCw, AlertTriangle, User, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(API_ENDPOINTS.ORDER_CANCEL_ALL());
      setList(res?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch cancel requests:', err);
      Toast.error(err?.response?.data?.message || 'Failed to load cancel requests');
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
        await fetchPending(); // Refresh the list
      } else {
        Toast.error(res?.data?.message || 'Failed to approve');
        await fetchPending(); // Refresh even on error to remove stale data
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to approve';
      Toast.error(errorMsg);
      await fetchPending(); // Refresh to sync state
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
        await fetchPending(); // Refresh the list
      } else {
        Toast.error(res?.data?.message || 'Failed to reject');
        await fetchPending(); // Refresh even on error
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to reject';
      Toast.error(errorMsg);
      await fetchPending(); // Refresh to sync state
    } finally {
      setRejectingId(null);
    }
  };

  // Search filter (customer, quotation, product, reason, salesperson, status)
  const filteredList = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    return list.filter((req) => {
      const customer = (req.customer_name || '').toLowerCase();
      const quotation = (req.quotation_number || req.quotation_id || '').toLowerCase();
      const product = (req.item_product_name || req.product_name || req.reason || '').toLowerCase();
      const reason = (req.reason || '').toLowerCase();
      const salesperson = (req.requested_by || req.approved_by || '').toLowerCase();
      const status = (req.status || '').toLowerCase();
      return (
        customer.includes(q) ||
        quotation.includes(q) ||
        product.includes(q) ||
        reason.includes(q) ||
        salesperson.includes(q) ||
        status.includes(q)
      );
    });
  }, [list, searchQuery]);

  // Pagination on filtered list
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredList.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="p-4 sm:p-6">
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
          <p className="text-gray-600 font-medium">No order cancel requests</p>
          <p className="text-sm text-gray-500 mt-1">When a salesperson requests to cancel an order, it will appear here.</p>
        </div>
      ) : (
        <>
          {/* Search box */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, quotation, product, reason, salesperson, status..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {filteredList.length === list.length
                ? `${list.length} request${list.length !== 1 ? 's' : ''}`
                : `${filteredList.length} of ${list.length} matching`}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredList.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Search className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No requests match your search</p>
                <p className="text-sm mt-1">Try a different search term or clear the search box.</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salesperson
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {req.customer_name || 'N/A'}
                            </div>
                            {req.is_partial && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                                Partial
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{req.quotation_number || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{req.quotation_id?.substring(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {req.item_product_name || req.product_name || req.is_partial ? (req.reason?.replace('Partial: ', '') || 'N/A') : 'Full Order'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {req.quantity ? `${req.quantity} ${req.unit || ''}`.trim() : '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {req.rate ? `₹${Number(req.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{Number(req.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={req.reason || 'No reason provided'}>
                          {req.reason || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{req.requested_by || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : ''}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {req.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={approvingId === req.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-xs"
                              title="Approve"
                            >
                              {approvingId === req.id ? (
                                <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModalId(req.id)}
                              disabled={rejectingId === req.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 text-xs"
                              title="Reject"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {req.status === 'approved' && req.approved_by && (
                              <div>By: {req.approved_by}</div>
                            )}
                            {req.status === 'rejected' && req.approved_by && (
                              <div>By: {req.approved_by}</div>
                            )}
                            {req.approved_at && (
                              <div>{new Date(req.approved_at).toLocaleDateString('en-IN')}</div>
                            )}
                            {req.rejected_at && (
                              <div>{new Date(req.rejected_at).toLocaleDateString('en-IN')}</div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>

          {/* Pagination - always show when there is data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 px-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-700">
                Showing {filteredList.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredList.length)} of {filteredList.length} request{filteredList.length !== 1 ? 's' : ''}
              </span>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Per page
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[100px] text-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || filteredList.length === 0}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages || filteredList.length === 0}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
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
