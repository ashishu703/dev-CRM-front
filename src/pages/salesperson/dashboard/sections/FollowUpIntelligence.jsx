import React, { memo } from 'react';
import { Hourglass, ListChecks, Flame } from 'lucide-react';
import { useRunningCount } from '../hooks/useRunningCount';

const HEADER_GRADIENT = { background: 'linear-gradient(135deg, #0F4C81 0%, #0B63B6 100%)' };
const BOX_GRADIENTS = [
  { bg: 'linear-gradient(135deg, #6A5AE0 0%, #5B7CFA 100%)', circle: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)', circle: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)', circle: 'rgba(255,255,255,0.15)' },
];

const FollowUpIntelligence = memo(function FollowUpIntelligence({ followUpIntelligence }) {
  if (!followUpIntelligence) return null;

  const {
    averageFollowUpDelayHours = 0,
    pendingFollowUps = {},
    overdueFollowUps = {},
    trendPct,
  } = followUpIntelligence;

  const pendingTotal = pendingFollowUps.total ?? 0;
  const overdueTotal = overdueFollowUps.total ?? 0;
  const runningPending = useRunningCount(pendingTotal);
  const runningOverdue = useRunningCount(overdueTotal);

  const trendVal = trendPct != null ? trendPct : 0;
  const high = (pendingFollowUps.high ?? 0) + (overdueFollowUps.high ?? 0);
  const medium = (pendingFollowUps.medium ?? 0) + (overdueFollowUps.medium ?? 0);
  const low = (pendingFollowUps.low ?? 0) + (overdueFollowUps.low ?? 0);
  const total = high + medium + low;
  const maxPriority = Math.max(1, high, medium, low);

  return (
    <div className="salesperson-dashboard-card overflow-hidden w-full rounded-xl border-2 transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'rgba(11, 99, 182, 0.25)' }}>
      <div className="relative overflow-hidden px-4 py-3 text-white" style={HEADER_GRADIENT}>
        <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <h3 className="relative z-10 text-base font-bold m-0">Follow-Up Intelligence</h3>
        <p className="relative z-10 text-xs font-medium text-white/90 mt-0.5 m-0">Pending, overdue and average delay</p>
      </div>

      <div className="card-inner-padding flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="relative overflow-hidden rounded-xl border-2 p-3 min-h-[88px]" style={{ background: BOX_GRADIENTS[0].bg, borderColor: 'rgba(91, 124, 250, 0.35)' }}>
            <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full" style={{ background: BOX_GRADIENTS[0].circle }} />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-white/90">Avg Delay</span>
              <Hourglass className="w-4 h-4 text-white shrink-0" />
            </div>
            <div className="relative z-10 mt-1 text-lg font-extrabold text-white tabular-nums leading-none">
              {Number(averageFollowUpDelayHours).toFixed(1)} <span className="text-xs font-semibold text-white/80">hrs</span>
            </div>
            <div className="relative z-10 mt-1 text-[11px] font-bold text-white drop-shadow-sm">
              {trendVal >= 0 ? '+' : ''}{trendVal}% vs yesterday
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border-2 p-3 min-h-[88px]" style={{ background: BOX_GRADIENTS[1].bg, borderColor: 'rgba(245, 158, 11, 0.35)' }}>
            <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full" style={{ background: BOX_GRADIENTS[1].circle }} />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-white/90">Pending</span>
              <ListChecks className="w-4 h-4 text-white shrink-0" />
            </div>
            <div className="relative z-10 mt-1 text-lg font-extrabold text-white tabular-nums leading-none">{runningPending}</div>
            <div className="relative z-10 mt-1 text-[11px] font-semibold text-white/90">To be followed up</div>
          </div>

          <div className="relative overflow-hidden rounded-xl border-2 p-3 min-h-[88px]" style={{ background: BOX_GRADIENTS[2].bg, borderColor: 'rgba(239, 68, 68, 0.35)' }}>
            <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full" style={{ background: BOX_GRADIENTS[2].circle }} />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-white/90">Overdue</span>
              <Flame className="w-4 h-4 text-white shrink-0" />
            </div>
            <div className="relative z-10 mt-1 flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-white tabular-nums leading-none">{runningOverdue}</span>
              <span className="text-[11px] font-semibold text-white/80">≈ {Number(overdueFollowUps.avgOverdueDays ?? 0).toFixed(1)} days</span>
            </div>
            <div className="relative z-10 mt-1 text-[11px] font-semibold text-white/90">Needs attention</div>
          </div>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-[var(--text-secondary)] mb-2">Priority breakdown</div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-14 text-[11px] text-slate-500 shrink-0">High</span>
              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden min-w-[50px]">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${total > 0 ? (high / maxPriority) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-[13px] font-semibold text-slate-800 tabular-nums">{high}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 text-[11px] text-slate-500 shrink-0">Medium</span>
              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden min-w-[50px]">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${total > 0 ? (medium / maxPriority) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-[13px] font-semibold text-slate-800 tabular-nums">{medium}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 text-[11px] text-slate-500 shrink-0">Low</span>
              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden min-w-[50px]">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${total > 0 ? (low / maxPriority) * 100 : 0}%` }} />
              </div>
              <span className="w-8 text-right text-[13px] font-semibold text-slate-800 tabular-nums">{low}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FollowUpIntelligence;
