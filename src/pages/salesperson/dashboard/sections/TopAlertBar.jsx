import React, { memo } from 'react';
import { AlertTriangle, TrendingDown, Target } from 'lucide-react';

const TopAlertBar = memo(function TopAlertBar({ alerts, isDarkMode }) {
  if (!alerts) return null;

  const { highValueDealsAtRisk, paymentsOverdue, paymentsOverduePctChange, targetGapPct, targetGapUnits } = alerts;

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {highValueDealsAtRisk > 0 && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm ${
            isDarkMode ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'bg-orange-100 text-orange-800 border border-orange-300'
          }`}
        >
          <span className="text-xs font-bold opacity-80">h</span>
          <span>{highValueDealsAtRisk} High Value Deals at Risk</span>
        </div>
      )}
      {paymentsOverdue > 0 && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm ${
            isDarkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{paymentsOverdue} Payments Overdue</span>
          {paymentsOverduePctChange != null && (
            <span className="flex items-center text-xs opacity-90">
              <TrendingDown className="h-3 w-3 mr-0.5" />
              {paymentsOverduePctChange}%
            </span>
          )}
        </div>
      )}
      {(targetGapPct > 0 || targetGapUnits > 0) && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm ${
            isDarkMode ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          <Target className="h-4 w-4 shrink-0" />
          <span>{Math.round(targetGapPct)}%</span>
          {targetGapUnits !== 0 && <span>({targetGapUnits > 0 ? '-' : ''}{Math.abs(targetGapUnits)})</span>}
          <span className="text-xs opacity-90">Target gap</span>
        </div>
      )}
    </div>
  );
});

export default TopAlertBar;
