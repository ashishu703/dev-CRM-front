import React, { memo } from 'react';
import { AlertCircle, Phone } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const formatAmt = (n) => {
  const num = Number(n) || 0;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(1)}L`;
  if (num >= 1e3) return `₹${(num / 1e3).toFixed(0)}K`;
  return `₹${Math.round(num)}`;
};

function getDaysStuckColor(days) {
  if (days >= 10) return 'text-red-600 bg-red-100 border-red-200';
  if (days >= 6) return 'text-orange-600 bg-orange-100 border-orange-200';
  if (days >= 3) return 'text-amber-600 bg-amber-100 border-amber-200';
  return 'text-slate-600 bg-slate-100 border-slate-200';
}

const REASON_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const StuckDealsCard = memo(function StuckDealsCard({ stuckDealsByDays = [], onNavigate }) {
  const data = stuckDealsByDays?.list ?? (Array.isArray(stuckDealsByDays) ? stuckDealsByDays : []);
  const totalStuckDeals = stuckDealsByDays?.totalStuckDeals ?? data.length;
  const totalStuckValue = stuckDealsByDays?.totalStuckValue ?? 0;
  const avgStuckDays = stuckDealsByDays?.avgStuckDays ?? 0;
  const stuckReasonBreakdown = stuckDealsByDays?.stuckReasonBreakdown ?? [];

  const donutData = stuckReasonBreakdown.map((r, i) => ({ name: r.name, value: Number(r.value) || 0, fill: REASON_COLORS[i % REASON_COLORS.length] })).filter((d) => d.value > 0);

  const handleCall = (deal) => {
    if (onNavigate && deal?.id) onNavigate('customers', deal.id);
  };

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header">
        <h3>Stuck Deals</h3>
        <p>Action intelligence · Days stuck · Reason breakdown</p>
      </div>
      <div className="card-inner-padding">
        {totalStuckDeals === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-500">
            <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-[12px]">No stuck deals</p>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3">
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold">Total Stuck</div>
                <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{totalStuckDeals}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] border-l-4 border-l-[var(--warning-500)] p-3">
                <div className="text-[10px] text-[var(--warning-600)] font-semibold">Stuck Value</div>
                <div className="text-lg font-bold text-[var(--text-primary)]">{formatAmt(totalStuckValue)}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3">
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold">Avg Days</div>
                <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{avgStuckDays}</div>
              </div>
            </div>

            {/* Donut - Stuck Reason Breakdown */}
            {donutData.length > 0 && (
              <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-3">
                <div className="text-[11px] font-semibold text-slate-600 mb-1">Stuck reason breakdown</div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={52}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {donutData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                    <Legend layout="horizontal" align="center" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-[240px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr>
                    <th className="text-left py-2 px-1.5 font-semibold text-slate-600">Lead</th>
                    <th className="text-right py-2 px-1.5 font-semibold text-slate-600">Deal</th>
                    <th className="text-left py-2 px-1.5 font-semibold text-slate-600">Stage</th>
                    <th className="text-center py-2 px-1.5 font-semibold text-slate-600">Days</th>
                    <th className="text-left py-2 px-1.5 font-semibold text-slate-600">Reason</th>
                    <th className="text-left py-2 px-1.5 font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 15).map((deal) => {
                    const days = deal.daysStuck ?? 0;
                    const colorClass = getDaysStuckColor(days);
                    return (
                      <tr key={deal.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-1.5 px-1.5 font-medium text-slate-800 truncate max-w-[100px]" title={deal.name}>{deal.name}</td>
                        <td className="py-1.5 px-1.5 text-right font-semibold text-slate-700 tabular-nums">{deal.valueFormatted}</td>
                        <td className="py-1.5 px-1.5 text-slate-600 text-[10px] truncate max-w-[80px]">{deal.stage || '—'}</td>
                        <td className="py-1.5 px-1.5 text-center">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${colorClass}`}>{days}d</span>
                        </td>
                        <td className="py-1.5 px-1.5 text-slate-500 text-[10px]">{deal.reason || '—'}</td>
                        <td className="py-1.5 px-1.5">
                          <button
                            type="button"
                            onClick={() => handleCall(deal)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default StuckDealsCard;
