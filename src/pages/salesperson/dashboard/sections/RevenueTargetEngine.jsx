import React, { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Target, TrendingUp } from 'lucide-react';
import { formatCr } from '../utils/formatUtils';

const RevenueTargetEngine = memo(function RevenueTargetEngine({ revenueTarget, salesPipelineCRM }) {
  if (!revenueTarget) return null;

  const {
    monthlyTrend = [],
    last7DaysTrend = [],
    target = 0,
    achieved = 0,
    targetGapAmount = 0,
    requiredPerDay = 0,
    projectedMonthEnd = 0,
    revenuePerLead = 0,
    revenuePerOrder = 0,
    revenueSourceBreakdown = [],
  } = revenueTarget;

  const pipelineValue = salesPipelineCRM?.pipelineValue ?? 0;
  const probabilityWeighted = salesPipelineCRM?.probabilityWeightedValue ?? 0;
  const targetNum = Number(target) || 0;
  const achievedNum = Number(achieved) || 0;
  const projectedNum = Number(projectedMonthEnd) || 0;
  const forecastOk = targetNum === 0 || (achievedNum + Number(probabilityWeighted || 0)) >= targetNum;

  const hasAnyRevenue = target > 0 || achieved > 0;
  const chartData = (last7DaysTrend || []).length > 0
    ? last7DaysTrend.map((t) => ({ day: t.day ? t.day.slice(5) : '', amount: Number(t.amount) || 0 }))
    : (monthlyTrend || []).map((m) => ({ day: m.month, amount: Number(m.actual) || 0 }));

  const pieData = (revenueSourceBreakdown || []).filter((x) => Number(x.value) > 0).map((x, i) => ({
    name: x.name,
    value: Number(x.value) || 0,
    fill: ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][i % 5],
  }));

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header">
        <h3>Revenue Performance</h3>
        <p>Summary · Trend · Source · Forecast · Revenue per lead/order</p>
      </div>
      <div className="card-inner-padding">
        {!hasAnyRevenue ? (
          <div className="py-10 flex flex-col items-center justify-center text-slate-500 text-sm">
            <Target className="w-10 h-10 mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        ) : (
          <>
            {/* Layer 1: Big summary */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] border-l-4 border-l-[var(--success-500)] p-3">
                <div className="text-[10px] text-[var(--success-600)] font-semibold">Achieved</div>
                <div className="text-base font-bold text-[var(--text-primary)]">{formatCr(achieved)}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3">
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold">Target</div>
                <div className="text-base font-bold text-[var(--text-primary)]">{formatCr(target)}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] border-l-4 border-l-[var(--warning-500)] p-3">
                <div className="text-[10px] text-[var(--warning-600)] font-semibold">Gap</div>
                <div className="text-base font-bold text-[var(--text-primary)]">{formatCr(targetGapAmount)}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3">
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold">Required/day</div>
                <div className="text-base font-bold text-[var(--text-primary)]">{formatCr(requiredPerDay)}</div>
              </div>
              <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] border-l-4 p-3 ${projectedNum >= targetNum ? 'border-l-[var(--success-500)]' : 'border-l-[var(--danger-500)]'}`}>
                <div className="text-[10px] font-semibold text-[var(--text-secondary)]">Projected month end</div>
                <div className={`text-base font-bold ${projectedNum >= targetNum ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`}>{formatCr(projectedMonthEnd)}</div>
              </div>
            </div>

            {/* Layer 2: Revenue trend line */}
            {chartData.length > 0 && (
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3 mb-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-secondary)] mb-2">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                  Revenue trend
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revEngineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f1f5f9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip formatter={(v) => [formatCr(v), 'Revenue']} contentStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={2} fill="url(#revEngineGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Layer 3: Revenue source breakdown (pie) */}
            {pieData.length > 0 && (
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3 mb-4">
                <div className="text-[11px] font-semibold text-[var(--text-secondary)] mb-2">Revenue source (lead mix)</div>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={2} dataKey="value" nameKey="name">
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                    <Legend layout="horizontal" align="center" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Layer 4: Forecast + Revenue per lead/order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] border-l-4 p-3 ${forecastOk ? 'border-l-[var(--success-500)]' : 'border-l-[var(--danger-500)]'}`}>
                <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-1">Forecast intelligence</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Expected pipeline: <strong>{formatCr(pipelineValue)}</strong></div>
                <div className="text-[10px] text-[var(--text-secondary)]">Probability weighted: <strong>{formatCr(probabilityWeighted)}</strong></div>
                <p className={`text-[10px] mt-1 font-semibold ${forecastOk ? 'text-[var(--success-600)]' : 'text-[var(--danger-600)]'}`}>
                  {forecastOk ? 'Weighted + achieved ≥ target' : 'Below target — increase pace'}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3">
                <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-1">Profitability insight</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Revenue per lead: <strong className="text-[var(--text-primary)]">{formatCr(revenuePerLead)}</strong></div>
                <div className="text-[10px] text-[var(--text-secondary)]">Revenue per order: <strong className="text-[var(--text-primary)]">{formatCr(revenuePerOrder)}</strong></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default RevenueTargetEngine;
