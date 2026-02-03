import React, { useState, useEffect } from 'react';
import { X, FileEdit, AlertCircle } from 'lucide-react';
import quotationService from '../../api/admin_api/quotationService';
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService';
import Toast from '../../utils/Toast';

export default function AmendPIModal({ item, onClose, onRevisedCreated }) {
  const quotationId = item?.quotationData?.id ?? item?.quotationData?.quotationId ?? item?.quotationData?.quotation_id ?? null;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [activePI, setActivePI] = useState(null);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [reducedQty, setReducedQty] = useState({}); // quotation_item_id -> quantity

  useEffect(() => {
    if (!quotationId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      quotationService.getCompleteData(quotationId),
      proformaInvoiceService.getActivePI(quotationId)
    ])
      .then(([completeRes, activeRes]) => {
        if (cancelled) return;
        const data = completeRes?.data ?? completeRes;
        const q = data?.quotation ?? data;
        setQuotation(q);
        const pi = activeRes?.data?.data ?? activeRes?.data ?? activeRes;
        setActivePI(pi);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          Toast.error(err?.data?.message || err?.message || 'Failed to load data');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [quotationId]);

  const items = quotation?.items ?? quotation?.quotation_items ?? [];
  const removedIdsArr = Array.from(removedIds);
  const reducedItemsArr = Object.entries(reducedQty)
    .filter(([id, qty]) => qty != null && qty !== '' && !removedIds.has(id))
    .map(([quotationItemId, quantity]) => ({ quotationItemId, quantity: Number(quantity) }));

  const toggleRemoved = (id) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setQuantity = (id, value) => {
    const v = value === '' ? '' : Number(value);
    if (v === '' || v <= 0) {
      setReducedQty((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    } else {
      setReducedQty((prev) => ({ ...prev, [id]: v }));
    }
  };

  const getEffectiveQuantity = (item) => {
    const id = item.id ?? item.quotation_item_id;
    if (removedIds.has(String(id))) return 0;
    if (reducedQty[id] != null && reducedQty[id] !== '') return Number(reducedQty[id]);
    return Number(item.quantity) || 1;
  };

  const getEffectiveItemTotal = (item) => {
    const qty = getEffectiveQuantity(item);
    const unitPrice = Number(item.unit_price) ?? 0;
    const total = item.total_amount != null ? Number(item.total_amount) : unitPrice * qty;
    const origQty = Number(item.quantity) || 1;
    if (origQty === 0) return 0;
    return (total / origQty) * qty;
  };

  let newSubtotal = 0;
  let newTaxAmount = 0;
  items.forEach((it) => {
    const t = getEffectiveItemTotal(it);
    const gstRate = Number(it.gst_rate) ?? 18;
    newSubtotal += t / (1 + gstRate / 100);
    newTaxAmount += t - t / (1 + gstRate / 100);
  });
  const newTotal = newSubtotal + newTaxAmount;
  const hasChanges = removedIdsArr.length > 0 || reducedItemsArr.length > 0;
  const canSubmit = hasChanges && newTotal >= 0;

  const handleCreateRevised = async () => {
    if (!activePI?.id) {
      Toast.error('No approved PI found. Cannot create revised PI.');
      return;
    }
    if (!canSubmit) {
      Toast.error('Please select products to remove (checkbox) or reduce quantity first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await proformaInvoiceService.createRevisedPI(activePI.id, {
        removedItemIds: removedIdsArr.map(String),
        reducedItems: reducedItemsArr,
        subtotal: Math.round(newSubtotal * 100) / 100,
        taxAmount: Math.round(newTaxAmount * 100) / 100,
        totalAmount: Math.round(newTotal * 100) / 100
      });
      const revised = res?.data?.data ?? res?.data ?? res;
      const revisedId = revised?.id;
      if (revisedId) {
        try {
          await proformaInvoiceService.submitRevisedPI(revisedId);
          Toast.success('Revised PI created and submitted for department head approval.');
        } catch (e) {
          Toast.success('Revised PI created. You can submit it for approval from the PI list.');
        }
      } else {
        Toast.success(res?.message || 'Revised PI created.');
      }
      onRevisedCreated?.(revised);
      onClose();
    } catch (err) {
      let msg = err?.data?.message ?? err?.data?.error ?? err?.message ?? 'Failed to create revised PI';
      if (typeof msg === 'string' && (msg.length > 200 || msg.includes('<'))) {
        msg = 'Failed to create revised PI. Please check backend logs.';
      }
      Toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!quotationId) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
          <p className="text-gray-600">Quotation not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-blue-600" />
            Amend PI (Cancel / Reduce products)
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : !activePI ? (
            <p className="text-gray-600">No approved PI found for this quotation. Amend is only available after PI approval.</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Select products to remove or reduce quantity. Revised PI will require department head approval.
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.map((it) => {
                  const id = it.id ?? it.quotation_item_id;
                  const name = it.product_name ?? it.description ?? `Item #${id}`;
                  const origQty = Number(it.quantity) || 1;
                  const effQty = getEffectiveQuantity(it);
                  const isRemoved = removedIds.has(String(id));
                  return (
                    <div key={id} className={`p-3 rounded-lg border ${isRemoved ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isRemoved}
                            onChange={() => toggleRemoved(String(id))}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-800 truncate">{name}</span>
                        </label>
                        {!isRemoved && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Qty:</span>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={reducedQty[id] ?? origQty}
                              onChange={(e) => setQuantity(id, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>New subtotal:</span>
                  <span>₹{newSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₹{newTaxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold mt-1">
                  <span>New total:</span>
                  <span>₹{newTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          {activePI && (
            <button
              type="button"
              onClick={handleCreateRevised}
              disabled={submitting}
              title={!canSubmit ? 'Select products to remove or reduce quantity first' : ''}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create revised PI'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
