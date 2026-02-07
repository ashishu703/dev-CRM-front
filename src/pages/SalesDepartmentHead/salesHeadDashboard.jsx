"use client"

import { TrendingUp, CheckCircle, Clock, CreditCard, UserPlus, CalendarCheck, ArrowUp, XCircle, PhoneOff, Target, BarChart3, PieChart as PieChartIcon, Activity, Award, TrendingDown, ArrowRightLeft, Calendar, FileText, FileCheck, FileX, Receipt, ShoppingCart, DollarSign, RefreshCw, Trophy, IndianRupee } from "lucide-react"
import React, { useState, useEffect, useMemo, useCallback } from "react"
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
  SalesPipelineDonutChart
} from '../../components/dashboard/ChartJSCharts'

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


const MS_IN_DAY = 24 * 60 * 60 * 1000;

const SalesHeadDashboard = ({ setActiveView, isDarkMode = false }) => {
  const { user } = useAuth()
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

  const isPaymentApprovedByAccounts = (payment) => {
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

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      
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
      
      const response = await departmentHeadService.getHeadById(user.id)
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
    const receivedValue = totalSalesAmount
    const avgDaysToClose = 60.70
    return {
      totalSales: formatCompact(totalSalesAmount),
      winRate: winRate.toFixed(2) + '%',
      lostRate: lostRate.toFixed(2) + '%',
      avgDaysToClose: avgDaysToClose.toFixed(2),
      pipelineValue: formatCompact(piValue),
      openDeals: formatCompact(openDeals),
      weightedValue: formatCompact(receivedValue),
      avgOpenDealAge: avgOpenDealAge.toFixed(2)
    }
  }, [leads, overviewDateFilter, businessMetrics.totalReceivedPayment, businessMetrics.totalRevenue])

  const calculatedMetrics = useMemo(() => calculateMetrics(), [leads, overviewDateFilter])
  const statusData = useMemo(() => calculateLeadStatusData(), [leads, overviewDateFilter])
  const leadSources = useMemo(() => calculateLeadSources(), [leads, overviewDateFilter])
  const weeklyActivity = useMemo(() => calculateWeeklyActivity(), [leads, overviewDateFilter])
  const monthlyRevenue = useMemo(() => calculateMonthlyRevenue(), [allPayments, overviewDateFilter])
  const salesPipelineDonutData = useMemo(() => getSalesPipelineDonutData(), [leads, overviewDateFilter])

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

  const daysLeftInTarget = (() => {
    if (!hasTargetAssigned) return 0
    const endDate = new Date(`${userTarget.targetEndDate}T00:00:00`)
    return getCalendarDaysRemaining(endDate)
  })()
  
  const revenueTarget = hasTargetAssigned ? (userTarget.target || 0) : 0
  const revenueCurrent = hasTargetAssigned ? (businessMetrics.totalReceivedPayment || 0) : 0
  const targetProgress = revenueTarget > 0 ? Math.min(100, Math.round((revenueCurrent / revenueTarget) * 100)) : 0
  const targetStatusOnTrack = targetProgress >= 100 || (daysLeftInTarget > 0 && targetProgress >= 0)

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
    <main className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : ''}`} style={!isDarkMode ? { backgroundColor: '#F4F7FB' } : undefined}>
      <div className="flex flex-row items-center justify-end gap-2 sm:gap-3 mb-4 flex-wrap">
        <button
          onClick={refreshDashboard}
          disabled={refreshing}
          className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
            refreshing ? 'opacity-50 cursor-not-allowed' : ''
          } ${isDarkMode ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white'}`}
          title="Refresh dashboard data"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
        <div className="relative flex items-center gap-2">
          <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${overviewDateFilter ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`} />
          <input
            type="date"
            value={overviewDateFilter}
            onChange={(e) => setOverviewDateFilter(e.target.value)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm min-w-0 ${
              isDarkMode ? `bg-gray-800 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 ${overviewDateFilter ? 'border-purple-400 bg-purple-900/30' : ''}` : `bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500 ${overviewDateFilter ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`
            }`}
            title="Filter data from selected date to today"
            max={toDateOnly(new Date())}
            placeholder="dd-mm-yyyy"
          />
          {overviewDateFilter && (
            <button
              onClick={() => setOverviewDateFilter('')}
              className={`px-2 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-800 border border-gray-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 bg-white border border-gray-300'}`}
              title="Clear date filter"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Sales Pipeline: Refresh+Date row ke neeche — 8 metric cards + Donut */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Row 1: Total sales, Win rate, Lost rate, Avg days to close */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className={cx("border-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]", isDarkMode && "bg-[#4a3ab0] border-[#5B7CFA]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #6A5AE0 0%, #5B7CFA 100%)', borderColor: 'rgba(107, 114, 128, 0.3)' } : undefined} isDarkMode={isDarkMode}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={cx("text-sm font-semibold", isDarkMode ? "text-indigo-100" : "text-white")} isDarkMode={isDarkMode}>Total sales</CardTitle>
                  <div className={cx("p-2 rounded-lg", isDarkMode ? "bg-indigo-800/50" : "bg-white/20")}>
                    <DollarSign className={cx("h-5 w-5", "text-white")} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className={cx("text-2xl sm:text-3xl font-bold text-white")}>{salesOverviewMetrics.totalSales}</div>
                  <p className={cx("text-xs font-medium text-white/90")}>Revenue received</p>
                </CardContent>
              </Card>
              <Card className={cx("border-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]", isDarkMode && "bg-[#0a3d6b] border-[#0B63B6]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #0F4C81 0%, #0B63B6 100%)', borderColor: 'rgba(11, 99, 182, 0.4)' } : undefined} isDarkMode={isDarkMode}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.12)' } : { background: 'rgba(0,0,0,0.2)' }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={cx("text-sm font-semibold text-white")} isDarkMode={isDarkMode}>Win rate</CardTitle>
                  <div className={cx("p-2 rounded-lg bg-white/20")}>
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.winRate}</div>
                  <p className="text-xs font-medium text-white/90">Converted vs followed up</p>
                </CardContent>
              </Card>
              <Card className={cx("border-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]", isDarkMode && "bg-[#0a5a8f] border-[#00A3D9]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #0E7ACF 0%, #00A3D9 100%)', borderColor: 'rgba(0, 163, 217, 0.4)' } : undefined} isDarkMode={isDarkMode}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={cx("text-sm font-semibold text-white")} isDarkMode={isDarkMode}>Lost rate</CardTitle>
                  <div className={cx("p-2 rounded-lg bg-white/20")}>
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.lostRate}</div>
                  <p className="text-xs font-medium text-white/90">Lost vs total leads</p>
                </CardContent>
              </Card>
              <Card className={cx("border-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]", isDarkMode && "bg-[#1a9b5e] border-[#1ECAD3]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #22B573 0%, #1ECAD3 100%)', borderColor: 'rgba(30, 202, 211, 0.4)' } : undefined} isDarkMode={isDarkMode}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={cx("text-sm font-semibold text-white")} isDarkMode={isDarkMode}>Avg days to close</CardTitle>
                  <div className={cx("p-2 rounded-lg bg-white/20")}>
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.avgDaysToClose}</div>
                  <p className="text-xs font-medium text-white/90">Days to close deal</p>
                </CardContent>
              </Card>
            </div>
            {/* Row 2: Pipeline value, Open deals, Received, Avg open deal age */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className={cx("border-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]", isDarkMode && "bg-[#4a3ab0] border-[#5B7CFA]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #6A5AE0 0%, #5B7CFA 100%)', borderColor: 'rgba(107, 114, 128, 0.3)' } : undefined} isDarkMode={isDarkMode}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={cx("text-sm font-semibold text-white")} isDarkMode={isDarkMode}>Pipeline value</CardTitle>
                  <div className={cx("p-2 rounded-lg bg-white/20")}>
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.pipelineValue}</div>
                  <p className="text-xs font-medium text-white/90">PI value</p>
                </CardContent>
              </Card>
              <Card className={cx("border-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]", isDarkMode && "bg-[#0a3d6b] border-[#0B63B6]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #0F4C81 0%, #0B63B6 100%)', borderColor: 'rgba(11, 99, 182, 0.4)' } : undefined} isDarkMode={isDarkMode}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.12)' } : { background: 'rgba(0,0,0,0.2)' }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={cx("text-sm font-semibold text-white")} isDarkMode={isDarkMode}>Open deals</CardTitle>
                  <div className={cx("p-2 rounded-lg bg-white/20")}>
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.openDeals}</div>
                  <p className="text-xs font-medium text-white/90">Active in pipeline</p>
                </CardContent>
              </Card>
              <Card className={cx("border-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]", isDarkMode && "bg-[#0a5a8f] border-[#00A3D9]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #0E7ACF 0%, #00A3D9 100%)', borderColor: 'rgba(0, 163, 217, 0.4)' } : undefined} isDarkMode={isDarkMode}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={cx("text-sm font-semibold text-white")} isDarkMode={isDarkMode}>Received</CardTitle>
                  <div className={cx("p-2 rounded-lg bg-white/20")}>
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.weightedValue}</div>
                  <p className="text-xs font-medium text-white/90">Revenue received</p>
                </CardContent>
              </Card>
              <Card className={cx("border-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]", isDarkMode && "bg-[#1a9b5e] border-[#1ECAD3]/50 text-white")} style={!isDarkMode ? { background: 'linear-gradient(135deg, #22B573 0%, #1ECAD3 100%)', borderColor: 'rgba(30, 202, 211, 0.4)' } : undefined} isDarkMode={isDarkMode}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full" style={!isDarkMode ? { background: 'rgba(255,255,255,0.15)' } : { background: 'rgba(0,0,0,0.2)' }} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className={cx("text-sm font-semibold text-white")} isDarkMode={isDarkMode}>Avg open deal age</CardTitle>
                  <div className={cx("p-2 rounded-lg bg-white/20")}>
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{salesOverviewMetrics.avgOpenDealAge}</div>
                  <p className="text-xs font-medium text-white/90">Days in pipeline</p>
                </CardContent>
              </Card>
            </div>
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

      {/* Target & Timeline — single strip, no cards */}
      <div className={cx("mb-8 rounded-xl border overflow-hidden", isDarkMode ? "bg-slate-800/40 border-slate-600/50" : "bg-white/80 border-slate-200 shadow-sm")}>
        <div className={cx("px-4 py-3 border-b", isDarkMode ? "border-slate-600/50" : "border-slate-100")}>
          <h3 className={cx("text-base font-semibold", isDarkMode ? "text-white" : "text-gray-800")}>Target & Timeline</h3>
        </div>
        <div className={cx("flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x", isDarkMode ? "divide-slate-600" : "divide-slate-200")}>
          <div className="flex-1 flex items-center gap-3 px-4 py-4 sm:py-5">
            <div className={cx("p-2 rounded-lg shrink-0", isDarkMode ? "bg-blue-500/20" : "bg-blue-50")}>
              <Target className={cx("h-5 w-5", isDarkMode ? "text-blue-400" : "text-blue-600")} />
            </div>
            <div className="min-w-0">
              <p className={cx("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-gray-500")}>Revenue Target</p>
              <p className={cx("text-lg sm:text-xl font-bold truncate", isDarkMode ? "text-white" : "text-gray-900")}>₹{(revenueTarget || 0).toLocaleString('en-IN')}</p>
              {userTarget.targetStartDate && userTarget.targetEndDate && (
                <p className={cx("text-xs mt-0.5", isDarkMode ? "text-slate-500" : "text-gray-400")}>
                  {new Date(userTarget.targetStartDate).toLocaleDateString('en-IN')} – {new Date(userTarget.targetEndDate).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 px-4 py-4 sm:py-5">
            <div className={cx("p-2 rounded-lg shrink-0", isDarkMode ? "bg-green-500/20" : "bg-green-50")}>
              <IndianRupee className={cx("h-5 w-5", isDarkMode ? "text-green-400" : "text-green-600")} />
            </div>
            <div className="min-w-0">
              <p className={cx("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-gray-500")}>Revenue Achieved</p>
              <p className={cx("text-lg sm:text-xl font-bold truncate", isDarkMode ? "text-white" : "text-gray-900")}>₹{(revenueCurrent || 0).toLocaleString('en-IN')}</p>
              <p className={cx("text-xs mt-0.5", isDarkMode ? "text-slate-500" : "text-gray-400")}>Approved payments received</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 px-4 py-4 sm:py-5">
            <div className={cx("p-2 rounded-lg shrink-0", isDarkMode ? "bg-amber-500/20" : "bg-amber-50")}>
              <Calendar className={cx("h-5 w-5", isDarkMode ? "text-amber-400" : "text-amber-600")} />
            </div>
            <div className="min-w-0">
              <p className={cx("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-gray-500")}>Days Left</p>
              <p className={cx("text-lg sm:text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>{daysLeftInTarget}</p>
              <p className={cx("text-xs mt-0.5", isDarkMode ? "text-slate-500" : "text-gray-400")}>
                {userTarget.targetEndDate ? 'Remaining days in target period' : 'No target period set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className={cx("rounded-xl border overflow-hidden", isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-md")}>
          <div className={cx("px-4 py-3 border-b", isDarkMode ? "border-gray-600" : "border-gray-200")}>
            <div className="flex items-center justify-between">
              <h2 className={cx("text-base font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>Top Performers</h2>
              <div className="flex gap-1">
                <button type="button" onClick={() => setTopPerformersView('current')} className={cx("px-2 py-1 text-xs font-medium rounded border", topPerformersView === 'current' ? (isDarkMode ? "bg-white text-gray-900 border-white" : "bg-gray-900 text-white border-gray-900") : (isDarkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-700 border-gray-200"))}>This Month</button>
                <button type="button" onClick={() => setTopPerformersView('previous')} className={cx("px-2 py-1 text-xs font-medium rounded border", topPerformersView === 'previous' ? (isDarkMode ? "bg-white text-gray-900 border-white" : "bg-gray-900 text-white border-gray-900") : (isDarkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-700 border-gray-200"))}>Last Month</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={cx("border-b", isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-gray-50")}>
                  <th className={cx("text-left py-3 px-4 font-semibold", isDarkMode ? "text-gray-300" : "text-gray-700")}>#</th>
                  <th className={cx("text-left py-3 px-4 font-semibold", isDarkMode ? "text-gray-300" : "text-gray-700")}>Name</th>
                  <th className={cx("text-right py-3 px-4 font-semibold", isDarkMode ? "text-gray-300" : "text-gray-700")}>Received</th>
                  <th className={cx("text-right py-3 px-4 font-semibold", isDarkMode ? "text-gray-300" : "text-gray-700")}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {(topPerformersView === 'previous' ? topPerformers.previous : topPerformers.current).length > 0 ? (topPerformersView === 'previous' ? topPerformers.previous : topPerformers.current).map((p, i) => (
                  <tr key={i} className={cx("border-b", isDarkMode ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-100 hover:bg-gray-50")}>
                    <td className="py-2.5 px-4 font-medium">{i + 1}</td>
                    <td className={cx("py-2.5 px-4", isDarkMode ? "text-white" : "text-gray-900")}>{p.name}</td>
                    <td className={cx("py-2.5 px-4 text-right font-medium", isDarkMode ? "text-green-400" : "text-green-600")}>₹{p.paymentReceived.toLocaleString('en-IN')}</td>
                    <td className={cx("py-2.5 px-4 text-right", isDarkMode ? "text-gray-300" : "text-gray-600")}>{p.saleOrders}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className={cx("py-8 text-center", isDarkMode ? "text-gray-400" : "text-gray-500")}>No data</td></tr>
                )}
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

      {/* Trends & Analytics */}
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
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default SalesHeadDashboard
