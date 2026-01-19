"use client"

import { TrendingUp, CheckCircle, Clock, CreditCard, UserPlus, CalendarCheck, ArrowUp, XCircle, PhoneOff, Target, BarChart3, PieChart as PieChartIcon, Activity, Award, TrendingDown, ArrowRightLeft, Calendar, FileText, FileCheck, FileX, Receipt, ShoppingCart, DollarSign, RefreshCw, Trophy } from "lucide-react"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import apiClient from '../../utils/apiClient'
import { API_ENDPOINTS } from '../../api/admin_api/api'
import quotationService from '../../api/admin_api/quotationService'
import paymentService from '../../api/admin_api/paymentService'
import proformaInvoiceService from '../../api/admin_api/proformaInvoiceService'
import departmentUserService from '../../api/admin_api/departmentUserService'
import departmentHeadService from '../../api/admin_api/departmentHeadService'
import { useAuth } from '../../hooks/useAuth'
import salesDataService from '../../services/SalesDataService'
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
  SalesVsTargetChart,
  OutstandingPaymentAgingChart
} from '../../components/dashboard/ChartJSCharts'

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

function Card({ className, children, isDarkMode = false }) {
  return <div className={cx(
    "rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl",
    isDarkMode 
      ? "bg-gray-800 border-gray-700 shadow-lg" 
      : "bg-white border-gray-200 shadow-md hover:shadow-2xl",
    className
  )}>{children}</div>
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


const MS_IN_DAY = 24 * 60 * 60 * 1000;

const SalesHeadDashboard = ({ setActiveView, isDarkMode = false }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [dateFilter, setDateFilter] = useState('')
  const [overviewDateFilter, setOverviewDateFilter] = useState('')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [allPayments, setAllPayments] = useState([])
  const [allQuotations, setAllQuotations] = useState([])
  const [topPerformers, setTopPerformers] = useState({ current: [], previous: [] })
  const [topPerformersView, setTopPerformersView] = useState('current') // current | previous

  const getCalendarDaysRemaining = (targetDate) => {
    if (!targetDate || isNaN(targetDate.getTime())) return 0
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    if (endDay < today) return 0
    const diffTime = endDay - today
    return Math.max(0, Math.round(diffTime / MS_IN_DAY))
  }
  
  // Department head target state
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

  // Helper functions to reduce code duplication
  const isPaymentApprovedByAccounts = (payment) => {
    // Check approval_status first (primary field), then fallback to other field names
    const accountsStatus = (payment.approval_status || payment.accounts_approval_status || payment.accountsApprovalStatus || '').toLowerCase()
    const isApproved = accountsStatus === 'approved'

    return isApproved
  }

  const isPaymentCompleted = (payment) => {
    const status = (payment.payment_status || payment.status || '').toLowerCase()
    return status === 'completed' || status === 'paid' || status === 'success' || status === 'advance'
  }

  const isPaymentRefund = (payment) => {
    return payment.is_refund === true || payment.is_refund === 1
  }

  const isAdvancePayment = (payment) => {
    const status = (payment.payment_status || payment.status || '').toLowerCase()
    return status === 'advance' || 
           payment.is_advance === true || 
           payment.payment_type === 'advance' || 
           payment.installment_number === 1 || 
           payment.installment_number === 0
  }

  const getPaymentAmount = (payment) => {
    const amount = Number(
      payment.installment_amount ||
      payment.paid_amount || 
      payment.amount || 
      payment.payment_amount ||
      0
    )
    return isNaN(amount) ? 0 : amount
  }

  // OPTIMIZED: Fetch ALL leads at once for dashboard overview
  // Use salesDataService.fetchAllLeads() to match SuperAdmin dashboard logic
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      
      // Use the same fetching method as SuperAdmin dashboard
      // Pass departmentType to ensure we get all leads from the department (not just created by this user)
      const departmentType = user?.departmentType || user?.department_type || 'office_sales'
      const allLeads = await salesDataService.fetchAllLeads(departmentType)
      
      // Transform API data to match our format
      const transformedLeads = allLeads.map(lead => ({
        id: lead.id,
        name: lead.customer || lead.name,
        sales_status: lead.sales_status || lead.salesStatus || 'pending',
        follow_up_status: lead.follow_up_status || lead.followUpStatus || '',
        source: lead.lead_source || lead.leadSource || 'Unknown',
        created_at: lead.created_at || lead.createdAt || lead.date || new Date().toISOString(),
        assigned_salesperson: lead.assigned_salesperson || lead.assignedSalesperson || ''
      }))
      
      setLeads(transformedLeads)
      setError(null)
    } catch (err) {
      console.error('Error loading leads:', err)
      setError('Failed to load leads data')
      setLeads([])
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [user?.departmentType, user?.department_type])

  // Fetch department head target data
  const fetchUserTarget = useCallback(async () => {
    try {
      if (!user?.id) {
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
      
      // Get department head data
      const response = await departmentHeadService.getHeadById(user.id)
      // Handle different response structures: {user: {...}} or {data: {user: {...}}} or direct data
      let headData = null
      if (response?.data?.user) {
        headData = response.data.user
      } else if (response?.user) {
        headData = response.user
      } else if (response?.data) {
        headData = response.data
      } else {
        headData = response
      }
      
      if (headData) {
        const target = parseFloat(headData.target || 0)
        const next = {
          target: target,
          achievedTarget: parseFloat(headData.achievedTarget || headData.achieved_target || 0),
          targetStartDate: headData.targetStartDate || headData.target_start_date || null,
          targetEndDate: headData.targetEndDate || headData.target_end_date || null,
          targetDurationDays: headData.targetDurationDays || headData.target_duration_days || null
        }
        setUserTarget(next)
        return next
      } else {
        console.warn('No head data found in response:', response)
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
    } catch (err) {
      console.error('Error fetching department head target:', err)
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
  }, [user?.id])

  // OPTIMIZED: Fetch business metrics - reuse leads from state if available
  const fetchBusinessMetrics = useCallback(async (leadsData = null, targetWindow = null) => {
    try {
      setLoadingMetrics(true)
      
      // OPTIMIZED: Reuse leads from state if available, otherwise fetch using parallel pagination
      let allLeads = leadsData || leads
      if (!allLeads || allLeads.length === 0) {
        // Use salesDataService.fetchAllLeads for parallel pagination (same as SuperAdmin)
        const departmentType = user?.departmentType || user?.department_type || 'office_sales'
        const fetchedLeads = await salesDataService.fetchAllLeads(departmentType)
        
        // Transform if needed
        allLeads = fetchedLeads.map(lead => ({
          id: lead.id,
          name: lead.customer || lead.name,
          sales_status: lead.sales_status || lead.salesStatus || 'pending',
          follow_up_status: lead.follow_up_status || lead.followUpStatus || '',
          source: lead.lead_source || lead.leadSource || 'Unknown',
          created_at: lead.created_at || lead.createdAt || lead.date || new Date().toISOString(),
          assigned_salesperson: lead.assigned_salesperson || lead.assignedSalesperson || ''
        }))
      }
      
      const leadIds = allLeads.map(lead => lead.id).filter(id => id != null)
      
      if (leadIds.length === 0) {
        setLoadingMetrics(false)
        setAllPayments([])
        return
      }
      
      // OPTIMIZED: Parallel fetch of quotations, customer payments
      const [bulkQuotationsRes, bulkCustomerPaymentsRes] = await Promise.all([
        quotationService.getBulkQuotationsByCustomers(leadIds),
        paymentService.getBulkPaymentsByCustomers(leadIds)
      ])
      let allQuotations = bulkQuotationsRes?.data || []
        
      // Remove duplicates based on quotation ID
      const uniqueQuotations = new Map()
      allQuotations.forEach(q => {
        if (q.id && !uniqueQuotations.has(q.id)) {
          uniqueQuotations.set(q.id, q)
        }
      })
      allQuotations = Array.from(uniqueQuotations.values())
      
      const quotationIds = allQuotations.map(q => q.id).filter(id => id != null)
      
      // OPTIMIZED: Parallel fetch of quotation payments and PIs
      const [quotationPaymentsRes, bulkPIsRes] = await Promise.all([
        quotationIds.length > 0 ? paymentService.getBulkPaymentsByQuotations(quotationIds) : Promise.resolve({ data: [] }),
        quotationIds.length > 0 ? proformaInvoiceService.getBulkPIsByQuotations(quotationIds) : Promise.resolve({ data: [] })
      ])
      
      const quotationPayments = quotationPaymentsRes?.data || []
      const customerPayments = bulkCustomerPaymentsRes?.data || []
      
      // Merge and deduplicate payments
      const paymentMap = new Map()
      ;[...quotationPayments, ...customerPayments].forEach(p => {
        const key = p.id || p.payment_reference || `${p.quotation_id}_${p.lead_id}_${p.payment_date}_${p.installment_amount}`
        if (!paymentMap.has(key)) {
          paymentMap.set(key, p)
        }
      })
      
      const fetchedPayments = Array.from(paymentMap.values())
      
      // Store payments and quotations for chart calculations
      setAllPayments(fetchedPayments)
      setAllQuotations(allQuotations)
      
      // Use fetchedPayments variable for rest of the function
      const allPayments = fetchedPayments
      
      // Get PIs
      const allPIs = bulkPIsRes?.data || []
      
      // Set of quotation IDs which have at least one PI
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
      // Filter completed/paid/advance payments and exclude refunds
      // ONLY include payments approved by accounts department (NO PI requirement for payment counting)
      let completedPayments = allPayments.filter(p => {
        return isPaymentCompleted(p) && !isPaymentRefund(p) && isPaymentApprovedByAccounts(p)
      })
      
      // Apply date range filter if department head has target dates
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
      const totalReceivedPayment = completedPayments.reduce((sum, p) => sum + getPaymentAmount(p), 0)
      
      // Calculate advance payment (first payment or payments marked as advance)
      const advancePayments = completedPayments.filter(isAdvancePayment)
      const totalAdvancePayment = advancePayments.reduce((sum, p) => sum + getPaymentAmount(p), 0)
      
      // Calculate due payments - ONLY for quotations that have PI created
      // Don't care about quotation approval status, just need PI to exist
      const quotationsWithPI = allQuotations.filter(q => quotationIdsWithPI.has(q.id))
      
      // Fetch summaries for quotations with PI to get accurate totals (in background)
      const quotationIdsForSummary = quotationsWithPI.map(q => q.id)
      let summariesMap = {}
      
      if (quotationIdsForSummary.length > 0) {
        try {
          const bulkSummariesRes = await quotationService.getBulkSummaries(quotationIdsForSummary)
          summariesMap = bulkSummariesRes?.data || {}
        } catch (err) {
          console.error('Error fetching summaries:', err)
        }
      }
      
      // Calculate due payment and total revenue
      let duePayment = 0
      let totalRevenue = 0
      
      // Calculate for each quotation that has PI
      quotationsWithPI.forEach(quotation => {
        const summary = summariesMap[quotation.id]
        
        // Try to get total from summary first, then fallback to quotation
        let quotationTotal = 0
        if (summary && summary.total_amount) {
          quotationTotal = Number(summary.total_amount)
        } else if (summary && summary.grand_total) {
          quotationTotal = Number(summary.grand_total)
        } else {
          quotationTotal = Number(quotation.total_amount || quotation.total || 0)
        }
        
        
        // Safeguard against unreasonably large numbers (> 10 crore per quotation)
        if (quotationTotal > 100000000) {
          console.warn('  - WARNING: Quotation amount too high, skipping:', quotationTotal)
          return
        }
        
        if (!isNaN(quotationTotal) && quotationTotal > 0) {
          // Only add to total revenue if quotation is approved
          const status = (quotation.status || '').toLowerCase()
          if (status === 'approved') {
            totalRevenue += quotationTotal
          }
          
          // Get all approved payments for this quotation (advance, partial, full)
          const quotationPayments = allPayments.filter(p => 
            p.quotation_id === quotation.id && 
            isPaymentCompleted(p) && 
            !isPaymentRefund(p) && 
            isPaymentApprovedByAccounts(p)
          )
          
          const paidTotal = quotationPayments.reduce((sum, p) => {
            return sum + getPaymentAmount(p)
          }, 0)
          
          // Calculate remaining amount (Due Payment)
          const remaining = quotationTotal - paidTotal
          
          if (remaining > 0) {
            duePayment += remaining
          }
        }
      })
      
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
      
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      currentMonthEnd.setHours(23, 59, 59, 999)

      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      prevMonthEnd.setHours(23, 59, 59, 999)

      // Calculate top performers based on payment received (in background)
      Promise.all([
        calculateTopPerformers(fetchedPayments, allQuotations, allLeads, quotationIdsWithPI, {
          startDate: toDateOnly(currentMonthStart),
          endDate: toDateOnly(currentMonthEnd)
        }),
        calculateTopPerformers(fetchedPayments, allQuotations, allLeads, quotationIdsWithPI, {
          startDate: toDateOnly(prevMonthStart),
          endDate: toDateOnly(prevMonthEnd)
        })
      ]).then(([current, previous]) => {
        setTopPerformers({ current, previous })
      }).catch(err => {
        console.error('Error calculating top performers:', err)
        setTopPerformers({ current: [], previous: [] })
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
  }, [user?.departmentType, user?.department_type, userTarget.targetStartDate, userTarget.targetEndDate, leads])

  // OPTIMIZED: Refresh dashboard function - fetch leads first, then metrics with leads data
  // Use salesDataService.fetchAllLeads() to match SuperAdmin dashboard logic
  const refreshDashboard = useCallback(async () => {
    try {
      setRefreshing(true)
      // Fetch leads using the same method as SuperAdmin dashboard
      const departmentType = user?.departmentType || user?.department_type || 'office_sales'
      const allLeads = await salesDataService.fetchAllLeads(departmentType)
      
      // Transform API data to match our format
      const transformedLeads = allLeads.map(lead => ({
        id: lead.id,
        name: lead.customer || lead.name,
        sales_status: lead.sales_status || lead.salesStatus || 'pending',
        follow_up_status: lead.follow_up_status || lead.followUpStatus || '',
        source: lead.lead_source || lead.leadSource || 'Unknown',
        created_at: lead.created_at || lead.createdAt || lead.date || new Date().toISOString(),
        assigned_salesperson: lead.assigned_salesperson || lead.assignedSalesperson || ''
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
  }, [user?.departmentType, user?.department_type, fetchBusinessMetrics, fetchUserTarget])

  // Calculate top performers based on payment received
  const calculateTopPerformers = async (payments, quotations, leads, quotationIdsWithPI = new Set(), dateRange = null) => {
    try {
      // Get all department users under this head
      if (!user?.id) {
        return []
      }
      
      const usersResponse = await departmentUserService.getByHeadId(user.id)
      // Handle different response structures - check data.users first (nested structure)
      let users = []
      if (usersResponse?.data?.users && Array.isArray(usersResponse.data.users)) {
        users = usersResponse.data.users
      } else if (Array.isArray(usersResponse?.data)) {
        users = usersResponse.data
      } else if (Array.isArray(usersResponse)) {
        users = usersResponse
      } else if (usersResponse?.success && usersResponse.data?.users && Array.isArray(usersResponse.data.users)) {
        users = usersResponse.data.users
      } else if (usersResponse?.success && Array.isArray(usersResponse.data)) {
        users = usersResponse.data
      } else if (usersResponse?.users && Array.isArray(usersResponse.users)) {
        users = usersResponse.users
      }
      
      if (!Array.isArray(users) || users.length === 0) {
        return []
      }
      
      // Create a map of salesperson identifier (email/username) to their data
      const performerMap = new Map()
      
      // Initialize all users - use email and username as keys
      users.forEach(u => {
        const name = u.name || u.username || u.email || 'Unknown'
        const email = u.email || ''
        const username = u.username || ''
        
        // Store by both email and username for matching
        performerMap.set(email.toLowerCase(), {
          name,
          email,
          username,
          paymentReceived: 0,
          saleOrders: 0,
          saleOrderAmount: 0
        })
        if (username && username.toLowerCase() !== email.toLowerCase()) {
          performerMap.set(username.toLowerCase(), {
            name,
            email,
            username,
            paymentReceived: 0,
            saleOrders: 0,
            saleOrderAmount: 0
          })
        }
      })
      
      // Calculate payment received per salesperson
      // ONLY include payments approved by accounts department (NO PI requirement)
      let completedPayments = payments.filter(p => {
        return isPaymentCompleted(p) && isPaymentApprovedByAccounts(p)
      })

      if (dateRange?.startDate && dateRange?.endDate) {
        const start = new Date(`${dateRange.startDate}T00:00:00`)
        const end = new Date(`${dateRange.endDate}T23:59:59.999`)
        completedPayments = completedPayments.filter(p => {
          const paymentDate = p.payment_date ? new Date(p.payment_date) : (p.created_at ? new Date(p.created_at) : null)
          if (!paymentDate || isNaN(paymentDate.getTime())) return false
          return paymentDate >= start && paymentDate <= end
        })
      }
      
      // Map quotations to salespersons via leads
      const quotationToSalesperson = new Map()
      quotations.forEach(q => {
        if (q.customer_id) {
          const lead = leads.find(l => l.id === q.customer_id)
          if (lead && lead.assigned_salesperson) {
            const salespersonId = String(lead.assigned_salesperson).toLowerCase().trim()
            quotationToSalesperson.set(q.id, salespersonId)
          }
        }
      })
      
      // Calculate payments and sale orders per salesperson
      completedPayments.forEach(payment => {
        const salespersonId = quotationToSalesperson.get(payment.quotation_id)
        if (salespersonId && performerMap.has(salespersonId)) {
          const performer = performerMap.get(salespersonId)
          performer.paymentReceived += getPaymentAmount(payment)
        }
      })
      
      // Count sale orders per salesperson
      // Business rule: any quotation that has at least one PI created is treated as a Sale Order
      // This matches the logic used in the salesperson dashboard (no approval status check needed)
      quotations.forEach(quotation => {
        // Only check if quotation has a PI (matches salesperson dashboard logic)
        if (quotationIdsWithPI.has(quotation.id)) {
          const salespersonId = quotationToSalesperson.get(quotation.id)
          if (salespersonId && performerMap.has(salespersonId)) {
            const performer = performerMap.get(salespersonId)
            // Count unique quotations as sale orders
            if (!performer.saleOrderQuotations) {
              performer.saleOrderQuotations = new Set()
            }
            performer.saleOrderQuotations.add(quotation.id)
            
            // Get quotation total amount for sale order amount
            const quotationAmount = Number(quotation.total_amount || 0)
            if (!performer.saleOrderAmountMap) {
              performer.saleOrderAmountMap = new Map()
            }
            // Only add once per quotation (use Map to avoid duplicates)
            if (!performer.saleOrderAmountMap.has(quotation.id)) {
              performer.saleOrderAmountMap.set(quotation.id, quotationAmount)
              performer.saleOrderAmount = (performer.saleOrderAmount || 0) + quotationAmount
            }
          }
        }
      })
      
      // Convert sale order sets to counts and deduplicate by email
      const uniquePerformers = new Map()
      performerMap.forEach((performer, key) => {
        const emailKey = performer.email.toLowerCase()
        if (!uniquePerformers.has(emailKey)) {
          uniquePerformers.set(emailKey, {
            name: performer.name,
            email: performer.email,
            paymentReceived: performer.paymentReceived,
            saleOrders: performer.saleOrderQuotations?.size || 0,
            saleOrderAmount: performer.saleOrderAmount || 0
          })
        } else {
          // Merge data if duplicate
          const existing = uniquePerformers.get(emailKey)
          existing.paymentReceived += performer.paymentReceived
          existing.saleOrderAmount += (performer.saleOrderAmount || 0)
          if (performer.saleOrderQuotations) {
            performer.saleOrderQuotations.forEach(qId => {
              if (!existing.saleOrderQuotations) {
                existing.saleOrderQuotations = new Set()
              }
              existing.saleOrderQuotations.add(qId)
            })
            existing.saleOrders = existing.saleOrderQuotations.size
            delete existing.saleOrderQuotations
          }
        }
      })
      
      // Sort by payment received and get top 3
      const performers = Array.from(uniquePerformers.values())
        .filter(p => p.paymentReceived > 0)
        .sort((a, b) => b.paymentReceived - a.paymentReceived)
        .slice(0, 3)

      return performers
    } catch (err) {
      console.error('Error calculating top performers:', err)
      return []
    }
  }

  // Load real data on mount
  // OPTIMIZED: Prevent duplicate calls with refs
  const fetchingMetricsRef = React.useRef(false);
  const initialLoadRef = React.useRef(false);
  
  // OPTIMIZED: Load real data on mount - fetch leads first, then metrics with leads data
  useEffect(() => {
    if (!user?.id || initialLoadRef.current) return;
    initialLoadRef.current = true;
    
    const loadData = async () => {
      // Fetch leads first
      await fetchLeads();
      // Fetch user target in parallel
      await fetchUserTarget();
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])
  
  // OPTIMIZED: Fetch metrics after leads are loaded (reuse leads data)
  useEffect(() => {
    if (!initialLoadRef.current || fetchingMetricsRef.current || !leads.length || !user?.id) return;
    
    // Fetch metrics with leads data to avoid duplicate API call
    if (!fetchingMetricsRef.current) {
      fetchingMetricsRef.current = true;
      fetchBusinessMetrics(leads, userTarget).finally(() => {
        fetchingMetricsRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads.length, user?.id]); // Only when leads are loaded
  
  // OPTIMIZED: Fetch business metrics when user target dates change (to recalculate with date range)
  useEffect(() => {
    // Skip if not yet initialized or already fetching
    if (!initialLoadRef.current || fetchingMetricsRef.current || !user?.id) return;
    
    // Only refetch if we have target dates
    if (userTarget.targetStartDate && userTarget.targetEndDate) {
      fetchingMetricsRef.current = true;
      fetchBusinessMetrics(leads, userTarget).finally(() => {
        fetchingMetricsRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTarget.targetStartDate, userTarget.targetEndDate])

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

  // Filter leads by date (from selected date to current date)
  const getFilteredLeads = () => {
    if (!overviewDateFilter) return leads
    
    const selectedDate = new Date(overviewDateFilter)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    // Current date (end of today)
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    
    return leads.filter(lead => {
      if (!lead.created_at) return false
      const leadDate = new Date(lead.created_at)
      return leadDate >= startOfDay && leadDate <= endDate
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

  // Calculate monthly revenue trend from real payment data
  const calculateMonthlyRevenue = () => {
    // Filter payments by date if date filter is set (from selected date to current date)
    let paymentsToUse = allPayments
    
    if (overviewDateFilter) {
      const selectedDate = new Date(overviewDateFilter)
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      
      // Current date (end of today)
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999)
      
      paymentsToUse = allPayments.filter(p => {
        const paymentDate = p.payment_date ? new Date(p.payment_date) : (p.created_at ? new Date(p.created_at) : null)
        if (!paymentDate) return false
        return paymentDate >= startOfDay && paymentDate <= endDate
      })
    }
    
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

  // Chart data functions for Chart.js components
  const getQuotationTrendsData = () => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }
    
    const quotationByMonth = {}
    const filteredQuotations = getFilteredQuotations()
    
    filteredQuotations.forEach(q => {
      const date = q.created_at ? new Date(q.created_at) : null
      if (!date) return
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      quotationByMonth[monthKey] = (quotationByMonth[monthKey] || 0) + 1
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
      const status = (l.sales_status || l.salesStatus || '').toLowerCase()
      return status === 'interested' || status === 'running' || status === 'converted'
    }).length
    
    const proposal = filteredLeads.filter(l => {
      const followUp = (l.follow_up_status || '').toLowerCase()
      return followUp === 'quotation sent' || followUp === 'proposal sent'
    }).length
    
    const closed = filteredLeads.filter(l => {
      const status = (l.sales_status || l.salesStatus || '').toLowerCase()
      return status === 'win/closed' || status === 'closed' || status === 'converted'
    }).length
    
    return {
      labels: ['Leads', 'Qualified', 'Proposal', 'Closed'],
      values: [totalLeads, qualified, proposal, closed]
    }
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
      actual: monthlyActual,
      target: monthlyTarget
    }
  }

  const getRevenueDistributionData = () => {
    const filteredQuotations = getFilteredQuotations()
    const productMap = {}
    
    filteredQuotations.forEach(q => {
      const items = q.items || []
      items.forEach(item => {
        const productName = item.product_name || item.name || 'Unknown'
        const quantity = parseFloat(item.quantity || 0)
        const price = parseFloat(item.price || 0)
        const amount = quantity * price
        
        productMap[productName] = (productMap[productName] || 0) + amount
      })
    })
    
    const sortedProducts = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    return {
      labels: sortedProducts.map(p => p[0]),
      values: sortedProducts.map(p => Math.round(p[1]))
    }
  }

  const getOutstandingPaymentAgingData = () => {
    const paymentsToUse = getFilteredPayments()
    const now = new Date()
    
    const aging0_30 = paymentsToUse.filter(p => {
      const dueDate = p.due_date ? new Date(p.due_date) : null
      if (!dueDate) return false
      const daysDiff = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
      const status = (p.payment_status || p.status || '').toLowerCase()
      const approvalStatus = (p.approval_status || '').toLowerCase()
      const isApproved = approvalStatus === 'approved'
      const isCompleted = status === 'completed' || status === 'paid' || status === 'success'
      return !isCompleted && isApproved && daysDiff >= 0 && daysDiff <= 30
    }).reduce((sum, p) => {
      const amount = parseFloat(p.installment_amount || p.amount || p.paid_amount || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const aging31_60 = paymentsToUse.filter(p => {
      const dueDate = p.due_date ? new Date(p.due_date) : null
      if (!dueDate) return false
      const daysDiff = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
      const status = (p.payment_status || p.status || '').toLowerCase()
      const approvalStatus = (p.approval_status || '').toLowerCase()
      const isApproved = approvalStatus === 'approved'
      const isCompleted = status === 'completed' || status === 'paid' || status === 'success'
      return !isCompleted && isApproved && daysDiff > 30 && daysDiff <= 60
    }).reduce((sum, p) => {
      const amount = parseFloat(p.installment_amount || p.amount || p.paid_amount || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const aging60Plus = paymentsToUse.filter(p => {
      const dueDate = p.due_date ? new Date(p.due_date) : null
      if (!dueDate) return false
      const daysDiff = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
      const status = (p.payment_status || p.status || '').toLowerCase()
      const approvalStatus = (p.approval_status || '').toLowerCase()
      const isApproved = approvalStatus === 'approved'
      const isCompleted = status === 'completed' || status === 'paid' || status === 'success'
      return !isCompleted && isApproved && daysDiff > 60
    }).reduce((sum, p) => {
      const amount = parseFloat(p.installment_amount || p.amount || p.paid_amount || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    return {
      labels: ['0-30 Days', '31-60 Days', '60+ Days'],
      values: [Math.round(aging0_30), Math.round(aging31_60), Math.round(aging60Plus)]
    }
  }

  const getPaymentAreaData = () => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }
    
    const paymentsToUse = getFilteredPayments()
    
    return months.map((monthLabel, monthIndex) => {
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
        return isCompleted && isApproved && paymentDate >= monthStart && paymentDate <= monthEnd
      })
      
      const received = monthPayments.reduce((sum, p) => {
        const amount = parseFloat(p.installment_amount || p.amount || p.paid_amount || 0)
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0)
      
      return {
        label: monthLabel,
        received: Math.round(received),
        advance: 0,
        due: 0
      }
    })
  }

  const getFilteredQuotations = () => {
    // Return all quotations for department head (can add date filtering later if needed)
    return allQuotations || []
  }

  const getFilteredPayments = () => {
    // Return all payments for department head (can add date filtering later if needed)
    return allPayments || []
  }

  // Handle date filter change
  const handleDateFilterChange = (selectedDate) => {
    setDateFilter(selectedDate)
  }

  // OPTIMIZED: Memoize heavy calculations
  const calculatedMetrics = useMemo(() => calculateMetrics(), [leads, overviewDateFilter])
  const statusData = useMemo(() => calculateLeadStatusData(), [leads, overviewDateFilter])
  const leadSources = useMemo(() => calculateLeadSources(), [leads, overviewDateFilter])
  const weeklyActivity = useMemo(() => calculateWeeklyActivity(), [leads, overviewDateFilter])
  const monthlyRevenue = useMemo(() => calculateMonthlyRevenue(), [allPayments, overviewDateFilter])

  // Generate performance data with demo data
  const getPerformanceData = (selectedDate) => {
    // Demo performance data
    const baseData = {
      targets: {
        monthlyLeads: { current: 45, target: 100, label: "Monthly Leads" },
        conversionRate: { current: 28, target: 30, label: "Conversion Rate (%)" },
        revenue: { current: 1250000, target: 1500000, label: "Quarterly Revenue (₹)" },
        calls: { current: 45, target: 60, label: "Daily Calls" }
      },
      leadStatusData: [
        { label: "New", value: 5, color: "#3b82f6" },
        { label: "Contacted", value: 8, color: "#60a5fa" },
        { label: "Proposal Sent", value: 6, color: "#f59e0b" },
        { label: "Meeting Scheduled", value: 4, color: "#8b5cf6" },
        { label: "Closed Won", value: 3, color: "#10b981" },
        { label: "Closed Lost", value: 2, color: "#ef4444" }
      ],
      monthlyPerformance: [
        { label: "Jan", value: 78, color: "#3b82f6" },
        { label: "Feb", value: 85, color: "#3b82f6" },
        { label: "Mar", value: 92, color: "#3b82f6" },
        { label: "Apr", value: 88, color: "#3b82f6" },
        { label: "May", value: 95, color: "#3b82f6" },
        { label: "Jun", value: 102, color: "#10b981" }
      ],
      kpis: [
        {
          title: "Lead Response Time",
          value: "0 hrs",
          target: "< 1 hr",
          status: "warning",
          icon: Clock,
          color: "bg-orange-50 text-orange-600 border-orange-200"
        },
        {
          title: "Follow-up Rate",
          value: "0%",
          target: "> 85%",
          status: "warning",
          icon: ArrowUp,
          color: "bg-orange-50 text-orange-600 border-orange-200"
        },
        {
          title: "Customer Satisfaction",
          value: "0/5",
          target: "> 4.5",
          status: "warning",
          icon: Award,
          color: "bg-orange-50 text-orange-600 border-orange-200"
        },
        {
          title: "Quotation Success",
          value: "0%",
          target: "> 70%",
          status: "warning",
          icon: CheckCircle,
          color: "bg-orange-50 text-orange-600 border-orange-200"
        },
        {
          title: "Transfer Leads",
          value: "0",
          target: "< 20",
          status: "success",
          icon: ArrowRightLeft,
          color: "bg-green-50 text-green-600 border-green-200"
        }
      ]
    }

    // If no date is selected, return base data
    if (!selectedDate) {
      return baseData
    }

    // Return base data for any selected date (no dummy variations)
    return baseData
  }

  // Get filtered performance data
  const performanceData = getPerformanceData(dateFilter)

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

  // Calculate days left based on target period
  const daysLeftInTarget = (() => {
    if (!hasTargetAssigned) return 0
    const endDate = new Date(`${userTarget.targetEndDate}T00:00:00`)
    return getCalendarDaysRemaining(endDate)
  })()
  
  // Use actual department head target data (only when assigned)
  const revenueTarget = hasTargetAssigned ? (userTarget.target || 0) : 0
  const revenueCurrent = hasTargetAssigned ? (businessMetrics.totalReceivedPayment || 0) : 0

  // Overview Data - Real data from API
  const overviewData = {
    metrics: [
      {
        title: "Total Leads",
        value: calculatedMetrics.totalLeads.toString(),
        subtitle: "Active leads this month",
        icon: UserPlus,
        color: "bg-blue-50 text-blue-600 border-blue-200",
        trend: "+12%",
        trendUp: true
      },
      {
        title: "Conversion Rate",
        value: `${calculatedMetrics.conversionRate}%`,
        subtitle: "Above target of 20%",
        icon: CheckCircle,
        color: "bg-green-50 text-green-600 border-green-200",
        trend: "+3.2%",
        trendUp: true
      },
      {
        title: "Pending Rate",
        value: `${calculatedMetrics.pendingRate}%`,
        subtitle: "Leads requiring follow-up",
        icon: Clock,
        color: "bg-orange-50 text-orange-600 border-orange-200",
        trend: "-2.1%",
        trendUp: false
      },
      {
        title: "Total Revenue",
        value: `₹${businessMetrics.totalReceivedPayment.toLocaleString('en-IN')}`,
        subtitle: "Revenue from payment received",
        icon: CreditCard,
        color: "bg-purple-50 text-purple-600 border-purple-200",
        trend: "0%",
        trendUp: false
      },
    ],
    weeklyLeads: weeklyActivity,
    leadSourceData: leadSources,
    monthlyRevenue: monthlyRevenue
  }

  const overviewMetrics = overviewData.metrics

  // Counts mapped directly from lead status values used in Lead Status page
  // Use SalesDataService.calculateLeadStatuses() for consistency with SuperAdmin dashboard
  const salesStatusCounts = React.useMemo(() => {
    const filtered = getFilteredLeads()
    // Use the same calculation method as SuperAdmin dashboard
    const leadStatuses = salesDataService.calculateLeadStatuses(filtered)
    // Convert to the format expected by this component
    return {
      all: leadStatuses.total,
      pending: leadStatuses.pending,
      running: leadStatuses.running,
      converted: leadStatuses.converted,
      interested: leadStatuses.interested,
      'win/closed': leadStatuses.winClosed,
      closed: leadStatuses.closed,
      lost: leadStatuses.lost
    }
  }, [leads, overviewDateFilter])

  // Follow-up specific counts (only the requested ones)
  // Use SalesDataService.calculateLeadStatuses() for consistency with SuperAdmin dashboard
  const followUpCounts = React.useMemo(() => {
    const filtered = getFilteredLeads()
    // Use the same calculation method as SuperAdmin dashboard
    const leadStatuses = salesDataService.calculateLeadStatuses(filtered)
    return {
      'appointment scheduled': leadStatuses.meetingScheduled,
      'closed/lost': leadStatuses.closedLostFollowup,
      'quotation sent': leadStatuses.quotationSent
    }
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

  // Show skeleton loader on initial load (same as SuperAdmin)
  if (initialLoading) {
    return <DashboardSkeleton />
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
    <main className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Tab Navigation with Date Filter and Refresh Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <div className="flex gap-3 sm:gap-6 overflow-x-auto w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`gap-2 flex items-center pb-2 border-b-2 whitespace-nowrap ${
              activeTab === 'overview' 
                ? 'text-blue-600 border-blue-600' 
                : isDarkMode 
                  ? 'text-gray-400 border-transparent'
                  : 'text-gray-500 border-transparent'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={`gap-2 flex items-center pb-2 border-b-2 whitespace-nowrap ${
              activeTab === 'performance' 
                ? 'text-blue-600 border-blue-600' 
                : isDarkMode 
                  ? 'text-gray-400 border-transparent'
                  : 'text-gray-500 border-transparent'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Performance
          </button>
        </div>
        {activeTab === 'overview' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                refreshing
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'
              }`}
              title="Refresh dashboard data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="relative flex items-center gap-2">
              <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                overviewDateFilter 
                  ? (isDarkMode ? 'text-purple-400' : 'text-purple-600')
                  : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
              } transition-colors duration-200`} />
              <input
                type="date"
                value={overviewDateFilter}
                onChange={(e) => setOverviewDateFilter(e.target.value)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm min-w-0 ${
                  isDarkMode 
                    ? `bg-gray-800 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 ${overviewDateFilter ? 'border-purple-400 bg-purple-900/30' : ''}`
                    : `bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 ${overviewDateFilter ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`
                }`}
                title="Filter data from selected date to today"
                max={toDateOnly(new Date())}
                placeholder="dd-mm-yyyy"
              />
              {overviewDateFilter && (
                <button
                  onClick={() => setOverviewDateFilter('')}
                  className={`px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-800 border border-gray-600' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 bg-white border border-gray-300'
                  }`}
                  title="Clear date filter"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'overview' && (
        <>
      {/* Lead Status Summary - Moved to top */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Status Summary</h2>
        </div>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Overview of your leads by status</p>

        {/* Total Leads Card and Lead Status Cards - Combined grid with 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-hidden">
          {/* Total Leads Card - Added at the beginning */}
          <Card className={cx(
            "border-2 relative overflow-hidden",
            isDarkMode 
              ? "bg-gradient-to-br from-blue-900/90 to-blue-800/90 border-blue-500/50 text-white shadow-blue-500/20" 
              : "bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 text-blue-700 border-blue-300 shadow-lg shadow-blue-200/50"
          )} isDarkMode={isDarkMode}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className={`text-sm font-semibold ${
                isDarkMode 
                  ? 'text-blue-100' 
                  : 'text-blue-800'
              }`} isDarkMode={isDarkMode}>Total Leads</CardTitle>
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-blue-800/50' : 'bg-blue-200/50'
              }`}>
                <UserPlus className={`h-5 w-5 ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                isDarkMode ? 'from-white to-blue-100 bg-clip-text text-transparent' : 'from-blue-600 to-blue-800 bg-clip-text text-transparent'
              }`}>{calculatedMetrics.totalLeads}</div>
              <p className={`text-xs font-medium ${
                isDarkMode 
                  ? 'text-blue-200' 
                  : 'text-blue-600'
              }`}>All leads {overviewDateFilter ? 'from selected date to today' : 'in your pipeline'}</p>
            </CardContent>
          </Card>
          {leadStatuses.map((status, index) => {
            const Icon = status.icon
            // Color mapping for vibrant gradients - matching salesperson dashboard
            const colorMap = {
              'Pending': { gradient: 'from-orange-50 via-amber-50 to-orange-50', border: 'border-orange-300', iconBg: 'bg-orange-200/50', iconColor: 'text-orange-600', textColor: 'text-orange-800', valueColor: 'from-orange-600 to-orange-800', shadow: 'shadow-orange-200/50' },
              'Running': { gradient: 'from-blue-50 via-cyan-50 to-blue-50', border: 'border-blue-300', iconBg: 'bg-blue-200/50', iconColor: 'text-blue-600', textColor: 'text-blue-800', valueColor: 'from-blue-600 to-blue-800', shadow: 'shadow-blue-200/50' },
              'Converted': { gradient: 'from-green-50 via-emerald-50 to-green-50', border: 'border-green-300', iconBg: 'bg-green-200/50', iconColor: 'text-green-600', textColor: 'text-green-800', valueColor: 'from-green-600 to-green-800', shadow: 'shadow-green-200/50' },
              'Interested': { gradient: 'from-purple-50 via-violet-50 to-purple-50', border: 'border-purple-300', iconBg: 'bg-purple-200/50', iconColor: 'text-purple-600', textColor: 'text-purple-800', valueColor: 'from-purple-600 to-purple-800', shadow: 'shadow-purple-200/50' },
              'Win/Closed': { gradient: 'from-emerald-50 via-teal-50 to-emerald-50', border: 'border-emerald-300', iconBg: 'bg-emerald-200/50', iconColor: 'text-emerald-600', textColor: 'text-emerald-800', valueColor: 'from-emerald-600 to-emerald-800', shadow: 'shadow-emerald-200/50' },
              'Closed': { gradient: 'from-gray-50 via-slate-50 to-gray-50', border: 'border-gray-300', iconBg: 'bg-gray-200/50', iconColor: 'text-gray-600', textColor: 'text-gray-800', valueColor: 'from-gray-600 to-gray-800', shadow: 'shadow-gray-200/50' },
              'Lost': { gradient: 'from-red-50 via-rose-50 to-red-50', border: 'border-red-300', iconBg: 'bg-red-200/50', iconColor: 'text-red-600', textColor: 'text-red-800', valueColor: 'from-red-600 to-red-800', shadow: 'shadow-red-200/50' },
              'Meeting scheduled': { gradient: 'from-indigo-50 via-blue-50 to-indigo-50', border: 'border-indigo-300', iconBg: 'bg-indigo-200/50', iconColor: 'text-indigo-600', textColor: 'text-indigo-800', valueColor: 'from-indigo-600 to-indigo-800', shadow: 'shadow-indigo-200/50' },
              'Quotation Sent': { gradient: 'from-yellow-50 via-amber-50 to-yellow-50', border: 'border-yellow-300', iconBg: 'bg-yellow-200/50', iconColor: 'text-yellow-600', textColor: 'text-yellow-800', valueColor: 'from-yellow-600 to-yellow-800', shadow: 'shadow-yellow-200/50' },
              'Closed/Lost (Follow-up)': { gradient: 'from-slate-50 via-gray-50 to-slate-50', border: 'border-slate-300', iconBg: 'bg-slate-200/50', iconColor: 'text-slate-600', textColor: 'text-slate-800', valueColor: 'from-slate-600 to-slate-800', shadow: 'shadow-slate-200/50' },
            }
            const colors = colorMap[status.title] || { 
              gradient: 'from-gray-50 to-gray-50', 
              border: 'border-gray-300', 
              iconBg: 'bg-gray-200/50', 
              iconColor: 'text-gray-600', 
              textColor: 'text-gray-800', 
              valueColor: 'from-gray-600 to-gray-800',
              shadow: 'shadow-gray-200/50'
            }
            
            return (
              <Card key={index} className={cx(
                "border-2 relative overflow-hidden",
                isDarkMode 
                  ? "bg-gradient-to-br from-gray-800/90 to-gray-700/90 border-gray-600/50 text-white" 
                  : `bg-gradient-to-br ${colors.gradient} ${colors.border} shadow-lg ${colors.shadow}`
              )} isDarkMode={isDarkMode}>
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
                  isDarkMode 
                    ? 'from-gray-600/20 to-gray-500/20' 
                    : colors.valueColor.split(' ').map(c => c.includes('from-') || c.includes('to-') ? c + '/10' : c).join(' ')
                } rounded-bl-full`}></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={`text-sm font-semibold ${
                    isDarkMode 
                      ? 'text-gray-200' 
                      : colors.textColor
                  }`} isDarkMode={isDarkMode}>{status.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : colors.iconBg
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-300' : colors.iconColor
                    }`} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                    isDarkMode 
                      ? 'from-white to-gray-200 bg-clip-text text-transparent' 
                      : `${colors.valueColor} bg-clip-text text-transparent`
                  }`}>{status.count}</div>
                  <p className={`text-xs font-medium ${
                    isDarkMode 
                      ? 'text-gray-300' 
                      : colors.textColor.replace('800', '600')
                  }`}>{status.subtitle}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Target & Timeline - Revenue Targets */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <Target className={`h-5 w-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Target & Timeline</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          <Card className={cx(
            "border-2 relative overflow-hidden",
            isDarkMode 
              ? "bg-gradient-to-br from-indigo-900/90 to-purple-800/90 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/20" 
              : "bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 text-indigo-700 border-indigo-300 shadow-xl shadow-indigo-200/50"
          )} isDarkMode={isDarkMode}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className={`text-sm font-semibold ${isDarkMode ? 'text-indigo-100' : 'text-indigo-800'}`} isDarkMode={isDarkMode}>Revenue Target</CardTitle>
              <div className={`p-2.5 rounded-xl shadow-lg ${isDarkMode ? 'bg-indigo-800/50' : 'bg-white/80'}`}>
                <Target className={`h-5 w-5 ${isDarkMode ? 'text-indigo-200' : 'text-indigo-600'}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                isDarkMode ? 'from-white to-indigo-100 bg-clip-text text-transparent' : 'from-indigo-600 to-purple-600 bg-clip-text text-transparent'
              }`}>₹{revenueTarget.toLocaleString('en-IN')}</div>
              <p className={`text-xs font-medium mb-3 ${
                isDarkMode ? 'text-indigo-200' : 'text-indigo-600'
              }`}>
                {hasTargetAssigned 
                  ? `Revenue target (${new Date(`${userTarget.targetStartDate}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${new Date(`${userTarget.targetEndDate}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })})`
                  : 'Target not assigned for this month'
                }
              </p>
              <div className={`w-full h-2 rounded-full ${
                isDarkMode ? 'bg-indigo-800/30' : 'bg-indigo-100'
              }`}>
                <div className={`h-full rounded-full bg-gradient-to-r ${
                  isDarkMode ? 'from-indigo-400 to-purple-400' : 'from-indigo-500 to-purple-500'
                }`} style={{ width: '100%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className={cx(
            "border-2 relative overflow-hidden",
            isDarkMode 
              ? "bg-gradient-to-br from-green-900/90 to-emerald-800/90 border-green-500/50 text-white shadow-lg shadow-green-500/20" 
              : "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 text-green-700 border-green-300 shadow-xl shadow-green-200/50"
          )} isDarkMode={isDarkMode}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className={`text-sm font-semibold ${
                isDarkMode 
                  ? 'text-green-100' 
                  : 'text-green-800'
              }`} isDarkMode={isDarkMode}>Revenue Achieved</CardTitle>
              <div className={`p-2.5 rounded-xl shadow-lg ${isDarkMode ? 'bg-green-800/50' : 'bg-white/80'}`}>
                <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-green-200' : 'text-green-600'}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                isDarkMode ? 'from-white to-green-100 bg-clip-text text-transparent' : 'from-green-600 to-emerald-600 bg-clip-text text-transparent'
              }`}>₹{revenueCurrent.toLocaleString('en-IN')}</div>
              <p className={`text-xs font-medium mb-3 ${
                isDarkMode 
                  ? 'text-green-200' 
                  : 'text-green-600'
              }`}>
                {hasTargetAssigned 
                  ? `Revenue achieved (${userTarget.targetDurationDays || Math.ceil((new Date(`${userTarget.targetEndDate}T00:00:00`) - new Date(`${userTarget.targetStartDate}T00:00:00`)) / (1000 * 60 * 60 * 24))} days period)`
                  : 'Target not assigned'
                }
              </p>
              <div className={`w-full h-2 rounded-full ${
                isDarkMode ? 'bg-green-800/30' : 'bg-green-100'
              }`}>
                <div className={`h-full rounded-full bg-gradient-to-r ${
                  isDarkMode ? 'from-green-400 to-emerald-400' : 'from-green-500 to-emerald-500'
                }`} style={{ width: '100%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className={cx(
            "border-2 relative overflow-hidden",
            isDarkMode 
              ? "bg-gradient-to-br from-slate-800/90 to-gray-700/90 border-slate-600/50 text-white shadow-lg shadow-slate-500/20" 
              : "bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 text-slate-700 border-slate-300 shadow-xl shadow-slate-200/50"
          )} isDarkMode={isDarkMode}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-400/20 to-gray-500/20 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className={`text-sm font-semibold ${
                isDarkMode 
                  ? 'text-slate-200' 
                  : 'text-slate-800'
              }`} isDarkMode={isDarkMode}>Days Left</CardTitle>
              <div className={`p-2.5 rounded-xl shadow-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-white/80'}`}>
                <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                isDarkMode ? 'from-white to-slate-200 bg-clip-text text-transparent' : 'from-slate-600 to-gray-700 bg-clip-text text-transparent'
              }`}>{daysLeftInTarget}</div>
              <p className={`text-xs font-medium mb-3 ${
                isDarkMode 
                  ? 'text-slate-300' 
                  : 'text-slate-600'
              }`}>
                {hasTargetAssigned ? 'Remaining days in target period' : 'Target not assigned'}
              </p>
              <div className={`w-full h-2 rounded-full ${
                isDarkMode ? 'bg-slate-700/30' : 'bg-slate-100'
              }`}>
                <div className={`h-full rounded-full bg-gradient-to-r ${
                  isDarkMode ? 'from-slate-400 to-gray-400' : 'from-slate-500 to-gray-500'
                }`} style={{ width: '100%' }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Performance Metrics - Enhanced styling */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Key Performance Metrics</h2>
        </div>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Critical business indicators and trends</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-hidden">
          {overviewMetrics.map((metric, index) => {
            const Icon = metric.icon
            // Color schemes for each metric
            const metricColors = [
              { gradient: 'from-blue-50 via-cyan-50 to-blue-50', border: 'border-blue-300', iconBg: 'bg-blue-200/50', textColor: 'text-blue-800', valueColor: 'from-blue-600 to-cyan-600', shadow: 'shadow-blue-200/50', darkGradient: 'from-blue-900/90 to-cyan-800/90' },
              { gradient: 'from-green-50 via-emerald-50 to-green-50', border: 'border-green-300', iconBg: 'bg-green-200/50', textColor: 'text-green-800', valueColor: 'from-green-600 to-emerald-600', shadow: 'shadow-green-200/50', darkGradient: 'from-green-900/90 to-emerald-800/90' },
              { gradient: 'from-orange-50 via-amber-50 to-orange-50', border: 'border-orange-300', iconBg: 'bg-orange-200/50', textColor: 'text-orange-800', valueColor: 'from-orange-600 to-amber-600', shadow: 'shadow-orange-200/50', darkGradient: 'from-orange-900/90 to-amber-800/90' },
              { gradient: 'from-purple-50 via-pink-50 to-purple-50', border: 'border-purple-300', iconBg: 'bg-purple-200/50', textColor: 'text-purple-800', valueColor: 'from-purple-600 to-pink-600', shadow: 'shadow-purple-200/50', darkGradient: 'from-purple-900/90 to-pink-800/90' },
            ]
            const colors = metricColors[index % metricColors.length]
            
            return (
              <Card key={index} className={cx(
                "border-2 relative overflow-hidden",
                isDarkMode 
                  ? `bg-gradient-to-br ${colors.darkGradient} border-gray-600/50 text-white shadow-lg`
                  : `bg-gradient-to-br ${colors.gradient} ${colors.border} shadow-xl ${colors.shadow}`
              )} isDarkMode={isDarkMode}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${
                  isDarkMode ? 'from-gray-600/20 to-gray-500/20' : colors.valueColor.split(' ').map(c => c.includes('from-') || c.includes('to-') ? c + '/10' : c).join(' ')
                } rounded-bl-full`}></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : colors.textColor}`}>{metric.title}</CardTitle>
                  <div className={`p-2.5 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-white/80'}`}>
                    <Icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : colors.textColor.replace('800', '600')}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-gray-200 bg-clip-text text-transparent' : `${colors.valueColor} bg-clip-text text-transparent`
                    }`}>{metric.value}</div>
                    <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${
                      isDarkMode 
                        ? (metric.trendUp ? 'text-green-200 bg-green-800/50' : 'text-red-200 bg-red-800/50')
                        : (metric.trendUp ? 'text-green-700 bg-green-100 shadow-green-200/50' : 'text-red-700 bg-red-100 shadow-red-200/50')
                    }`}>
                      {metric.trendUp ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 mr-1" />
                      )}
                      {metric.trend}
                    </div>
                  </div>
                  <p className={`text-xs font-medium mb-3 ${
                    isDarkMode 
                      ? 'text-gray-300' 
                      : colors.textColor.replace('800', '600')
                  }`}>{metric.subtitle}</p>
                  <div className={`w-full h-2 rounded-full ${
                    isDarkMode ? 'bg-gray-700/30' : 'bg-gray-100'
                  }`}>
                    <div className={`h-full rounded-full bg-gradient-to-r ${
                      isDarkMode 
                        ? (metric.trendUp ? 'from-green-400 to-emerald-400' : 'from-red-400 to-rose-400')
                        : (metric.trendUp ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500')
                    }`} style={{ width: '100%' }}></div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <Trophy className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Performers</h2>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Top 3 salespersons by payment received</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTopPerformersView('current')}
              className={cx(
                "px-3 py-1 text-xs font-semibold rounded-lg border transition-colors",
                topPerformersView === 'current'
                  ? (isDarkMode ? "bg-white text-gray-900 border-white" : "bg-gray-900 text-white border-gray-900")
                  : (isDarkMode ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
              )}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setTopPerformersView('previous')}
              className={cx(
                "px-3 py-1 text-xs font-semibold rounded-lg border transition-colors",
                topPerformersView === 'previous'
                  ? (isDarkMode ? "bg-white text-gray-900 border-white" : "bg-gray-900 text-white border-gray-900")
                  : (isDarkMode ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
              )}
            >
              Last Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(topPerformersView === 'previous' ? topPerformers.previous : topPerformers.current).length > 0 ? (
            (topPerformersView === 'previous' ? topPerformers.previous : topPerformers.current).map((performer, index) => (
              <Card key={index} className={cx(
                "border-2 shadow-lg hover:shadow-xl",
                isDarkMode 
                  ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 text-white" 
                  : index === 0 
                    ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300"
                    : index === 1
                      ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"
                      : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
              )} isDarkMode={isDarkMode}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white'
                        : index === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : index === 1
                            ? 'bg-gray-400 text-gray-900'
                            : 'bg-orange-400 text-orange-900'
                    }`}>
                      {index + 1}
                    </div>
                    <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`} isDarkMode={isDarkMode}>
                      {performer.name}
                    </CardTitle>
                  </div>
                  <Trophy className={`h-5 w-5 ${
                    isDarkMode 
                      ? 'text-yellow-400'
                      : index === 0
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                  }`} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Received</div>
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{performer.paymentReceived.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sale Orders</div>
                      <div className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {performer.saleOrders}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sale Order Amount</div>
                      <div className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{(performer.saleOrderAmount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3">
              <Card className={cx(
                "border-2",
                isDarkMode 
                  ? "bg-gray-800 border-gray-600 text-white" 
                  : "bg-gray-50 border-gray-200"
              )} isDarkMode={isDarkMode}>
                <CardContent className="p-8 text-center">
                  <Trophy className={`h-12 w-12 mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No performance data available yet
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Business Metrics Section */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2">
          <BarChart3 className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Business Metrics</h2>
        </div>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Track your quotations, PIs, payments, and orders</p>

        {loadingMetrics ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Quotation Metrics */}
            <div className="mb-6">
              <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Quotations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-blue-900/90 to-cyan-800/90 border-blue-500/50 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 text-blue-700 border-blue-300 shadow-xl shadow-blue-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-blue-100' : 'text-blue-800'
                    }`} isDarkMode={isDarkMode}>Total Quotation</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-800/50' : 'bg-blue-200/50'}`}>
                      <FileText className={`h-5 w-5 ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-blue-100 bg-clip-text text-transparent' : 'from-blue-600 to-cyan-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.totalQuotation}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-600'
                    }`}>All quotations created</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-green-900/90 to-emerald-800/90 border-green-500/50 text-white shadow-lg shadow-green-500/20" 
                    : "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 text-green-700 border-green-300 shadow-xl shadow-green-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-green-100' : 'text-green-800'
                    }`} isDarkMode={isDarkMode}>Approved Quotation</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-800/50' : 'bg-green-200/50'}`}>
                      <FileCheck className={`h-5 w-5 ${isDarkMode ? 'text-green-200' : 'text-green-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-green-100 bg-clip-text text-transparent' : 'from-green-600 to-emerald-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.approvedQuotation}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-green-200' : 'text-green-600'
                    }`}>Approved quotations</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-orange-900/90 to-amber-800/90 border-orange-500/50 text-white shadow-lg shadow-orange-500/20" 
                    : "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 text-orange-700 border-orange-300 shadow-xl shadow-orange-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-orange-100' : 'text-orange-800'
                    }`} isDarkMode={isDarkMode}>Pending for Approval</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-800/50' : 'bg-orange-200/50'}`}>
                      <Clock className={`h-5 w-5 ${isDarkMode ? 'text-orange-200' : 'text-orange-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-orange-100 bg-clip-text text-transparent' : 'from-orange-600 to-amber-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.pendingQuotation}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-orange-200' : 'text-orange-600'
                    }`}>Awaiting approval</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-red-900/90 to-rose-800/90 border-red-500/50 text-white shadow-lg shadow-red-500/20" 
                    : "bg-gradient-to-br from-red-50 via-rose-50 to-red-50 text-red-700 border-red-300 shadow-xl shadow-red-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-red-100' : 'text-red-800'
                    }`} isDarkMode={isDarkMode}>Rejected Quotation</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-800/50' : 'bg-red-200/50'}`}>
                      <FileX className={`h-5 w-5 ${isDarkMode ? 'text-red-200' : 'text-red-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-red-100 bg-clip-text text-transparent' : 'from-red-600 to-rose-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.rejectedQuotation}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-red-200' : 'text-red-600'
                    }`}>Rejected quotations</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* PI Metrics */}
            <div className="mb-6">
              <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Proforma Invoices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-indigo-900/90 to-purple-800/90 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 text-indigo-700 border-indigo-300 shadow-xl shadow-indigo-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-indigo-100' : 'text-indigo-800'
                    }`} isDarkMode={isDarkMode}>Total PI</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-800/50' : 'bg-indigo-200/50'}`}>
                      <Receipt className={`h-5 w-5 ${isDarkMode ? 'text-indigo-200' : 'text-indigo-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-indigo-100 bg-clip-text text-transparent' : 'from-indigo-600 to-purple-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.totalPI}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-indigo-200' : 'text-indigo-600'
                    }`}>All proforma invoices</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-green-900/90 to-emerald-800/90 border-green-500/50 text-white shadow-lg shadow-green-500/20" 
                    : "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 text-green-700 border-green-300 shadow-xl shadow-green-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-green-100' : 'text-green-800'
                    }`} isDarkMode={isDarkMode}>Approved PI</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-800/50' : 'bg-green-200/50'}`}>
                      <FileCheck className={`h-5 w-5 ${isDarkMode ? 'text-green-200' : 'text-green-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-green-100 bg-clip-text text-transparent' : 'from-green-600 to-emerald-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.approvedPI}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-green-200' : 'text-green-600'
                    }`}>Approved proforma invoices</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-orange-900/90 to-amber-800/90 border-orange-500/50 text-white shadow-lg shadow-orange-500/20" 
                    : "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 text-orange-700 border-orange-300 shadow-xl shadow-orange-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-orange-100' : 'text-orange-800'
                    }`} isDarkMode={isDarkMode}>Pending for Approval PI</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-800/50' : 'bg-orange-200/50'}`}>
                      <Clock className={`h-5 w-5 ${isDarkMode ? 'text-orange-200' : 'text-orange-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-orange-100 bg-clip-text text-transparent' : 'from-orange-600 to-amber-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.pendingPI}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-orange-200' : 'text-orange-600'
                    }`}>Awaiting approval</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-red-900/90 to-rose-800/90 border-red-500/50 text-white shadow-lg shadow-red-500/20" 
                    : "bg-gradient-to-br from-red-50 via-rose-50 to-red-50 text-red-700 border-red-300 shadow-xl shadow-red-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-red-100' : 'text-red-800'
                    }`} isDarkMode={isDarkMode}>Rejected PI</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-800/50' : 'bg-red-200/50'}`}>
                      <FileX className={`h-5 w-5 ${isDarkMode ? 'text-red-200' : 'text-red-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-red-100 bg-clip-text text-transparent' : 'from-red-600 to-rose-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.rejectedPI}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-red-200' : 'text-red-600'
                    }`}>Rejected proforma invoices</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment & Order Metrics */}
            <div className="mb-6">
              <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payments & Orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-purple-900/90 to-pink-800/90 border-purple-500/50 text-white shadow-lg shadow-purple-500/20" 
                    : "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 text-purple-700 border-purple-300 shadow-xl shadow-purple-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-purple-100' : 'text-purple-800'
                    }`} isDarkMode={isDarkMode}>Total Advance Payment</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-800/50' : 'bg-purple-200/50'}`}>
                      <DollarSign className={`h-5 w-5 ${isDarkMode ? 'text-purple-200' : 'text-purple-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-purple-100 bg-clip-text text-transparent' : 'from-purple-600 to-pink-600 bg-clip-text text-transparent'
                    }`}>₹{businessMetrics.totalAdvancePayment.toLocaleString('en-IN')}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-purple-200' : 'text-purple-600'
                    }`}>Advance payments received</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-red-900/90 to-rose-800/90 border-red-500/50 text-white shadow-lg shadow-red-500/20" 
                    : "bg-gradient-to-br from-red-50 via-rose-50 to-red-50 text-red-700 border-red-300 shadow-xl shadow-red-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-red-100' : 'text-red-800'
                    }`} isDarkMode={isDarkMode}>Due Payment</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-800/50' : 'bg-red-200/50'}`}>
                      <CreditCard className={`h-5 w-5 ${isDarkMode ? 'text-red-200' : 'text-red-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-red-100 bg-clip-text text-transparent' : 'from-red-600 to-rose-600 bg-clip-text text-transparent'
                    }`}>₹{businessMetrics.duePayment.toLocaleString('en-IN')}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-red-200' : 'text-red-600'
                    }`}>Pending payment amount</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-teal-900/90 to-cyan-800/90 border-teal-500/50 text-white shadow-lg shadow-teal-500/20" 
                    : "bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 text-teal-700 border-teal-300 shadow-xl shadow-teal-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-teal-100' : 'text-teal-800'
                    }`} isDarkMode={isDarkMode}>Total Sale Order</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-teal-800/50' : 'bg-teal-200/50'}`}>
                      <ShoppingCart className={`h-5 w-5 ${isDarkMode ? 'text-teal-200' : 'text-teal-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-teal-100 bg-clip-text text-transparent' : 'from-teal-600 to-cyan-600 bg-clip-text text-transparent'
                    }`}>{businessMetrics.totalSaleOrder}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-teal-200' : 'text-teal-600'
                    }`}>Sale orders created</p>
                  </CardContent>
                </Card>

                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-green-900/90 to-emerald-800/90 border-green-500/50 text-white shadow-lg shadow-green-500/20" 
                    : "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 text-green-700 border-green-300 shadow-xl shadow-green-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-green-100' : 'text-green-800'
                    }`} isDarkMode={isDarkMode}>Total Received Payment</CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-800/50' : 'bg-green-200/50'}`}>
                      <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-green-200' : 'text-green-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-green-100 bg-clip-text text-transparent' : 'from-green-600 to-emerald-600 bg-clip-text text-transparent'
                    }`}>₹{businessMetrics.totalReceivedPayment.toLocaleString('en-IN')}</div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-green-200' : 'text-green-600'
                    }`}>Total payments received</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Overview KPI Cards - Colorful Design */}
            <div className="mt-8 mb-6">
              <h3 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payment Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Payments Card */}
                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-blue-900/90 to-indigo-800/90 border-blue-500/50 text-white shadow-blue-500/20" 
                    : "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 text-blue-700 border-blue-300 shadow-lg shadow-blue-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-blue-100' : 'text-blue-800'
                    }`} isDarkMode={isDarkMode}>Total Payments</CardTitle>
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-blue-800/50' : 'bg-blue-200/50'
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        isDarkMode ? 'text-blue-200' : 'text-blue-600'
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-2xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-blue-100 bg-clip-text text-transparent' : 'from-blue-600 to-indigo-600 bg-clip-text text-transparent'
                    }`}>
                      ₹{((businessMetrics.totalReceivedPayment || 0) + (businessMetrics.totalAdvancePayment || 0) + (businessMetrics.duePayment || 0)).toLocaleString('en-IN')}
                    </div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-600'
                    }`}>All payment transactions</p>
                  </CardContent>
                </Card>

                {/* Paid Amount Card */}
                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-green-900/90 to-emerald-800/90 border-green-500/50 text-white shadow-green-500/20" 
                    : "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 text-green-700 border-green-300 shadow-lg shadow-green-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-green-100' : 'text-green-800'
                    }`} isDarkMode={isDarkMode}>Paid Amount</CardTitle>
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-green-800/50' : 'bg-green-200/50'
                    }`}>
                      <CheckCircle className={`h-5 w-5 ${
                        isDarkMode ? 'text-green-200' : 'text-green-600'
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-2xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-green-100 bg-clip-text text-transparent' : 'from-green-600 to-emerald-600 bg-clip-text text-transparent'
                    }`}>
                      ₹{(businessMetrics.totalReceivedPayment || 0).toLocaleString('en-IN')}
                    </div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-green-200' : 'text-green-600'
                    }`}>Successfully received</p>
                  </CardContent>
                </Card>

                {/* Pending Amount Card */}
                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-orange-900/90 to-amber-800/90 border-orange-500/50 text-white shadow-orange-500/20" 
                    : "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 text-orange-700 border-orange-300 shadow-lg shadow-orange-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-amber-600/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-orange-100' : 'text-orange-800'
                    }`} isDarkMode={isDarkMode}>Pending Amount</CardTitle>
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-orange-800/50' : 'bg-orange-200/50'
                    }`}>
                      <Clock className={`h-5 w-5 ${
                        isDarkMode ? 'text-orange-200' : 'text-orange-600'
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-2xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-orange-100 bg-clip-text text-transparent' : 'from-orange-600 to-amber-600 bg-clip-text text-transparent'
                    }`}>
                      ₹{(businessMetrics.totalAdvancePayment || 0).toLocaleString('en-IN')}
                    </div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-orange-200' : 'text-orange-600'
                    }`}>Awaiting payment</p>
                  </CardContent>
                </Card>

                {/* Overdue Amount Card */}
                <Card className={cx(
                  "border-2 relative overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-br from-red-900/90 to-rose-800/90 border-red-500/50 text-white shadow-red-500/20" 
                    : "bg-gradient-to-br from-red-50 via-rose-50 to-red-50 text-red-700 border-red-300 shadow-lg shadow-red-200/50"
                )} isDarkMode={isDarkMode}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-600/20 rounded-bl-full"></div>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className={`text-sm font-semibold ${
                      isDarkMode ? 'text-red-100' : 'text-red-800'
                    }`} isDarkMode={isDarkMode}>Overdue Amount</CardTitle>
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-red-800/50' : 'bg-red-200/50'
                    }`}>
                      <XCircle className={`h-5 w-5 ${
                        isDarkMode ? 'text-red-200' : 'text-red-600'
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-2xl font-bold mb-1 bg-gradient-to-r ${
                      isDarkMode ? 'from-white to-red-100 bg-clip-text text-transparent' : 'from-red-600 to-rose-600 bg-clip-text text-transparent'
                    }`}>
                      ₹{(businessMetrics.duePayment || 0).toLocaleString('en-IN')}
                    </div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-red-200' : 'text-red-600'
                    }`}>Past due date</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Business Metrics Charts - Chart.js Professional Charts */}
            <div className="mt-8">
              <h3 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Trends & Analytics</h3>
              
              {/* Row 1: Quotation Trends & Proforma Invoice Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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


        </>
      )}

      {activeTab === 'performance' && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className={`border-2 max-w-2xl w-full ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`} isDarkMode={isDarkMode}>
            <CardContent className="p-12 text-center">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <Target className={`h-10 w-10 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Coming Soon
              </h2>
              
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                This feature will be available soon
              </p>
              
              <div className={`space-y-4 mb-8 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  <Calendar className={`h-6 w-6 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className="text-base font-medium">Attendance Tracking</span>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <Award className={`h-6 w-6 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <span className="text-base font-medium">Performance Incentive Report</span>
                </div>
              </div>
              
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                You will be able to view your attendance records and detailed performance incentive reports here.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}

export default SalesHeadDashboard
