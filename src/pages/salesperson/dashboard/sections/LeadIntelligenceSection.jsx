import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieIcon, AlertCircle } from 'lucide-react';

const LeadIntelligenceSection = memo(function LeadIntelligenceSection({ leadIntelligence }) {
  if (!leadIntelligence) return null;

  const { whyNotConverting = [], stuckDealsByDays = [] } = leadIntelligence;

  const donutData = Array.isArray(whyNotConverting)
    ? whyNotConverting.map((r) => ({ name: r.name, value: r.value || 0, color: r.color || '#6366f1' }))
    : [];

  const hasDonut = donutData.some((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      <div className="dashboard-card overflow-hidden">
        <div className="px-3 pt-3 pb-1.5 border-b border-white/5">
          <h3 className="text-[13px] font-semibold text-slate-100">Why Leads not converting</h3>
        </div>
        <div className="p-3 h-40">
          {!hasDonut ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
              <PieIcon className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <div className="px-3 pt-3 pb-1.5 border-b border-white/5">
          <h3 className="text-[13px] font-semibold text-slate-100">Stuck Deals</h3>
          <p className="text-slate-400 text-[10px] mt-0.5">Deals stuck &gt; 7 days</p>
        </div>
        <div className="p-3">
          {stuckDealsByDays.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400">
              <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No data available</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {stuckDealsByDays.slice(0, 5).map((deal) => (
                <li key={deal.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-b-0">
                  <span className="font-medium text-slate-100 truncate text-[11px]">{deal.name}</span>
                  <span className="text-base font-semibold shrink-0 ml-2 text-indigo-400">
                    {deal.valueFormatted}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
});

export default LeadIntelligenceSection;
