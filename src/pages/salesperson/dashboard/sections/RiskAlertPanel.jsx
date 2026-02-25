import React, { memo } from 'react';
import { AlertTriangle } from 'lucide-react';

const RiskAlertPanel = memo(function RiskAlertPanel({ summary }) {
  const stuck = summary?.leadIntelligence?.stuckDealsByDays;
  const stuckList = stuck?.list ?? [];
  const stuck10Plus = stuckList.filter((d) => (d.daysStuck || 0) >= 10).length;
  const paymentRisk = summary?.paymentRisk;
  const overdueList = paymentRisk?.paymentDelaysList ?? paymentRisk?.topOverdueClients ?? [];
  const clients30Plus = overdueList.filter((c) => (c.agingDays || 0) >= 30).length;
  const revenueTarget = summary?.revenueTarget;
  const paceStatus = revenueTarget?.paceStatus;
  const paceBehind = paceStatus === 'behind';
  const achievedPct = Number(revenueTarget?.achievedPct) || 0;
  const targetGap = 100 - achievedPct;

  const alerts = [];
  if (stuck10Plus > 0) alerts.push({ id: 'stuck', text: `${stuck10Plus} deal${stuck10Plus !== 1 ? 's' : ''} stuck > 10 days`, type: 'warning' });
  if (clients30Plus > 0) alerts.push({ id: 'overdue', text: `${clients30Plus} client${clients30Plus !== 1 ? 's' : ''} 30+ days overdue`, type: 'warning' });
  if (paceBehind && targetGap > 0) alerts.push({ id: 'revenue', text: `Revenue pace ${targetGap.toFixed(0)}% below target`, type: 'warning' });

  if (alerts.length === 0) return null;

  return (
    <div className="salesperson-dashboard-card border-l-4 border-l-[var(--warning-500)]">
      <div className="card-inner-padding">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-[var(--warning-600)] shrink-0" />
          <h4 className="text-[14px] font-semibold text-[var(--text-primary)]">Risk alerts</h4>
        </div>
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] font-medium">
              <span className="text-[var(--warning-500)]" aria-hidden>⚠</span>
              {a.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default RiskAlertPanel;
