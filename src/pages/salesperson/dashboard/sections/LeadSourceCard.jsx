import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users } from 'lucide-react';

const SOURCE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316'];

const LeadSourceCard = memo(function LeadSourceCard({ leadSourceBreakdown = [] }) {
  const list = Array.isArray(leadSourceBreakdown) ? leadSourceBreakdown : [];
  const totalLeads = list.reduce((s, x) => s + (Number(x.count) || 0), 0);
  const donutData = list
    .filter((x) => (Number(x.count) || 0) > 0)
    .map((x, i) => ({
      name: x.name || 'Unknown',
      value: Number(x.count) || 0,
      fill: SOURCE_COLORS[i % SOURCE_COLORS.length],
    }));

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header">
        <h3>Lead Source</h3>
        <p>Leads by source · Count · Share</p>
      </div>
      <div className="card-inner-padding">
        {list.length === 0 || totalLeads === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-[var(--text-primary)]">
            <Users className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-semibold">No data found</p>
            <p className="text-xs mt-1 opacity-80">No lead source data</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3 mb-4">
              <div className="text-[10px] text-[var(--text-primary)] font-semibold opacity-90">Total leads</div>
              <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{totalLeads}</div>
            </div>
            {donutData.length > 0 && (
              <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-3">
                <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-1">Source breakdown</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={58}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {donutData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Leads']} />
                    <Legend layout="horizontal" align="center" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-[200px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr>
                    <th className="text-left py-2 px-1.5 font-semibold text-slate-600">Source</th>
                    <th className="text-right py-2 px-1.5 font-semibold text-slate-600">Count</th>
                    <th className="text-right py-2 px-1.5 font-semibold text-slate-600">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                      <td className="py-1.5 px-1.5 text-slate-800 font-medium">{row.name || 'Unknown'}</td>
                      <td className="py-1.5 px-1.5 text-right tabular-nums text-slate-700">{row.count ?? 0}</td>
                      <td className="py-1.5 px-1.5 text-right tabular-nums text-slate-600">{row.value ?? '0%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default LeadSourceCard;
