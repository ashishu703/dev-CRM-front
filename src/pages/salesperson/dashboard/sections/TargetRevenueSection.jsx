import React, { memo } from 'react';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatUtils';

/**
 * Target & Revenue — single section.
 * Block A: KPI row (Achieved, Target, Gap, Required/day, Projected).
 * Block B: Circular progress + daily pace.
 * Block C: 7-day revenue trend (once).
 * Block D: Forecast + revenue by source.
 */
const TargetRevenueSection = memo(function TargetRevenueSection({ revenueTarget, salesPipelineCRM }) {
  if (!revenueTarget) return null;

  const {
    target = 0,
    achieved = 0,
    requiredPerDay = 0,
    daysLeftInPeriod = 0,
    achievedPct = 0,
    last7DaysTrend = [],
    isPeriodExpired = false,
  } = revenueTarget;

  const targetNum = Number(target) || 0;
  const achievedNum = Number(achieved) || 0;
  const projectedNum = Number(revenueTarget.projectedMonthEnd) || 0;
  const currentDailyAvg = revenueTarget.currentDailyAvg ?? 0;

  const hasTarget = target > 0;
  const progressPct = targetNum > 0 ? Math.min(100, (achievedNum / targetNum) * 100) : 0;

  const trendData = (last7DaysTrend || []).map((t) => ({
    day: t.day ? t.day.slice(5) : '',
    amount: Number(t.amount) || 0,
  }));
  const trendUp = trendData.length >= 2 && trendData[trendData.length - 1]?.amount >= (trendData[0]?.amount || 0);
  const trendFlat =
    trendData.length >= 2 &&
    Math.abs((trendData[trendData.length - 1]?.amount || 0) - (trendData[0]?.amount || 0)) <
      (trendData[0]?.amount || 0) * 0.1;

  const TrendIcon = () => {
    if (trendUp) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trendFlat) return <Minus className="w-4 h-4 text-amber-500" />;
    return <TrendingDown className="w-4 h-4 text-rose-500" />;
  };

  // No active target and no achieved: show card with "No target set" and timeline area
  if (!hasTarget && achievedNum <= 0 && !isPeriodExpired) {
    return (
      <div className="salesperson-dashboard-card overflow-hidden">
        <div className="dashboard-card-header flex flex-row items-center gap-2">
          <Target className="w-4 h-4 text-[var(--primary-600)] shrink-0" />
          <div>
            <h3>Target & Revenue</h3>
            <p>Progress · Pace · Last 7 days</p>
          </div>
        </div>
        <div className="card-inner-padding">
          <div className="py-6 flex flex-col items-center justify-center text-[var(--text-primary)] rounded-lg bg-slate-50 border border-slate-200 mb-4">
            <p className="text-sm font-semibold">No target set</p>
            <p className="text-xs mt-1 opacity-80">Set target in Department Management to see progress here</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600">Last 7 days</span>
              <TrendIcon />
            </div>
            {trendData.length > 0 ? (
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="targetRevenueTrendGradEmpty" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f1f5f9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={1.5} fill="url(#targetRevenueTrendGradEmpty)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[100px] flex flex-col items-center justify-center text-[var(--text-primary)]">
                <p className="text-xs opacity-80">No trend data for last 7 days</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Period expired: show message and achieved only (no active target)
  if (isPeriodExpired) {
    return (
      <div className="salesperson-dashboard-card overflow-hidden">
        <div className="dashboard-card-header flex flex-row items-center gap-2">
          <Target className="w-4 h-4 text-[var(--primary-600)] shrink-0" />
          <div>
            <h3>Target & Revenue</h3>
            <p>Progress · Pace · Last 7 days</p>
          </div>
        </div>
        <div className="card-inner-padding">
          <div className="rounded-lg bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 p-3 mb-4">
            <p className="text-sm font-semibold text-amber-800">Target period expired</p>
            <p className="text-xs mt-1 text-amber-700">Set a new target period in Department Management. Last period achieved: {formatCurrency(achieved)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600">Last 7 days</span>
              <TrendIcon />
            </div>
            {trendData.length > 0 ? (
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="targetRevenueTrendGradExpired" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f1f5f9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={1.5} fill="url(#targetRevenueTrendGradExpired)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[100px] flex flex-col items-center justify-center text-[var(--text-primary)]">
                <p className="text-xs opacity-80">No trend data for last 7 days</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, targetNum - achievedNum);

  return (
    <div className="salesperson-dashboard-card overflow-hidden">
      <div className="dashboard-card-header flex flex-row items-center gap-2">
        <Target className="w-4 h-4 text-[var(--primary-600)] shrink-0" />
        <div>
          <h3>Target & Revenue</h3>
          <p>Progress · Pace · Last 7 days</p>
        </div>
      </div>
      <div className="card-inner-padding">
        {/* Row 1: [ Total Target ] [ Achieved ] [ Remaining ] [ % Complete ] */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500 font-semibold">Total Target</div>
            <div className="text-base font-bold text-slate-800">{formatCurrency(target)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 border-l-4 border-l-emerald-500 p-3">
            <div className="text-[10px] text-emerald-600 font-semibold">Achieved</div>
            <div className="text-base font-bold text-slate-800">{formatCurrency(achieved)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 border-l-4 border-l-amber-500 p-3">
            <div className="text-[10px] text-amber-600 font-semibold">Remaining</div>
            <div className="text-base font-bold text-slate-800">{formatCurrency(remaining)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500 font-semibold">% Complete</div>
            <div className="text-base font-bold text-slate-800">{Number(achievedPct).toFixed(1)}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-500"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
        </div>

        {/* Row 2: [ Required per day ] [ Current daily avg ] [ Days left ] [ Projected if same pace ] */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500 font-semibold">Required per day</div>
            <div className="text-base font-bold text-slate-800">{formatCurrency(requiredPerDay)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500 font-semibold">Current daily avg</div>
            <div className="text-base font-bold text-slate-800">{formatCurrency(currentDailyAvg)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="text-[10px] text-slate-500 font-semibold">Days left</div>
            <div className="text-base font-bold text-slate-800">{daysLeftInPeriod ?? 0}</div>
          </div>
          <div
            className={`rounded-lg border border-slate-200 p-3 ${
              projectedNum >= targetNum ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'bg-rose-50 border-l-4 border-l-rose-500'
            }`}
          >
            <div className="text-[10px] text-slate-600 font-semibold">Projected if same pace</div>
            <div
              className={`text-base font-bold ${projectedNum >= targetNum ? 'text-emerald-700' : 'text-rose-700'}`}
            >
              {formatCurrency(revenueTarget.projectedMonthEnd)}
            </div>
          </div>
        </div>

        {/* Graph (Last 7 days) */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-600">Last 7 days</span>
            <TrendIcon />
          </div>
          {trendData.length > 0 ? (
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="targetRevenueTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f1f5f9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={1.5} fill="url(#targetRevenueTrendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[100px] flex flex-col items-center justify-center text-[var(--text-primary)]">
              <p className="text-sm font-semibold">No data found</p>
              <p className="text-xs mt-1 opacity-80">No trend data for last 7 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TargetRevenueSection;
