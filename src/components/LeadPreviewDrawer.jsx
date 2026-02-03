import React, { useState } from 'react';
import { X, RefreshCw, FileText, Ban, CheckCircle, XCircle, User, Receipt } from 'lucide-react';

const TABS = { details: 'details', quotations: 'quotations', cancelOrder: 'cancelOrder' };

const LeadPreviewDrawer = ({
  isOpen,
  onClose,
  previewLead,
  loadingQuotations,
  quotations,
  proformaInvoices,
  isValueAssigned,
  onViewQuotation,
  onDownloadPDF,
  onApproveQuotation,
  onRejectQuotation,
  onViewPI,
  onApprovePI,
  onRejectPI,
  // DH: Order Cancel & PI Amendment approvals (inside Leads)
  pendingOrderCancels,
  pendingRevisedPIs,
  loadingOrderCancels,
  loadingRevisedPIs,
  onApproveOrderCancel,
  onRejectOrderCancel,
  onApproveRevisedPI,
  onRejectRevisedPI
}) => {
  const [activeTab, setActiveTab] = useState(TABS.details);
  const [rejectCancelModalId, setRejectCancelModalId] = useState(null);
  const [rejectCancelReason, setRejectCancelReason] = useState('');
  const [rejectPIModalId, setRejectPIModalId] = useState(null);
  const [rejectPIReason, setRejectPIReason] = useState('');
  if (!isOpen || !previewLead) return null;

  const pendingCancelCount = (pendingOrderCancels || []).length;

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pending_verification':
      case 'pending':
        return 'text-yellow-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      case 'sent':
        return 'text-blue-600';
      case 'accepted':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pending_verification':
      case 'pending':
        return 'Pending Verification';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      case 'sent':
        return 'Sent';
      case 'accepted':
        return 'Accepted';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex z-50">
      <div className="bg-white h-full w-full max-w-md sm:max-w-lg md:max-w-xl ml-auto shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-200 sticky top-0 bg-white z-10 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">Lead - {previewLead.customerId}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 flex-shrink-0" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab(TABS.details)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === TABS.details ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <User className="h-4 w-4" />
            Lead Details
          </button>
          <button
            onClick={() => setActiveTab(TABS.quotations)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === TABS.quotations ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            Quotations & PIs
          </button>
          <button
            onClick={() => setActiveTab(TABS.cancelOrder)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === TABS.cancelOrder ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Ban className="h-4 w-4" />
            Cancel Order
            {pendingCancelCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-amber-500 text-white text-xs font-bold">
                {pendingCancelCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          {activeTab === TABS.details && (
          <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Details</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Customer Name</label>
                <p className="text-gray-900 font-semibold">{previewLead.customer}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Business</label>
                <p className="text-gray-900 font-semibold">{previewLead.business || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Address</label>
                <p className="text-gray-900 font-semibold">{previewLead.address || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">State</label>
                <p className="text-gray-900 font-semibold">{previewLead.state || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Sales Status</label>
                <p className="text-gray-900 font-semibold">{previewLead.salesStatus}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Follow Up Status</label>
                <p className="text-gray-900 font-semibold">{previewLead.followUpStatus || previewLead.telecallerStatus || 'N/A'}</p>
                {previewLead.followUpRemark && (
                  <p className="text-xs text-gray-600 italic mt-0.5">"{previewLead.followUpRemark}"</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Assigned Salesperson</label>
                <p className="text-gray-900 font-semibold">{isValueAssigned(previewLead.assignedSalesperson) ? previewLead.assignedSalesperson : 'Unassigned'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Assigned Telecaller</label>
                <p className="text-gray-900 font-semibold">{isValueAssigned(previewLead.assignedTelecaller) ? previewLead.assignedTelecaller : 'Unassigned'}</p>
              </div>
            </div>
          </div>
          </div>
          )}

          {activeTab === TABS.quotations && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              Quotations & Proforma Invoices
            </h3>
            {loadingQuotations ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading quotations...</span>
              </div>
            ) : quotations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No quotations found for this lead</p>
                <p className="text-xs text-gray-400 mt-1">Quotations will appear here once created</p>
              </div>
            ) : (
              quotations.map((quotation) => {
                const isCancelled = (quotation.status || '').toLowerCase() === 'cancelled';
                return (
                <div key={quotation.id} className={`rounded-lg p-4 border ${isCancelled ? 'bg-gray-100 border-gray-300 opacity-75' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    {getStatusLabel(quotation.status)} Quotation
                    {isCancelled && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-400 text-white">Closed</span>}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Quotation #{quotation.quotation_number}</p>
                        <p className="text-xs text-gray-600">
                          {quotation.customer_name} - {quotation.customer_business}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${getStatusColor(quotation.status)}`}>
                          {formatCurrency(quotation.total_amount)} - {getStatusLabel(quotation.status)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Valid Until: {formatDate(quotation.valid_until)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Prepared by: {quotation.created_by}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {!isCancelled && (
                          <>
                            <button 
                              onClick={() => onViewQuotation(quotation.id)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                            >
                              View Quotation
                            </button>
                            <button 
                              onClick={() => onDownloadPDF(quotation.id)}
                              className="px-3 py-1.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-xs"
                            >
                              Download PDF
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const quotationPIs = proformaInvoices
                      .filter(pi => pi.quotation_id === quotation.id)
                      .sort((a, b) => {
                        if (!a.parent_pi_id && b.parent_pi_id) return -1;
                        if (a.parent_pi_id && !b.parent_pi_id) return 1;
                        return new Date(a.created_at) - new Date(b.created_at);
                      });
                    if (quotationPIs.length === 0) return null;

                    return (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Proforma Invoices:</p>
                        <div className="space-y-2">
                          {quotationPIs.map((pi) => (
                            <div key={pi.id} className="bg-gray-50 border border-gray-200 rounded-md p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-purple-600" />
                                  <div>
                                    <p className="text-xs font-semibold text-gray-900">{pi.pi_number}</p>
                                    {pi.parent_pi_id && (
                                      <p className="text-xs text-indigo-600 font-medium">↳ Revised from {pi.parent_pi_number || 'Original PI'}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      {new Date(pi.created_at).toLocaleDateString()} • ₹{Number(pi.total_amount || 0).toLocaleString()}
                                    </p>
                                  </div>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    pi.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    pi.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    pi.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {pi.status === 'approved' ? '✅ Approved' :
                                     pi.status === 'rejected' ? '❌ Rejected' :
                                     pi.status === 'pending_approval' ? '⏳ Pending' :
                                     '📄 ' + (pi.status || 'Draft')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onViewPI(pi.id)}
                                    className="text-blue-600 text-xs hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                                  >
                                    View
                                  </button>
                                  {pi.status === 'pending_approval' && (
                                    <>
                                      <button
                                        onClick={() => onApprovePI(pi.id)}
                                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => onRejectPI(pi.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
              })
            )}
          </div>
          )}

          {activeTab === TABS.cancelOrder && (
          <div className="space-y-5">
          <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <Ban className="h-4 w-4 text-amber-600" />
                Cancel Order Requests (from Salesperson)
              </h3>
              <p className="text-xs text-gray-600 mb-3">Approve to close quotation &amp; PIs. Reject to keep order active.</p>
              {loadingOrderCancels ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : (pendingOrderCancels || []).length === 0 ? (
                <p className="text-sm text-gray-500">No pending order cancel requests for this lead.</p>
              ) : (
                <div className="space-y-2">
                  {(pendingOrderCancels || []).map((req) => (
                    <div key={req.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{req.quotation_number || `Quotation ${req.quotation_id}`}</p>
                          {req.total_amount != null && (
                            <p className="text-xs text-gray-600">Total: {formatCurrency(req.total_amount)}</p>
                          )}
                          {req.reason && (
                            <p className="text-xs text-gray-700 mt-1 bg-white/60 rounded p-1.5">{req.reason}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">By {req.requested_by} • {req.created_at ? new Date(req.created_at).toLocaleString('en-IN') : ''}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => onApproveOrderCancel?.(req.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-xs"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectCancelModalId(req.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50 text-xs"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          <div className="mt-5 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                PI Amendments (Revised PIs)
              </h3>
              {loadingRevisedPIs ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : (pendingRevisedPIs || []).length === 0 ? (
                <p className="text-sm text-gray-500">No pending revised PIs for this lead.</p>
              ) : (
                <div className="space-y-2">
                  {(pendingRevisedPIs || []).map((pi) => (
                    <div key={pi.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{pi.pi_number}</p>
                          {pi.parent_pi_number && (
                            <p className="text-xs text-gray-600">Amends {pi.parent_pi_number}</p>
                          )}
                          <p className="text-xs text-gray-700 mt-1">
                            Revised: {formatCurrency(pi.total_amount ?? 0)}
                            {pi.parent_total_amount != null && (
                              <span className="text-gray-500 ml-1">(was {formatCurrency(pi.parent_total_amount)})</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => onApproveRevisedPI?.(pi.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-xs"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectPIModalId(pi.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50 text-xs"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Reject Order Cancel modal */}
          {rejectCancelModalId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject cancel request</h3>
                <p className="text-sm text-gray-600 mb-3">Optional: Add a reason for rejection.</p>
                <textarea
                  value={rejectCancelReason}
                  onChange={(e) => setRejectCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                  rows={3}
                  placeholder="e.g. Order already in production"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setRejectCancelModalId(null); setRejectCancelReason(''); }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await onRejectOrderCancel?.(rejectCancelModalId, rejectCancelReason);
                      setRejectCancelModalId(null);
                      setRejectCancelReason('');
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Revised PI modal */}
          {rejectPIModalId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject revised PI</h3>
                <p className="text-sm text-gray-600 mb-3">Optional: Add a reason for rejection.</p>
                <textarea
                  value={rejectPIReason}
                  onChange={(e) => setRejectPIReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                  rows={3}
                  placeholder="e.g. Customer confirmed full order"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setRejectPIModalId(null); setRejectPIReason(''); }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await onRejectRevisedPI?.(rejectPIModalId, rejectPIReason);
                      setRejectPIModalId(null);
                      setRejectPIReason('');
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3 border-t border-gray-200 sticky bottom-0 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadPreviewDrawer;

