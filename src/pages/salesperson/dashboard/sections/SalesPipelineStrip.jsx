import React, { memo } from 'react';
import { TrendingDown, Percent, Clock, MousePointer } from 'lucide-react';
import { formatCurrency } from '../utils/formatUtils';

// Blue → Purple → Pink → Orange → Green (Won), Lost = red
const STAGE_COLORS = [
  '#3b82f6', // New Lead - blue
  '#8b5cf6', // Appointment - purple
  '#ec4899', // Quotation - pink
  '#f97316', // Negotiation - orange
  '#22c55e', // Won - green
  '#ef4444', // Lost - red
];

const SalesPipelineStrip = memo(function SalesPipelineStrip({ salesPipelineStrip, salesPipelineCRM, hidePipelineValue, onStageClick }) {
  const crm = salesPipelineCRM || {};
  const stages = crm.stages || [];
  const dropOffs = crm.dropOffs || [];
  const totalCount = stages.reduce((s, st) => s + (st.count || 0), 0);
  const handleStageClick = (stageKey) => onStageClick && stageKey && (() => onStageClick(stageKey));

  if (stages.length === 0 && (!salesPipelineStrip || salesPipelineStrip.length === 0)) {
    return (
      <div className="salesperson-dashboard-card overflow-hidden">
        <div className="dashboard-card-header">
          <h3>Sales Pipeline</h3>
          <p>Horizontal funnel · Conversion & drop-off</p>
        </div>
        <div className="card-inner-padding py-10 flex flex-col items-center justify-center text-[var(--text-primary)]">
          <p className="text-sm font-semibold">No data found</p>
          <p className="text-xs mt-1 opacity-80">No pipeline data for the selected date</p>
        </div>
      </div>
    );
  }

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header">
        <h3>Sales Pipeline</h3>
        <p>Horizontal funnel · Conversion % · Drop-off · Avg days</p>
      </div>
      <div className="card-inner-padding flex flex-col gap-4">
        {/* Step blocks: Stage → Next, Drop % — all 5 in one row (New Lead → … → Won → Lost) */}
        <div className="grid grid-cols-5 gap-2 w-full min-w-0">
          {stages.map((stage, index) => {
            const next = stages[index + 1];
            if (!next) return null;
            const drop =
              stage.count > 0
                ? Number((((stage.count - next.count) / stage.count) * 100).toFixed(0))
                : 0;
            const onClick = handleStageClick(stage.key);
            return (
              <div
                key={stage.key}
                role={onClick ? 'button' : undefined}
                tabIndex={onClick ? 0 : undefined}
                onClick={onClick}
                onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
                className={`rounded-lg border border-slate-200 p-3 bg-slate-50 min-w-0 ${onClick ? 'cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-colors' : ''}`}
              >
                <div className="text-xs text-slate-500">{stage.label}</div>
                <div className="text-lg font-bold text-slate-800 tabular-nums">{stage.count}</div>
                <div className="mt-2 text-xs text-slate-500">
                  → {next.label}: <span className="font-semibold text-slate-700">{next.count}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-rose-600">
                  Drop: {drop}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Table: Stage, Count, Conversion %, Avg days, Drop % */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-2 px-2 font-semibold text-slate-600">Stage</th>
                <th className="text-right py-2 px-2 font-semibold text-slate-600">Count</th>
                <th className="text-right py-2 px-2 font-semibold text-slate-600">Conversion %</th>
                <th className="text-right py-2 px-2 font-semibold text-slate-600">Avg days</th>
                <th className="text-right py-2 px-2 font-semibold text-slate-600">Drop %</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s, idx) => {
                const dropToNext = dropOffs[idx];
                const dropPct = dropToNext != null && dropToNext.dropPct != null ? `${Number(dropToNext.dropPct).toFixed(0)}%` : '—';
                const rowOnClick = handleStageClick(s.key);
                return (
                  <tr
                    key={s.key}
                    role={rowOnClick ? 'button' : undefined}
                    tabIndex={rowOnClick ? 0 : undefined}
                    onClick={rowOnClick}
                    onKeyDown={rowOnClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rowOnClick(); } } : undefined}
                    className={`border-b border-slate-100 ${rowOnClick ? 'cursor-pointer hover:bg-slate-100' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-2 px-2 font-medium text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STAGE_COLORS[idx % STAGE_COLORS.length] }} />
                      {s.label}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold tabular-nums">{s.count}</td>
                    <td className="py-2 px-2 text-right text-slate-600 tabular-nums">{s.conversionPct != null ? `${s.conversionPct}%` : '—'}</td>
                    <td className="py-2 px-2 text-right text-slate-600 tabular-nums">{s.avgDaysSpent ?? '—'}</td>
                    <td className="py-2 px-2 text-right text-slate-600 tabular-nums">{dropPct}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
              <Percent className="w-3.5 h-3.5" /> Overall conversion
            </div>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {totalCount > 0 ? `${Number(crm.overallConversionRate || 0).toFixed(1)}%` : '—'}
            </div>
            <div className="text-[9px] text-slate-500">Won / Total</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
              <Clock className="w-3.5 h-3.5" /> Avg time to close
            </div>
            <div className="text-base font-bold text-slate-800 mt-0.5">{crm.avgTimeToClose ?? 0} days</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
              <MousePointer className="w-3.5 h-3.5" /> Avg follow-ups
            </div>
            <div className="text-base font-bold text-slate-800 mt-0.5">{crm.avgFollowupsPerOrder ?? '—'}</div>
          </div>
        </div>

        {/* Pipeline value shown only in TargetRevenueSection */}
        {!hidePipelineValue && (crm.pipelineValue > 0 || crm.probabilityWeightedValue > 0) && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200 text-[11px]">
            <span className="text-slate-500">
              Expected in pipeline: <strong className="text-slate-800">{formatCurrency(crm.pipelineValue)}</strong>
            </span>
            <span className="text-slate-500">
              Probability weighted: <strong className="text-indigo-600">{formatCurrency(crm.probabilityWeightedValue)}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default SalesPipelineStrip;
