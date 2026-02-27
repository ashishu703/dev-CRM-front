import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import quotationService from '../../api/admin_api/quotationService';
import paymentService from '../../api/admin_api/paymentService';
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService';
import uploadService from '../../api/admin_api/uploadService';
import { toDateOnly } from '../../utils/dateOnly';

const normalizeQuotationStatus = (status) => (status || '').toLowerCase().trim();
const normalizePiStatus = (pi) => String(pi?.status || '').toLowerCase().trim();
const selectActiveApprovedPi = (pis) => {
  const approved = (pis || []).filter((pi) => normalizePiStatus(pi) === 'approved');
  if (approved.length === 0) return null;
  const sorted = approved.slice().sort((a, b) => {
    const aIsRevised = a?.parent_pi_id ? 1 : 0;
    const bIsRevised = b?.parent_pi_id ? 1 : 0;
    if (aIsRevised !== bIsRevised) return bIsRevised - aIsRevised;
    return new Date(b?.created_at || b?.createdAt || 0) - new Date(a?.created_at || a?.createdAt || 0);
  });
  return sorted[0] || null;
};

export default function PaymentModal({
  party,
  contextDefault = 'advance',
  againstQuotationId = null,
  againstPiId = null,
  onClose,
  onPaymentAdded
}) {
  const [paymentContext, setPaymentContext] = useState(contextDefault);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);

  const [paymentData, setPaymentData] = useState({
    installment_amount: '',
    payment_method: 'cash',
    payment_reference: '',
    payment_status: 'completed',
    payment_receipt_url: '',
    payment_date: toDateOnly(new Date()),
    delivery_note: '',
    payment_remark: '',
    purchase_order_id: '',
    delivery_date: '',
    delivery_status: 'pending'
  });

  const [customerQuotations, setCustomerQuotations] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState(againstQuotationId || '');
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [selectedPIId, setSelectedPIId] = useState(againstPiId || '');
  const [summary, setSummary] = useState({ total: 0, paid: 0, remaining: 0 });
  const [credit, setCredit] = useState(0);
  const [adjustCredit, setAdjustCredit] = useState('no');
  const [creditApplyMode, setCreditApplyMode] = useState('full');
  const [customCreditAmount, setCustomCreditAmount] = useState('');

  const partyId = party?.id || party?.leadData?.id || party?.leadId || null;

  const confirmedOrders = useMemo(() => {
    const approved = (customerQuotations || []).filter((q) => {
      const st = normalizeQuotationStatus(q.status);
      return st === 'approved' || st === 'completed';
    });
    return approved;
  }, [customerQuotations]);

  useEffect(() => {
    const fetchCredit = async () => {
      if (!partyId) return;
      try {
        const res = await paymentService.getCustomerCredit(partyId);
        const balance = res?.data?.data?.balance ?? res?.data?.balance ?? res?.balance;
        setCredit(Number(balance ?? 0));
      } catch (_) {
        setCredit(0);
      }
    };
    fetchCredit();
  }, [partyId]);

  useEffect(() => {
    const loadQuotations = async () => {
      if (!partyId) return;
      if (paymentContext !== 'order') return;
      try {
        const res = await quotationService.getQuotationsByCustomer(partyId);
        const all = Array.isArray(res?.data) ? res.data : [];
        const approvedOrders = all.filter((q) => {
          const st = normalizeQuotationStatus(q.status);
          return st === 'approved' || st === 'completed';
        });

        const quotationIds = approvedOrders.map((q) => q.id).filter(Boolean);
        if (quotationIds.length === 0) {
          setCustomerQuotations([]);
          return;
        }

        // Filter to PI-approved confirmed orders only
        const bulkPIsRes = await proformaInvoiceService
          .getBulkPIsByQuotations(quotationIds)
          .catch(() => ({ data: [] }));
        const allPIs = Array.isArray(bulkPIsRes?.data) ? bulkPIsRes.data : (bulkPIsRes?.data?.data || []);
        const pisByQuotationId = new Map();
        (allPIs || []).forEach((pi) => {
          if (!pi?.quotation_id) return;
          if (!pisByQuotationId.has(pi.quotation_id)) pisByQuotationId.set(pi.quotation_id, []);
          pisByQuotationId.get(pi.quotation_id).push(pi);
        });

        const confirmed = approvedOrders.filter((q) => {
          const pis = pisByQuotationId.get(q.id) || [];
          return !!selectActiveApprovedPi(pis);
        });

        setCustomerQuotations(confirmed);
      } catch (_) {
        setCustomerQuotations([]);
      }
    };
    loadQuotations();
  }, [partyId, paymentContext]);

  useEffect(() => {
    const loadPIAndSummary = async () => {
      if (!selectedQuotationId) {
        setProformaInvoices([]);
        setSelectedPIId('');
        setSummary({ total: 0, paid: 0, remaining: 0 });
        return;
      }
      try {
        const [piRes, sumRes] = await Promise.all([
          proformaInvoiceService.getActivePI(selectedQuotationId),
          quotationService.getSummary(selectedQuotationId)
        ]);
        const activePi = piRes?.data || null; // backend: { success, data }
        if (!activePi || normalizePiStatus(activePi) !== 'approved') {
          setProformaInvoices([]);
          setSelectedPIId('');
          setError('This order is not PI-confirmed (approved). Please choose another confirmed order or add Advance / On-account.');
        } else {
          setError(null);
          setProformaInvoices([activePi]);
          setSelectedPIId(activePi?.id || '');
        }
        const s = sumRes?.data || sumRes || {};
        setSummary({
          total: Number(s.total_amount ?? s.total ?? 0),
          paid: Number(s.total_paid ?? s.paid ?? 0),
          remaining: Number(s.current_remaining ?? s.remaining ?? 0)
        });
      } catch (_) {
        setProformaInvoices([]);
        setSelectedPIId('');
        setSummary({ total: 0, paid: 0, remaining: 0 });
      }
    };
    if (paymentContext === 'order') {
      loadPIAndSummary();
    }
  }, [selectedQuotationId, paymentContext, againstPiId]);

  const canSubmit = useMemo(() => {
    if (!partyId) return false;
    const amt = Number(paymentData.installment_amount);
    if (!amt || Number.isNaN(amt) || amt <= 0) return false;
    if (paymentContext === 'order') {
      if (!selectedQuotationId) return false;
      if (!selectedPIId) return false;
    }
    return true;
  }, [partyId, paymentData.installment_amount, paymentContext, selectedQuotationId, selectedPIId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      let receiptUrl = paymentData.payment_receipt_url;
      if (receiptFile && !receiptUrl) {
        receiptUrl = await uploadService.uploadFile(receiptFile, 'payments');
      }

      const installmentAmount = Number(paymentData.installment_amount);
      const paymentDate = paymentData.payment_date || toDateOnly(new Date());

      const payload = {
        lead_id: party?.leadData?.id || partyId,
        customer_id: partyId,
        installment_amount: installmentAmount,
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
        payment_status: paymentData.payment_status,
        payment_receipt_url: receiptUrl || undefined,
        payment_date: paymentDate,
        notes: paymentData.delivery_note,
        remarks: paymentData.payment_remark,
        purchase_order_id: paymentData.purchase_order_id,
        delivery_date: paymentData.delivery_date || null,
        delivery_status: paymentData.delivery_status
      };

      if (paymentContext === 'order') {
        payload.quotation_id = selectedQuotationId;
        payload.pi_id = selectedPIId;
        const remainingDue = Number(summary.remaining ?? 0);
        if (credit > 0 && adjustCredit === 'yes') {
          const raw = creditApplyMode === 'full' ? credit : Math.min(Number(customCreditAmount) || 0, credit);
          const toApply = Math.min(raw, remainingDue);
          if (toApply > 0) {
            payload.adjust_credit = true;
            payload.credit_adjust_amount = toApply;
          }
        }
      }

      const response = await paymentService.createPayment(payload);
      if (response?.success) {
        onClose();
        onPaymentAdded?.({
          leadId: partyId,
          quotationId: paymentContext === 'order' ? selectedQuotationId : null
        });
      } else {
        setError('Failed to add payment');
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  if (!party) return null;

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">
              {party.customerName && party.customerName !== 'N/A' ? party.customerName : (party.leadData?.name || party.name || 'N/A')}
            </h4>
            <div className="mt-2 text-xs text-gray-700 font-medium">Available credit: ₹{Number(credit || 0).toLocaleString('en-IN')}</div>

            {paymentContext === 'order' && credit > 0 && (
              <div className="mt-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-2">
                <p className="text-sm font-medium text-gray-900">Adjust party credit against this payment?</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="adjustCreditModal" checked={adjustCredit === 'no'} onChange={() => setAdjustCredit('no')} className="rounded-full" />
                    No
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="adjustCreditModal" checked={adjustCredit === 'yes'} onChange={() => setAdjustCredit('yes')} className="rounded-full" />
                    Yes
                  </label>
                </div>
                {adjustCredit === 'yes' && (
                  <div className="pl-2 space-y-2 border-l-2 border-emerald-300">
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="creditModeModal" checked={creditApplyMode === 'full'} onChange={() => setCreditApplyMode('full')} className="rounded-full" />
                        Full (₹{Number(credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="creditModeModal" checked={creditApplyMode === 'custom'} onChange={() => setCreditApplyMode('custom')} className="rounded-full" />
                        Custom
                      </label>
                    </div>
                    {creditApplyMode === 'custom' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">₹</span>
                        <input
                          type="number"
                          min="0"
                          max={credit}
                          step="0.01"
                          value={customCreditAmount}
                          onChange={(e) => setCustomCreditAmount(e.target.value)}
                          className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm"
                          placeholder="Amount"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Context</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="paymentContext"
                    value="advance"
                    checked={paymentContext === 'advance'}
                    onChange={() => {
                      setPaymentContext('advance');
                      setSelectedQuotationId('');
                      setSelectedPIId('');
                    }}
                  />
                  Advance / On-account
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="paymentContext"
                    value="order"
                    checked={paymentContext === 'order'}
                    onChange={() => setPaymentContext('order')}
                  />
                  Against Confirmed Order
                </label>
              </div>
            </div>

            {paymentContext === 'order' && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmed Order (Quotation)</label>
                  <select
                    value={selectedQuotationId}
                    onChange={(e) => setSelectedQuotationId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Confirmed Order --</option>
                    {confirmedOrders.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quotation_number || q.id} - ₹{Number(q.total_amount || 0).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                  {selectedQuotationId && (
                    <div className="text-xs text-gray-600 mt-2 grid grid-cols-3 gap-2">
                      <div>Total: ₹{Number(summary.total ?? 0).toLocaleString('en-IN')}</div>
                      <div>Paid: ₹{Number(summary.paid ?? 0).toLocaleString('en-IN')}</div>
                      <div>Due: ₹{Number(summary.remaining ?? 0).toLocaleString('en-IN')}</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PI</label>
                  <select
                    value={selectedPIId}
                    onChange={(e) => setSelectedPIId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select PI --</option>
                    {proformaInvoices.map((pi) => (
                      <option key={pi.id} value={pi.id}>
                        {pi.pi_number || pi.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                required
                value={paymentData.installment_amount}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, installment_amount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select
                required
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, payment_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
              <input
                type="text"
                value={paymentData.payment_reference}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, payment_reference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="UPI txn / cheque no / bank ref"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (optional)</label>
              <input
                type="file"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
