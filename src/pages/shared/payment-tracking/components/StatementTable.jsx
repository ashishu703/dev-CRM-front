import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrencyINR } from '../utils/formatters';

const th = 'px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600 tracking-wider';

function formatDate(v) {
  if (!v) return '\u2014';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '\u2014' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ApprovalBadge({ status }) {
  const s = (status || 'pending').toLowerCase();
  const cls = s === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : s === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200';
  const label = s === 'approved' ? 'Approved' : s === 'rejected' ? 'Rejected' : 'Pending';
  return <span className={'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ' + cls}>{label}</span>;
}

export default function StatementTable({ rows, canDelete, onDeletePaymentHistory }) {
  const [enlargeUrl, setEnlargeUrl] = useState(null);
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-[850px] w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className={th}>Payment Date</th>
              <th className={th}>Party</th>
              <th className={th + ' text-right'}>Amount</th>
              <th className={th}>Payment Method</th>
              <th className={th}>Reference</th>
              <th className={th}>Approval Status</th>
              <th className={th}>Screenshot</th>
              {canDelete && <th className={th + ' text-center'}>Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-8 text-sm text-gray-500 text-center"
                  colSpan={canDelete ? 8 : 7}
                >
                  No statement entries
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(r.paymentDate)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.partyName}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">{formatCurrencyINR(r.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.method || '\u2014'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{r.reference || '\u2014'}</td>
                  <td className="px-4 py-3"><ApprovalBadge status={r.approvalStatus} /></td>
                  <td className="px-4 py-3">
                    {r.receiptUrl ? (
                      <button type="button" onClick={() => setEnlargeUrl(r.receiptUrl)} className="block w-12 h-12 rounded border border-slate-200 overflow-hidden bg-slate-50 hover:ring-2 hover:ring-blue-400 focus:outline-none">
                        <img src={r.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  {canDelete && (
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onDeletePaymentHistory?.(r)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:brightness-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {enlargeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEnlargeUrl(null)} role="dialog" aria-modal="true">
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-lg shadow-xl">
            <button type="button" onClick={() => setEnlargeUrl(null)} className="absolute top-2 right-2 z-10 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700" aria-label="Close">×</button>
            <img src={enlargeUrl} alt="Payment receipt" className="w-full h-auto" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </>
  );
}
