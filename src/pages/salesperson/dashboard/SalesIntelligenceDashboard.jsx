import React, { memo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useGetDashboardSummaryQuery } from '../../../features/dashboard/dashboardApi';
import {
  TodayWorkSummary,
  FollowUpPipeline,
  SalesPipelineSection,
  GeoDistributionCompact,
  TargetRevenueSection,
  TodayPriorityExecution,
  LeadSourceCard,
  RunningOrderSection,
} from './sections';
import SalesIntelligenceSkeleton from './SalesIntelligenceSkeleton';

const CARD_GAP = 'gap-6';

const SalesIntelligenceDashboard = memo(function SalesIntelligenceDashboard({ isDarkMode, onNavigate }) {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const date = dateFilter || new Date().toISOString().slice(0, 10);
  const { data: summary, isLoading, error, refetch } = useGetDashboardSummaryQuery(
    { date },
    { refetchOnMountOrArgChange: 60 }
  );

  const displayDate = dateFilter || new Date().toISOString().slice(0, 10);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();
  const displayName = user?.name || user?.username || user?.displayName || (user?.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : 'Salesperson');

  if (isLoading) {
    return <SalesIntelligenceSkeleton />;
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto dashboard-container salesperson-dashboard-bg">
        <div className="max-w-2xl mx-auto text-center py-16 px-4">
          <p className="text-[var(--text-primary)] text-[15px] font-semibold">
            Failed to load dashboard.
          </p>
          <p className="text-[var(--text-secondary)] text-[13px] mt-1">
            {error?.data?.message || error?.message || 'Please try again.'}
          </p>
          <button type="button" onClick={() => refetch()} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden dashboard-container salesperson-dashboard-bg text-[13px]">
      <div className="dashboard-sections w-full max-w-[1600px] mx-auto min-w-0">
        {/* Greeting row: left = greeting, right = date filter */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-[var(--text-primary)]">
              <span className="text-[13px] font-medium text-[var(--text-primary)]">{greeting}, </span>
              <span className="section-title text-[20px] md:text-[22px] font-bold text-[var(--text-primary)]">{displayName}</span>
            </p>
            <p className="text-[14px] text-[var(--text-primary)] mt-1 font-medium opacity-90">See your personalised performance</p>
          </div>
          <div className="relative shrink-0">
            <span className="text-[11px] font-semibold text-[var(--text-primary)] mr-2 hidden sm:inline">Filter by date</span>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-[var(--text-primary)] hover:bg-slate-50 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              {new Date(displayDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </button>
            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDatePicker(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-1 z-20">
                  <input
                    type="date"
                    value={displayDate}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setShowDatePicker(false);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-800 shadow-lg"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 1. KPI + Follow-up same row (3 col: 2 + 1) */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 ${CARD_GAP} items-stretch`}>
          <div className="min-w-0 lg:col-span-2">
            <TodayWorkSummary
              todayWorkSummary={summary?.todayWorkSummary}
              user={user}
              showGreeting={false}
              onNavigate={onNavigate}
            />
          </div>
          <div className="min-w-0">
            <FollowUpPipeline
              salesPipelineCRM={summary?.salesPipelineCRM}
              followUpIntelligence={summary?.followUpIntelligence}
            />
          </div>
        </div>

        {/* 2. Sales Pipeline (full width) */}
        <SalesPipelineSection
          salesPipelineCRM={summary?.salesPipelineCRM}
          salesPipelineStrip={summary?.salesPipelineStrip}
        />

        {/* 3. Target & Revenue */}
        <TargetRevenueSection
          revenueTarget={summary?.revenueTarget}
          salesPipelineCRM={summary?.salesPipelineCRM}
        />

        {/* 4. Lead Priority */}
        <TodayPriorityExecution
          todayPriority={summary?.todayPriority}
          onNavigate={onNavigate}
          isLoading={false}
        />

        {/* 5. Running Order (from Payment Tracking) */}
        <RunningOrderSection onNavigate={onNavigate} />

        {/* 6. Map | Lead Source */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 ${CARD_GAP}`}>
          <GeoDistributionCompact indiaGeo={summary?.indiaGeo} onNavigate={onNavigate} />
          <LeadSourceCard leadSourceBreakdown={summary?.leadSourceBreakdown} />
        </div>
      </div>
    </main>
  );
});

export default SalesIntelligenceDashboard;
