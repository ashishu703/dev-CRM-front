import React, { memo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useGetDashboardSummaryQuery } from '../../../features/dashboard/dashboardApi';
import {
  TodayWorkSummary,
  FollowUpIntelligence,
  SalesPipelineStrip,
  GeoDistributionCompact,
  TargetAchievementBreakdown,
  TodayPriorityExecution,
  MoneyControlPanel,
  StuckDealsCard,
  LeadSourceCard,
  RevenueTargetEngine,
  RiskAlertPanel,
} from './sections';
import SalesIntelligenceSkeleton from './SalesIntelligenceSkeleton';

const SalesIntelligenceDashboard = memo(function SalesIntelligenceDashboard({ isDarkMode, onNavigate }) {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState(null);

  const { data: summary, isLoading, error, refetch } = useGetDashboardSummaryQuery(undefined, {
    refetchOnMountOrArgChange: 60,
  });

  if (isLoading) {
    return <SalesIntelligenceSkeleton />;
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto dashboard-container salesperson-dashboard-bg">
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-[var(--danger-600)] text-[14px] font-medium">
            Failed to load dashboard. {error?.data?.message || error?.message || 'Please try again.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden dashboard-container salesperson-dashboard-bg text-[13px]">
      <div className="w-full max-w-[1600px] mx-auto min-w-0 dashboard-sections">
        <TodayWorkSummary
          todayWorkSummary={summary?.todayWorkSummary}
          user={user}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          onNavigate={onNavigate}
        />

        {/* Two columns: left + right – 8px spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8 min-w-0">
            <FollowUpIntelligence followUpIntelligence={summary?.followUpIntelligence} />
            <TodayPriorityExecution todayPriority={summary?.todayPriority} onNavigate={onNavigate} isLoading={false} />
            <TargetAchievementBreakdown revenueTarget={summary?.revenueTarget} />
          </div>
          <div className="flex flex-col gap-8 min-w-0">
            <GeoDistributionCompact indiaGeo={summary?.indiaGeo} onNavigate={onNavigate} />
            <SalesPipelineStrip salesPipelineStrip={summary?.salesPipelineStrip} salesPipelineCRM={summary?.salesPipelineCRM} />
          </div>
        </div>

        {/* Risk + Money + Revenue section */}
        <div className="section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StuckDealsCard stuckDealsByDays={summary?.leadIntelligence?.stuckDealsByDays} onNavigate={onNavigate} />
            <div className="flex flex-col gap-8 min-w-0">
              <MoneyControlPanel paymentRisk={summary?.paymentRisk} />
              <LeadSourceCard leadSourceBreakdown={summary?.leadSourceBreakdown} />
            </div>
          </div>
          <RevenueTargetEngine revenueTarget={summary?.revenueTarget} salesPipelineCRM={summary?.salesPipelineCRM} />
          <RiskAlertPanel summary={summary} />
        </div>
      </div>
    </main>
  );
});

export default SalesIntelligenceDashboard;
