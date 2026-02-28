import React, { memo } from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';
import { formatLac } from '../utils/formatUtils';

const BUCKET_STYLE = {
  '0_7': { label: '0-7 days', color: '#22c55e', bg: 'bg-emerald-500' },
  '7_15': { label: '8-15 days', color: '#fb923c', bg: 'bg-orange-300' },
  '15_30': { label: '16-30 days', color: '#f97316', bg: 'bg-orange-500' },
  '30_plus': { label: '30+ days', color: '#ef4444', bg: 'bg-red-500' },
};

const MoneyControlPanel = memo(function MoneyControlPanel({ paymentRisk }) {
  if (!paymentRisk) return null;

  const {
    agingBuckets = [],
    totalAmount = 0,
    totalClients = 0,
    paymentDelaysList = [],
    topOverdueClients = [],
    riskScore = {},
    collectionTotalDue = 0,
    collectionCollected = 0,
    collectionRate = 100,
  } = paymentRisk;

  const list = paymentDelaysList.length > 0 ? paymentDelaysList : topOverdueClients;
  const totalForStack = agingBuckets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const hasAnyAmount = totalForStack > 0;

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header">
        <h3>Payment Risk & Aging</h3>
        <p>Aging distribution · Risk score · Collection efficiency</p>
      </div>
      <div className="card-inner-padding">
        {!hasAnyAmount && list.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <Wallet className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No overdue payments</p>
          </div>
        ) : (
          <>
            {/* Part 1: Horizontal stacked bar */}
            {hasAnyAmount && (
              <div className="mb-4">
                <div className="text-[11px] font-semibold text-slate-600 mb-1.5">Aging distribution</div>
                <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  {agingBuckets.map((b) => {
                    const amt = Number(b.amount) || 0;
                    const pct = totalForStack > 0 ? (amt / totalForStack) * 100 : 0;
                    const style = BUCKET_STYLE[b.key] || BUCKET_STYLE['30_plus'];
                    return (
                      <div
                        key={b.key}
                        className="flex-1 min-w-0 flex items-center justify-center transition-all"
                        style={{ width: `${pct}%`, backgroundColor: style.color, minWidth: pct > 5 ? undefined : 0 }}
                        title={`${style.label}: ${formatLac(amt)}`}
                      >
                        {pct > 12 && <span className="text-[10px] font-bold text-white truncate">{formatLac(amt)}</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-500">
                  {agingBuckets.map((b) => {
                    const style = BUCKET_STYLE[b.key];
                    return (
                      <span key={b.key} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: style?.color }} /> {style?.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Part 2: Risk score */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-semibold text-slate-600">Payment risk:</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  riskScore.riskLabel === 'High Risk' ? 'bg-red-100 text-red-700' :
                  riskScore.riskLabel === 'Medium Risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                {riskScore.riskLabel || 'Low Risk'}
              </span>
              {(riskScore.lowPct != null || riskScore.highPct != null) && (
                <span className="text-[10px] text-slate-500">
                  On time {riskScore.lowPct}% · Delayed {riskScore.mediumPct}% · 30+ days {riskScore.highPct}%
                </span>
              )}
            </div>

            {/* Collection efficiency (white + left border accent only) */}
            {(Number(collectionTotalDue) > 0 || Number(collectionCollected) > 0) && (
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] border-l-4 border-l-[var(--primary-600)] p-3 mb-4">
                <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-1.5">Collection efficiency</div>
                <div className="grid grid-cols-3 gap-4 text-[11px]">
                  <div>
                    <div className="text-slate-500">Total due</div>
                    <div className="font-bold text-slate-800">{formatLac(collectionTotalDue)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Collected</div>
                    <div className="font-bold text-emerald-600">{formatLac(collectionCollected)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Collection rate</div>
                    <div className="font-bold text-teal-700">{Number(collectionRate).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Part 3: Overdue table */}
            <div className="text-[11px] font-semibold text-slate-600 mb-1.5">Overdue list</div>
            {list.length === 0 ? (
              <p className="text-[11px] text-slate-500">No overdue clients</p>
            ) : (
              <div className="overflow-x-auto max-h-[180px] overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Client</th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-600">Amount</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Due date</th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-600">Days overdue</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-1.5 px-2 font-medium text-slate-800 truncate max-w-[120px]">{c.clientName}</td>
                        <td className="py-1.5 px-2 text-right font-semibold tabular-nums">{formatLac(c.amount)}</td>
                        <td className="py-1.5 px-2 text-slate-600 tabular-nums">{c.dueDate || '—'}</td>
                        <td className={`py-1.5 px-2 text-right font-bold tabular-nums ${(c.agingDays || 0) >= 30 ? 'text-red-600' : (c.agingDays || 0) >= 16 ? 'text-orange-600' : 'text-slate-700'}`}>
                          {c.agingDays ?? 0}d
                        </td>
                        <td className="py-1.5 px-2">
                          <span className={`text-[10px] font-semibold ${c.risk === 'High' ? 'text-red-600' : c.risk === 'Medium' ? 'text-orange-600' : 'text-slate-600'}`}>
                            {c.risk || 'Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default MoneyControlPanel;
