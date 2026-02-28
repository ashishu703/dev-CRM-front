import React, { memo } from 'react';
import { Target, Clock, Zap, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCr } from '../utils/formatUtils';

const TargetAchievementBreakdown = memo(function TargetAchievementBreakdown({ revenueTarget }) {
  if (!revenueTarget) return null;

  const {
    target = 0,
    achieved = 0,
    targetGapAmount = 0,
    requiredPerDay = 0,
    performanceIndex = 0,
    daysLeftInPeriod = 0,
    achievedPct = 0,
    daysPassedInPeriod = 0,
    totalDaysInPeriod = 1,
    currentDailyAvg = 0,
    projectedMonthEnd = 0,
    paceStatus = 'on_track',
    last7DaysTrend = [],
  } = revenueTarget;

  const hasTarget = target > 0;
  const targetNum = Number(target) || 0;
  const achievedNum = Number(achieved) || 0;
  const progressPct = targetNum > 0 ? Math.min(100, (achievedNum / targetNum) * 100) : 0;
  const gapDaily = (Number(requiredPerDay) || 0) - (Number(currentDailyAvg) || 0);
  const isBehindPace = gapDaily > 0 && paceStatus === 'behind';
  const trendData = (last7DaysTrend || []).map((t) => ({ day: t.day ? t.day.slice(5) : '', amount: Number(t.amount) || 0 }));
  const trendUp = trendData.length >= 2 && trendData[trendData.length - 1]?.amount >= (trendData[0]?.amount || 0);
  const trendFlat = trendData.length >= 2 && Math.abs((trendData[trendData.length - 1]?.amount || 0) - (trendData[0]?.amount || 0)) < (trendData[0]?.amount || 0) * 0.1;

  const PaceBadge = () => {
    if (paceStatus === 'ahead') return <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]"><CheckCircle className="w-3.5 h-3.5" /> Ahead</span>;
    if (paceStatus === 'behind') return <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]"><AlertTriangle className="w-3.5 h-3.5" /> Behind</span>;
    return <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]"><CheckCircle className="w-3.5 h-3.5" /> On track</span>;
  };

  const TrendIcon = () => {
    if (trendUp) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trendFlat) return <Minus className="w-4 h-4 text-amber-500" />;
    return <TrendingDown className="w-4 h-4 text-rose-500" />;
  };

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header flex flex-row items-center gap-2">
        <Target className="w-4 h-4 text-[var(--primary-600)] shrink-0" />
        <div>
          <h3>Target & Achievement</h3>
          <p>Circular progress · Daily pace · 7-day trend · Projected</p>
        </div>
      </div>
      <div className="card-inner-padding">
        {!hasTarget ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-500 text-sm">No target assigned</div>
        ) : (
          <>
            {/* Layer 1 – Big circular progress ring */}
            <div className="flex justify-center mb-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                    fill="none"
                    stroke={progressPct >= 100 ? '#22c55e' : '#14b8a6'}
                    strokeWidth="3"
                    strokeDasharray={`${progressPct} 100`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-semibold text-slate-500">Achieved</span>
                  <span className="text-xl font-bold text-slate-800 tabular-nums">{Number(achievedPct).toFixed(0)}%</span>
                  <span className="text-[9px] text-slate-500 mt-0.5 text-center leading-tight">{formatCr(achieved)} / {formatCr(target)}</span>
                  <div className="mt-1"><PaceBadge /></div>
                </div>
              </div>
            </div>

            {/* Layer 2 – Daily pace (white + left border accent only) */}
            <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-3 mb-4 border-l-4 ${isBehindPace ? 'border-l-[var(--danger-500)]' : 'border-l-[var(--warning-500)]'}`}>
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2 text-[11px]">
                <Zap className="w-3.5 h-3.5" />
                Daily pace
              </div>
              <div className="grid grid-cols-3 gap-4 text-[11px]">
                <div>
                  <div className="text-slate-500">Required/day</div>
                  <div className="font-bold text-slate-800">{formatCr(requiredPerDay)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Current daily avg</div>
                  <div className="font-bold text-slate-800">{formatCr(currentDailyAvg)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Gap</div>
                  <div className={`font-bold ${gapDaily > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{formatCr(Math.abs(gapDaily))} {gapDaily > 0 ? 'short' : ''}</div>
                </div>
              </div>
            </div>

            {/* Layer 3 – Mini trend (last 7 days) */}
            {trendData.length > 0 && (
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600">Last 7 days revenue</span>
                  <TrendIcon />
                </div>
                <ResponsiveContainer width="100%" height={56}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="targetTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f1f5f9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip formatter={(v) => [formatCr(v), 'Revenue']} contentStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={1.5} fill="url(#targetTrendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3">
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold">Monthly target</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{formatCr(target)}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] border-l-4 border-l-[var(--success-500)] p-3">
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold">Achieved</div>
                <div className="text-sm font-bold text-[var(--success-600)]">{formatCr(achieved)}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] border-l-4 border-l-[var(--warning-500)] p-3">
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold">Remaining</div>
                <div className="text-sm font-bold text-[var(--warning-600)]">{formatCr(targetGapAmount)}</div>
              </div>
              <div className="rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] p-3">
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold">Daily required</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{formatCr(requiredPerDay)}</div>
              </div>
            </div>

            {/* Projected month end (white + left border accent only) */}
            {totalDaysInPeriod > 0 && (
              <div className={`mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-3 border-l-4 ${projectedMonthEnd >= targetNum ? 'border-l-[var(--success-500)]' : 'border-l-[var(--danger-500)]'}`}>
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold mb-0.5">Projected month end</div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`text-lg font-bold ${projectedMonthEnd >= targetNum ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatCr(projectedMonthEnd)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    (Achieved / {daysPassedInPeriod} days) × {totalDaysInPeriod} days
                  </span>
                </div>
                {projectedMonthEnd >= targetNum ? (
                  <p className="text-[10px] text-emerald-600 mt-1">On track to meet target</p>
                ) : (
                  <p className="text-[10px] text-rose-600 mt-1">Increase daily pace to meet target</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap mt-6 pt-4 border-t border-[var(--border)]">
              <span className="text-slate-500 text-[11px] font-medium">Performance</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] ${
                  performanceIndex >= 80 ? 'bg-emerald-100 text-emerald-700' : performanceIndex >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {performanceIndex} / 100
              </span>
              <span className="text-[10px] text-slate-500">{daysLeftInPeriod}d left in period</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default TargetAchievementBreakdown;
