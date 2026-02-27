import React from 'react';
import { PlusCircle } from 'lucide-react';

const th = 'px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600 tracking-wider';

function formatCurrency(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

/** Pending Payment tab: Party, Quotation Number, Pending Amount, Action only (no Salesperson, no Quotation ID). */
export default function PendingPaymentsTable({ rows, onAddPayment, getPaymentForRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[500px] w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className={th}>Party</th>
            <th className={th}>Quotation Number</th>
            <th className={th + ' text-right'}>Pending Amount</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600 tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-sm text-gray-500 text-center" colSpan={4}>
                No pending payments
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const payment = getPaymentForRow ? getPaymentForRow(r) : null;
              const isPartiallyCancelled = r.quotationStatus === 'partially_cancelled';
              const rowClass = isPartiallyCancelled
                ? 'bg-red-50/50 hover:bg-red-50/70 border-l-4 border-l-red-500'
                : 'hover:bg-gray-50/50';
              return (
                <tr key={r.quotationId || r.orderId} className={rowClass}>
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
                    {formatCurrency(r.pendingAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => payment && onAddPayment(payment)}
                      disabled={!payment}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Payment
                    </button>
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
