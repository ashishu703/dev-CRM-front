import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MoreVertical, PlusCircle, Trash2, PencilLine } from 'lucide-react';
import { formatCurrencyINR } from '../utils/formatters';
import { useBulkQuotationIdSelection } from '../hooks/useBulkQuotationIdSelection';
import BulkQuotationDeleteBar from './BulkQuotationDeleteBar';
import RoundSelectCheckbox from './RoundSelectCheckbox';

const th = 'px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600 tracking-wider';
const thCenter = th + ' text-center';

/** Pending Payment tab: Party, Quotation Number, Pending Amount, Action only (no Salesperson, no Quotation ID). */
function RowActionsMenu({ row, payment, canDelete, onAddPayment, onDeleteQuotation, onEditQuotation }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const quotationId = row?.quotationId;
  const quotationNumber = row?.quotationNumber;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-center" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Row actions"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                onDeleteQuotation?.(quotationId);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!payment) return;
              onAddPayment?.(payment);
              setOpen(false);
            }}
            disabled={!payment}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
              !payment ? 'text-gray-400 cursor-not-allowed opacity-60' : 'text-gray-700'
            }`}
            title={!payment ? 'Payment record not found for this quotation' : ''}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" /> Add Payment
          </button>

          <button
            type="button"
            onClick={() => {
              onEditQuotation?.(row, { quotationNumber });
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <PencilLine className="w-4 h-4 text-indigo-600" /> Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default function PendingPaymentsTable({
  rows,
  onAddPayment,
  getPaymentForRow,
  canDelete,
  onDeleteQuotation,
  onBulkDeleteQuotations,
  onEditQuotation,
}) {
  const visibleQuotationIds = useMemo(() => {
    const seen = new Set();
    const list = [];
    rows.forEach((r) => {
      const id = r.quotationId;
      if (id && !seen.has(id)) {
        seen.add(id);
        list.push(id);
      }
    });
    return list;
  }, [rows]);

  const {
    selectedIds: selectedQuotationIds,
    allSelected,
    selectedCount,
    toggleAll,
    toggleOne,
    clearSelection,
  } = useBulkQuotationIdSelection(visibleQuotationIds);

  const handleBulkDelete = async () => {
    if (!selectedCount) return;
    await onBulkDeleteQuotations?.(selectedQuotationIds);
    clearSelection();
  };

  return (
    <div className="overflow-x-auto">
      <BulkQuotationDeleteBar
        canDelete={canDelete}
        selectedCount={selectedCount}
        onDelete={handleBulkDelete}
        summaryLabel={`${selectedCount} selected`}
      />

      <table className="min-w-[620px] w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {canDelete && (
              <th className="w-10 px-2 py-3 text-center text-xs font-semibold uppercase text-slate-600 tracking-wider">
                <RoundSelectCheckbox
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  aria-label="Select all pending"
                />
              </th>
            )}
            <th className={th}>Party</th>
            <th className={th}>Quotation Number</th>
            <th className={th + ' text-right'}>Pending Amount</th>
            <th className={thCenter + (canDelete ? ' w-20' : ' w-24')}>Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td
                className="px-4 py-8 text-sm text-gray-500 text-center"
                colSpan={canDelete ? 5 : 4}
              >
                No pending payments
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const payment = getPaymentForRow ? getPaymentForRow(r) : null;
              const isPartiallyCancelled = r.quotationStatus === 'partially_cancelled';
              const rowClass = isPartiallyCancelled
                ? 'bg-red-50/50 hover:bg-red-50/70 border-l-4 border-l-red-500'
                : 'hover:bg-slate-50/60';
              const checked = selectedQuotationIds.includes(r.quotationId);
              return (
                <tr key={r.quotationId || r.orderId} className={rowClass}>
                  {canDelete && (
                    <td className="px-2 py-3 text-center">
                      <RoundSelectCheckbox
                        checked={checked}
                        onChange={(e) => toggleOne(r.quotationId, e.target.checked)}
                        aria-label={`Select ${r.quotationNumber || r.quotationId}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.partyName}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">
                    <span className="inline-flex items-center gap-2 flex-wrap">
                      {r.quotationNumber || '—'}
                      {isPartiallyCancelled && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          Partially Cancelled
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-amber-700">
                    {formatCurrencyINR(r.pendingAmount)}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <RowActionsMenu
                      row={r}
                      payment={payment}
                      canDelete={canDelete}
                      onAddPayment={onAddPayment}
                      onDeleteQuotation={onDeleteQuotation}
                      onEditQuotation={onEditQuotation}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
