import React, { memo, useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useGetDashboardSummaryQuery } from '../../../features/dashboard/dashboardApi';
import { useGetDepartmentUsersByHeadIdQuery, useListDepartmentUsersQuery } from '../../../features/departmentUsers/departmentUsersApi';
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
import { createDashboardCardHandler } from './utils/dashboardNavigation';

const CARD_GAP = 'gap-6';
const SALES_DEPARTMENT_TYPES = ['office_sales', 'telesales', 'marketing_sales'];

const SalesIntelligenceDashboard = memo(function SalesIntelligenceDashboard({
  isDarkMode,
  onNavigate,
  mode = 'salesperson',
}) {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSalespersonId, setSelectedSalespersonId] = useState('');

  const isHead = mode === 'head';
  const isSuperAdmin = mode === 'superadmin';
  const showSalespersonFilter = isHead || isSuperAdmin;

  const date = dateFilter || new Date().toISOString().slice(0, 10);
  const queryParams = useMemo(() => {
    const p = { date };
    if (showSalespersonFilter && selectedSalespersonId) p.userId = selectedSalespersonId;
    return p;
  }, [date, showSalespersonFilter, selectedSalespersonId]);

  const { data: summary, isLoading, error, refetch } = useGetDashboardSummaryQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const { data: headUsersData } = useGetDepartmentUsersByHeadIdQuery(user?.id, {
    skip: !isHead || !user?.id,
  });
  const { data: listUsersData } = useListDepartmentUsersQuery(
    { limit: 300 },
    { skip: !isSuperAdmin }
  );

  const headUsers = headUsersData?.users ?? headUsersData?.data?.users ?? [];
  const listUsers = listUsersData?.users ?? listUsersData?.data?.users ?? [];

  const salespersonOptions = useMemo(() => {
    const toId = (u) => String(u?.id ?? u?._id ?? u?.userId ?? '');
    const toName = (u) => (u?.name || u?.username || u?.email || 'Unknown').trim() || 'Unknown';
    if (isHead && headUsers.length) {
      return headUsers.map((u) => ({ id: toId(u), name: toName(u) })).filter((o) => o.id);
    }
    if (isSuperAdmin && listUsers.length) {
      return listUsers
        .filter((u) => SALES_DEPARTMENT_TYPES.includes((u.departmentType || u.department_type || '').toLowerCase()))
        .map((u) => ({ id: toId(u), name: toName(u) }))
        .filter((o) => o.id);
    }
    return [];
  }, [isHead, isSuperAdmin, headUsers, listUsers]);

  const displayDate = dateFilter || new Date().toISOString().slice(0, 10);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const selectedOption = salespersonOptions.find((o) => String(o.id) === String(selectedSalespersonId));
  const displayName =
    mode === 'salesperson'
      ? user?.name || user?.username || user?.displayName || (user?.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : 'Salesperson')
      : selectedSalespersonId
        ? (selectedOption?.name || 'Salesperson')
        : isSuperAdmin
          ? 'Superadmin'
          : (user?.name || user?.username || user?.displayName || (user?.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : 'Department Head'));
  const subtitle =
    mode === 'salesperson'
      ? 'See your personalised performance'
      : selectedSalespersonId
        ? 'Individual performance'
        : 'Overall Sales Performance';

  const navigate = onNavigate || (() => {});
  const onCardClick = useMemo(
    () => createDashboardCardHandler(mode, navigate, date),
    [mode, navigate, date]
  );

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
      <div className="dashboard-sections w-full max-w-[1600px] mx-auto min-w-0 px-3 sm:px-4 md:px-6 pb-6">
        {/* Greeting row: left = greeting + name, right = filters (salesperson + date) */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-[var(--text-primary)]">
              <span className="text-[13px] font-medium text-[var(--text-primary)]">{greeting}, </span>
              <span className="section-title text-[20px] md:text-[22px] font-bold text-[var(--text-primary)]">{displayName}</span>
            </p>
            <p className="text-[14px] text-[var(--text-primary)] mt-1 font-medium opacity-90">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {showSalespersonFilter && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[var(--text-primary)] hidden sm:inline">Salesperson</span>
                <select
                  value={selectedSalespersonId}
                  onChange={(e) => setSelectedSalespersonId(e.target.value)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-[var(--text-primary)] hover:bg-slate-50 shadow-sm min-w-[140px]"
                >
                  <option value="">Overall</option>
                  {salespersonOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
        </div>

        {/* 1. KPI + Follow-up same row (3 col: 2 + 1) */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 ${CARD_GAP} items-stretch`}>
          <div className="min-w-0 lg:col-span-2">
            <TodayWorkSummary
              todayWorkSummary={summary?.todayWorkSummary}
              user={user}
              showGreeting={false}
              onCardClick={onCardClick}
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
          onStageClick={(stageKey) => onCardClick(null, stageKey)}
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
