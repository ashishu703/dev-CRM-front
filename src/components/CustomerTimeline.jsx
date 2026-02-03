import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { X, CheckCircle, FileText, Receipt, CreditCard, UserPlus, Calendar, Clock, MessageSquare, Ban, AlertTriangle } from 'lucide-react';
import customerTimelineService from '../services/CustomerTimelineService';
import DateFormatter from '../utils/DateFormatter';

const CustomerTimeline = ({
  lead,
  onClose,
  onReassign,
  onQuotationView,
  onPIView,
  onApprovePI,
  onRejectPI,
  onCancelOrder,
  onApproveCancelRequest,
  onRejectCancelRequest
}) => {
  if (!lead) return null;

  const [history, setHistory] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [pisByQuotationId, setPisByQuotationId] = useState({});
  const [payments, setPayments] = useState([]);
  const [transferInfo, setTransferInfo] = useState(null);
  const [cancelRequests, setCancelRequests] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [processingCancel, setProcessingCancel] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!lead?.id) return;
        const data = await customerTimelineService.getTimelineData(lead.id);
        if (cancelled) return;

        setHistory(data.history || []);
        setQuotations(data.quotations || []);
        setPisByQuotationId(data.pisByQuotationId || {});
        setPayments(data.payments || []);
        setTransferInfo(data.transferInfo || null);
        setCancelRequests(data.cancelRequests || []);
      } catch (e) {
        console.warn('Failed to load customer timeline', e);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [lead?.id, refreshKey]);

  const groupedHistory = useMemo(() => {
    const items = [...history].sort(
      (a, b) =>
        new Date(a.created_at || a.follow_up_date || 0) -
        new Date(b.created_at || b.follow_up_date || 0)
    );
    const groups = {};
    items.forEach((h) => {
      const dateInput = h.follow_up_date || h.created_at || Date.now();
      const key = DateFormatter.formatDate(dateInput);
      if (!groups[key]) groups[key] = [];
      groups[key].push(h);
    });
    return groups;
  }, [history]);

  const allQuotations = Array.isArray(quotations)
    ? [...quotations].sort(
        (a, b) =>
          new Date(a.quotation_date || a.created_at || 0) -
          new Date(b.quotation_date || b.created_at || 0)
      )
    : [];

  const createdDateLabel = DateFormatter.formatDate(lead.created_at || lead.createdAt);

  // Check if quotation has pending cancel request
  const hasPendingCancelRequest = useCallback((quotationId) => {
    return cancelRequests.some(
      (req) => req.quotation_id === quotationId && req.status?.toLowerCase() === 'pending'
    );
  }, [cancelRequests]);

  // Get cancel request for quotation
  const getCancelRequest = useCallback((quotationId) => {
    return cancelRequests.find((req) => req.quotation_id === quotationId);
  }, [cancelRequests]);

  // Check if quotation has any approved PI (eligible for cancel order)
  const hasApprovedPI = useCallback((quotationId) => {
    const pis = pisByQuotationId[quotationId] || [];
    return pis.some((pi) => pi.status?.toLowerCase() === 'approved');
  }, [pisByQuotationId]);

  // Handle cancel order action
  const handleCancelOrder = useCallback(async (quotation) => {
    if (onCancelOrder) {
      await onCancelOrder(quotation);
      setRefreshKey((k) => k + 1);
    }
  }, [onCancelOrder]);

  // Handle approve cancel request
  const handleApproveCancelRequest = useCallback(async (request) => {
    if (!onApproveCancelRequest) return;
    setProcessingCancel(request.id);
    try {
      await onApproveCancelRequest(request);
      setRefreshKey((k) => k + 1);
    } finally {
      setProcessingCancel(null);
    }
  }, [onApproveCancelRequest]);

  // Handle reject cancel request
  const handleRejectCancelRequest = useCallback(async (request) => {
    if (!onRejectCancelRequest) return;
    setProcessingCancel(request.id);
    try {
      await onRejectCancelRequest(request);
      setRefreshKey((k) => k + 1);
    } finally {
      setProcessingCancel(null);
    }
  }, [onRejectCancelRequest]);

  // Pending cancel requests count
  const pendingCancelCount = cancelRequests.filter((r) => r.status?.toLowerCase() === 'pending').length;

  return (
    <div
      className="fixed top-16 right-0 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)] z-[90]"
      style={{ width: '100%', maxWidth: 380, minWidth: 300 }}
    >
      <div className="bg-white h-full flex flex-col shadow-2xl border-l border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 pt-8 sm:pt-10 pb-4 px-4 sticky top-0 z-10 shadow-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 leading-none">
              <Clock className="h-4 w-4" />
              Customer Timeline
            </h3>
            <div className="flex items-center gap-2">
              {onReassign && (
                <button
                  type="button"
                  onClick={() => onReassign(lead)}
                  className="text-white hover:text-purple-200 p-1.5 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                  title="Reassign Lead"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-white hover:text-gray-200 p-1.5 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Close timeline"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            maxHeight: 'calc(100vh - 58px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: 12,
            paddingTop:10
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg p-3 mb-3 border border-purple-200 shadow-sm">
            <h4 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5 text-purple-600" />
              Customer Details
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-purple-700 min-w-[90px]">Customer Name:</span>
                <span className="text-gray-800 font-medium">{lead.customer || lead.name || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-700 min-w-[90px]">Business Name:</span>
                <span className="text-gray-800 font-medium">{lead.business || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-pink-700 min-w-[90px]">Contact No:</span>
                <span className="text-gray-800 font-medium">{lead.phone || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-indigo-700 min-w-[90px]">Email Address:</span>
                <span className="text-gray-800 font-medium">{lead.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Timeline: created + follow‑ups */}
          <div style={{ marginTop: 4 }}>
            <h4
              className="text-xs font-bold text-gray-900"
              style={{ marginBottom: 2 }}
            >
              Timeline
            </h4>

            <div className="flex justify-center mb-2">
              <span className="text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full shadow-md">
                {createdDateLabel}
              </span>
            </div>

            <div className="mb-3">
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 p-3 shadow-md">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-green-500 rounded-full">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-900">
                    Customer Created
                  </span>
                  <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                    COMPLETED
                  </span>
                </div>
                <div className="text-[10px] font-medium text-gray-700 ml-7">
                  Lead ID: <span className="text-blue-600 font-bold">LD-{lead.id}</span>
                </div>
              </div>
            </div>

            {transferInfo && transferInfo.transferredAt && (
              <>
                <div className="flex justify-center mb-2">
                  <span className="text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-md">
                    {DateFormatter.formatDate(transferInfo.transferredAt)}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 p-3 shadow-md">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-purple-500 rounded-full">
                        <UserPlus className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-900">
                        Lead Transferred
                      </span>
                      <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                        TRANSFERRED
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-700 space-y-0.5 ml-7">
                      {transferInfo.transferredFrom && (
                        <div>
                          <span className="font-semibold text-purple-700">From:</span> <span className="text-gray-800">{transferInfo.transferredFrom}</span>
                        </div>
                      )}
                      {transferInfo.transferredTo && (
                        <div>
                          <span className="font-semibold text-pink-700">To:</span> <span className="text-gray-800">{transferInfo.transferredTo}</span>
                        </div>
                      )}
                      {transferInfo.transferReason && (
                        <div className="mt-1 italic text-gray-600">
                          "{transferInfo.transferReason}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {Object.keys(groupedHistory)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((dateKey) => (
                <div key={dateKey} className="mb-3">
                  <div className="flex justify-center mb-2">
                    <span className="text-[10px] font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full shadow-md">
                      {dateKey}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupedHistory[dateKey].map((h, idx) => {
                      const statusColor = String(h.sales_status || '').toLowerCase();
                      const statusBg = statusColor === 'running' 
                        ? 'from-yellow-400 to-orange-400' 
                        : statusColor === 'pending'
                        ? 'from-yellow-500 to-amber-500'
                        : statusColor === 'win' || statusColor === 'converted'
                        ? 'from-green-500 to-emerald-500'
                        : 'from-blue-500 to-cyan-500';
                      
                      const cardBg = statusColor === 'win' || statusColor === 'converted'
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                        : statusColor === 'running'
                        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-300';
                      
                      return (
                        <div key={`${h.id || idx}`}>
                          <div className={`rounded-lg border-2 p-3 shadow-sm ${cardBg}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                                <MessageSquare className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-[11px] font-bold text-gray-900">
                                Follow Up
                              </span>
                              {h.sales_status && (
                                <span className={`ml-auto px-2 py-0.5 text-[9px] font-semibold rounded-full bg-gradient-to-r ${statusBg} text-white shadow-sm`}>
                                  {String(h.sales_status).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-800 ml-7 space-y-1">
                              <div>
                                <span className="font-semibold text-blue-700">Status:</span>{' '}
                                <span className="text-gray-800">{h.follow_up_status || '—'}</span>
                              </div>
                              {h.follow_up_remark && (
                                <div>
                                  <span className="font-semibold text-purple-700">Remark:</span>{' '}
                                  <span className="text-gray-700 italic">{h.follow_up_remark}</span>
                                </div>
                              )}
                              {(h.follow_up_date || h.follow_up_time || h.created_at) && (
                                <div className="flex items-center gap-1 text-[9px] text-gray-600 mt-1">
                                  <Clock className="h-2.5 w-2.5 text-pink-600" />
                                  {customerTimelineService.formatIndianDateTime(
                                    h.follow_up_date,
                                    h.follow_up_time,
                                    h.created_at
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {allQuotations.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-center mb-2">
                  <span className="text-[10px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-md">
                    Quotations &amp; PIs
                  </span>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 p-3 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                      <FileText className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900">
                      Quotation History
                    </span>
                    <span className="text-[9px] text-gray-500 ml-auto">
                      {allQuotations.length} quotation{allQuotations.length > 1 ? 's' : ''}
                    </span>
                  </div>
                    <div className="space-y-3 text-[10px] text-gray-800">
                        {allQuotations.map((q) => {
                        const pis = pisByQuotationId[q.id] || [];
                        // Sort PIs: original first, then revised
                        const sortedPIs = [...pis].sort((a, b) => {
                          if (!a.parent_pi_id && b.parent_pi_id) return -1;
                          if (a.parent_pi_id && !b.parent_pi_id) return 1;
                          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
                        });
                        const status = String(q.status || 'PENDING').toLowerCase();
                        const statusClass =
                          status === 'approved'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : status === 'rejected'
                            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                            : status === 'cancelled'
                            ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
                            : q.status
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';

                        return (
                          <div
                            key={q.id}
                            className="border-2 border-yellow-200 rounded-lg overflow-hidden bg-white shadow-sm"
                          >
                            {/* Quotation Header */}
                            <div className="px-3 py-2.5 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[11px] text-blue-700">
                                  {q.quotation_number || `QT-${String(q.id).slice(-4)}`}
                                </span>
                                <span className="flex items-center gap-0.5 text-[9px] text-gray-600">
                                  <Calendar className="h-2.5 w-2.5 text-pink-600" />
                                  {q.quotation_date ? DateFormatter.formatDate(q.quotation_date) : ''}
                                </span>
                                <span
                                  className={`ml-auto px-2 py-0.5 text-[9px] font-semibold rounded-full shadow-sm ${statusClass}`}
                                >
                                  {(q.status || 'PENDING').toUpperCase()}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {onQuotationView && (
                                  <button
                                    type="button"
                                    onClick={() => onQuotationView(q)}
                                    className="px-2.5 py-1 text-[9px] rounded-md font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-sm transition-all"
                                  >
                                    View
                                  </button>
                                )}
                                {/* Cancel Order Button - Only show if has approved PI and no pending cancel request */}
                                {onCancelOrder && hasApprovedPI(q.id) && !hasPendingCancelRequest(q.id) && status === 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelOrder(q)}
                                    className="px-2.5 py-1 text-[9px] rounded-md font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-sm transition-all flex items-center gap-1"
                                  >
                                    <Ban className="h-3 w-3" />
                                    Cancel Order
                                  </button>
                                )}
                                {/* Show pending cancel badge */}
                                {hasPendingCancelRequest(q.id) && (
                                  <span className="px-2 py-1 text-[9px] rounded-md font-semibold bg-gradient-to-r from-orange-400 to-amber-400 text-white flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Cancel Pending
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* PI Section */}
                            {sortedPIs.length > 0 && (
                              <div className="px-3 py-2 space-y-2">
                                <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                  Proforma Invoices ({sortedPIs.length})
                                </div>
                                {sortedPIs.map((pi, piIndex) => {
                                  const piStatus = String(pi.status || 'PENDING').toLowerCase();
                                  const piClass =
                                    piStatus === 'approved'
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                      : piStatus === 'pending_approval'
                                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                                      : piStatus === 'superseded'
                                      ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
                                      : pi.status
                                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
                                  
                                  const isRevised = !!pi.parent_pi_id;
                                  const isPending = piStatus === 'pending' || piStatus === 'pending_approval' || piStatus === 'sent_for_approval';
                                  
                                  return (
                                    <div
                                      key={pi.id}
                                      className={`rounded-lg p-2.5 border-2 shadow-sm ${
                                        isRevised 
                                          ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 ml-3' 
                                          : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300'
                                      }`}
                                    >
                                      {/* PI Header Row */}
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <div className={`p-1 rounded ${isRevised ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}>
                                          <Receipt className="h-3 w-3 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`font-bold text-[11px] ${isRevised ? 'text-indigo-700' : 'text-orange-700'}`}>
                                              {pi.pi_number || `PI-${String(pi.id).slice(-4)}`}
                                            </span>
                                            {isRevised && (
                                              <span className="text-[8px] text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full font-medium">
                                                Rev. of {pi.parent_pi_number || 'Original'}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-semibold shadow-sm whitespace-nowrap ${piClass}`}>
                                          {(pi.status || 'PENDING').toUpperCase().replace('_', ' ')}
                                        </span>
                                      </div>
                                      
                                      {/* PI Actions Row */}
                                      <div className="flex items-center gap-1.5 ml-7">
                                        {onPIView && (
                                          <button
                                            type="button"
                                            onClick={() => onPIView(pi)}
                                            className="px-2 py-1 text-[9px] rounded-md font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-sm transition-all"
                                          >
                                            View
                                          </button>
                                        )}
                                        {onApprovePI && isPending && (
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              await onApprovePI(pi);
                                              setRefreshKey((k) => k + 1);
                                            }}
                                            className="px-2 py-1 text-[9px] rounded-md font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-sm transition-all"
                                          >
                                            Approve
                                          </button>
                                        )}
                                        {onRejectPI && isPending && (
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              await onRejectPI(pi);
                                              setRefreshKey((k) => k + 1);
                                            }}
                                            className="px-2 py-1 text-[9px] rounded-md font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-sm transition-all"
                                          >
                                            Reject
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                </div>
              </div>
            )}

            {/* Order Cancel Requests Section */}
            {cancelRequests.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-center mb-2">
                  <span className="text-[10px] font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Ban className="h-3 w-3" />
                    Cancel Requests
                    {pendingCancelCount > 0 && (
                      <span className="bg-white text-red-600 px-1.5 py-0.5 rounded-full text-[8px] font-bold ml-1">
                        {pendingCancelCount}
                      </span>
                    )}
                  </span>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 p-3 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full">
                      <Ban className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900">
                      Order Cancellations
                    </span>
                    <span className="text-[9px] text-gray-500 ml-auto">
                      {cancelRequests.length} request{cancelRequests.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cancelRequests.map((request) => {
                      const reqStatus = (request.status || 'pending').toLowerCase();
                      const isPending = reqStatus === 'pending';
                      const isApproved = reqStatus === 'approved';
                      const isRejected = reqStatus === 'rejected';
                      
                      const statusClass = isApproved
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : isRejected
                        ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
                      
                      const quotation = allQuotations.find((q) => q.id === request.quotation_id);
                      
                      return (
                        <div
                          key={request.id}
                          className={`rounded-lg p-2.5 border-2 shadow-sm ${
                            isPending 
                              ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300' 
                              : isApproved
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                              : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`p-1 rounded ${isPending ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : isApproved ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-500 to-slate-500'}`}>
                              <Ban className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-[11px] text-gray-800">
                                {quotation?.quotation_number || `QT-${String(request.quotation_id).slice(-4)}`}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-semibold shadow-sm whitespace-nowrap ${statusClass}`}>
                              {reqStatus.toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Cancel Request Details */}
                          <div className="text-[10px] text-gray-700 ml-7 space-y-1">
                            {request.reason && (
                              <div>
                                <span className="font-semibold text-red-700">Reason:</span>{' '}
                                <span className="text-gray-700 italic">{request.reason}</span>
                              </div>
                            )}
                            {request.created_at && (
                              <div className="flex items-center gap-1 text-[9px] text-gray-600">
                                <Calendar className="h-2.5 w-2.5 text-pink-600" />
                                {DateFormatter.formatDate(request.created_at)}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions for Pending Requests */}
                          {isPending && (onApproveCancelRequest || onRejectCancelRequest) && (
                            <div className="flex items-center gap-1.5 ml-7 mt-2">
                              {onApproveCancelRequest && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveCancelRequest(request)}
                                  disabled={processingCancel === request.id}
                                  className="px-2 py-1 text-[9px] rounded-md font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-sm transition-all disabled:opacity-50"
                                >
                                  {processingCancel === request.id ? 'Processing...' : 'Approve'}
                                </button>
                              )}
                              {onRejectCancelRequest && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectCancelRequest(request)}
                                  disabled={processingCancel === request.id}
                                  className="px-2 py-1 text-[9px] rounded-md font-semibold bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600 shadow-sm transition-all disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {payments.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-center mb-2">
                  <span className="text-[10px] font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full shadow-md">
                    Payment History
                  </span>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 p-3 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                      <CreditCard className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900">
                      Payments
                    </span>
                    <span className="text-[9px] text-gray-500 ml-auto">
                      {payments.length} payment{payments.length > 1 ? 's' : ''}
                    </span>
                  </div>
                    <div className="space-y-1.5 text-[10px] text-gray-800">
                      {payments
                        .sort((a, b) => 
                          new Date(b.payment_date || b.created_at || 0) - 
                          new Date(a.payment_date || a.created_at || 0)
                        )
                        .map((payment) => {
                          const approvalStatus = (payment.approval_status || 'pending').toLowerCase();
                          const isApproved = approvalStatus === 'approved';
                          const isRejected = approvalStatus === 'rejected';
                          
                          const piTotal = payment.total_quotation_amount || 0;
                          const paidAmount = Number(payment.installment_amount || 0);
                          const remainingAfter = Number(payment.remaining_amount || 0);
                          let paymentType = 'Partial';
                          if (remainingAfter === 0 && paidAmount > 0) {
                            paymentType = 'Full';
                          } else if (payment.installment_number === 1 && paidAmount > 0) {
                            paymentType = 'Advance';
                          }

                          const statusClass = isApproved
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : isRejected
                            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                            : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';

                          let quotationId = payment.quotation_id || payment.quotationId;
                          if (!quotationId && payment.quotation_number) {
                            const foundQuotation = allQuotations.find(q => 
                              q.quotation_number === payment.quotation_number || 
                              q.id === payment.quotation_number ||
                              String(q.id).includes(String(payment.quotation_number))
                            );
                            quotationId = foundQuotation?.id;
                          }
                          
                          let piId = payment.pi_id || payment.piId;
                          if (!piId && quotationId) {
                            const pis = pisByQuotationId[quotationId] || [];
                            if (pis.length > 0) {
                              if (payment.pi_number) {
                                const foundPI = pis.find(p => 
                                  p.pi_number === payment.pi_number || 
                                  p.id === payment.pi_number ||
                                  String(p.id).includes(String(payment.pi_number))
                                );
                                piId = foundPI?.id || pis[0]?.id;
                              } else {
                                piId = pis[0]?.id;
                              }
                            }
                          }
                          
                          return (
                            <div
                                key={payment.id || payment.payment_reference}
                                className="border-2 border-blue-200 rounded-lg px-3 py-2 bg-white shadow-sm mb-1.5"
                              >
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="font-bold text-blue-700">
                                  {payment.quotation_number || 'QT-N/A'}
                                </span>
                                {payment.pi_number && (
                                  <span className="text-[9px] text-gray-600 font-medium">
                                    • {payment.pi_number}
                                  </span>
                                )}
                                <span className="flex items-center gap-0.5 text-[9px] text-gray-600">
                                  <Calendar className="h-2.5 w-2.5 text-pink-600" />
                                  {payment.payment_date ? DateFormatter.formatDate(payment.payment_date) : ''}
                                </span>
                                <span className={`ml-auto px-2 py-0.5 text-[9px] font-semibold rounded-full shadow-sm ${statusClass}`}>
                                  {approvalStatus.toUpperCase()}
                                </span>
                              </div>
                              <div className="mt-1 text-[9px] text-gray-700 space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-700">
                                    ₹{Number(paidAmount).toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className={`font-semibold ${
                                    paymentType === 'Full' 
                                      ? 'text-green-700' 
                                      : paymentType === 'Advance' 
                                      ? 'text-blue-700' 
                                      : 'text-orange-700'
                                  }`}>
                                    {paymentType}
                                  </span>
                                  {payment.payment_method && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-gray-600 font-medium">
                                        {payment.payment_method}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {payment.installment_number && (
                                  <div className="text-[8px] text-gray-600 font-medium">
                                    Installment #{payment.installment_number}
                                  </div>
                                )}
                                {(quotationId || payment.quotation_number || piId || (quotationId && pisByQuotationId[quotationId]?.length > 0)) && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {(quotationId || payment.quotation_number) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (onQuotationView) {
                                            const quotation = quotationId ? allQuotations.find(q => q.id === quotationId) : null;
                                            if (quotation) {
                                              onQuotationView(quotation);
                                            } else if (quotationId) {
                                              onQuotationView(quotationId);
                                            } else if (payment.quotation_number) {
                                              const foundQuotation = allQuotations.find(q => 
                                                q.quotation_number === payment.quotation_number
                                              );
                                              if (foundQuotation) {
                                                onQuotationView(foundQuotation);
                                              }
                                            }
                                          }
                                        }}
                                        disabled={!onQuotationView}
                                        className="px-1.5 py-0.5 text-[8px] rounded-md font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        View QT
                                      </button>
                                    )}
                                    {(piId || (quotationId && pisByQuotationId[quotationId]?.length > 0)) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (onPIView) {
                                            const pis = quotationId ? (pisByQuotationId[quotationId] || []) : [];
                                            let pi = null;
                                            
                                            if (piId) {
                                              pi = pis.find(p => p.id === piId);
                                            }
                                            
                                            if (!pi && payment.pi_number) {
                                              pi = pis.find(p => p.pi_number === payment.pi_number);
                                            }
                                            
                                            if (!pi && pis.length > 0) {
                                              pi = pis[0];
                                            }
                                            
                                            if (pi) {
                                              onPIView(pi);
                                            } else if (piId) {
                                              onPIView(piId);
                                            }
                                          }
                                        }}
                                        disabled={!onPIView}
                                        className="px-1.5 py-0.5 text-[8px] rounded-md font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        View PI
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTimeline;


