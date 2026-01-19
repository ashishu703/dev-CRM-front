import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, Eye, Filter, Info, Loader2, Search } from 'lucide-react';
import paymentService from '../../api/admin_api/paymentService';

const TAB_META = {
  pending: { label: 'Pending', color: 'text-amber-600 border-amber-200 bg-amber-50' },
  approved: { label: 'Approved', color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
  rejected: { label: 'Rejected', color: 'text-rose-600 border-rose-200 bg-rose-50' }
};
const STATUS_KEYS = Object.keys(TAB_META);

const AccountsPayInfo = ({ setActiveView }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [viewPayment, setViewPayment] = useState(null);
  const [editPayment, setEditPayment] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'approved', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tabCounts, setTabCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [installmentBreakdown, setInstallmentBreakdown] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset pagination on tab/search change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, debouncedSearch]);

  const fetchCounts = useCallback(async () => {
    try {
      const responses = await Promise.all(
        STATUS_KEYS.map((status) =>
          paymentService.getAllPayments({ approvalStatus: status, limit: 1 })
        )
      );
      const next = {};
      responses.forEach((res, idx) => {
        const status = STATUS_KEYS[idx];
        next[status] = res?.pagination?.total ?? 0;
      });
      setTabCounts(next);
    } catch (err) {
      console.warn('Failed to fetch tab counts', err);
    }
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await paymentService.getAllPayments({
          approvalStatus: activeTab,
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined
        });
        const rows = Array.isArray(response?.data) ? response.data : [];
        const formatted = rows.map((payment) => {
          const totalAmount =
            Number(payment.total_quotation_amount ?? payment.totalQuotationAmount ?? payment.total_amount ?? 0) || 0;
          const remainingAmount = Number(payment.remaining_amount ?? payment.remainingAmount ?? 0) || 0;
          const paidAmount = Number(payment.paid_amount ?? payment.paidAmount ?? 0) || 0;
          const isAdvance = totalAmount > 0 && remainingAmount > 0;
          const statusVariant = isAdvance
            ? {
                code: 'A',
                label: 'Advance Payment',
                badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200'
              }
            : {
                code: 'F',
                label: 'Full Payment',
                badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              };
          const displayPi = payment.pi_number?.trim()
            ? payment.pi_number
            : payment.pi_full_id?.trim()
            ? payment.pi_full_id
            : payment.pi_id?.trim()
            ? payment.pi_id
            : 'N/A';

          return {
            ...payment,
            displayQuotation: payment.quotation_number || payment.quotation_id || '—',
            displayPi,
            approvalStatus: (payment.approval_status || 'pending').toLowerCase(),
            leadSort: Number(payment.lead_id || 0),
            remarksText: payment.remarks || '—',
            methodLabel: (payment.payment_method || 'N/A').replace(/_/g, ' ').toUpperCase(),
            statusVariant,
            paymentTotals: {
              totalAmount,
              remainingAmount,
              paidAmount
            }
          };
        });
        formatted.sort((a, b) => a.leadSort - b.leadSort);
        setPayments(formatted);
        const total = response?.pagination?.total ?? formatted.length;
        setTabCounts((prev) => ({ ...prev, [activeTab]: total }));
        setPagination((prev) => ({
          ...prev,
          total,
          pages: response?.pagination?.pages ?? 1
        }));
      } catch (error) {
        console.error('Failed to fetch payments', error);
        setAlert({ type: 'error', message: error.message || 'Unable to load payments' });
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [activeTab, pagination.page, pagination.limit, debouncedSearch, refreshKey]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const formatAmount = (value) => {
    if (value === undefined || value === null) return '₹0';
    return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const handleOpenEdit = (payment) => {
    setEditPayment(payment);
    setEditForm({
      status: payment.approval_status || activeTab,
      notes: payment.approval_notes || ''
    });
  };

  const handleViewPayment = async (payment) => {
    setViewPayment(payment);
    // Load installment breakdown if quotation_id exists
    if (payment.quotation_id) {
      setLoadingBreakdown(true);
      try {
        const response = await paymentService.getInstallmentBreakdown(payment.quotation_id);
        setInstallmentBreakdown(response?.data || null);
      } catch (error) {
        console.error('Failed to load installment breakdown:', error);
        setInstallmentBreakdown(null);
      } finally {
        setLoadingBreakdown(false);
      }
    } else {
      setInstallmentBreakdown(null);
    }
  };

  const handleApprovalSubmit = async (event) => {
    event.preventDefault();
    if (!editPayment) return;
    setSubmitting(true);
    try {
      await paymentService.updateApprovalStatus(editPayment.id, editForm.status, editForm.notes);
      setAlert({ type: 'success', message: `Payment marked as ${editForm.status}` });
      setEditPayment(null);
      setEditForm({ status: 'approved', notes: '' });
      setRefreshKey((prev) => prev + 1);
      await fetchCounts();
    } catch (error) {
      console.error('Failed to update approval', error);
      setAlert({ type: 'error', message: error.message || 'Failed to update approval status' });
    } finally {
      setSubmitting(false);
    }
  };

  const paginatedLabel = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + pagination.limit - 1, pagination.total);
    return `Showing ${pagination.total ? start : 0}-${pagination.total ? end : 0} of ${pagination.total}`;
  }, [pagination]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-2 sm:gap-3">
        {Object.entries(TAB_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition ${
              activeTab === key ? `${meta.color} border-current` : 'border-slate-200 text-slate-500'
            }`}
          >
            {meta.label} <span className="hidden sm:inline">({tabCounts[key] || 0})</span>
            <span className="sm:hidden">({tabCounts[key] || 0})</span>
          </button>
        ))}
      </div>

      {alert && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <Info className="w-4 h-4" />
          {alert.message}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{paginatedLabel}</span>
            <span className="sm:hidden">Payments</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full sm:w-auto pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Lead ID', 'Customer', 'Business', 'Product', 'Address', 'Quotation ID', 'PI ID', 'Payment Method / Ref', 'Installment', 'Remarks', 'Action'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={11} className="px-6 py-10 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading payments...
                  </td>
                </tr>
              )}
              {!loading && payments.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-10 text-center text-slate-500">
                    No payments found for this tab.
                  </td>
                </tr>
              )}
              {!loading &&
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">LD-{payment.lead_id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.customer_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.business_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.product_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{payment.address || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.displayQuotation}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{payment.displayPi}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{payment.methodLabel}</span>
                      {payment.payment_reference && (
                        <span className="block text-slate-500">Ref: {payment.payment_reference}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatAmount(payment.installment_amount)}
                      {payment.statusVariant && (
                        <span
                          className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${payment.statusVariant.badgeClass}`}
                          title={payment.statusVariant.label}
                        >
                          {payment.statusVariant.code}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-pre-line">
                      {payment.remarksText}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(payment)}
                          title="Edit approval"
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewPayment(payment)}
                          title="View details"
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {loading && (
            <div className="text-center py-10 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading payments...
            </div>
          )}
          {!loading && payments.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              No payments found for this tab.
            </div>
          )}
          {!loading &&
            payments.map((payment) => (
              <div key={payment.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Lead ID</p>
                    <p className="text-sm font-semibold text-slate-900">LD-{payment.lead_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(payment)}
                      title="Edit approval"
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewPayment(payment)}
                      title="View details"
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Customer</p>
                    <p className="text-sm text-slate-700">{payment.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Business</p>
                    <p className="text-sm text-slate-700">{payment.business_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Product</p>
                    <p className="text-sm text-slate-700">{payment.product_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Installment</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatAmount(payment.installment_amount)}
                      {payment.statusVariant && (
                        <span
                          className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${payment.statusVariant.badgeClass}`}
                          title={payment.statusVariant.label}
                        >
                          {payment.statusVariant.code}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm text-slate-600">{payment.address || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Quotation ID</p>
                    <p className="text-sm text-slate-600">{payment.displayQuotation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">PI ID</p>
                    <p className="text-sm text-slate-600">{payment.displayPi}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payment Method</p>
                  <p className="text-sm font-semibold text-slate-900">{payment.methodLabel}</p>
                  {payment.payment_reference && (
                    <p className="text-xs text-slate-500 mt-1">Ref: {payment.payment_reference}</p>
                  )}
                </div>
                {payment.remarksText && payment.remarksText !== '—' && (
                  <div>
                    <p className="text-xs text-slate-500">Remarks</p>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{payment.remarksText}</p>
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100">
          <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">{paginatedLabel}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="px-3 py-2 text-xs sm:text-sm border rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-slate-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="px-3 py-2 text-xs sm:text-sm border rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewPayment && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-2 sm:p-4">
          <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl border border-slate-200 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <p className="text-[10px] uppercase text-slate-400">Payment Preview</p>
                <h3 className="text-sm font-semibold text-slate-900">Lead #{viewPayment.lead_id}</h3>
              </div>
              <button onClick={() => {
                setViewPayment(null);
                setInstallmentBreakdown(null);
              }} className="text-slate-400 hover:text-slate-600 text-lg leading-none">
                ✕
              </button>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Customer</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">{viewPayment.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Business</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">{viewPayment.business_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Product</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">{viewPayment.product_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Installment Amount</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">{formatAmount(viewPayment.installment_amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Quotation ID</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">{viewPayment.displayQuotation || viewPayment.quotation_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">PI ID</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">{viewPayment.displayPi || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Payment Method</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">
                    {(viewPayment.payment_method || 'N/A').replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Reference No.</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">{viewPayment.payment_reference || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Payment Date</p>
                  <p className="text-xs font-medium text-slate-900 leading-tight">
                    {viewPayment.payment_date ? new Date(viewPayment.payment_date).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Address</p>
                <p className="text-xs text-slate-700 leading-tight break-words">{viewPayment.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Remarks</p>
                <p className="text-xs text-slate-700 leading-tight break-words">{viewPayment.remarks || 'No remarks added'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Accounts Notes</p>
                <p className="text-xs text-slate-500 leading-tight break-words">
                  {viewPayment.approval_notes?.trim() ? viewPayment.approval_notes : 'No notes provided'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-1">Payment Receipt</p>
                {viewPayment.payment_receipt_url ? (
                  <div className="flex flex-col sm:flex-row items-start gap-2">
                    <div className="border border-slate-200 rounded overflow-hidden bg-white flex-shrink-0 w-full sm:w-auto" style={{ maxWidth: '160px', maxHeight: '120px' }}>
                      <img
                        src={viewPayment.payment_receipt_url}
                        alt="Payment receipt"
                        className="w-full h-full object-contain"
                        style={{ maxHeight: '120px', maxWidth: '100%' }}
                        loading="lazy"
                      />
                    </div>
                    <a
                      href={viewPayment.payment_receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 text-[10px] font-medium text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors"
                    >
                      Open
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No receipt uploaded</p>
                )}
              </div>
            </div>

            {/* Detailed Installment Breakdown */}
            {viewPayment.quotation_id && (
              <div className="border-t border-slate-200 mt-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Installment Breakdown</h4>
                    <p className="text-xs text-slate-500">Complete payment ledger with installment-wise details</p>
                  </div>
                  {loadingBreakdown && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  )}
                </div>

                {loadingBreakdown ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    Loading installment details...
                  </div>
                ) : installmentBreakdown ? (
                  <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Total Amount</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatAmount(installmentBreakdown.summary?.total_quotation_amount)}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                        <p className="text-[10px] text-emerald-600 uppercase mb-1">Total Approved</p>
                        <p className="text-sm font-semibold text-emerald-700">
                          {formatAmount(installmentBreakdown.summary?.total_approved)}
                        </p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <p className="text-[10px] text-amber-600 uppercase mb-1">Remaining</p>
                        <p className="text-sm font-semibold text-amber-700">
                          {formatAmount(installmentBreakdown.summary?.remaining_balance)}
                        </p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <p className="text-[10px] text-indigo-600 uppercase mb-1">Installments</p>
                        <p className="text-sm font-semibold text-indigo-700">
                          {installmentBreakdown.summary?.approved_installments || 0} / {installmentBreakdown.summary?.total_installments || 0}
                        </p>
                      </div>
                    </div>

                    {/* Installment Table */}
                    {installmentBreakdown.installments && installmentBreakdown.installments.length > 0 ? (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block border border-slate-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase">Inst #</th>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase">Date</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase">Amount</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase">Ledger Before</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase">Ledger After</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase">Cumulative Paid</th>
                                <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-600 uppercase">Remaining</th>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase">Method</th>
                                <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-600 uppercase">Reference</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                              {installmentBreakdown.installments.map((inst, idx) => {
                                const isApproved = inst.approval_status === 'approved';
                                const isPending = inst.approval_status === 'pending';
                                const isRejected = inst.approval_status === 'rejected';
                                
                                return (
                                  <tr key={inst.payment_id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                    <td className="px-4 py-2 text-xs font-semibold text-slate-900">
                                      {inst.installment_number}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-600">
                                      {inst.payment_date ? new Date(inst.payment_date).toLocaleDateString('en-IN') : 'N/A'}
                                    </td>
                                    <td className="px-4 py-2 text-xs font-semibold text-slate-900 text-right">
                                      {formatAmount(inst.installment_amount)}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-600 text-right">
                                      {formatAmount(inst.ledger_balance_before)}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-600 text-right">
                                      {formatAmount(inst.ledger_balance_after)}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-600 text-right">
                                      {formatAmount(inst.cumulative_approved)}
                                    </td>
                                    <td className="px-4 py-2 text-xs font-medium text-right">
                                      <span className={inst.remaining_balance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                        {formatAmount(inst.remaining_balance)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-xs">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                        isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        'bg-rose-50 text-rose-700 border border-rose-200'
                                      }`}>
                                        {inst.approval_status?.toUpperCase() || 'PENDING'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-600">
                                      {(inst.payment_method || 'N/A').replace(/_/g, ' ').toUpperCase()}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-500 font-mono">
                                      {inst.payment_reference || '—'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                              <tr>
                                <td colSpan="2" className="px-4 py-2 text-xs font-semibold text-slate-900">
                                  TOTAL
                                </td>
                                <td className="px-4 py-2 text-xs font-semibold text-slate-900 text-right">
                                  {formatAmount(installmentBreakdown.summary?.total_paid_all)}
                                </td>
                                <td colSpan="2" className="px-4 py-2 text-xs text-slate-500 text-right">
                                  Approved: {formatAmount(installmentBreakdown.summary?.total_approved)}
                                </td>
                                <td className="px-4 py-2 text-xs font-semibold text-slate-900 text-right">
                                  {formatAmount(installmentBreakdown.summary?.total_approved)}
                                </td>
                                <td className="px-4 py-2 text-xs font-semibold text-right">
                                  <span className={installmentBreakdown.summary?.remaining_balance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                    {formatAmount(installmentBreakdown.summary?.remaining_balance)}
                                  </span>
                                </td>
                                <td colSpan="3" className="px-4 py-2 text-xs text-slate-500">
                                  {installmentBreakdown.summary?.approved_installments || 0} approved, {installmentBreakdown.summary?.pending_installments || 0} pending, {installmentBreakdown.summary?.rejected_installments || 0} rejected
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                        {/* Mobile Card View for Installments */}
                        <div className="md:hidden space-y-3">
                          {installmentBreakdown.installments.map((inst, idx) => {
                            const isApproved = inst.approval_status === 'approved';
                            const isPending = inst.approval_status === 'pending';
                            const isRejected = inst.approval_status === 'rejected';
                            
                            return (
                              <div key={inst.payment_id || idx} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-900">Inst #{inst.installment_number}</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                      {inst.approval_status?.toUpperCase() || 'PENDING'}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatAmount(inst.installment_amount)}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <p className="text-[10px] text-slate-500">Date</p>
                                    <p className="text-slate-700">{inst.payment_date ? new Date(inst.payment_date).toLocaleDateString('en-IN') : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500">Method</p>
                                    <p className="text-slate-700">{(inst.payment_method || 'N/A').replace(/_/g, ' ').toUpperCase()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500">Ledger Before</p>
                                    <p className="text-slate-700">{formatAmount(inst.ledger_balance_before)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500">Ledger After</p>
                                    <p className="text-slate-700">{formatAmount(inst.ledger_balance_after)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500">Cumulative Paid</p>
                                    <p className="text-slate-700">{formatAmount(inst.cumulative_approved)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500">Remaining</p>
                                    <p className={`font-medium ${inst.remaining_balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                      {formatAmount(inst.remaining_balance)}
                                    </p>
                                  </div>
                                </div>
                                {inst.payment_reference && (
                                  <div>
                                    <p className="text-[10px] text-slate-500">Reference</p>
                                    <p className="text-xs text-slate-600 font-mono">{inst.payment_reference}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6 text-sm text-slate-500 border border-slate-200 rounded-lg">
                        No installments found for this quotation
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-slate-500 border border-slate-200 rounded-lg">
                    Unable to load installment breakdown
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

  {/* Edit Modal */}
      {editPayment && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-2 sm:p-4">
          <form
            onSubmit={handleApprovalSubmit}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 max-h-[95vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="text-xs uppercase text-slate-500">Update Approval</p>
                <h3 className="text-lg font-semibold text-slate-900">Lead #{editPayment.lead_id}</h3>
              </div>
              <button onClick={() => setEditPayment(null)} type="button" className="text-slate-500 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs uppercase font-semibold text-slate-500">Approval Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-slate-500">Notes / Reason</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add internal note or rejection reason"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditPayment(null)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccountsPayInfo;

