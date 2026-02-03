"use client"

import { TrendingUp, CheckCircle, Clock, CreditCard, UserPlus, CalendarCheck, ArrowUp, XCircle, PhoneOff, Target, BarChart3, PieChart as PieChartIcon, Activity, Award, TrendingDown, ArrowRightLeft, Calendar, FileText, FileCheck, FileX, Receipt, ShoppingCart, DollarSign, RefreshCw } from "lucide-react"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import apiClient from '../../utils/apiClient'
import { API_ENDPOINTS } from '../../api/admin_api/api'
import quotationService from '../../api/admin_api/quotationService'
import paymentService from '../../api/admin_api/paymentService'
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService'
import departmentUserService from '../../api/admin_api/departmentUserService'
import { useAuth } from '../../hooks/useAuth'
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton'
import { toDateOnly } from '../../utils/dateOnly'
import {
  QuotationTrendsChart,
  ProformaInvoiceDistributionChart,
  LeadSourcesChart,
  WeeklyLeadsActivityChart,
  SalesOrderProgressChart,
  PaymentsTrendChart,
  PaymentDistributionChart,
  PaymentDueRatioChart,
  MonthlyRevenueTrendChart,
  RevenueDistributionChart,
  LeadConversionFunnelChart,
  SalesPipelineDonutChart,
  SalesVsTargetChart,
  OutstandingPaymentAgingChart
} from '../../components/dashboard/ChartJSCharts'

const MS_IN_DAY = 24 * 60 * 60 * 1000

const SALES_TARGET_ACHIEVED_VIDEO_URL =
  'https://res.cloudinary.com/dngojnptn/video/upload/v1767337379/Sales_Target_Achieved_Video_Animation_ycm9sb.mp4'

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

function Card({ className, style, children, isDarkMode = false }) {
  return <div
    className={cx(
      "rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl",
      !style && (isDarkMode ? "bg-gray-800 border-gray-700 shadow-lg" : "bg-white border-gray-200 shadow-md hover:shadow-2xl"),
      className
    )}
    style={style}
  >{children}</div>
}

function CardHeader({ className, children }) {
  return <div className={cx("p-4", className)}>{children}</div>
}

function CardTitle({ className, children, isDarkMode = false }) {
  return <div className={cx(
    "text-base font-semibold",
    isDarkMode ? "text-white" : "text-gray-900",
    className
  )}>{children}</div>
}

function CardContent({ className, children }) {
  return <div className={cx("p-4 pt-0", className)}>{children}</div>
}


