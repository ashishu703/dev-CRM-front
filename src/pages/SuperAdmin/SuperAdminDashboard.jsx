import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import LeadStatusCards from '../../components/dashboard/LeadStatusCards';
import TargetTimeline from '../../components/dashboard/TargetTimeline';
import KeyPerformanceMetrics from '../../components/dashboard/KeyPerformanceMetrics';
import TopPerformers from '../../components/dashboard/TopPerformers';
import BusinessMetrics from '../../components/dashboard/BusinessMetrics';
import ColorfulPieChart from '../../components/dashboard/ColorfulPieChart';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import salesDataService from '../../services/SalesDataService';
import StatCard from '../../components/dashboard/StatCard';
import { DollarSign, Ticket, CheckCircle, Clock, XCircle, Server } from 'lucide-react';
import paymentService from '../../api/admin_api/paymentService';
import quotationService from '../../api/admin_api/quotationService';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import departmentHeadService from '../../api/admin_api/departmentHeadService';
import { toDateOnly } from '../../utils/dateOnly';

const SALES_TARGET_ACHIEVED_VIDEO_URL =
  'https://res.cloudinary.com/dngojnptn/video/upload/v1767337379/Sales_Target_Achieved_Video_Animation_ycm9sb.mp4';

const SuperAdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState('Select date range');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [salesData, setSalesData] = useState({
    leads: {
      total: 0, pending: 0, running: 0, converted: 0, interested: 0,
      winClosed: 0, closed: 0, lost: 0, meetingScheduled: 0,
      quotationSent: 0, closedLostFollowup: 0
    },
    revenue: {
      target: 0, achieved: 0, daysLeft: 0,
      targetStartDate: null, targetEndDate: null
    },
    metrics: {
      totalLeads: 0, conversionRate: 0, pendingRate: 0, totalRevenue: 0,
      conversionRateChange: 3.2, pendingRateChange: -2.1
    },
    quotations: { total: 0, approved: 0, pending: 0, rejected: 0 },
    proformaInvoices: { total: 0, approved: 0, pending: 0, rejected: 0 },
    payments: { totalAdvance: 0, duePayment: 0, totalSaleOrder: 0, totalReceived: 0 },
    topPerformers: { current: [], previous: [] }
  });

  const [accountsData, setAccountsData] = useState({
    pending: { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 }
  });

  const [itData, setItData] = useState({
    resolved: 0,
    pending: 0,
    inProgress: 0,
    open: 0,
    closed: 0
  });

  const [monthlyHighlight, setMonthlyHighlight] = useState(null);
  const [showMonthlyHighlight, setShowMonthlyHighlight] = useState(false);

  // Month-start full-screen highlights for SuperAdmin (day 1-2 on every login)
  useEffect(() => {
    const run = async () => {
      try {
        const now = new Date();
        if (now.getDate() > 2) return;

        const res = await apiClient.get('/api/reports/monthly-highlights?departmentType=office_sales', false);
        const data = res?.data?.data || res?.data || res || null;
        const hasAchievers = Array.isArray(data?.achievers) && data.achievers.length > 0;
        if (data?.show && data?.highlightType === 'superadmin_team' && hasAchievers) {
          setMonthlyHighlight(data);
          setShowMonthlyHighlight(true);
          const t3 = setTimeout(() => setShowMonthlyHighlight(false), 7000);
          return () => { clearTimeout(t3); };
        }
      } catch {
        // ignore
      }
    };
    run();
  }, []);

  const getEffectiveDateRange = useCallback(() => {
    // If user picked an explicit range, respect it
    if (startDate || endDate) {
      return { start: startDate || null, end: endDate || null };
    }

    const now = new Date();
    const todayStr = toDateOnly(now);

    if (selectedPeriod === 'daily') {
      return { start: todayStr, end: todayStr };
    }

    if (selectedPeriod === 'weekly') {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { start: toDateOnly(start), end: todayStr };
    }

    if (selectedPeriod === 'quarterly') {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      return { start: toDateOnly(start), end: todayStr };
    }

    // Default monthly (also for unknown values)
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: toDateOnly(start), end: todayStr };
  }, [selectedPeriod, startDate, endDate]);

  // OPTIMIZED: Fetch revenue targets with parallel pagination
  const fetchRevenueTargets = useCallback(async () => {
    try {
      // Use the same effective range as Achieved, so Target matches selected month/range
      const effectiveRange = getEffectiveDateRange();
      const rangeStart = effectiveRange?.start ? new Date(`${effectiveRange.start}T00:00:00`) : null;
      const rangeEnd = effectiveRange?.end ? new Date(`${effectiveRange.end}T23:59:59`) : null;

      // Fetch first page to get total pages, then fetch all in parallel
      const firstPageResponse = await departmentHeadService.listHeads({
        page: 1,
        limit: 100,
        departmentType: 'office_sales',
        isActive: true
      });
      
      const pagination = firstPageResponse?.pagination || firstPageResponse?.data?.pagination;
      const totalPages = pagination?.pages || 1;
      const firstPageData = firstPageResponse?.users || firstPageResponse?.data?.users || [];
      
      // If only one page, process and return early
      if (totalPages <= 1) {
        let allSalesHeads = firstPageData;
        
        // Filter to ensure only office_sales department heads
        const officeSalesHeads = allSalesHeads.filter(head => {
          const deptType = head.department_type || head.departmentType || '';
          return deptType.toLowerCase() === 'office_sales';
        });
        
        // Deduplicate by email
        const uniqueHeadsMap = new Map();
        officeSalesHeads.forEach(head => {
          const key = head.email || head.id;
          if (key && !uniqueHeadsMap.has(key)) {
            uniqueHeadsMap.set(key, head);
          }
        });
        const uniqueHeads = Array.from(uniqueHeadsMap.values());
        
        // Aggregate targets
        let totalTarget = 0;
        let earliestStartDate = null;
        let latestEndDate = null;
        
        uniqueHeads.forEach(head => {
          const targetValue = head.target || 0;
          const target = typeof targetValue === 'string' 
            ? parseFloat(targetValue.replace(/,/g, '')) || 0
            : parseFloat(targetValue) || 0;
          
          const startDate = head.target_start_date || head.targetStartDate;
          const endDate = head.target_end_date || head.targetEndDate;

          // Only include targets that belong to the selected month/range
          let include = true;
          if (rangeStart || rangeEnd) {
            const sd = startDate ? new Date(startDate) : null;
            if (sd && !isNaN(sd.getTime())) {
              if (rangeStart && sd < rangeStart) include = false;
              if (rangeEnd && sd > rangeEnd) include = false;
            } else {
              include = false;
            }
          }

          if (include) {
            totalTarget += target;
          }
          
          if (startDate) {
            const start = new Date(startDate);
            if (!earliestStartDate || start < earliestStartDate) {
              earliestStartDate = start;
            }
          }
          
          if (endDate) {
            const end = new Date(endDate);
            if (!latestEndDate || end > latestEndDate) {
              latestEndDate = end;
            }
          }
        });
        
        let daysLeft = 0;
        if (latestEndDate) {
          daysLeft = salesDataService.calculateDaysLeft(toDateOnly(latestEndDate));
        }
        
        setSalesData(prev => ({
          ...prev,
          revenue: {
            ...prev.revenue,
            target: totalTarget,
            targetStartDate: earliestStartDate ? toDateOnly(earliestStartDate) : null,
            targetEndDate: latestEndDate ? toDateOnly(latestEndDate) : null,
            daysLeft: daysLeft
          }
        }));
        return;
      }
      
      // Fetch remaining pages in parallel (skip page 1 as we already have it)
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          departmentHeadService.listHeads({
            page,
            limit: 100,
            departmentType: 'office_sales',
            isActive: true
          })
        );
      }
      
      const remainingResponses = await Promise.all(pagePromises);
      let allSalesHeads = [...firstPageData];
      
      remainingResponses.forEach(response => {
        const heads = response?.users || response?.data?.users || [];
        allSalesHeads = allSalesHeads.concat(heads);
      });
      
      // Filter to ensure only office_sales department heads
      const officeSalesHeads = allSalesHeads.filter(head => {
        const deptType = head.department_type || head.departmentType || '';
        return deptType.toLowerCase() === 'office_sales';
      });
      
      // Deduplicate by email
      const uniqueHeadsMap = new Map();
      officeSalesHeads.forEach(head => {
        const key = head.email || head.id;
        if (key && !uniqueHeadsMap.has(key)) {
          uniqueHeadsMap.set(key, head);
        }
      });
      const uniqueHeads = Array.from(uniqueHeadsMap.values());
      
      // Aggregate targets
      let totalTarget = 0;
      let earliestStartDate = null;
      let latestEndDate = null;
      
      uniqueHeads.forEach(head => {
        const targetValue = head.target || 0;
        const target = typeof targetValue === 'string' 
          ? parseFloat(targetValue.replace(/,/g, '')) || 0
          : parseFloat(targetValue) || 0;
        
        const startDate = head.target_start_date || head.targetStartDate;
        const endDate = head.target_end_date || head.targetEndDate;

        // Only include targets that belong to the selected month/range
        let include = true;
        if (rangeStart || rangeEnd) {
          const sd = startDate ? new Date(startDate) : null;
          if (sd && !isNaN(sd.getTime())) {
            if (rangeStart && sd < rangeStart) include = false;
            if (rangeEnd && sd > rangeEnd) include = false;
          } else {
            include = false;
          }
        }

        if (include) {
          totalTarget += target;
        }
        
        if (startDate) {
          const start = new Date(startDate);
          if (!earliestStartDate || start < earliestStartDate) {
            earliestStartDate = start;
          }
        }
        
        if (endDate) {
          const end = new Date(endDate);
          if (!latestEndDate || end > latestEndDate) {
            latestEndDate = end;
          }
        }
      });
      
      // Calculate days left
      let daysLeft = 0;
      if (latestEndDate) {
        daysLeft = salesDataService.calculateDaysLeft(toDateOnly(latestEndDate));
      }
      
      // Update revenue data
      setSalesData(prev => ({
        ...prev,
        revenue: {
          ...prev.revenue,
          target: totalTarget,
          targetStartDate: earliestStartDate ? toDateOnly(earliestStartDate) : null,
          targetEndDate: latestEndDate ? toDateOnly(latestEndDate) : null,
          daysLeft: daysLeft
        }
      }));
      
    } catch (error) {
      console.error('[SuperAdminDashboard] Error fetching revenue targets:', error);
      setSalesData(prev => ({
        ...prev,
        revenue: {
          ...prev.revenue,
          target: 0,
          targetStartDate: null,
          targetEndDate: null,
          daysLeft: 0
        }
      }));
    }
  }, [getEffectiveDateRange]);

  // OPTIMIZED: Parallel API calls in fetchSalesData with progressive updates
  const fetchSalesData = useCallback(async () => {
    setRefreshing(true);
    try {
      const effectiveRange = getEffectiveDateRange();

      // Step 1: Fetch leads
      const allLeads = await salesDataService.fetchAllLeads('office_sales');
      const leadStatuses = salesDataService.calculateLeadStatuses(allLeads);
      const leadIds = allLeads.map(l => l.id).filter(id => id != null);
      
      // Update leads immediately (progressive loading)
      setSalesData(prev => ({
        ...prev,
        leads: leadStatuses,
        metrics: {
          ...prev.metrics,
          totalLeads: leadStatuses.total
        }
      }));
      
      // Step 2: Fetch quotations (depends on leadIds)
      const allQuotations = await salesDataService.fetchQuotations(leadIds);
      const quotations = salesDataService.calculateQuotationMetrics(allQuotations);
      leadStatuses.quotationSent = quotations.total;
      const quotationIds = allQuotations.map(q => q.id).filter(id => id != null);
      
      // Update quotations immediately
      setSalesData(prev => ({
        ...prev,
        quotations,
        leads: { ...prev.leads, quotationSent: quotations.total }
      }));
      
      // Step 3: Parallel fetch of payments and PIs (skip summaries for now)
      const [allPayments, allPIs] = await Promise.all([
        salesDataService.fetchPayments(quotationIds, leadIds),
        salesDataService.fetchProformaInvoices(quotationIds)
      ]);
      
      const proformaInvoices = salesDataService.calculatePIMetrics(allPIs);
      const quotationIdsWithPI = new Set(allPIs.map(pi => pi.quotation_id).filter(id => id != null));
      const quotationsWithPI = allQuotations.filter(q => quotationIdsWithPI.has(q.id));
      
      // Update PIs immediately
      setSalesData(prev => ({
        ...prev,
        proformaInvoices,
        payments: {
          ...prev.payments,
          totalSaleOrder: quotationIdsWithPI.size
        }
      }));
      
      // Step 4: Calculate payment metrics (fast)
      const { totalReceived, totalAdvance } = salesDataService.calculatePaymentMetrics(
        allPayments,
        quotationsWithPI,
        allQuotations,
        { startDate: effectiveRange.start, endDate: effectiveRange.end }
      );
      const { conversionRate, pendingRate } = salesDataService.calculateMetrics(leadStatuses);
      
      // Update payment metrics immediately
      setSalesData(prev => ({
        ...prev,
        revenue: {
          ...prev.revenue,
          achieved: totalReceived,
        },
        metrics: {
          ...prev.metrics,
          conversionRate,
          pendingRate,
          totalRevenue: totalReceived,
          conversionRateChange: 3.2,
          pendingRateChange: -2.1
        },
        payments: {
          ...prev.payments,
          totalAdvance,
          totalReceived
        }
      }));
      
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      currentMonthEnd.setHours(23, 59, 59, 999);

      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      prevMonthEnd.setHours(23, 59, 59, 999);

      // Step 5: Heavy calculations in background (non-blocking)
      // Calculate duePayment and topPerformers asynchronously
      Promise.all([
        salesDataService.calculateDuePayment(quotationsWithPI, allQuotations, allPayments),
        salesDataService.calculateTopPerformers(allPayments, allLeads, allQuotations, 'office_sales', {
          startDate: toDateOnly(currentMonthStart),
          endDate: toDateOnly(currentMonthEnd)
        }),
        salesDataService.calculateTopPerformers(allPayments, allLeads, allQuotations, 'office_sales', {
          startDate: toDateOnly(prevMonthStart),
          endDate: toDateOnly(prevMonthEnd)
        })
      ]).then(([duePayment, topPerformersCurrent, topPerformersPrevious]) => {
        setSalesData(prev => ({
          ...prev,
          payments: {
            ...prev.payments,
            duePayment
          },
          topPerformers: {
            current: topPerformersCurrent,
            previous: topPerformersPrevious
          }
        }));
      }).catch(error => {
        console.error('[SuperAdminDashboard] Error in heavy calculations:', error);
      });
      
    } catch (error) {
      console.error('[SuperAdminDashboard] Error fetching sales data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getEffectiveDateRange]);

  const formatDisplayRange = useCallback((start, end) => {
    if (!start && !end) return 'Select date range';
    if (start && end) return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
    if (start) return `${new Date(start).toLocaleDateString()} - ...`;
    return `... - ${new Date(end).toLocaleDateString()}`;
  }, []);

  // OPTIMIZED: Parallel fetch for accounts data
  const fetchAccountsData = useCallback(async () => {
    try {
      const statuses = ['pending', 'approved', 'rejected'];
      const responses = await Promise.all(
        statuses.map((status) =>
          paymentService.getAllPayments({ approvalStatus: status, limit: 1 })
        )
      );

      const nextStats = {};
      responses.forEach((res, idx) => {
        const status = statuses[idx];
        const rows = Array.isArray(res?.data) ? res.data : [];
        const total = res?.pagination?.total ?? rows.length;
        const totalAmount = rows.reduce((sum, row) => sum + Number(row.installment_amount || 0), 0);
        nextStats[status] = { count: total, amount: totalAmount };
      });
      setAccountsData(nextStats);
    } catch (err) {
      console.error('Failed to load accounts stats', err);
      setAccountsData({
        pending: { count: 0, amount: 0 },
        approved: { count: 0, amount: 0 },
        rejected: { count: 0, amount: 0 }
      });
    }
  }, []);

  const fetchITData = useCallback(async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TICKETS_LIST());
      const tickets = response?.data || response || [];
      
      const stats = {
        resolved: tickets.filter(t => (t.status || '').toLowerCase() === 'resolved').length,
        pending: tickets.filter(t => {
          const status = (t.status || '').toLowerCase();
          return status === 'open' || status === 'pending';
        }).length,
        inProgress: tickets.filter(t => (t.status || '').toLowerCase() === 'in progress').length,
        open: tickets.filter(t => (t.status || '').toLowerCase() === 'open').length,
        closed: tickets.filter(t => (t.status || '').toLowerCase() === 'closed').length
      };
      
      setItData(stats);
    } catch (err) {
      console.error('Failed to load IT stats', err);
      setItData({
        resolved: 0,
        pending: 0,
        inProgress: 0,
        open: 0,
        closed: 0
      });
    }
  }, []);

  const applyDateRange = useCallback(() => {
    setDateRange(formatDisplayRange(startDate, endDate));
    setShowDatePicker(false);
    // Refresh all data in parallel
    Promise.all([
      fetchSalesData(),
      fetchAccountsData(),
      fetchITData(),
      fetchRevenueTargets()
    ]);
  }, [startDate, endDate, formatDisplayRange, fetchSalesData, fetchAccountsData, fetchITData, fetchRevenueTargets]);

  const clearDateRange = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setDateRange('Select date range');
    setShowDatePicker(false);
    // Refresh all data in parallel
    Promise.all([
      fetchSalesData(),
      fetchAccountsData(),
      fetchITData(),
      fetchRevenueTargets()
    ]);
  }, [fetchSalesData, fetchAccountsData, fetchITData, fetchRevenueTargets]);

  // OPTIMIZED: Memoized chart data calculation with vibrant colors
  const leadStatusChartData = useMemo(() => {
    return [
      { label: 'Pending', value: salesData.leads.pending || 0, color: '#667eea' },
      { label: 'Running', value: salesData.leads.running || 0, color: '#4facfe' },
      { label: 'Converted', value: salesData.leads.converted || 0, color: '#43e97b' },
      { label: 'Interested', value: salesData.leads.interested || 0, color: '#fa709a' },
      { label: 'Win/Closed', value: salesData.leads.winClosed || 0, color: '#38f9d7' },
      { label: 'Closed', value: salesData.leads.closed || 0, color: '#764ba2' },
      { label: 'Lost', value: salesData.leads.lost || 0, color: '#f5576c' }
    ].filter(item => item.value > 0);
  }, [salesData.leads]);

  // OPTIMIZED: Memoized total chart value
  const totalChartValue = useMemo(() => {
    return leadStatusChartData.reduce((sum, item) => sum + item.value, 0);
  }, [leadStatusChartData]);

  // OPTIMIZED: Memoized refresh handler
  const handleRefresh = useCallback(() => {
    Promise.all([
      fetchSalesData(),
      fetchAccountsData(),
      fetchITData(),
      fetchRevenueTargets()
    ]);
  }, [fetchSalesData, fetchAccountsData, fetchITData, fetchRevenueTargets]);

  // Initial data load
  useEffect(() => {
    let isMounted = true;
    
    const loadAllData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchSalesData(),
          fetchAccountsData(),
          fetchITData(),
          fetchRevenueTargets()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };
    
    loadAllData();
    
    return () => {
      isMounted = false;
    };
  }, [selectedPeriod, fetchSalesData, fetchAccountsData, fetchITData, fetchRevenueTargets]);

  // Show skeleton loader instead of spinner
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {showMonthlyHighlight && monthlyHighlight?.highlightType === 'superadmin_team' && (
        <div className="fixed inset-0 z-[99999]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowMonthlyHighlight(false)}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <video
                src={SALES_TARGET_ACHIEVED_VIDEO_URL}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                onEnded={() => setShowMonthlyHighlight(false)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/40" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="max-w-4xl">
                  <div className="text-white text-3xl font-extrabold">Congratulations to Achievers!</div>
                  <div className="text-white/90 text-sm mt-2">
                    {monthlyHighlight?.title || 'Previous month target achievements'}
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
                    <div className="text-sm font-semibold">Achieved Target</div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {(monthlyHighlight.achievers || []).slice(0, 10).map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{p.username || p.email}</span>
                          <span className="text-white/90">₹{Number(p.achieved || 0).toLocaleString('en-IN')} / ₹{Number(p.target || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowMonthlyHighlight(false)}
                      className="px-5 py-2.5 text-sm font-semibold rounded-xl shadow-lg border text-white border-white/25 bg-white/10 hover:bg-white/15"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 shadow-lg transition-all duration-200 font-medium"
              style={{
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
              }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span style={{ fontFamily: 'Inter, sans-serif' }}>Refresh</span>
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-sm text-gray-700 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Live Updates</span>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 backdrop-blur-sm shadow-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className="bg-white/90 backdrop-blur-sm border border-gray-300 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-60 text-left shadow-sm font-medium hover:bg-white transition-all duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {dateRange}
              </button>
              {showDatePicker && (
                <div className="absolute z-20 mt-2 right-0 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-5 w-64" style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-4">
                    <button onClick={clearDateRange} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Clear</button>
                    <button onClick={() => setShowDatePicker(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                    <button onClick={applyDateRange} className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium shadow-md transition-all duration-200" style={{ fontFamily: 'Inter, sans-serif' }}>Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>Sales Department</h2>
            <p className="text-sm text-gray-600 mt-0.5">Performance metrics and analytics</p>
          </div>
        </div>
        
        <LeadStatusCards leads={salesData.leads} />
        <TargetTimeline revenue={salesData.revenue} />
        <KeyPerformanceMetrics metrics={salesData.metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ColorfulPieChart
            title="Total Leads Distribution"
            data={leadStatusChartData}
            total={totalChartValue || salesData.leads.total || 0}
          />
          <TopPerformers performers={salesData.topPerformers} />
        </div>

        <BusinessMetrics
          quotations={salesData.quotations}
          proformaInvoices={salesData.proformaInvoices}
          payments={salesData.payments}
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>Accounts Department</h2>
            <p className="text-sm text-gray-600 mt-0.5">Payment tracking and financial overview</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Pending Payments" 
            value={accountsData.pending.count} 
            icon={Clock} 
            color={{ bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', value: 'text-amber-600' }} 
            description={`₹${accountsData.pending.amount.toLocaleString('en-IN')} pending approval`} 
          />
          <StatCard 
            title="Approved Payments" 
            value={accountsData.approved.count} 
            icon={CheckCircle} 
            color={{ bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', value: 'text-emerald-600' }} 
            description={`₹${accountsData.approved.amount.toLocaleString('en-IN')} approved`} 
          />
          <StatCard 
            title="Rejected Payments" 
            value={accountsData.rejected.count} 
            icon={XCircle} 
            color={{ bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', value: 'text-rose-600' }} 
            description={`₹${accountsData.rejected.amount.toLocaleString('en-IN')} rejected`} 
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>IT Department</h2>
            <p className="text-sm text-gray-600 mt-0.5">System health and ticket management</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Resolved Tickets" 
            value={itData.resolved} 
            icon={CheckCircle} 
            color={{ bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', value: 'text-emerald-600' }} 
            description="Tickets resolved" 
          />
          <StatCard 
            title="Pending Tickets" 
            value={itData.pending} 
            icon={Clock} 
            color={{ bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', value: 'text-amber-600' }} 
            description="Tickets pending" 
          />
          <StatCard 
            title="In Progress" 
            value={itData.inProgress} 
            icon={Ticket} 
            color={{ bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', value: 'text-blue-600' }} 
            description="Tickets in progress" 
          />
          <StatCard 
            title="Open Tickets" 
            value={itData.open} 
            icon={Ticket} 
            color={{ bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', value: 'text-indigo-600' }} 
            description="Open tickets" 
          />
          <StatCard 
            title="Closed Tickets" 
            value={itData.closed} 
            icon={CheckCircle} 
            color={{ bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', value: 'text-slate-600' }} 
            description="Closed tickets" 
          />
        </div>
      </div>
    </div>
  );
};

export default memo(SuperAdminDashboard);
