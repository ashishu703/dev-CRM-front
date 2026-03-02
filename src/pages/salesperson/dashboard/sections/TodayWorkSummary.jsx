import React, { memo } from 'react';
import { Phone, Search, ClipboardList, UserPlus, FileText, IndianRupee, FileCheck, UserX } from 'lucide-react';
import { useRunningCount } from '../hooks/useRunningCount';
import { formatCurrency } from '../utils/formatUtils';

// 8 uniqu
const GRADIENT_STYLES = [
  { bg: 'linear-gradient(135deg, #6A5AE0 0%, #5B7CFA 100%)', border: 'rgba(107, 114, 128, 0.3)', circle: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg, #0F4C81 0%, #0B63B6 100%)', border: 'rgba(11, 99, 182, 0.4)', circle: 'rgba(255,255,255,0.12)' },
  { bg: 'linear-gradient(135deg, #0E7ACF 0%, #00A3D9 100%)', border: 'rgba(0, 163, 217, 0.4)', circle: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg, #22B573 0%, #1ECAD3 100%)', border: 'rgba(30, 202, 211, 0.4)', circle: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)', border: 'rgba(124, 58, 237, 0.4)', circle: 'rgba(255,255,255,0.12)' },
  { bg: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)', border: 'rgba(3, 105, 161, 0.4)', circle: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)', border: 'rgba(180, 83, 9, 0.4)', circle: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg, #047857 0%, #10B981 100%)', border: 'rgba(4, 120, 87, 0.4)', circle: 'rgba(255,255,255,0.15)' },
];

function TrendSubtext({ trend }) {
  const pct = Number(trend?.pct) ?? 0;
  const dir = trend?.dir || 'flat';
  const isUp = dir === 'up';
  const isDown = dir === 'down';
  const cls = isUp ? 'text-white' : isDown ? 'text-white' : 'text-white';

  if (dir === 'flat') {
    return <span className="text-[11px] sm:text-xs font-semibold text-white drop-shadow-sm">0% vs yesterday</span>;
  }
  return (
    <span className={`text-[11px] sm:text-xs font-bold ${cls} drop-shadow-sm`}>
      {isUp ? '+' : '-'}{pct}% vs yesterday
    </span>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getDisplayName(user) {
  if (!user) return 'Salesperson';
  const name = user.name || user.username || user.displayName;
  if (name) return name;
  const email = user.email || '';
  if (email.includes('@')) return email.split('@')[0].replace(/[._]/g, ' ');
  return 'Salesperson';
}

const SummaryCard = memo(function SummaryCard({ card, gradientStyle, TrendSubtext }) {
  const isPayment = card.key === 'paymentApprovedToday';
  const numericValue = typeof card.value === 'number' ? card.value : (isPayment ? card.count : 0);
  const runningCount = useRunningCount(numericValue);
  const Icon = card.icon;
  const hasClick = card.onClick && typeof card.onClick === 'function';

  let mainDisplay;
  if (isPayment) {
    mainDisplay = card.value;
  } else {
    mainDisplay = runningCount;
  }

  let subtext;
  if (isPayment) {
    const count = card.count ?? 0;
    subtext = (
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] sm:text-xs font-semibold text-white drop-shadow-sm">{count} payment{count !== 1 ? 's' : ''}</span>
        {card.trend != null ? <TrendSubtext trend={card.trend} /> : <span className="text-[11px] sm:text-xs font-bold text-white drop-shadow-sm">0% vs yesterday</span>}
      </div>
    );
  } else {
    subtext = card.trend != null ? <TrendSubtext trend={card.trend} /> : <span className="text-[11px] sm:text-xs font-semibold text-white/90">—</span>;
  }

  const wrap = (children) =>
    hasClick ? (
      <button
        type="button"
        onClick={card.onClick}
        className="relative w-full h-full min-h-[100px] text-left rounded-xl border-2 overflow-hidden transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/30 flex flex-col"
        style={{ background: gradientStyle.bg, borderColor: gradientStyle.border }}
      >
        {children}
      </button>
    ) : (
      <div
        className="relative w-full h-full min-h-[100px] rounded-xl border-2 overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col"
        style={{ background: gradientStyle.bg, borderColor: gradientStyle.border }}
      >
        {children}
      </div>
    );

  return wrap(
    <>
      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-bl-full" style={{ background: gradientStyle.circle }} />
      <div className="relative z-10 p-3 sm:p-4 flex flex-col flex-1 min-h-0">
        <div className="flex flex-row items-center justify-between gap-1.5 pb-1.5 sm:pb-2">
          <span className="text-[11px] sm:text-xs font-semibold text-white truncate leading-tight">{card.label}</span>
          <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 shrink-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-end min-h-0">
          <div className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-tight">{mainDisplay}</div>
          <div className="mt-1 min-h-[1.25rem] flex items-center">{subtext}</div>
        </div>
      </div>
    </>
  );
});

const TodayWorkSummary = memo(function TodayWorkSummary({ todayWorkSummary, user, showGreeting = true, onNavigate, onCardClick }) {
  const greeting = getGreeting();
  const displayName = getDisplayName(user);

  if (!todayWorkSummary) {
    return (
      <section className="w-full dashboard-kpi-row">
        {showGreeting && (
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="min-w-0">
              <p className="text-[var(--text-primary)]">
                <span className="text-[13px] font-medium text-[var(--text-secondary)]">{greeting}, </span>
                <span className="section-title text-[20px] md:text-[22px] font-bold">{displayName || 'Salesperson'}</span>
              </p>
              <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">See your personalised performance</p>
            </div>
          </div>
        )}
      </section>
    );
  }

  const runningOrders = todayWorkSummary.runningOrders?.value ?? 0;
  const newLeadsNoFollowUp = todayWorkSummary.newLeadsWithoutFollowUp?.value ?? 0;
  const makeClick = (key) => (onCardClick ? () => onCardClick(key) : undefined);

  const cards = [
    { key: 'todayCalls', label: 'Calls Made', value: todayWorkSummary.todayCalls?.value ?? 0, trend: todayWorkSummary.todayCalls?.trend, icon: Phone, onClick: makeClick('todayCalls') },
    { key: 'todayEnquiries', label: 'Enquiries Generated', value: todayWorkSummary.todayEnquiries?.value ?? 0, trend: todayWorkSummary.todayEnquiries?.trend, icon: Search, onClick: makeClick('todayEnquiries') },
    { key: 'followUpsTaken', label: 'Follow-Ups Taken', value: todayWorkSummary.followUpsTaken?.value ?? 0, trend: todayWorkSummary.followUpsTaken?.trend, icon: ClipboardList, onClick: makeClick('followUpsTaken') },
    { key: 'newLeadsNoFollowUp', label: 'New Leads (No Follow-up)', value: newLeadsNoFollowUp, icon: UserX, onClick: makeClick('newLeadsNoFollowUp') },
    { key: 'newLeadsAdded', label: 'New Leads Added', value: todayWorkSummary.newLeadsAdded?.value ?? 0, trend: todayWorkSummary.newLeadsAdded?.trend, icon: UserPlus, onClick: makeClick('newLeadsAdded') },
    { key: 'quotationCreated', label: 'Quotations Created', value: todayWorkSummary.quotationCreated?.value ?? 0, subValue: todayWorkSummary.quotationCreated?.yesterdayValue ?? null, trend: todayWorkSummary.quotationCreated?.trend, icon: FileText, onClick: makeClick('quotationCreated') },
    { key: 'paymentApprovedToday', label: 'Payment Received', value: Number(todayWorkSummary.paymentApprovedToday?.amount) > 0 ? formatCurrency(todayWorkSummary.paymentApprovedToday?.amount) : '₹0', count: todayWorkSummary.paymentApprovedToday?.value ?? 0, trend: todayWorkSummary.paymentApprovedToday?.trend, runningOrders, icon: IndianRupee, onClick: makeClick('paymentApprovedToday') },
    { key: 'piCreated', label: 'PI', value: todayWorkSummary.piCreated?.value ?? 0, trend: todayWorkSummary.piCreated?.trend, icon: FileCheck, onClick: makeClick('piCreated') },
  ];

  return (
    <section className="w-full dashboard-kpi-row">
      {showGreeting && (
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="min-w-0">
            <p className="text-[var(--text-primary)]">
              <span className="text-[13px] font-medium text-[var(--text-secondary)]">{greeting}, </span>
              <span className="section-title text-[20px] md:text-[22px] font-bold">{displayName}</span>
            </p>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">See your personalised performance</p>
          </div>
        </div>
      )}

      <div className="w-full min-w-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full" style={{ gridTemplateRows: 'auto auto' }}>
          {cards.map((c, i) => (
            <div key={c.key} className="min-w-0 flex flex-1">
              <SummaryCard
                card={c}
                gradientStyle={GRADIENT_STYLES[i]}
                TrendSubtext={TrendSubtext}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default TodayWorkSummary;