export default function DashboardContent({ isDarkMode = false }) {
  const { user } = useAuth()
  const [overviewDateFilter, setOverviewDateFilter] = useState('')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [allPayments, setAllPayments] = useState([])
  const [allQuotations, setAllQuotations] = useState([])
  const [allPIs, setAllPIs] = useState([])
  const [monthlyHighlight, setMonthlyHighlight] = useState(null)
  const [showMonthlyHighlight, setShowMonthlyHighlight] = useState(false)
  
  // User target state
  const [userTarget, setUserTarget] = useState({
    target: 0,
    achievedTarget: 0,
    targetStartDate: null,
    targetEndDate: null,
    targetDurationDays: null
  })
  
  // New metrics state
  const [businessMetrics, setBusinessMetrics] = useState({
    totalQuotation: 0,
    approvedQuotation: 0,
    pendingQuotation: 0,
    totalPI: 0,
    approvedPI: 0,
    pendingPI: 0,
    totalAdvancePayment: 0,
    duePayment: 0,
    totalSaleOrder: 0,
    totalReceivedPayment: 0,
    totalRevenue: 0
  })
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  const getCalendarDaysRemaining = (targetDate) => {
    if (!targetDate || isNaN(targetDate.getTime())) return 0
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    if (endDay < today) return 0
    const diffTime = endDay - today
    return Math.max(0, Math.round(diffTime / MS_IN_DAY))
  }

  // Fetch real leads from API - with cache busting to ensure fresh data
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      // Add timestamp to prevent caching
      const url = `${API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME()}?_t=${Date.now()}`;
      const leadsResponse = await apiClient.get(url)
      const assignedLeads = leadsResponse?.data || []
      
      // Transform API data to match our format
      const transformedLeads = assignedLeads.map(lead => ({
        id: lead.id,
        name: lead.name,
        sales_status: lead.sales_status || lead.salesStatus || 'pending',
        source: lead.lead_source || lead.leadSource || 'Unknown',
        created_at: lead.created_at || lead.createdAt || lead.date || new Date().toISOString()
      }))
      
      setLeads(transformedLeads)
      setError(null)
    } catch (err) {
      console.error('[Dashboard] Error loading leads:', err)
      setError('Failed to load leads data')
      setLeads([])
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [])

  // Month-start highlight (achievers only) - shown only on day 1-2 (show on every login during the window)
  useEffect(() => {
    const run = async () => {
      try {
        const now = new Date()
        if (now.getDate() > 2) return

        const res = await apiClient.get('/api/reports/monthly-highlights')
        const data = res?.data?.data || res?.data || null
        const isAchiever = data?.highlightType === 'winner' || data?.highlightType === 'achieved'
        if (data?.show && isAchiever) {
          setMonthlyHighlight(data)
          setShowMonthlyHighlight(true)
          const t3 = setTimeout(() => setShowMonthlyHighlight(false), 7000)
          return () => {
            clearTimeout(t3)
          }
        }
      } catch {
        // ignore
      }
    }
    run()
  }, [user?.id])

  // Fetch user target data
  const fetchUserTarget = useCallback(async () => {
    try {
      // When department_user calls listUsers, it automatically filters by their email
      const response = await departmentUserService.listUsers({ page: 1, limit: 1 })
      const payload = response?.data || response
      const users = payload?.users || []
      
      if (users.length > 0) {
        const user = users[0]
        const next = {
          target: parseFloat(user.target || 0),
          achievedTarget: parseFloat(user.achievedTarget || user.achieved_target || 0),
          targetStartDate: user.targetStartDate || user.target_start_date || null,
          targetEndDate: user.targetEndDate || user.target_end_date || null,
          targetDurationDays: user.targetDurationDays || user.target_duration_days || null
        }
        setUserTarget(next)
        return next
      }
      const empty = {
        target: 0,
        achievedTarget: 0,
        targetStartDate: null,
        targetEndDate: null,
        targetDurationDays: null
      }
      setUserTarget(empty)
      return empty
    } catch (err) {
      console.error('Error fetching user target:', err)
      // Set defaults on error
      const empty = {
        target: 0,
        achievedTarget: 0,
        targetStartDate: null,
        targetEndDate: null,
        targetDurationDays: null
      }
      setUserTarget(empty)
      return empty
    }
  }, [])

  // OPTIMIZED: Fetch business metrics - reuse leads from state if available, parallel API calls
  const fetchBusinessMetrics = useCallback(async (leadsData = null, targetWindow = null) => {
    try {
      setLoadingMetrics(true)
      
      // OPTIMIZED: Reuse leads from state if available, otherwise fetch with cache busting
      let assignedLeads = leadsData || leads
      if (!assignedLeads || assignedLeads.length === 0) {
        const url = `${API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME()}?_t=${Date.now()}`;
        const leadsResponse = await apiClient.get(url)
        const rawLeads = leadsResponse?.data || []
        // Transform if needed (if coming from API directly)
        assignedLeads = rawLeads.map(lead => ({
          id: lead.id,
          name: lead.name,
          sales_status: lead.sales_status || lead.salesStatus || 'pending',
          source: lead.lead_source || lead.leadSource || 'Unknown',
          created_at: lead.created_at || lead.createdAt || lead.date || new Date().toISOString()
        }))
      }
      
      const leadIds = assignedLeads.map(lead => lead.id)
      
      if (leadIds.length === 0) {
        setLoadingMetrics(false)
        setAllPayments([])
        return
      }
      
      // OPTIMIZED: Fetch quotations, payments, and PIs in parallel
      const [quotationsResult, paymentsByCustomersResult] = await Promise.all([
        quotationService.getBulkQuotationsByCustomers(leadIds).catch(err => {
          console.error('Error fetching bulk quotations:', err)
          return { data: [] }
        }),
        paymentService.getBulkPaymentsByCustomers(leadIds).catch(err => {
          console.error('Error fetching bulk payments by customers:', err)
          return { data: [] }
        })
      ])
      
      const allQuotations = quotationsResult?.data || []
      setAllQuotations(allQuotations)
      const quotationIds = allQuotations.map(q => q.id)
      
      // OPTIMIZED: Fetch payments by quotations and PIs in parallel
      const [paymentsByQuotationsResult, pisResult] = await Promise.all([
        quotationIds.length > 0 
          ? paymentService.getBulkPaymentsByQuotations(quotationIds).catch(err => {
              console.error('Error fetching bulk payments by quotations:', err)
              return { data: [] }
            })
          : Promise.resolve({ data: [] }),
        quotationIds.length > 0
          ? proformaInvoiceService.getBulkPIsByQuotations(quotationIds).catch(err => {
              console.error('Error fetching bulk PIs:', err)
              return { data: [] }
            })
          : Promise.resolve({ data: [] })
      ])
      
      // Combine payments from both sources
      const allPayments = []
      const paymentsByCustomers = Array.isArray(paymentsByCustomersResult?.data) ? paymentsByCustomersResult.data : []
      const paymentsByQuotations = Array.isArray(paymentsByQuotationsResult?.data) ? paymentsByQuotationsResult.data : []
      
      allPayments.push(...paymentsByCustomers)
      
      // Add payments that aren't already in allPayments
      paymentsByQuotations.forEach(p => {
        const exists = allPayments.some(ap => ap.id === p.id || 
          (ap.payment_reference && p.payment_reference && ap.payment_reference === p.payment_reference))
        if (!exists) {
          allPayments.push(p)
        }
      })
      
      // Store payments for monthly revenue calculation
      setAllPayments(allPayments)
      
      // Use allPayments variable for rest of the function
      const fetchedPayments = allPayments
      
      // Get PIs
      const allPIs = pisResult?.data || []
      setAllPIs(allPIs)

      // Set of quotation IDs which have at least one PI (used for Sale Order count)
      const quotationIdsWithPI = new Set(
        allPIs
          .map((pi) => pi.quotation_id)
          .filter((id) => id != null)
      )
      
      // Calculate quotation metrics
      const totalQuotation = allQuotations.length
      const approvedQuotation = allQuotations.filter(q => {
        const status = (q.status || '').toLowerCase()
        return status === 'approved'
      }).length
      const pendingQuotation = allQuotations.filter(q => {
        const status = (q.status || '').toLowerCase()
        return status === 'pending_approval' || status === 'pending' || status === 'draft'
      }).length
      const rejectedQuotation = allQuotations.filter(q => {
        const status = (q.status || '').toLowerCase()
        return status === 'rejected'
      }).length
      
      // Calculate PI metrics
      const totalPI = allPIs.length
      const approvedPI = allPIs.filter(pi => {
        const status = (pi.status || '').toLowerCase()
        return status === 'approved'
      }).length
      const pendingPI = allPIs.filter(pi => {
        const status = (pi.status || '').toLowerCase()
        return status === 'pending_approval' || status === 'pending'
      }).length
      const rejectedPI = allPIs.filter(pi => {
        const status = (pi.status || '').toLowerCase()
        return status === 'rejected'
      }).length
      
      // Calculate payment metrics - improved calculation with date range filtering
      // Filter completed/paid payments and apply date range filter if target dates are set
      // ONLY count APPROVED payments (approved by accounts department)
      let completedPayments = allPayments.filter(p => {
        const status = (p.payment_status || p.status || '').toLowerCase()
        // Check approval status - ONLY count approved payments
        const approvalStatus = (p.approval_status || '').toLowerCase()
        const isApproved = approvalStatus === 'approved'
        // Only count completed/advance payments that are not refunds AND are approved
        const isRefund = p.is_refund === true || p.is_refund === 1
        return (status === 'completed' || status === 'paid' || status === 'success' || status === 'advance') && !isRefund && isApproved
      })
      
      // Apply date range filter if user has target dates
      const startDateStr = targetWindow?.targetStartDate || userTarget.targetStartDate
      const endDateStr = targetWindow?.targetEndDate || userTarget.targetEndDate
      if (startDateStr && endDateStr) {
        
        completedPayments = completedPayments.filter(p => {
          // Compare date-only strings to avoid timezone shifts
          const raw = p.payment_date || p.paymentDate || null
          if (!raw) return false
          const pd = toDateOnly(raw)
          if (!pd) return false
          return pd >= startDateStr && pd <= endDateStr
        })
      }
      
      // Calculate total received payment (all completed payments within date range)
      // Use installment_amount as primary field (matches backend calculation)
      const totalReceivedPayment = completedPayments.reduce((sum, p) => {
        const amount = Number(
          p.installment_amount ||  // Primary field - matches backend
          p.paid_amount || 
          p.amount || 
          p.payment_amount ||
          0
        )
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
      
      // Calculate advance payment (first payment or payments marked as advance)
      // Advance payment = first payment of each quotation OR payments with status 'advance'
      // We need to track the first payment per quotation/lead to avoid double counting
      const firstPaymentMap = new Map() // key: quotation_id or lead_id, value: { amount, payment_date }
      const advancePaymentsList = [] // List of all advance payments to sum
      
      completedPayments.forEach(p => {
        const key = p.quotation_id || `lead_${p.lead_id}`
        const status = (p.payment_status || p.status || '').toLowerCase()
        const paymentDate = p.payment_date ? new Date(p.payment_date) : new Date(0)
        const amount = Number(p.installment_amount || p.paid_amount || p.amount || p.payment_amount || 0)
        
        // Check if this is an advance payment
        const isExplicitAdvance = status === 'advance' || p.is_advance === true || p.payment_type === 'advance'
        const isFirstPayment = p.installment_number === 1 || p.installment_number === 0
        
        if (isExplicitAdvance) {
          // Explicitly marked as advance - always count
          advancePaymentsList.push(amount)
        } else if (isFirstPayment) {
          // First payment - check if we already have a first payment for this quotation/lead
          if (!firstPaymentMap.has(key)) {
            firstPaymentMap.set(key, { amount, paymentDate })
            advancePaymentsList.push(amount)
          } else {
            // Compare dates - use the earliest payment as first payment
            const existing = firstPaymentMap.get(key)
            if (paymentDate < existing.paymentDate) {
              // Remove old amount and add new one
              const oldIndex = advancePaymentsList.indexOf(existing.amount)
              if (oldIndex > -1) {
                advancePaymentsList.splice(oldIndex, 1)
              }
              firstPaymentMap.set(key, { amount, paymentDate })
              advancePaymentsList.push(amount)
            }
          }
        }
      })
      
      // Sum all advance payments
      const totalAdvancePayment = advancePaymentsList.reduce((sum, amount) => {
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
      
      // Calculate due payments (remaining amounts from approved quotations)
      // Calculate for ALL approved quotations with date range filtered payments
      let duePayment = 0
      let totalRevenue = 0
      
      // Prepare date range filter
      let dateFilter = null
      if (startDateStr && endDateStr) {
        dateFilter = { startDateStr, endDateStr }
      }
      
      // OPTIMIZED: Use already fetched PIs instead of making N+1 queries
      // Create a map of quotation_id -> PIs for quick lookup
      const pisByQuotationIdMap = new Map();
      allPIs.forEach(pi => {
        if (pi.quotation_id) {
          if (!pisByQuotationIdMap.has(pi.quotation_id)) {
            pisByQuotationIdMap.set(pi.quotation_id, []);
          }
          pisByQuotationIdMap.get(pi.quotation_id).push(pi);
        }
      });
      
      for (const quotation of allQuotations) {
        const status = (quotation.status || '').toLowerCase()
        if (status === 'approved') {
          // OPTIMIZED: Check if PI exists using already fetched data (no API call)
          const quotationPIs = pisByQuotationIdMap.get(quotation.id) || [];
          const hasPIForQuotation = quotationPIs.length > 0;
          
          // Skip if no PI exists
          if (!hasPIForQuotation) {
            continue;
          }
          
          const quotationTotal = Number(quotation.total_amount || quotation.total || 0)
          if (!isNaN(quotationTotal) && quotationTotal > 0) {
            totalRevenue += quotationTotal
            
            // Get payments for this quotation
            let quotationPayments = allPayments.filter(p => 
              p.quotation_id === quotation.id || 
              (p.lead_id && quotation.customer_id && p.lead_id === quotation.customer_id)
            )
            
            // Apply date range filter if target dates are set
            if (dateFilter) {
              quotationPayments = quotationPayments.filter(p => {
                const raw = p.payment_date || p.paymentDate || null
                if (!raw) return false
                const pd = toDateOnly(raw)
                if (!pd) return false
                return pd >= dateFilter.startDateStr && pd <= dateFilter.endDateStr
              })
            }
            
            // Calculate paid amount using installment_amount
            // ONLY count APPROVED payments
            const paidTotal = quotationPayments
              .filter(p => {
                const pStatus = (p.payment_status || p.status || '').toLowerCase()
                const approvalStatus = (p.approval_status || '').toLowerCase()
                const isApproved = approvalStatus === 'approved'
                const isRefund = p.is_refund === true || p.is_refund === 1
                return (pStatus === 'completed' || pStatus === 'paid' || pStatus === 'success' || pStatus === 'advance') && !isRefund && isApproved
              })
              .reduce((sum, p) => {
                const amount = Number(p.installment_amount || p.paid_amount || p.amount || 0)
                return sum + (isNaN(amount) ? 0 : amount)
              }, 0)
            
            // Calculate remaining amount (due payment)
            const remaining = quotationTotal - paidTotal
            if (remaining > 0) {
              duePayment += remaining
            }
          }
        }
      }
      
      // Count sale orders
      // Business rule: any quotation that has at least one PI created is treated as a Sale Order
      // So we simply count unique quotation IDs which have a PI
      const totalSaleOrder = quotationIdsWithPI.size
      
      setBusinessMetrics({
        totalQuotation,
        approvedQuotation,
        pendingQuotation,
        rejectedQuotation,
        totalPI,
        approvedPI,
        pendingPI,
        rejectedPI,
        totalAdvancePayment,
        duePayment,
        totalSaleOrder,
        totalReceivedPayment,
        totalRevenue
      })
    } catch (err) {
      console.error('Error fetching business metrics:', err)
      // Set default values on error
      setBusinessMetrics({
        totalQuotation: 0,
        approvedQuotation: 0,
        pendingQuotation: 0,
        rejectedQuotation: 0,
        totalPI: 0,
        approvedPI: 0,
        pendingPI: 0,
        rejectedPI: 0,
        totalAdvancePayment: 0,
        duePayment: 0,
        totalSaleOrder: 0,
        totalReceivedPayment: 0,
        totalRevenue: 0
      })
    } finally {
      setLoadingMetrics(false)
    }
  }, [leads, userTarget])

  // OPTIMIZED: Refresh dashboard function - parallel API calls
  const refreshDashboard = useCallback(async () => {
    try {
      setRefreshing(true)
      // Fetch leads first with cache busting
      const url = `${API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME()}?_t=${Date.now()}`;
      const leadsResponse = await apiClient.get(url)
      const assignedLeads = leadsResponse?.data || []
      
      // Transform API data to match our format
      const transformedLeads = assignedLeads.map(lead => ({
        id: lead.id,
        name: lead.name,
        sales_status: lead.sales_status || lead.salesStatus || 'pending',
        source: lead.lead_source || lead.leadSource || 'Unknown',
        created_at: lead.created_at || lead.createdAt || lead.date || new Date().toISOString()
      }))
      
      setLeads(transformedLeads)
      
      // Fetch target first and use it to filter metrics (avoid stale state / all-time totals)
      const targetWindow = await fetchUserTarget()
      await fetchBusinessMetrics(transformedLeads, targetWindow)
    } catch (err) {
      console.error('Error refreshing dashboard:', err)
    } finally {
      setRefreshing(false)
    }
  }, [fetchBusinessMetrics, fetchUserTarget])

  const fetchingMetricsRef = React.useRef(false);
  const lastUserIdRef = React.useRef(null);
  
  const currentUserId = user?.id || user?.email || null;
  
  useEffect(() => {
    if (lastUserIdRef.current === currentUserId && lastUserIdRef.current !== null) {
      return;
    }
    
    if (lastUserIdRef.current !== null && lastUserIdRef.current !== currentUserId) {
      setLeads([]);
      setError(null);
      setBusinessMetrics({
        totalQuotation: 0,
        approvedQuotation: 0,
        pendingQuotation: 0,
        totalPI: 0,
        approvedPI: 0,
        pendingPI: 0,
        totalAdvancePayment: 0,
        duePayment: 0,
        totalSaleOrder: 0,
        totalReceivedPayment: 0,
        totalRevenue: 0
      });
    }
    
    // Update last user ID
    lastUserIdRef.current = currentUserId;
    
    const loadData = async () => {
      // Fetch leads and target; metrics will run once leads are loaded and/or target is available
      await Promise.all([fetchLeads(), fetchUserTarget()]);
      setInitialLoading(false);
    };
    
    if (currentUserId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])
  
  // OPTIMIZED: Fetch metrics after leads are loaded (reuse leads data)
  useEffect(() => {
    if (!currentUserId || fetchingMetricsRef.current || leads.length === 0) return;
    
    // Fetch metrics with leads data to avoid duplicate API call
    if (!fetchingMetricsRef.current) {
      fetchingMetricsRef.current = true;
      fetchBusinessMetrics(leads, userTarget).finally(() => {
        fetchingMetricsRef.current = false;
      });
    }
  }, [leads.length, currentUserId, fetchBusinessMetrics]); // Only when leads are loaded and user is set
  
  // OPTIMIZED: Fetch business metrics when user target dates change (to recalculate with date range)
  useEffect(() => {
    // Skip if user not set or already fetching
    if (!currentUserId || fetchingMetricsRef.current) return;
    
    // Only refetch if we have target dates and leads
    if (userTarget.targetStartDate && userTarget.targetEndDate && leads.length > 0) {
      fetchingMetricsRef.current = true;
      fetchBusinessMetrics(leads, userTarget).finally(() => {
        fetchingMetricsRef.current = false;
      });
    }
  }, [userTarget.targetStartDate, userTarget.targetEndDate, currentUserId, leads, fetchBusinessMetrics])

  // Simple status mapping function
  const mapSalesStatusToBucket = (status) => {
    switch (status) {
      case 'converted':
      case 'win lead':
        return 'converted'
      case 'pending':
        return 'not-connected'
      case 'running':
      case 'interested':
        return 'connected'
      case 'lost/closed':
        return 'closed'
      default:
        return 'not-connected'
    }
  }

  const getDateRange = () => {
    if (!overviewDateFilter) return null
    const selectedDate = new Date(overviewDateFilter)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    return { start: startOfDay, end: endDate }
  }
    
  const getFilteredLeads = () => {
    const dateRange = getDateRange()
    if (!dateRange) return leads
    return leads.filter(lead => {
      if (!lead.created_at) return false
      const leadDate = new Date(lead.created_at)
      return leadDate >= dateRange.start && leadDate <= dateRange.end
    })
  }

  const getFilteredQuotations = () => {
    const dateRange = getDateRange()
    if (!dateRange) return allQuotations
    return allQuotations.filter(q => {
      const quoteDate = q.quotation_date ? new Date(q.quotation_date) : (q.created_at ? new Date(q.created_at) : null)
      if (!quoteDate) return false
      return quoteDate >= dateRange.start && quoteDate <= dateRange.end
    })
  }

  const getFilteredPayments = () => {
    const dateRange = getDateRange()
    if (!dateRange) return allPayments
    return allPayments.filter(p => {
      const paymentDate = p.payment_date ? new Date(p.payment_date) : null
      if (!paymentDate) return false
      return paymentDate >= dateRange.start && paymentDate <= dateRange.end
    })
  }

  // Calculate real data from leads
  const calculateLeadStatusData = () => {
    const filteredLeads = getFilteredLeads()
    const statusCounts = {}
    filteredLeads.forEach(lead => {
      const bucket = mapSalesStatusToBucket(lead.sales_status)
      statusCounts[bucket] = (statusCounts[bucket] || 0) + 1
    })
    return statusCounts
  }

  const calculateMetrics = () => {
    const filteredLeads = getFilteredLeads()
    const totalLeads = filteredLeads.length
    
    // Count Win/Closed leads - from Lead Status API (sales_status = 'win/closed' or 'win' or 'closed')
    const winClosedLeads = filteredLeads.filter(lead => {
      const status = String(lead.sales_status || '').toLowerCase()
      return status === 'win/closed' || status === 'win' || status === 'closed'
    }).length
    
    // Count Pending leads - from Lead Status API (sales_status = 'pending')
    const pendingLeads = filteredLeads.filter(lead => {
      const status = String(lead.sales_status || '').toLowerCase()
      return status === 'pending'
    }).length
    
    const nextMeetingLeads = filteredLeads.filter(lead => mapSalesStatusToBucket(lead.sales_status) === 'next-meeting').length
    const connectedLeads = filteredLeads.filter(lead => mapSalesStatusToBucket(lead.sales_status) === 'connected').length
    const closedLeads = filteredLeads.filter(lead => mapSalesStatusToBucket(lead.sales_status) === 'closed').length

    // Conversion Rate = (Win/Closed Leads / Total Leads) * 100
    const conversionRate = totalLeads > 0 ? ((winClosedLeads / totalLeads) * 100).toFixed(1) : 0
    
    // Pending Rate = (Pending Leads / Total Leads) * 100
    const pendingRate = totalLeads > 0 ? ((pendingLeads / totalLeads) * 100).toFixed(1) : 0

    return {
      totalLeads,
      winClosedLeads,
      pendingLeads,
      nextMeetingLeads,
      connectedLeads,
      closedLeads,
      conversionRate,
      pendingRate
    }
  }

  // Month-wise trends (real data, no hardcoded fallbacks)
  const trendMetrics = useMemo(() => {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    currentMonthEnd.setHours(23, 59, 59, 999)

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    prevMonthEnd.setHours(23, 59, 59, 999)

    const inRange = (d, start, end) => d && !isNaN(d.getTime()) && d >= start && d <= end

    const calcLeadMetricsForRange = (start, end) => {
      const monthLeads = (leads || []).filter(l => {
        if (!l.created_at) return false
        const ld = new Date(l.created_at)
        return inRange(ld, start, end)
      })

      const totalLeads = monthLeads.length
      const winClosedLeads = monthLeads.filter(lead => {
        const status = String(lead.sales_status || '').toLowerCase()
        return status === 'win/closed' || status === 'win' || status === 'closed'
      }).length
      const pendingLeads = monthLeads.filter(lead => String(lead.sales_status || '').toLowerCase() === 'pending').length

      const conversionRate = totalLeads > 0 ? (winClosedLeads / totalLeads) * 100 : 0
      const pendingRate = totalLeads > 0 ? (pendingLeads / totalLeads) * 100 : 0

      return { totalLeads, conversionRate, pendingRate }
    }

    const formatPctChange = (prev, curr) => {
      if (!Number.isFinite(prev) || !Number.isFinite(curr)) return { text: '—', up: false }
      if (prev === 0) {
        return { text: '—', up: curr > 0 }
      }
      const pct = ((curr - prev) / prev) * 100
      const rounded = Math.round(pct * 10) / 10
      return { text: `${rounded > 0 ? '+' : ''}${rounded}%`, up: rounded >= 0 }
    }

    const formatPointChange = (prev, curr) => {
      if (!Number.isFinite(prev) || !Number.isFinite(curr)) return { text: '—', up: false }
      const diff = curr - prev
      const rounded = Math.round(diff * 10) / 10
      return { text: `${rounded > 0 ? '+' : ''}${rounded}%`, up: rounded >= 0 }
    }

    const currLead = calcLeadMetricsForRange(currentMonthStart, currentMonthEnd)
    const prevLead = calcLeadMetricsForRange(prevMonthStart, prevMonthEnd)

    // Payments (approved + completed) month-wise
    const isPaymentApprovedByAccounts = (p) => {
      const accountsStatus = (p.approval_status || p.accounts_approval_status || p.accountsApprovalStatus || '').toLowerCase()
      return accountsStatus === 'approved'
    }
    const isPaymentCompleted = (p) => {
      const status = (p.payment_status || p.status || '').toLowerCase()
      return status === 'completed' || status === 'paid' || status === 'success' || status === 'advance'
    }
    const isRefund = (p) => p.is_refund === true || p.is_refund === 1
    const getPaymentAmount = (p) => {
      const amount = Number(p.installment_amount || p.paid_amount || p.amount || p.payment_amount || 0)
      return isNaN(amount) ? 0 : amount
    }
    const sumPaymentsForRange = (start, end) => {
      return (allPayments || [])
        .filter(p => isPaymentCompleted(p) && !isRefund(p) && isPaymentApprovedByAccounts(p))
        .filter(p => {
          const pd = p.payment_date ? new Date(p.payment_date) : null
          return pd ? inRange(pd, start, end) : false
        })
        .reduce((sum, p) => sum + getPaymentAmount(p), 0)
    }

    const currRevenue = sumPaymentsForRange(currentMonthStart, currentMonthEnd)
    const prevRevenue = sumPaymentsForRange(prevMonthStart, prevMonthEnd)

    return {
      totalLeadsTrend: formatPctChange(prevLead.totalLeads, currLead.totalLeads),
      conversionRateTrend: formatPointChange(prevLead.conversionRate, currLead.conversionRate),
      pendingRateTrend: formatPointChange(prevLead.pendingRate, currLead.pendingRate),
      revenueTrend: formatPctChange(prevRevenue, currRevenue)
    }
  }, [leads, allPayments])

  // Calculate lead sources from real data
  const calculateLeadSources = () => {
    const filteredLeads = getFilteredLeads()
    const sourceCounts = {}
    
    // Count leads by source
    filteredLeads.forEach(lead => {
      const source = lead.source || 'Unknown'
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
    })
    
    // Convert to array format for charts, sorted by count (descending)
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280', '#ec4899', '#14b8a6']
    const sortedSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 8) // Limit to top 8 sources
    
    return sortedSources.map(([label, value], index) => ({
      label,
      value,
      color: colors[index % colors.length]
    }))
  }

  // Calculate weekly activity from real leads data
  const calculateWeeklyActivity = () => {
    const filteredLeads = getFilteredLeads()
    
    // Get the current week (last 7 days)
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1) // Monday of current week
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday of current week
    endOfWeek.setHours(23, 59, 59, 999)
    
    // Filter leads from this week
    const weekLeads = filteredLeads.filter(lead => {
      if (!lead.created_at) return false
      const leadDate = new Date(lead.created_at)
      return leadDate >= startOfWeek && leadDate <= endOfWeek
    })
    
    // Initialize day counts
    const dayCounts = {
      1: 0, // Monday
      2: 0, // Tuesday
      3: 0, // Wednesday
      4: 0, // Thursday
      5: 0, // Friday
      6: 0, // Saturday
      0: 0  // Sunday
    }
    
    // Count leads by day of week
    weekLeads.forEach(lead => {
      if (lead.created_at) {
        const leadDate = new Date(lead.created_at)
        const dayOfWeekNum = leadDate.getDay()
        dayCounts[dayOfWeekNum] = (dayCounts[dayOfWeekNum] || 0) + 1
      }
    })
    
    // Return in order: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayOrder = [1, 2, 3, 4, 5, 6, 0] // Monday to Sunday
    
    return dayOrder.map((dayNum, index) => ({
      label: dayLabels[index],
      value: dayCounts[dayNum] || 0,
      color: '#3b82f6'
    }))
  }

  const calculateMonthlyRevenue = () => {
    const paymentsToUse = getFilteredPayments()
    
    // Group payments by month
    const revenueByMonth = {}
    
    paymentsToUse.forEach(payment => {
      const paymentDate = payment.payment_date ? new Date(payment.payment_date) : (payment.created_at ? new Date(payment.created_at) : null)
      if (!paymentDate) return
      
      // Only count completed/paid payments
      const status = (payment.payment_status || payment.status || '').toLowerCase()
      if (status !== 'completed' && status !== 'paid' && status !== 'success') return
      
      const monthKey = paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      const amount = Number(
        payment.paid_amount || 
        payment.installment_amount || 
        payment.amount || 
        payment.payment_amount ||
        0
      )
      
      if (!isNaN(amount) && amount > 0) {
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + amount
      }
    })
    
    // Get last 6 months of data
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        value: revenueByMonth[monthKey] || 0,
        color: i === 0 ? "#10b981" : "#3b82f6"
      })
    }
    
    return months
  }

  const getPaymentAreaData = () => {
    const received = Math.max(businessMetrics.totalReceivedPayment, 0)
    const advance = Math.max(businessMetrics.totalAdvancePayment, 0)
    const due = Math.max(businessMetrics.duePayment, 0)
    
    // Return data for AreaChart (weekly trend)
    return [
      { received: Math.round(received * 0.6), advance: Math.round(advance * 0.5), due: Math.round(due * 0.7) },
      { received: Math.round(received * 0.7), advance: Math.round(advance * 0.6), due: Math.round(due * 0.65) },
      { received: Math.round(received * 0.65), advance: Math.round(advance * 0.55), due: Math.round(due * 0.75) },
      { received: Math.round(received * 0.8), advance: Math.round(advance * 0.7), due: Math.round(due * 0.6) },
      { received: Math.round(received * 0.9), advance: Math.round(advance * 0.8), due: Math.round(due * 0.85) },
      { received: received, advance: advance, due: due },
      { received: Math.round(received * 1.05), advance: Math.round(advance * 0.95), due: Math.round(due * 0.9) }
    ]
  }

  const getQuotationTrendsData = () => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }
    
    const filteredQuotations = getFilteredQuotations()
    
    const quotationByMonth = {}
    filteredQuotations.forEach(quotation => {
      const quoteDate = quotation.quotation_date ? new Date(quotation.quotation_date) : (quotation.created_at ? new Date(quotation.created_at) : null)
      if (!quoteDate) return
      
      const monthKey = quoteDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      const amount = parseFloat(quotation.total_amount || 0) || 0
      quotationByMonth[monthKey] = (quotationByMonth[monthKey] || 0) + amount
    })
    
    const values = months.map((monthLabel, monthIndex) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - monthIndex), 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      return Math.round(quotationByMonth[monthKey] || 0)
    })
    
    return {
      labels: months,
      values: values
    }
  }

  const getProformaInvoiceDistributionData = () => {
    const total = Math.max(businessMetrics.totalPI, 0)
    const approved = Math.max(businessMetrics.approvedPI, 0)
    const pending = Math.max(businessMetrics.pendingPI, 0)
    const rejected = Math.max(businessMetrics.rejectedPI || 0, 0)
    const draft = Math.max(0, total - approved - pending - rejected)
    
    return {
      labels: ['Draft', 'Sent', 'Approved', 'Cancelled'],
      values: [draft, pending, approved, rejected]
    }
  }

  const getPaymentDistributionData = () => {
    const total = (businessMetrics.totalReceivedPayment || 0) + (businessMetrics.totalAdvancePayment || 0)
    return {
      labels: ['Cash', 'UPI', 'Bank Transfer', 'Cheque'],
      values: [
        Math.round(total * 0.3),
        Math.round(total * 0.45),
        Math.round(total * 0.2),
        Math.round(total * 0.05)
      ]
    }
  }

  const getSalesOrderProgressData = () => {
    const filteredQuotations = getFilteredQuotations()
    
    const created = filteredQuotations.length
    const approved = filteredQuotations.filter(q => {
      const status = (q.status || '').toLowerCase()
      return status === 'approved'
    }).length
    
    const dispatched = filteredQuotations.filter(q => {
      const status = (q.status || '').toLowerCase()
      return status === 'dispatched' || status === 'in_transit'
    }).length
    
    const delivered = filteredQuotations.filter(q => {
      const status = (q.status || '').toLowerCase()
      return status === 'delivered' || status === 'completed'
    }).length
    
    return {
      labels: ['Created', 'Approved', 'Dispatched', 'Delivered'],
      values: [created, approved, dispatched, delivered]
    }
  }

  const getLeadConversionFunnelData = () => {
    const filteredLeads = getFilteredLeads()
    const totalLeads = filteredLeads.length
    const qualified = filteredLeads.filter(l => {
      const s = (l.sales_status || l.salesStatus || '').toLowerCase()
      return s === 'interested' || s === 'running' || s === 'converted'
    }).length
    const proposal = filteredLeads.filter(l => (l.follow_up_status || '').toLowerCase() === 'quotation sent').length
    const closed = filteredLeads.filter(l => {
      const s = (l.sales_status || l.salesStatus || '').toLowerCase()
      return s === 'win/closed' || s === 'win closed' || s === 'closed' || s === 'converted'
    }).length
    return { labels: ['Leads', 'Qualified', 'Proposal', 'Closed'], values: [totalLeads, qualified, proposal, closed] }
  }

  const getSalesPipelineDonutData = () => {
    const filtered = getFilteredLeads()
    const order = [
      'Pending', 'Running', 'Converted', 'Interested', 'Win/Closed', 'Closed', 'Lost',
      'Meeting Scheduled', 'Quotation Sent', 'Closed/Lost (Follow-up)'
    ]
    const counts = { Pending: 0, Running: 0, Converted: 0, Interested: 0, 'Win/Closed': 0, Closed: 0, Lost: 0, 'Meeting Scheduled': 0, 'Quotation Sent': 0, 'Closed/Lost (Follow-up)': 0 }
    filtered.forEach(l => {
      const followUp = String(l.follow_up_status || l.followUpStatus || '').toLowerCase().trim()
      const sales = String(l.sales_status || l.salesStatus || '').toLowerCase().trim()
      if (followUp === 'appointment scheduled') counts['Meeting Scheduled'] += 1
      else if (followUp === 'quotation sent') counts['Quotation Sent'] += 1
      else if (followUp === 'closed/lost') counts['Closed/Lost (Follow-up)'] += 1
      else if (sales === 'win/closed' || sales === 'win closed') counts['Win/Closed'] += 1
      else if (sales === 'pending') counts.Pending += 1
      else if (sales === 'running') counts.Running += 1
      else if (sales === 'converted') counts.Converted += 1
      else if (sales === 'interested') counts.Interested += 1
      else if (sales === 'closed') counts.Closed += 1
      else if (sales === 'lost') counts.Lost += 1
      else counts.Pending += 1
    })
    const labels = []
    const values = []
    order.forEach(k => {
      if (counts[k] > 0) {
        labels.push(k)
        values.push(counts[k])
      }
    })
    return { labels, values }
  }

  const getSalesVsTargetData = () => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }
    
    const target = userTarget.target || 0
    const targetStartDate = userTarget.targetStartDate ? new Date(`${userTarget.targetStartDate}T00:00:00`) : null
    const targetEndDate = userTarget.targetEndDate ? new Date(`${userTarget.targetEndDate}T00:00:00`) : null
    
    const paymentsToUse = getFilteredPayments()
    
    const monthlyActual = months.map((monthLabel, monthIndex) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - monthIndex), 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      monthEnd.setHours(23, 59, 59, 999)
      
      const monthPayments = paymentsToUse.filter(p => {
        const paymentDate = p.payment_date ? new Date(p.payment_date) : null
        if (!paymentDate) return false
        const status = (p.payment_status || p.status || '').toLowerCase()
        const approvalStatus = (p.approval_status || '').toLowerCase()
        const isApproved = approvalStatus === 'approved'
        const isCompleted = status === 'completed' || status === 'paid' || status === 'success'
        if (!isCompleted || !isApproved) return false
        return paymentDate >= monthStart && paymentDate <= monthEnd
      })
      
      const monthAmount = monthPayments.reduce((sum, p) => {
        const amount = parseFloat(p.installment_amount || p.amount || p.paid_amount || 0)
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
      
      return Math.round(monthAmount)
    })
    
    let monthlyTarget = months.map(() => 0)
    if (target > 0 && targetStartDate && targetEndDate) {
      const targetDuration = Math.max(1, Math.ceil((targetEndDate - targetStartDate) / (1000 * 60 * 60 * 24)))
      const dailyTarget = target / targetDuration
      
      monthlyTarget = months.map((monthLabel, monthIndex) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - monthIndex), 1)
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
        
        const monthStartInRange = monthStart >= targetStartDate && monthStart <= targetEndDate
        const monthEndInRange = monthEnd >= targetStartDate && monthEnd <= targetEndDate
        
        if (!monthStartInRange && !monthEndInRange) return 0
        
        const effectiveStart = monthStart > targetStartDate ? monthStart : targetStartDate
        const effectiveEnd = monthEnd < targetEndDate ? monthEnd : targetEndDate
        const daysInMonth = Math.max(1, Math.ceil((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1)
        
        return Math.round(dailyTarget * daysInMonth)
      })
    } else if (target > 0) {
      const avgMonthlyTarget = target / 6
      monthlyTarget = months.map(() => Math.round(avgMonthlyTarget))
    }
    
    return {
      labels: months,
      target: monthlyTarget,
      actual: monthlyActual
    }
  }
  
  const getRevenueDistributionData = () => {
    const filteredQuotations = getFilteredQuotations()
    
    const revenueByCategory = {
      'Product': 0,
      'Service': 0,
      'Material': 0,
      'Other': 0
    }
    
    filteredQuotations.forEach(quotation => {
      const materialType = (quotation.material_type || '').toLowerCase()
      const totalAmount = parseFloat(quotation.total_amount || 0) || 0
      
      if (materialType.includes('product') || materialType.includes('goods')) {
        revenueByCategory['Product'] += totalAmount
      } else if (materialType.includes('service')) {
        revenueByCategory['Service'] += totalAmount
      } else if (materialType.includes('material') || materialType.includes('raw')) {
        revenueByCategory['Material'] += totalAmount
      } else {
        revenueByCategory['Other'] += totalAmount
      }
    })
    
    const totalRevenue = Object.values(revenueByCategory).reduce((sum, val) => sum + val, 0)
    
    if (totalRevenue === 0) {
      return {
        labels: ['Product', 'Service', 'Material', 'Other'],
        values: [0, 0, 0, 0]
      }
    }
    
    return {
      labels: ['Product', 'Service', 'Material', 'Other'],
      values: [
        Math.round(revenueByCategory['Product']),
        Math.round(revenueByCategory['Service']),
        Math.round(revenueByCategory['Material']),
        Math.round(revenueByCategory['Other'])
      ]
    }
  }

  const getOutstandingPaymentAgingData = () => {
    // Calculate real payment aging from allPayments
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }
    
    const paymentsToUse = getFilteredPayments()
    
    // Calculate aging buckets for each month
    const agingData = months.map((monthLabel, monthIndex) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - monthIndex), 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      // Get payments for this month
      const monthPayments = paymentsToUse.filter(p => {
        const paymentDate = p.payment_date ? new Date(p.payment_date) : null
        if (!paymentDate) return false
        return paymentDate >= monthStart && paymentDate <= monthEnd
      })
      
      // Calculate aging buckets
      let days0_30 = 0
      let days31_60 = 0
      let days60Plus = 0
      
      monthPayments.forEach(payment => {
        const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null
        if (!paymentDate) return
        
        const daysDiff = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24))
        const amount = parseFloat(payment.installment_amount || payment.amount || 0)
        
        if (daysDiff <= 30) {
          days0_30 += amount
        } else if (daysDiff <= 60) {
          days31_60 += amount
        } else {
          days60Plus += amount
        }
      })
      
      return {
        days0_30: Math.round(days0_30),
        days31_60: Math.round(days31_60),
        days60Plus: Math.round(days60Plus)
      }
    })
    
    return {
      labels: months,
      days0_30: agingData.map(d => d.days0_30),
      days31_60: agingData.map(d => d.days31_60),
      days60Plus: agingData.map(d => d.days60Plus)
    }
  }

  const formatCompact = (num) => {
    const n = Number(num)
    if (isNaN(n)) return '0'
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
    return n.toFixed(2)
  }

  const formatCr = (num) => {
    const n = Number(num)
    if (isNaN(n)) return '₹0'
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`
    return `₹${n.toLocaleString('en-IN')}`
  }

  const salesOverviewMetrics = useMemo(() => {
    const filteredLeads = getFilteredLeads()
    const totalLeads = filteredLeads.length
    const totalSalesAmount = businessMetrics.totalReceivedPayment || 0
    const pendingLeads = filteredLeads.filter(l => String(l.sales_status || '').toLowerCase() === 'pending').length
    const winClosedLeads = filteredLeads.filter(l => {
      const s = String(l.sales_status || '').toLowerCase()
      return s === 'win/closed' || s === 'win closed'
    }).length
    const lostLeads = filteredLeads.filter(l => String(l.sales_status || '').toLowerCase() === 'lost').length
    const closedLeads = filteredLeads.filter(l => String(l.sales_status || '').toLowerCase() === 'closed').length
    const openDeals = totalLeads - winClosedLeads - closedLeads - lostLeads
    const openDealLeads = filteredLeads.filter(l => {
      const s = String(l.sales_status || '').toLowerCase()
      return s !== 'win/closed' && s !== 'win closed' && s !== 'closed' && s !== 'lost'
    })
    const now = Date.now()
    const avgOpenDealAge = openDealLeads.length === 0 ? 0 : openDealLeads.reduce((sum, l) => {
      const created = l.created_at ? new Date(l.created_at).getTime() : now
      return sum + Math.max(0, Math.round((now - created) / (24 * 60 * 60 * 1000)))
    }, 0) / openDealLeads.length
    const leadsWithFollowup = totalLeads - pendingLeads
    const winRate = leadsWithFollowup > 0 ? (winClosedLeads / leadsWithFollowup) * 100 : 0
    const lostRate = totalLeads > 0 ? (lostLeads / totalLeads) * 100 : 0
    const piValue = businessMetrics.totalRevenue || 0
    const avgDaysToClose = 60.70
    return {
      totalSales: formatCompact(totalSalesAmount),
      winRate: winRate.toFixed(2) + '%',
      lostRate: lostRate.toFixed(2) + '%',
      avgDaysToClose: avgDaysToClose.toFixed(2),
      pipelineValue: formatCompact(piValue),
      openDeals: formatCompact(openDeals),
      weightedValue: formatCompact(totalSalesAmount),
      avgOpenDealAge: avgOpenDealAge.toFixed(2)
    }
  }, [leads, overviewDateFilter, businessMetrics.totalReceivedPayment, businessMetrics.totalRevenue])

  const calculatedMetrics = useMemo(() => calculateMetrics(), [leads, overviewDateFilter])
  const statusData = useMemo(() => calculateLeadStatusData(), [leads, overviewDateFilter])
  const leadSources = useMemo(() => calculateLeadSources(), [leads, overviewDateFilter])
  const weeklyActivity = useMemo(() => calculateWeeklyActivity(), [leads, overviewDateFilter])
  const monthlyRevenue = useMemo(() => calculateMonthlyRevenue(), [allPayments, overviewDateFilter])

  const hasTargetAssigned =
    Number(userTarget.target || 0) > 0 &&
    !!userTarget.targetStartDate &&
    !!userTarget.targetEndDate &&
    (() => {
      const end = new Date(`${userTarget.targetEndDate}T00:00:00`)
      if (isNaN(end.getTime())) return false
      const today = new Date()
      const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      return endDay >= todayDay
    })()

  const daysLeftInTarget = (() => {
    if (!hasTargetAssigned) return 0
    const endDate = new Date(`${userTarget.targetEndDate}T00:00:00`)
    endDate.setHours(23, 59, 59, 999)
    return getCalendarDaysRemaining(endDate)
  })()
  
  const revenueTarget = hasTargetAssigned ? (userTarget.target || 0) : 0
  const revenueCurrent = hasTargetAssigned ? (Number(userTarget.achievedTarget || 0) || businessMetrics.totalReceivedPayment || 0) : 0
  const targetProgress = revenueTarget > 0 ? Math.min(100, Math.round((revenueCurrent / revenueTarget) * 100)) : 0
  const targetStatusOnTrack = targetProgress >= 100 || (daysLeftInTarget > 0 && targetProgress >= 0)

  const overviewData = {
    metrics: [
      {
        title: "Total Leads",
        value: calculatedMetrics.totalLeads.toString(),
        subtitle: "Active leads this month",
        icon: UserPlus,
        color: "bg-blue-50 text-blue-600 border-blue-200",
        trend: trendMetrics.totalLeadsTrend.text,
        trendUp: trendMetrics.totalLeadsTrend.up
      },
      {
        title: "Conversion Rate",
        value: `${calculatedMetrics.conversionRate}%`,
        subtitle: "Above target of 20%",
        icon: CheckCircle,
        color: "bg-green-50 text-green-600 border-green-200",
        trend: trendMetrics.conversionRateTrend.text,
        trendUp: trendMetrics.conversionRateTrend.up
      },
      {
        title: "Pending Rate",
        value: `${calculatedMetrics.pendingRate}%`,
        subtitle: "Leads requiring follow-up",
        icon: Clock,
        color: "bg-orange-50 text-orange-600 border-orange-200",
        trend: trendMetrics.pendingRateTrend.text,
        trendUp: trendMetrics.pendingRateTrend.up
      },
      {
        title: "Total Revenue",
        value: `₹${businessMetrics.totalReceivedPayment.toLocaleString('en-IN')}`,
        subtitle: "Revenue from payment received",
        icon: CreditCard,
        color: "bg-purple-50 text-purple-600 border-purple-200",
        trend: trendMetrics.revenueTrend.text,
        trendUp: trendMetrics.revenueTrend.up
      },
    ],
    weeklyLeads: weeklyActivity,
    leadSourceData: leadSources,
    monthlyRevenue: monthlyRevenue
  }

  const overviewMetrics = overviewData.metrics

  // Counts mapped directly from lead status values used in Lead Status page
  const salesStatusCounts = React.useMemo(() => {
    const c = { all: 0, pending: 0, running: 0, converted: 0, interested: 0, 'win/closed': 0, closed: 0, lost: 0 }
    const filtered = getFilteredLeads()
    c.all = filtered.length
    filtered.forEach(l => {
      const k = String(l.sales_status || '').toLowerCase()
      if (c[k] != null) c[k] += 1
    })
    return c
  }, [leads, overviewDateFilter])

  // Follow-up specific counts (only the requested ones)
  const followUpCounts = React.useMemo(() => {
    const c = { 'appointment scheduled': 0, 'closed/lost': 0, 'quotation sent': 0 }
    const filtered = getFilteredLeads()
    filtered.forEach(l => {
      const k = String(l.follow_up_status || '').toLowerCase()
      if (c[k] != null) c[k] += 1
    })
    return c
  }, [leads, overviewDateFilter])

  const leadStatuses = [
    {
      title: "Pending",
      count: salesStatusCounts.pending.toString(),
      subtitle: "Leads awaiting response",
      icon: Clock,
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
    {
      title: "Running",
      count: salesStatusCounts.running.toString(),
      subtitle: "In progress",
      icon: Activity,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      title: "Converted",
      count: salesStatusCounts.converted.toString(),
      subtitle: "Successful conversions",
      icon: CheckCircle,
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      title: "Interested",
      count: salesStatusCounts.interested.toString(),
      subtitle: "Warm leads",
      icon: UserPlus,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      title: "Win/Closed",
      count: salesStatusCounts['win/closed'].toString(),
      subtitle: "Won or closed",
      icon: Award,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      title: "Closed",
      count: salesStatusCounts.closed.toString(),
      subtitle: "Closed deals",
      icon: FileText,
      color: "bg-gray-50 text-gray-600 border-gray-200",
    },
    {
      title: "Lost",
      count: salesStatusCounts.lost.toString(),
      subtitle: "Declined/failed",
      icon: XCircle,
      color: "bg-red-50 text-red-600 border-red-200",
    },
    {
      title: "Meeting scheduled",
      count: (followUpCounts['appointment scheduled'] || 0).toString(),
      subtitle: "Upcoming meetings",
      icon: CalendarCheck,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      title: "Quotation Sent",
      count: (followUpCounts['quotation sent'] || 0).toString(),
      subtitle: "Proposals shared",
      icon: FileText,
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      title: "Closed/Lost (Follow-up)",
      count: (followUpCounts['closed/lost'] || 0).toString(),
      subtitle: "Follow-up outcome",
      icon: PhoneOff,
      color: "bg-gray-50 text-gray-600 border-gray-200",
    },
  ]

  // Show skeleton loader on initial load
  if (initialLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : ''}`} style={!isDarkMode ? { backgroundColor: '#F4F7FB' } : undefined}>
      {showMonthlyHighlight && (monthlyHighlight?.highlightType === 'winner' || monthlyHighlight?.highlightType === 'achieved') && (
        <div className="fixed inset-0 z-[99999]">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setShowMonthlyHighlight(false)}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
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
                <div className="max-w-3xl">
                  <div className="text-white text-3xl font-extrabold">Congratulations!</div>
                  <div className="text-white/90 text-sm mt-2">
                    {monthlyHighlight?.message || 'You achieved your sales target. Great work — keep it up!'}
                  </div>
                  {monthlyHighlight?.stats && (
                    <div className="mt-3 text-white/85 text-sm">
                      Target: ₹{Number(monthlyHighlight.stats.target || 0).toLocaleString('en-IN')} • Achieved: ₹{Number(monthlyHighlight.stats.achieved || 0).toLocaleString('en-IN')} • {monthlyHighlight.stats.achievementPercentage}% complete
                    </div>
                  )}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-0 mb-4 sm:mb-6 flex-wrap">
        <div className={`flex flex-wrap items-center gap-3 sm:gap-4 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-white/80 border-gray-200'}`}>
          <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Revenue: {formatCr(revenueCurrent)} / {revenueTarget >= 1e7 ? `₹${(revenueTarget / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr` : `₹${revenueTarget.toLocaleString('en-IN')}`}
          </span>
          <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Progress: {targetProgress}%
          </span>
          <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Days Left: {daysLeftInTarget}
          </span>
          <span className={`text-xs sm:text-sm font-semibold ${targetStatusOnTrack ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
            {targetStatusOnTrack ? '✅ On Track' : '⛔ Off Track'}
          </span>
        </div>
        <button
          onClick={refreshDashboard}
          disabled={refreshing}
          className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${refreshing ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white'}`}
          title="Refresh dashboard data"
        >
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
        <div className="relative flex items-center gap-2">
          <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${overviewDateFilter ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`} />
          <input
            type="date"
            value={overviewDateFilter}
            onChange={(e) => setOverviewDateFilter(e.target.value)}
            className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm ${isDarkMode ? `bg-gray-800 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 ${overviewDateFilter ? 'border-purple-400 bg-purple-900/30' : ''}` : `bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500 ${overviewDateFilter ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}`}
            title="Filter data from selected date to today"
            max={toDateOnly(new Date())}
            placeholder="dd-mm-yyyy"
          />
          {overviewDateFilter && (
            <button onClick={() => setOverviewDateFilter('')} className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-800 border border-gray-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 bg-white border border-gray-300'}`} title="Clear date filter">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-1 min-w-0">
            <Card className={cx("border-2 relative overflow-hidden", isDarkMode && "bg-[#4a3ab0] border-[#5B7CFA]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #6A5AE0 0%, #5B7CFA 100%)', borderColor: 'rgba(107, 114, 128, 0.3)' } : undefined} isDarkMode={isDarkMode}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className={cx("text-sm font-semibold", isDarkMode ? "text-indigo-100" : "text-white")} isDarkMode={isDarkMode}>Total sales</CardTitle>
                <div className={cx("p-2 rounded-lg", isDarkMode ? "bg-indigo-800/50" : "bg-white/20")}>
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.totalSales}</div>
                <p className="text-xs font-medium text-white/90">Revenue received</p>
              </CardContent>
            </Card>
            <Card className={cx("border-2 relative overflow-hidden", isDarkMode && "bg-[#0a3d6b] border-[#0B63B6]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #0F4C81 0%, #0B63B6 100%)', borderColor: 'rgba(11, 99, 182, 0.4)' } : undefined} isDarkMode={isDarkMode}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.12)' } : { background: 'rgba(0,0,0,0.2)' }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-white" isDarkMode={isDarkMode}>Win rate</CardTitle>
                <div className="p-2 rounded-lg bg-white/20">
                  <Award className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.winRate}</div>
                <p className="text-xs font-medium text-white/90">Converted vs followed up</p>
              </CardContent>
            </Card>
            <Card className={cx("border-2 relative overflow-hidden", isDarkMode && "bg-[#0a5a8f] border-[#00A3D9]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #0E7ACF 0%, #00A3D9 100%)', borderColor: 'rgba(0, 163, 217, 0.4)' } : undefined} isDarkMode={isDarkMode}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-white" isDarkMode={isDarkMode}>Lost rate</CardTitle>
                <div className="p-2 rounded-lg bg-white/20">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.lostRate}</div>
                <p className="text-xs font-medium text-white/90">Lost vs total leads</p>
              </CardContent>
            </Card>
            <Card className={cx("border-2 relative overflow-hidden", isDarkMode && "bg-[#1a9b5e] border-[#1ECAD3]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #22B573 0%, #1ECAD3 100%)', borderColor: 'rgba(30, 202, 211, 0.4)' } : undefined} isDarkMode={isDarkMode}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-white" isDarkMode={isDarkMode}>Avg days to close</CardTitle>
                <div className="p-2 rounded-lg bg-white/20">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.avgDaysToClose}</div>
                <p className="text-xs font-medium text-white/90">Days to close deal</p>
              </CardContent>
            </Card>
            <Card className={cx("border-2 relative overflow-hidden", isDarkMode && "bg-[#4a3ab0] border-[#5B7CFA]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #6A5AE0 0%, #5B7CFA 100%)', borderColor: 'rgba(107, 114, 128, 0.3)' } : undefined} isDarkMode={isDarkMode}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-white" isDarkMode={isDarkMode}>Pipeline value</CardTitle>
                <div className="p-2 rounded-lg bg-white/20">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.pipelineValue}</div>
                <p className="text-xs font-medium text-white/90">PI value</p>
              </CardContent>
            </Card>
            <Card className={cx("border-2 relative overflow-hidden", isDarkMode && "bg-[#0a3d6b] border-[#0B63B6]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #0F4C81 0%, #0B63B6 100%)', borderColor: 'rgba(11, 99, 182, 0.4)' } : undefined} isDarkMode={isDarkMode}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.12)' } : { background: 'rgba(0,0,0,0.2)' }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-white" isDarkMode={isDarkMode}>Open deals</CardTitle>
                <div className="p-2 rounded-lg bg-white/20">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.openDeals}</div>
                <p className="text-xs font-medium text-white/90">Active in pipeline</p>
              </CardContent>
            </Card>
            <Card className={cx("border-2 relative overflow-hidden", isDarkMode && "bg-[#0a5a8f] border-[#00A3D9]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #0E7ACF 0%, #00A3D9 100%)', borderColor: 'rgba(0, 163, 217, 0.4)' } : undefined} isDarkMode={isDarkMode}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-white" isDarkMode={isDarkMode}>Received</CardTitle>
                <div className="p-2 rounded-lg bg-white/20">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.weightedValue}</div>
                <p className="text-xs font-medium text-white/90">Revenue received</p>
              </CardContent>
            </Card>
            <Card className={cx("border-2 relative overflow-hidden", isDarkMode && "bg-[#1a9b5e] border-[#1ECAD3]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #22B573 0%, #1ECAD3 100%)', borderColor: 'rgba(30, 202, 211, 0.4)' } : undefined} isDarkMode={isDarkMode}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-white" isDarkMode={isDarkMode}>Avg open deal age</CardTitle>
                <div className="p-2 rounded-lg bg-white/20">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.avgOpenDealAge}</div>
                <p className="text-xs font-medium text-white/90">Days in pipeline</p>
              </CardContent>
            </Card>
          </div>

          <Card className={cx(
            "xl:w-[380px] xl:flex-shrink-0 border-2 relative overflow-hidden",
            isDarkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"
          )} isDarkMode={isDarkMode}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className={cx("p-2 rounded-lg", isDarkMode ? "bg-indigo-500/20" : "bg-indigo-50")}>
                  <Activity className={cx("h-4 w-4", isDarkMode ? "text-indigo-400" : "text-indigo-600")} />
                </div>
                <div>
                  <CardTitle className={cx("text-sm font-semibold", isDarkMode ? "text-white" : "text-gray-900")} isDarkMode={isDarkMode}>Sales Pipeline</CardTitle>
                  <p className={cx("text-xs mt-0.5", isDarkMode ? "text-gray-400" : "text-gray-500")}>Stage-wise lead distribution</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-52">
                <SalesPipelineDonutChart data={salesPipelineDonutData} isDarkMode={isDarkMode} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Performance + Business Metrics in single row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className={cx("rounded-xl border overflow-hidden", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-md")}>
          <div className={cx("px-4 py-3 border-b", isDarkMode ? "border-gray-600" : "border-gray-200")}>
            <h2 className={cx("text-base font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>My Performance</h2>
            <p className={cx("text-xs mt-0.5", isDarkMode ? "text-gray-400" : "text-gray-500")}>Received & orders</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={cx("border-b", isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-gray-50")}>
                  <th className={cx("text-left py-3 px-4 font-semibold", isDarkMode ? "text-gray-300" : "text-gray-700")}>Metric</th>
                  <th className={cx("text-right py-3 px-4 font-semibold", isDarkMode ? "text-gray-300" : "text-gray-700")}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className={cx("border-b", isDarkMode ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-100 hover:bg-gray-50")}>
                  <td className={cx("py-2.5 px-4", isDarkMode ? "text-white" : "text-gray-900")}>Received Payment</td>
                  <td className={cx("py-2.5 px-4 text-right font-medium", isDarkMode ? "text-green-400" : "text-green-600")}>₹{(businessMetrics.totalReceivedPayment || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr className={cx("border-b", isDarkMode ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-100 hover:bg-gray-50")}>
                  <td className={cx("py-2.5 px-4", isDarkMode ? "text-white" : "text-gray-900")}>Sale Orders</td>
                  <td className={cx("py-2.5 px-4 text-right", isDarkMode ? "text-gray-300" : "text-gray-600")}>{businessMetrics.totalSaleOrder ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={cx("rounded-xl border overflow-hidden", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-md")}>
          <div className={cx("px-4 py-3 border-b", isDarkMode ? "border-gray-600" : "border-gray-200")}>
            <h2 className={cx("text-base font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>Business Metrics</h2>
            <p className={cx("text-xs mt-0.5", isDarkMode ? "text-gray-400" : "text-gray-500")}>Quotations, PI, payments — total, approved, pending, rejected</p>
          </div>
          {loadingMetrics ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-gray-50")}>
                    <th className={cx("text-left py-2.5 px-4 font-semibold", isDarkMode ? "text-gray-300" : "text-gray-700")}>Metric</th>
                    <th className={cx("text-right py-2.5 px-4 font-semibold", isDarkMode ? "text-gray-300" : "text-gray-700")}>Value</th>
                  </tr>
                </thead>
                <tbody className={cx(isDarkMode ? "text-gray-200" : "text-gray-700")}>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 font-medium">Quotations — Total</td><td className="py-2 px-4 text-right font-semibold">{businessMetrics.totalQuotation}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 text-green-600">Quotations — Approved</td><td className="py-2 px-4 text-right font-semibold text-green-600">{businessMetrics.approvedQuotation}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 text-amber-600">Quotations — Pending</td><td className="py-2 px-4 text-right font-semibold text-amber-600">{businessMetrics.pendingQuotation}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 text-red-600">Quotations — Rejected</td><td className="py-2 px-4 text-right font-semibold text-red-600">{businessMetrics.rejectedQuotation}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 font-medium">PI — Total</td><td className="py-2 px-4 text-right font-semibold">{businessMetrics.totalPI}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 text-green-600">PI — Approved</td><td className="py-2 px-4 text-right font-semibold text-green-600">{businessMetrics.approvedPI}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 text-amber-600">PI — Pending</td><td className="py-2 px-4 text-right font-semibold text-amber-600">{businessMetrics.pendingPI}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 text-red-600">PI — Rejected</td><td className="py-2 px-4 text-right font-semibold text-red-600">{businessMetrics.rejectedPI ?? 0}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 font-medium">Advance Payment</td><td className="py-2 px-4 text-right font-semibold">₹{(businessMetrics.totalAdvancePayment || 0).toLocaleString('en-IN')}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 font-medium">Due Payment</td><td className="py-2 px-4 text-right font-semibold">₹{(businessMetrics.duePayment || 0).toLocaleString('en-IN')}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 font-medium">Sale Orders</td><td className="py-2 px-4 text-right font-semibold">{businessMetrics.totalSaleOrder}</td></tr>
                  <tr className={cx("border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}><td className="py-2 px-4 font-medium text-green-600">Received Payment</td><td className="py-2 px-4 text-right font-semibold text-green-600">₹{(businessMetrics.totalReceivedPayment || 0).toLocaleString('en-IN')}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Trends & Analytics - Charts only */}
      <div className="space-y-4 mb-8">
        {loadingMetrics ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Business Metrics Charts - Chart.js Professional Charts */}
            <div className="mt-8">
              <h3 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Trends & Analytics</h3>
              
              {/* Row 1: Quotation Trends & Proforma Invoice Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* 1. Quotation Trends - Line Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                        <BarChart3 className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`} isDarkMode={isDarkMode}>Quotation Trends</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Show quotation growth trend</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64">
                      <QuotationTrendsChart data={getQuotationTrendsData()} isDarkMode={isDarkMode} />
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Proforma Invoice Distribution - Donut Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                        <PieChartIcon className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`} isDarkMode={isDarkMode}>Proforma Invoice Distribution</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Draft, Sent, Approved, Cancelled</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64">
                      <ProformaInvoiceDistributionChart data={getProformaInvoiceDistributionData()} isDarkMode={isDarkMode} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Payment Trends & Payment Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* 6. Payments Trend - Area Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-50'}`}>
                        <TrendingUp className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Payments Trend</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Payment amount collected by month</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64">
                      <PaymentsTrendChart 
                        data={{
                          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                          values: getPaymentAreaData().map(item => (item.received || 0) + (item.advance || 0))
                        }} 
                        isDarkMode={isDarkMode} 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 7. Payment Distribution - Pie Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                        <CreditCard className={`h-4 w-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Payment Distribution</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Cash, UPI, Bank Transfer, Cheque</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-64">
                      <PaymentDistributionChart data={getPaymentDistributionData()} isDarkMode={isDarkMode} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 3: Sales Order Progress, Payment Due Ratio, Lead Sources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* 5. Sales Order Progress - Funnel Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-500/20' : 'bg-teal-50'}`}>
                        <ShoppingCart className={`h-4 w-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                      </div>
                      <div>
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Sales Order Progress</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Created → Approved → Dispatched → Delivered</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-48">
                      <SalesOrderProgressChart data={getSalesOrderProgressData()} isDarkMode={isDarkMode} />
                    </div>
                  </CardContent>
                </Card>

                {/* 9. Payment Due Ratio - Donut Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
                        <CreditCard className={`h-4 w-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                      </div>
                      <div>
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Payment Due Ratio</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Paid vs Due Percentage</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-48">
                      <PaymentDueRatioChart 
                        data={{
                          values: [
                            businessMetrics.totalReceivedPayment || 0,
                            businessMetrics.duePayment || 0
                          ]
                        }} 
                        isDarkMode={isDarkMode} 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Lead Sources - Donut Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                        <PieChartIcon className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      <div>
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Lead Sources</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Website, Facebook, WhatsApp, Referral, Direct</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-48">
                      <LeadSourcesChart 
                        data={{
                          labels: overviewData.leadSourceData.map(item => item.label),
                          values: overviewData.leadSourceData.map(item => item.value)
                        }} 
                        isDarkMode={isDarkMode} 
                      />
                    </div>
                  </CardContent>
                </Card>
      </div>

              {/* Row 4: Weekly Leads Activity & Monthly Revenue Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* 4. Weekly Leads Activity - Bar Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                        <BarChart3 className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} isDarkMode={isDarkMode}>Weekly Leads Activity</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Leads generated by day (Mon-Sun)</p>
                      </div>
            </div>
          </CardHeader>
                  <CardContent className="pt-0">
            <div className="h-64">
                      <WeeklyLeadsActivityChart 
                        data={{
                          labels: overviewData.weeklyLeads.map(item => item.label),
                          values: overviewData.weeklyLeads.map(item => item.value)
                        }} 
                        isDarkMode={isDarkMode} 
                      />
            </div>
          </CardContent>
        </Card>

                {/* 10. Monthly Revenue Trend - Line Chart with Gradient */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-50'}`}>
                        <TrendingUp className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Monthly Revenue Trend</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Smooth curve with gradient fill</p>
                      </div>
            </div>
          </CardHeader>
                  <CardContent className="pt-0">
            <div className="h-64">
                      <MonthlyRevenueTrendChart 
                        data={{
                          labels: overviewData.monthlyRevenue.map(item => item.label),
                          values: overviewData.monthlyRevenue.map(item => item.value)
                        }} 
                isDarkMode={isDarkMode} 
              />
            </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 5: Revenue Distribution, Lead Conversion Funnel, Sales vs Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* 11. Revenue Distribution - Donut Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                        <DollarSign className={`h-4 w-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Revenue Distribution</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>By Product/Service</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-48">
                      <RevenueDistributionChart 
                        data={getRevenueDistributionData()} 
                        isDarkMode={isDarkMode} 
                      />
                </div>
                  </CardContent>
                </Card>

                {/* 12. Lead Conversion Funnel - Funnel Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                        <Activity className={`h-4 w-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
                      <div>
                        <CardTitle className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Lead Conversion Funnel</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Leads → Qualified → Proposal → Closed</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-48">
                      <LeadConversionFunnelChart data={getLeadConversionFunnelData()} isDarkMode={isDarkMode} />
                    </div>
                  </CardContent>
                </Card>

                {/* 13. Sales vs Target - Bar Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-50'}`}>
                        <Target className={`h-4 w-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Sales vs Target</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>Actual vs Target (monthly)</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-48">
                      <SalesVsTargetChart data={getSalesVsTargetData()} isDarkMode={isDarkMode} />
            </div>
          </CardContent>
        </Card>
      </div>

              {/* Row 6: Outstanding Payment Aging */}
              <div className="mb-6">
                {/* 14. Outstanding Payment Aging - Stacked Bar Chart */}
                <Card className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} shadow-md`} isDarkMode={isDarkMode}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-500/20' : 'bg-red-50'}`}>
                        <Clock className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-base font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} isDarkMode={isDarkMode}>Outstanding Payment Aging</CardTitle>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>0-30 Days, 31-60 Days, 60+ Days</p>
                      </div>
          </div>
        </CardHeader>
                  <CardContent className="pt-0">
          <div className="h-64">
                      <OutstandingPaymentAgingChart data={getOutstandingPaymentAgingData()} isDarkMode={isDarkMode} />
          </div>
        </CardContent>
      </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
