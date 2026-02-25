import React, { useState } from 'react';
import { X, DollarSign, Upload } from 'lucide-react';
import paymentService from '../../api/admin_api/paymentService';
import uploadService from '../../api/admin_api/uploadService';
import { toDateOnly } from '../../utils/dateOnly';
import Toast from '../../utils/Toast';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
];

/**
 * Slim modal to add a payment against an order (quotation) from Payment Tracking.
 * Includes amount, method, reference, and optional receipt image (Cloudinary).
 */
export default function AddPaymentForOrderModal({ payment, onClose, onSuccess }) {
  const quotationId = payment?.quotationIdRaw || payment?.quotationId;
  const customerId = payment?.leadId ?? payment?.paymentData?.lead_id ?? null;
  const dueAmount = Number(payment?.quotationRemainingDue ?? payment?.dueAmount ?? 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [form, setForm] = useState({
    installment_amount: '',
    payment_date: toDateOnly(new Date()),
    payment_method: 'cash',
    payment_reference: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const amount = Number(form.installment_amount);
    if (!quotationId || !customerId) {
      setError('Order or customer not found.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      let payment_receipt_url;
      if (receiptFile) {
        payment_receipt_url = await uploadService.uploadFile(receiptFile, 'payments');
      }
      const payload = {
        customer_id: customerId,
        quotation_id: quotationId,
        installment_amount: amount,
        payment_method: form.payment_method,
        payment_reference: (form.payment_reference || '').trim() || undefined,
        payment_status: 'completed',
        payment_date: form.payment_date,
        ...(payment_receipt_url && { payment_receipt_url }),
      };
      const response = await paymentService.createPayment(payload);
      if (response?.data?.success !== false && response?.success !== false) {
        Toast.success('Payment added successfully.');
        onSuccess?.();
        onClose();
      } else {
        setError(response?.data?.message || 'Failed to add payment.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to add payment.';
      setError(msg);
      Toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Add Payment
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600">
            Order: <span className="font-mono font-semibold">{payment?.quotationId || quotationId}</span>
            {dueAmount > 0 && (
              <span className="block mt-1 text-gray-500">Due: ₹{dueAmount.toLocaleString('en-IN')}</span>
            )}
          </p>
          {error && <div className="p-2 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.installment_amount}
              onChange={(e) => setForm((prev) => ({ ...prev, installment_amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
            <input
              type="date"
              required
              value={form.payment_date}
              onChange={(e) => setForm((prev) => ({ ...prev, payment_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm((prev) => ({ ...prev, payment_method: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference (optional)</label>
            <input
              type="text"
              value={form.payment_reference}
              onChange={(e) => setForm((prev) => ({ ...prev, payment_reference: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Cheque no, UPI ref, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment receipt / screenshot (optional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
            {receiptFile && <span className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><Upload className="w-3 h-3" /> {receiptFile.name}</span>}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
