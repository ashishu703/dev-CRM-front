"use client"

import React, { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, XCircle, Eye, Copy, Search, RefreshCw, X, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, User, Building2, Phone, Mail } from 'lucide-react'
import rfpService from '../../services/RfpService'
import Toast from '../../utils/Toast'
import { filterRfpsBySearch, sortRfpsByDate, formatRfpStatus } from '../../utils/rfpHelpers'

const IST_TIME_ZONE = 'Asia/Kolkata'

export default function SalespersonRfpRequests({ isDarkMode = false }) {
  // RFP Requests state
  const [rfps, setRfps] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, pending_dh, approved, rejected
  const [selectedRfp, setSelectedRfp] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [requestsPage, setRequestsPage] = useState(1)
  const [requestsItemsPerPage, setRequestsItemsPerPage] = useState(50)

  useEffect(() => {
    fetchRfps()
  }, [])

  const fetchRfps = async () => {
    setLoading(true)
    try {
      // Algorithm-based filtering: Build query parameters
      const queryParams = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined
      }
      
      console.log('[SalespersonRfpRequests] Fetching RFPs with filters:', queryParams)
      
      const response = await rfpService.list(queryParams)
      
      console.log('[SalespersonRfpRequests] RFP list response:', {
        success: response.success,
        dataLength: Array.isArray(response.data) ? response.data.length : 0,
        responseKeys: Object.keys(response),
        fullResponse: response,
        queryParams
      })
      
      // Additional debugging - check if data exists but in different format
      if (response.success && (!response.data || response.data.length === 0)) {
        console.warn('[SalespersonRfpRequests] Empty response - checking structure:', {
          hasData: 'data' in response,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          responseStructure: JSON.stringify(response).substring(0, 500)
        })
      }
      
      if (response.success) {
        let rfps = Array.isArray(response.data) ? response.data : []
        
        // Algorithm-based processing: Apply search filter if needed (client-side fallback)
        if (searchQuery && searchQuery.trim()) {
          rfps = filterRfpsBySearch(rfps, searchQuery)
        }
        
        // Algorithm-based sorting: Sort by date (newest first)
        rfps = sortRfpsByDate(rfps, false)
        
        setRfps(rfps)
      } else {
        console.error('[SalespersonRfpRequests] RFP list failed:', response)
        Toast.error(response.message || 'Failed to load RFP requests')
        setRfps([])
      }
    } catch (error) {
      console.error('[SalespersonRfpRequests] Error fetching RFPs:', error)
      Toast.error(error.message || 'Failed to load RFP requests')
      setRfps([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRfps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchQuery])
  
  // Reset pagination on filter/search change for requests tab
  useEffect(() => {
    setRequestsPage(1)
  }, [filterStatus, searchQuery])

  // Listen for RFP creation/update events to refresh the list
  useEffect(() => {
    const handleRfpUpdate = () => {
      // Refresh RFP requests when an RFP is raised/updated
      console.log('[SalespersonRfpRequests] RFP update event received, refreshing list...')
      fetchRfps()
    }

    window.addEventListener('rfpRecordUpdated', handleRfpUpdate)
    // Also listen for a more general RFP update event
    window.addEventListener('rfpUpdated', handleRfpUpdate)
    
    return () => {
      window.removeEventListener('rfpRecordUpdated', handleRfpUpdate)
      window.removeEventListener('rfpUpdated', handleRfpUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Algorithm-based status formatting using utility function
  const getStatusBadge = (status) => {
    const statusConfig = formatRfpStatus(status)
    const IconMap = {
      Clock,
      CheckCircle,
      XCircle,
      FileText
    }
    const Icon = IconMap[statusConfig.icon] || FileText
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {statusConfig.label}
      </span>
    )
  }

  const handleCopyRfpId = (rfpId) => {
    if (rfpId) {
      navigator.clipboard.writeText(rfpId)
      Toast.success('RFP ID copied to clipboard!')
    }
  }

  const handleViewDetails = async (rfp) => {
    try {
      const response = await rfpService.getById(rfp.id)
      if (response.success) {
        // Backend returns { rfp, prices, auditLogs }
        setSelectedRfp(response.data?.rfp || response.data)
        setShowDetails(true)
      }
    } catch (error) {
      Toast.error('Failed to load RFP details')
    }
  }

  const filteredRfps = rfps.filter(rfp => {
    if (filterStatus !== 'all' && rfp.status !== filterStatus) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const snapshotProducts = rfp.source_payload?.form?.allProducts
      const snapshotSpecs = Array.isArray(snapshotProducts)
        ? snapshotProducts.map(p => p?.productSpec || '').join(' ')
        : ''
      const productSpecs = snapshotSpecs || (rfp.products && rfp.products.length > 0
        ? rfp.products.map(p => p.product_spec || '').join(' ')
        : (rfp.product_spec || ''))
      return (
        productSpecs.toLowerCase().includes(query) ||
        (rfp.rfp_id || '').toLowerCase().includes(query) ||
        (rfp.company_name || '').toLowerCase().includes(query) ||
        (rfp.customer_name || '').toLowerCase().includes(query)
      )
    }
    return true
  })

  // Paginate + date-wise grouping for RFP Requests tab (rows pagination, not date-group pagination)
  const sortedFilteredRfps = React.useMemo(() => sortRfpsByDate(filteredRfps, false), [filteredRfps])
  const totalRequestPages = Math.max(1, Math.ceil(sortedFilteredRfps.length / requestsItemsPerPage))
  const startRequestIndex = (requestsPage - 1) * requestsItemsPerPage
  const endRequestIndex = startRequestIndex + requestsItemsPerPage
  const pageRfps = sortedFilteredRfps.slice(startRequestIndex, endRequestIndex)
  const paginatedRequestGroups = React.useMemo(() => {
    const order = []
    const map = {}
    pageRfps.forEach((rfp) => {
      const dateKey = normalizeDateKey(rfp.created_at) || 'No Date'
      if (!map[dateKey]) {
        order.push(dateKey)
        map[dateKey] = {
          dateKey,
          dateObj: dateKey === 'No Date' ? new Date(0) : (parseApiDate(rfp.created_at) || new Date(0)),
          records: []
        }
      }
      map[dateKey].records.push(rfp)
    })
    return order.map((k) => map[k])
  }, [pageRfps])

  const handleRequestsPageChange = (page) => {
    const next = Math.min(Math.max(1, page), totalRequestPages)
    setRequestsPage(next)
  }

  const handleRequestsItemsPerPageChange = (newItemsPerPage) => {
    setRequestsItemsPerPage(newItemsPerPage)
    setRequestsPage(1)
  }

  // Helper functions are function-declarations (hoisted) to avoid TDZ issues with useMemo.
  function parseApiDate(value) {
    if (!value) return null
    if (value instanceof Date) return value
    if (typeof value === 'number') {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? null : d
    }
    if (typeof value !== 'string') return null

    const s = value.trim()
    if (!s) return null

    // Date-only: treat as UTC midnight
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const d = new Date(`${s}T00:00:00Z`)
      return Number.isNaN(d.getTime()) ? null : d
    }

    // If timezone is already present (Z or +/- offset), Date can parse it reliably
    if (/[zZ]$/.test(s) || /[+-]\d{2}:?\d{2}$/.test(s)) {
      const d = new Date(s)
      return Number.isNaN(d.getTime()) ? null : d
    }

    // Common Postgres timestamp formats without timezone: treat as UTC
    // Examples: "2026-01-21 05:50:00", "2026-01-21 05:50:00.123"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      const d = new Date(s.replace(' ', 'T') + 'Z')
      return Number.isNaN(d.getTime()) ? null : d
    }

    // ISO without timezone: treat as UTC
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
      const d = new Date(s + 'Z')
      return Number.isNaN(d.getTime()) ? null : d
    }

    // Fallback: let Date try to parse
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }

  function formatDateTimeIST(value) {
    const d = parseApiDate(value)
    if (!d) return 'N/A'
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: IST_TIME_ZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  }

  function normalizeDateKey(dateString) {
    const d = parseApiDate(dateString)
    if (!d) return null
    // en-CA gives YYYY-MM-DD, and timeZone ensures date is computed in IST.
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: IST_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d)
  }

  // Format date for display (short format like "10 Dec")
  function formatDateShort(dateString) {
    const d = parseApiDate(dateString)
    if (!d) return 'N/A'
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: IST_TIME_ZONE,
      day: 'numeric',
      month: 'short'
    }).format(d)
  }

  // Format date for grouping (full format)
  function formatDateForGrouping(dateString) {
    const d = parseApiDate(dateString)
    if (!d) return 'N/A'
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: IST_TIME_ZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d)
  }

  function formatQty(value) {
    const num = Number.parseFloat(value)
    if (!Number.isFinite(num)) return '—'
    return Number.isInteger(num) ? String(num) : num.toFixed(2)
  }

  function formatMoneyINR(value) {
    const num = Number.parseFloat(value)
    if (!Number.isFinite(num)) return '—'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num)
  }

  function getProductsForDetails(rfp) {
    const snapshot = rfp?.source_payload?.form?.allProducts
    if (Array.isArray(snapshot) && snapshot.length > 0) {
      return snapshot.map((p) => ({
        productSpec: p?.productSpec || '',
        quantity: p?.quantity,
        length: p?.length,
        lengthUnit: p?.lengthUnit || '',
        targetPrice: p?.targetPrice
      }))
    }
    const products = rfp?.products
    if (Array.isArray(products) && products.length > 0) {
      return products.map((p) => ({
        productSpec: p?.product_spec || '',
        quantity: p?.quantity,
        length: p?.length,
        lengthUnit: p?.length_unit || '',
        targetPrice: p?.target_price
      }))
    }
    return []
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">RFP Raise & Approved</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View all raised and approved RFP requests
          </p>
        </div>

        {/* Filters and Search */}
        {/* Filters and Search */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by product, RFP ID, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending_dh')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'pending_dh'
                    ? 'bg-yellow-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'approved'
                    ? 'bg-green-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-red-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rejected
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchRfps}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RFP List (Date-wise Table + Pagination) */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading RFPs...</p>
          </div>
        ) : filteredRfps.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <FileText className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No RFP requests found</p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Raise an RFP to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedRequestGroups.map((group) => {
              const dateDisplay = group.dateKey === 'No Date' ? 'No Date' : formatDateShort(group.dateKey)
              const dateFull = group.dateKey === 'No Date' ? 'No Date' : formatDateForGrouping(group.dateKey)
              return (
                <div key={group.dateKey} className={`rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`px-3 sm:px-6 py-3 sm:py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {dateDisplay}
                          </h3>
                          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{dateFull}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${isDarkMode ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                        {group.records.length} RFP{group.records.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <table className="min-w-[900px] sm:w-full">
                      <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>RFP ID</th>
                          <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>LEAD</th>
                          <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>PRODUCTS</th>
                          <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>QTY</th>
                          <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>STATUS</th>
                          <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>CREATED</th>
                          <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {group.records.map((rfp) => {
                          const snapshot = Array.isArray(rfp.source_payload?.form?.allProducts) ? rfp.source_payload.form.allProducts : null
                          const productsList = snapshot?.length
                            ? snapshot.map(p => p?.productSpec).filter(Boolean)
                            : (rfp.products && Array.isArray(rfp.products) ? rfp.products.map(p => p.product_spec).filter(Boolean) : [])
                          const qty = snapshot?.length
                            ? snapshot.reduce((sum, p) => sum + (parseFloat(p?.quantity) || 0), 0)
                            : (rfp.products && Array.isArray(rfp.products)
                              ? rfp.products.reduce((sum, p) => sum + (parseFloat(p?.quantity) || 0), 0)
                              : (parseFloat(rfp.quantity) || 0))
                          return (
                            <tr key={rfp.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono text-xs sm:text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{rfp.rfp_id || `REQ-${rfp.id}`}</span>
                                  {rfp.rfp_id && (
                                    <button onClick={() => handleCopyRfpId(rfp.rfp_id)} className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`} title="Copy RFP ID">
                                      <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                <div className="font-medium">{rfp.customer_name || 'N/A'}</div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{rfp.company_name || ''}</div>
                              </td>
                              <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                <div className="space-y-1">
                                  {productsList.slice(0, 2).map((p, idx) => (
                                    <div key={idx} className="text-xs">{p}</div>
                                  ))}
                                  {productsList.length > 2 && (
                                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>+{productsList.length - 2} more</div>
                                  )}
                                </div>
                              </td>
                              <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                {Number(qty || 0).toFixed(2)}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  {getStatusBadge(rfp.status)}
                                  {rfp.approved_at && (
                                    <div className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      DH Approved: {formatDateTimeIST(rfp.approved_at)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatDateTimeIST(rfp.created_at)}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                                <button
                                  onClick={() => handleViewDetails(rfp)}
                                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                                    isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                  View
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}

            {/* Pagination (Requests) */}
            <div className={`mt-2 flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 border-t-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rows per page:</span>
                <select
                  value={requestsItemsPerPage}
                  onChange={(e) => handleRequestsItemsPerPageChange(parseInt(e.target.value))}
                  className={`px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>

              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {sortedFilteredRfps.length > 0
                  ? <>Showing {startRequestIndex + 1} to {Math.min(endRequestIndex, sortedFilteredRfps.length)} of {sortedFilteredRfps.length} RFPs</>
                  : <>No results found</>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRequestsPageChange(1)}
                  disabled={requestsPage === 1 || sortedFilteredRfps.length === 0}
                  className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRequestsPageChange(requestsPage - 1)}
                  disabled={requestsPage === 1 || sortedFilteredRfps.length === 0}
                  className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Page {requestsPage} / {totalRequestPages}
                </div>
                <button
                  onClick={() => handleRequestsPageChange(requestsPage + 1)}
                  disabled={requestsPage === totalRequestPages || sortedFilteredRfps.length === 0}
                  className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRequestsPageChange(totalRequestPages)}
                  disabled={requestsPage === totalRequestPages || sortedFilteredRfps.length === 0}
                  className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedRfp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-4xl rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-hidden`}>
              {/* Header (sticky) */}
              <div className={`sticky top-0 z-10 px-6 py-5 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className={`text-xl sm:text-2xl font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>RFP Request Details</h2>
                      {getStatusBadge(selectedRfp.status)}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>RFP ID</span>
                        <span className={`font-mono text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {selectedRfp.rfp_id || `REQ-${selectedRfp.id}`}
                        </span>
                        {selectedRfp.rfp_id && (
                          <button
                            onClick={() => handleCopyRfpId(selectedRfp.rfp_id)}
                            className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            title="Copy RFP ID"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                      {!selectedRfp.rfp_id && (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          RFP ID will be generated after DH approval
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedRfp(null)
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-92px)]">
                {/* Summary grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lead card */}
                  <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Lead</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedRfp.company_name || ''}</div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <User className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div className="min-w-0">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedRfp.customer_name || 'N/A'}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div className="min-w-0">
                          <div className={`text-sm break-words ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedRfp.customer_business || 'N/A'}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Business</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-start gap-2">
                          <Phone className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div className="min-w-0">
                            <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedRfp.customer_phone || 'N/A'}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Mail className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div className="min-w-0">
                            <div className={`text-sm break-all ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedRfp.customer_email || 'N/A'}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline card */}
                  <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Timeline</div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created</div>
                        <div className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatDateTimeIST(selectedRfp.created_at)}</div>
                      </div>
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DH Approved</div>
                        <div className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedRfp.approved_at ? formatDateTimeIST(selectedRfp.approved_at) : '—'}</div>
                        {selectedRfp.approved_by && (
                          <div className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>By: {selectedRfp.approved_by}</div>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <div className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delivery Timeline</div>
                        <div className={`mt-1 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {selectedRfp.delivery_timeline
                            ? new Date(selectedRfp.delivery_timeline).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Products</div>
                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                      {getProductsForDetails(selectedRfp).length} item{getProductsForDetails(selectedRfp).length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {getProductsForDetails(selectedRfp).length > 0 ? (
                    <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className={`overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <table className="min-w-[720px] w-full">
                          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                              <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Product</th>
                              <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Qty</th>
                              <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Length</th>
                              <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Target Price</th>
                            </tr>
                          </thead>
                          <tbody className={isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                            {getProductsForDetails(selectedRfp).map((p, idx) => (
                              <tr key={idx} className={isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'}>
                                <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                  <div className="font-medium">{p.productSpec || 'N/A'}</div>
                                </td>
                                <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {formatQty(p.quantity)}
                                </td>
                                <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {p.length ? `${formatQty(p.length)} ${p.lengthUnit || ''}`.trim() : '—'}
                                </td>
                                <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                  {p.targetPrice ? formatMoneyINR(p.targetPrice) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No products</div>
                  )}
                </div>

                {/* Notes / Requirements */}
                <div className="mt-6 space-y-4">
                  <div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Special Requirements</div>
                    <div className={`mt-2 rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800/60 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
                      {selectedRfp.special_requirements || selectedRfp.source_payload?.form?.specialRequirements || '—'}
                    </div>
                  </div>
                  {selectedRfp.calculator_pricing_log && (
                    <div>
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Pricing Log (Calculator)</div>
                      {(() => {
                        const log = selectedRfp.calculator_pricing_log || {};
                        const rateTypeLabelMap = {
                          alu_per_mtr: 'Aluminium / Mtr',
                          alloy_per_mtr: 'Alloy / Mtr',
                          alu_per_kg: 'Aluminium / Kg',
                          alloy_per_kg: 'Alloy / Kg'
                        };
                        const lengthUsed =
                          log.length !== undefined && log.length !== null
                            ? log.length
                            : (log.quantity !== undefined && log.quantity !== null ? log.quantity : '—');
                        return (
                          <div className={`mt-2 rounded-xl border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800/60 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Selected Product</div>
                                <div>{log.productSpec || '—'}</div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Family</div>
                                <div>{log.family || 'AAAC'}</div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Length / Qty Used</div>
                                <div>{lengthUsed}</div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rate Type</div>
                                <div>{log.rateType ? rateTypeLabelMap[log.rateType] || log.rateType : '—'}</div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Base Rate</div>
                                <div>
                                  {typeof log.basePerUnit === 'number'
                                    ? `₹${log.basePerUnit.toFixed(2)}`
                                    : (log.basePerUnit || '—')}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Base Amount</div>
                                <div>
                                  {typeof log.baseTotal === 'number'
                                    ? `₹${log.baseTotal.toFixed(2)}`
                                    : (log.baseTotal || '—')}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total After Charges</div>
                                <div className="font-semibold text-emerald-400">
                                  {typeof log.totalPrice === 'number'
                                    ? `₹${log.totalPrice.toFixed(2)}`
                                    : (log.totalPrice || '—')}
                                </div>
                              </div>
                            </div>
                            {Array.isArray(log.extraCharges) && log.extraCharges.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Additional Charges</div>
                                <ul className="text-sm list-disc list-inside space-y-1">
                                  {log.extraCharges.map((row, idx) => (
                                    <li key={idx}>
                                      {(row.label || 'Charge')} – {row.amount ? `₹${row.amount}` : '₹0'}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
