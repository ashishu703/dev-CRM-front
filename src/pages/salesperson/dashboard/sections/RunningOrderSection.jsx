import React, { memo } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { usePaymentTrackingData } from '../../../shared/payment-tracking/hooks/usePaymentTrackingData';

function formatRate(val) {
  if (val == null || val === '—') return '—';
  const n = Number(val);
  return Number.isNaN(n) ? String(val) : '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatQty(row) {
  const q = row.quantity;
  const u = (row.unit || '').trim();
  if (q == null || q === '—') return '—';
  return u ? `${q} ${u}` : String(q);
}

const RunningOrderSection = memo(function RunningOrderSection({ onNavigate }) {
  const { activeOrderProductRows = [], loading, refresh } = usePaymentTrackingData();
  const rows = Array.isArray(activeOrderProductRows) ? activeOrderProductRows : [];

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <h3>Running Order</h3>
          <p>Active orders from Payment Tracking · Party · Product · Qty · Rate</p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="card-inner-padding">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-[12px] min-w-[500px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Party</th>
                <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Product</th>
                <th className="text-right py-2.5 px-3 font-semibold text-slate-600">Quantity</th>
                <th className="text-right py-2.5 px-3 font-semibold text-slate-600">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[var(--text-primary)]">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No data found</p>
                    <p className="text-xs mt-1 opacity-80">No running orders</p>
                  </td>
                </tr>
              ) : (
                rows.slice(0, 10).map((r, i) => (
                  <tr key={`${r.quotationId ?? ''}-${r.partyName ?? ''}-${r.productName ?? ''}-${i}`} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-[var(--text-primary)] whitespace-nowrap">{r.partyName || '—'}</td>
                    <td className="py-2.5 px-3 text-[var(--text-primary)] max-w-[220px] truncate" title={r.productName}>{r.productName || '—'}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[var(--text-primary)]">{formatQty(r)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-medium text-[var(--text-primary)]">{formatRate(r.rate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 10 && (
          <p className="mt-2 text-[11px] text-[var(--text-primary)] opacity-90">
            Showing 10 of {rows.length}.{' '}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/payment-tracking')}
                className="text-[var(--primary-600)] font-semibold hover:underline"
              >
                View all in Payment Tracking
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
});

export default RunningOrderSection;
