import React, { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Hourglass, AlertCircle } from 'lucide-react';

const STAGE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#ef4444'];

/** Actionable follow-up widget: donut by stage + Avg Delay & Overdue count for quick action. */
const FollowUpPipeline = memo(function FollowUpPipeline({ salesPipelineCRM, followUpIntelligence }) {
  const stages = salesPipelineCRM?.stages ?? [];
  const avgDelayHours = followUpIntelligence?.averageFollowUpDelayHours ?? 0;
  const overdueTotal = followUpIntelligence?.overdueFollowUps?.total ?? 0;

  const { pieData, totalLeads } = useMemo(() => {
    const list = stages.filter((s) => (s.count || 0) > 0);
    const total = list.reduce((s, st) => s + (st.count || 0), 0);
    const data = list.map((s, i) => ({
      name: s.label,
      value: s.count,
      fill: STAGE_COLORS[i % STAGE_COLORS.length],
    }));
    return { pieData: data, totalLeads: total };
  }, [stages]);

  if (pieData.length === 0 && overdueTotal === 0) {
    return (
      <div className="salesperson-dashboard-card overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">Follow-Up Pipeline</h3>
        </div>
        <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-[var(--text-secondary)] text-sm gap-3">
          <span>Avg Delay: {Number(avgDelayHours).toFixed(1)} hrs</span>
          <span>No follow-up data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="salesperson-dashboard-card overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">Follow-Up Pipeline</h3>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {/* Actionable metrics: Avg Delay, Overdue count */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-2 flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold">Avg Delay</div>
              <div className="text-sm font-bold text-slate-800 tabular-nums">{Number(avgDelayHours).toFixed(1)} hrs</div>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold">Overdue</div>
              <div className="text-sm font-bold text-slate-800 tabular-nums">{overdueTotal} leads</div>
            </div>
          </div>
        </div>
        {pieData.length > 0 && (
          <div className="flex items-center justify-center min-h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="var(--bg-card)"
                  strokeWidth={1.5}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value}${totalLeads > 0 ? ` (${((value / totalLeads) * 100).toFixed(0)}%)` : ''}`,
                    name,
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});

export default FollowUpPipeline;
