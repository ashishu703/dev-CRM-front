"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { FileText, Clock, CheckCircle, XCircle, Eye, Copy, Search, RefreshCw, X, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import rfpService from '../../services/RfpService'
import Toast from '../../utils/Toast'
import apiClient from '../../utils/apiClient'
import { API_ENDPOINTS } from '../../api/admin_api/api'

export default function SalespersonRfpRequests({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('rfp-requests') // 'rfp-requests' or 'rfp-record'
  
  // RFP Requests state
  const [rfps, setRfps] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, pending_dh, approved, rejected
  const [selectedRfp, setSelectedRfp] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // RFP Record state
  const [records, setRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [recordsPage, setRecordsPage] = useState(1)
  const [recordsItemsPerPage, setRecordsItemsPerPage] = useState(50)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showRecordDetails, setShowRecordDetails] = useState(false)

  // Fetch all RFP Records (for date-wise grouping)
  const fetchAllRfpRecords = useCallback(async () => {
    setRecordsLoading(true)
    try {
      // Fetch all records without date filter
      const endpoint = API_ENDPOINTS.PRICING_RFP_DECISION_RECORDS_ALL()
      console.log('Fetching RFP records from:', endpoint)
      const response = await apiClient.get(endpoint)
      
      if (response.success) {
        setRecords(response.data || [])
      } else {
        console.error('RFP records response error:', response)
        Toast.error(response.message || 'Failed to fetch RFP records')
        setRecords([])
      }
    } catch (error) {
      console.error('Error fetching RFP records:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      })
      Toast.error(error.message || 'Failed to fetch RFP records')
      setRecords([])
    } finally {
      setRecordsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRfps()
  }, [])

  useEffect(() => {
    if (activeTab === 'rfp-record') {
      fetchAllRfpRecords()
    }
  }, [activeTab, fetchAllRfpRecords])

  // Listen for RFP record updates (when save/approve happens)
  useEffect(() => {
    const handleRfpRecordUpdate = () => {
      if (activeTab === 'rfp-record') {
        // Refresh records when save/approve happens
        fetchAllRfpRecords()
      }
    }

    window.addEventListener('rfpRecordUpdated', handleRfpRecordUpdate)
    return () => {
      window.removeEventListener('rfpRecordUpdated', handleRfpRecordUpdate)
    }
  }, [activeTab, fetchAllRfpRecords])

  const fetchRfps = async () => {
    setLoading(true)
    try {
      console.log('[SalespersonRfpRequests] Fetching RFPs with filters:', {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined
      })
      const response = await rfpService.list({ 
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined
      })
      console.log('[SalespersonRfpRequests] RFP list response:', {
        success: response.success,
        dataLength: Array.isArray(response.data) ? response.data.length : 0,
        data: response.data
      })
      if (response.success) {
        setRfps(Array.isArray(response.data) ? response.data : [])
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
    if (activeTab === 'rfp-requests') {
      fetchRfps()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchQuery, activeTab])

  // Listen for RFP creation/update events to refresh the list
  useEffect(() => {
    const handleRfpUpdate = () => {
      if (activeTab === 'rfp-requests') {
        // Refresh RFP requests when an RFP is raised/updated
        console.log('[SalespersonRfpRequests] RFP update event received, refreshing list...')
        fetchRfps()
      }
    }

    window.addEventListener('rfpRecordUpdated', handleRfpUpdate)
    // Also listen for a more general RFP update event
    window.addEventListener('rfpUpdated', handleRfpUpdate)
    
    return () => {
      window.removeEventListener('rfpRecordUpdated', handleRfpUpdate)
      window.removeEventListener('rfpUpdated', handleRfpUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_dh: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending DH Approval', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Rejected', icon: XCircle }
    }
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-300', label: status, icon: FileText }
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
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
        setSelectedRfp(response.data)
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
      return (
        (rfp.product_spec || '').toLowerCase().includes(query) ||
        (rfp.rfp_id || '').toLowerCase().includes(query) ||
        (rfp.company_name || '').toLowerCase().includes(query)
      )
    }
    return true
  })

  // Helper function to normalize date string to YYYY-MM-DD format
  const normalizeDateKey = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (e) {
      return null
    }
  }

  // Format date for display (short format like "10 Dec")
  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
  }

  // Format date for grouping (full format)
  const formatDateForGrouping = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Group records by date
  const groupedRecords = React.useMemo(() => {
    const groups = {}
    
    records.forEach(record => {
      const dateKey = normalizeDateKey(record.created_at)
      
      if (!dateKey) {
        if (!groups['No Date']) {
          groups['No Date'] = {
            dateObj: new Date(0),
            dateKey: 'No Date',
            records: []
          }
        }
        groups['No Date'].records.push(record)
        return
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateObj: new Date(record.created_at),
          dateKey: dateKey,
          records: []
        }
      }
      groups[dateKey].records.push(record)
    })
    
    // Sort dates in descending order (most recent first)
    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (a === 'No Date') return 1
      if (b === 'No Date') return -1
      
      const dateA = new Date(groups[a].dateObj)
      dateA.setHours(0, 0, 0, 0)
      const dateB = new Date(groups[b].dateObj)
      dateB.setHours(0, 0, 0, 0)
      
      return dateB.getTime() - dateA.getTime()
    })
    
    return sortedDates.map(dateKey => ({
      dateKey,
      dateObj: groups[dateKey].dateObj,
      records: groups[dateKey].records
    }))
  }, [records])

  // Pagination logic for grouped records
  const totalRecordPages = Math.ceil(groupedRecords.length / recordsItemsPerPage)
  const startRecordIndex = (recordsPage - 1) * recordsItemsPerPage
  const endRecordIndex = startRecordIndex + recordsItemsPerPage
  const paginatedRecordGroups = groupedRecords.slice(startRecordIndex, endRecordIndex)

  const handleRecordPageChange = (page) => {
    setRecordsPage(page)
  }

  const handleRecordItemsPerPageChange = (newItemsPerPage) => {
    setRecordsItemsPerPage(newItemsPerPage)
    setRecordsPage(1)
  }

  const handleCopyRfpRecordId = (rfpId) => {
    navigator.clipboard.writeText(rfpId)
    Toast.success('RFP ID copied to clipboard!')
  }

  const handleViewRecordDetails = (record) => {
    setSelectedRecord(record)
    setShowRecordDetails(true)
  }

  const getRecordStatusBadge = (status, recordType) => {
    const statusLower = (status || '').toLowerCase()
    const recordTypeLower = (recordType || '').toLowerCase()
    
    // Show record type badge
    if (recordTypeLower === 'saved') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Saved</span>
    } else if (recordTypeLower === 'approved') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Approved</span>
    } else if (recordTypeLower === 'generated') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Generated</span>
    }
    
    // Fallback to status-based badge
    if (statusLower === 'approved' || statusLower === 'rfp_created') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Approved</span>
    } else if (statusLower === 'saved' || statusLower === 'draft') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Saved</span>
    } else if (statusLower === 'rejected') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'Pending'}</span>
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

        {/* Tabs */}
        <div className={`border-b mb-4 sm:mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('rfp-requests')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                activeTab === 'rfp-requests'
                  ? 'border-blue-500 text-blue-600'
                  : isDarkMode 
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              RFP Requests
            </button>
            <button
              onClick={() => setActiveTab('rfp-record')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                activeTab === 'rfp-record'
                  ? 'border-blue-500 text-blue-600'
                  : isDarkMode 
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              RFP Record
            </button>
          </nav>
        </div>

        {/* RFP Requests Tab */}
        {activeTab === 'rfp-requests' && (
          <>
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

        {/* RFP List */}
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
          <div className={`space-y-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
            {filteredRfps.map((rfp) => (
              <div
                key={rfp.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:border-gray-500' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {rfp.product_spec || 'N/A'}
                      </h3>
                      {getStatusBadge(rfp.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {rfp.rfp_id && (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>RFP ID:</span>
                          <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{rfp.rfp_id}</span>
                          <button
                            onClick={() => handleCopyRfpId(rfp.rfp_id)}
                            className="p-1 hover:bg-gray-600 rounded transition-colors"
                            title="Copy RFP ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quantity: </span>
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{rfp.quantity || 'N/A'}</span>
                      </div>
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Company: </span>
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{rfp.company_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created: </span>
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                          {rfp.created_at ? new Date(rfp.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {rfp.delivery_timeline && (
                      <div className="mt-2 text-sm">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delivery Timeline: </span>
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{rfp.delivery_timeline}</span>
                      </div>
                    )}

                    {rfp.approved_by && (
                      <div className="mt-2 text-sm">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved by: </span>
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{rfp.approved_by}</span>
                        {rfp.approved_at && (
                          <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            ({new Date(rfp.approved_at).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    )}

                    {rfp.rejected_by && (
                      <div className="mt-2 text-sm">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rejected by: </span>
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{rfp.rejected_by}</span>
                        {rfp.rejection_reason && (
                          <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            - {rfp.rejection_reason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(rfp)}
                      className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedRfp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">RFP Details</h2>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedRfp(null)
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Product: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{selectedRfp.product_spec || 'N/A'}</span>
                </div>
                {selectedRfp.rfp_id && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>RFP ID: </span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{selectedRfp.rfp_id}</span>
                    <button
                      onClick={() => handleCopyRfpId(selectedRfp.rfp_id)}
                      className="ml-2 p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quantity: </span>
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{selectedRfp.quantity || 'N/A'}</span>
                </div>
                {selectedRfp.delivery_timeline && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delivery Timeline: </span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{selectedRfp.delivery_timeline}</span>
                  </div>
                )}
                {selectedRfp.special_requirements && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Special Requirements: </span>
                    <p className={`mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedRfp.special_requirements}</p>
                  </div>
                )}
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status: </span>
                  {getStatusBadge(selectedRfp.status)}
                </div>
                {selectedRfp.approved_by && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved by: </span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{selectedRfp.approved_by}</span>
                    {selectedRfp.approved_at && (
                      <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        on {new Date(selectedRfp.approved_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
                {selectedRfp.rejected_by && (
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rejected by: </span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{selectedRfp.rejected_by}</span>
                    {selectedRfp.rejection_reason && (
                      <div className={`mt-1 p-2 rounded ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} border ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}>
                        <span className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{selectedRfp.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* RFP Record Tab */}
        {activeTab === 'rfp-record' && (
          <>
            {/* Refresh Button */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={fetchAllRfpRecords}
                disabled={recordsLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50`}
              >
                <RefreshCw className={`w-4 h-4 ${recordsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Date-wise Grouped Records */}
            {recordsLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading RFP records...</p>
              </div>
            ) : groupedRecords.length === 0 ? (
              <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  No RFP records found
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedRecordGroups.map((group) => {
                  const dateDisplay = group.dateKey === 'No Date' 
                    ? 'No Date' 
                    : formatDateShort(group.dateKey)
                  const dateFull = group.dateKey === 'No Date' 
                    ? 'No Date' 
                    : formatDateForGrouping(group.dateKey)
                  
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
                        <table className="min-w-[800px] sm:w-full">
                          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                              <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                RFP ID
                              </th>
                              <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                LEAD NAME
                              </th>
                              <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                PRODUCTS
                              </th>
                              <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                STATUS
                              </th>
                              <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                CREATED AT
                              </th>
                              <th className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                ACTION
                              </th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {group.records.map((record, index) => (
                              <tr
                                key={record.id || index}
                                className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                              >
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-mono text-xs sm:text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                      {record.rfp_id}
                                    </span>
                                    <button
                                      onClick={() => handleCopyRfpRecordId(record.rfp_id)}
                                      className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                      title="Copy RFP ID"
                                    >
                                      <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                    </button>
                                  </div>
                                </td>
                                <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                  <div>
                                    <div className="font-medium">{record.lead_name || 'N/A'}</div>
                                    {record.lead_business && (
                                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        {record.lead_business}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                  <div className="space-y-1">
                                    {Array.isArray(record.products) ? (
                                      <>
                                        {record.products.slice(0, 2).map((product, idx) => (
                                          <div key={idx} className="text-xs">
                                            {product.productSpec} {product.quantity ? `(Qty: ${product.quantity})` : ''}
                                          </div>
                                        ))}
                                        {record.products.length > 2 && (
                                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            +{record.products.length - 2} more
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>No products</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  {getRecordStatusBadge(record.status, record.record_type)}
                                </td>
                                <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {record.created_at 
                                    ? new Date(record.created_at).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'N/A'}
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                                  <button
                                    onClick={() => handleViewRecordDetails(record)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                                      isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                  >
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
                
                {/* Pagination */}
                <div className={`mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 border-t-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50'}`}>
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rows per page:</span>
                    <select
                      value={recordsItemsPerPage}
                      onChange={(e) => handleRecordItemsPerPageChange(parseInt(e.target.value))}
                      className={`px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={500}>500</option>
                    </select>
                  </div>

                  {/* Page info */}
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {groupedRecords.length > 0 ? (
                      <>
                        Showing {startRecordIndex + 1} to {Math.min(endRecordIndex, groupedRecords.length)} of {groupedRecords.length} date groups ({records.length} total RFPs)
                      </>
                    ) : (
                      <>No results found</>
                    )}
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    {/* First page */}
                    <button
                      onClick={() => handleRecordPageChange(1)}
                      disabled={recordsPage === 1 || records.length === 0}
                      className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      title="First page"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>

                    {/* Previous page */}
                    <button
                      onClick={() => handleRecordPageChange(Math.max(1, recordsPage - 1))}
                      disabled={recordsPage === 1 || records.length === 0}
                      className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      title="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalRecordPages) }, (_, i) => {
                        let pageNum
                        if (totalRecordPages <= 5) {
                          pageNum = i + 1
                        } else if (recordsPage <= 3) {
                          pageNum = i + 1
                        } else if (recordsPage >= totalRecordPages - 2) {
                          pageNum = totalRecordPages - 4 + i
                        } else {
                          pageNum = recordsPage - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleRecordPageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                              recordsPage === pageNum
                                ? isDarkMode
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-blue-600 text-white border-blue-600'
                                : isDarkMode
                                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => handleRecordPageChange(Math.min(totalRecordPages, recordsPage + 1))}
                      disabled={recordsPage === totalRecordPages || records.length === 0}
                      className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      title="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Next page */}
                    <button
                      onClick={() => handleRecordPageChange(Math.min(totalRecordPages, recordsPage + 1))}
                      disabled={recordsPage === totalRecordPages || records.length === 0}
                      className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      title="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Last page */}
                    <button
                      onClick={() => handleRecordPageChange(totalRecordPages)}
                      disabled={recordsPage === totalRecordPages || records.length === 0}
                      className={`p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      title="Last page"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Record Details Modal */}
            {showRecordDetails && selectedRecord && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`w-full max-w-3xl rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
                  <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        RFP Record Details
                      </h2>
                      <button
                        onClick={() => setShowRecordDetails(false)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        RFP ID
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {selectedRecord.rfp_id}
                        </span>
                        <button
                          onClick={() => handleCopyRfpRecordId(selectedRecord.rfp_id)}
                          className="p-1 rounded hover:bg-gray-200"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Lead Information
                      </label>
                      <div className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div>Name: {selectedRecord.lead_name || 'N/A'}</div>
                        <div>Business: {selectedRecord.lead_business || 'N/A'}</div>
                        <div>Phone: {selectedRecord.lead_phone || 'N/A'}</div>
                        <div>Email: {selectedRecord.lead_email || 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Products
                          {selectedRecord.record_type === 'saved' && (
                            <span className="ml-2 text-xs text-blue-500">(Save Decision - Multiple products allowed)</span>
                          )}
                          {selectedRecord.record_type === 'approved' && (
                            <span className="ml-2 text-xs text-green-500">(Approved RFP - Should be 1 product per RFP)</span>
                          )}
                        </label>
                        {Array.isArray(selectedRecord.products) && (
                          <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {selectedRecord.products.length} product{selectedRecord.products.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-2">
                        {Array.isArray(selectedRecord.products) ? (
                          selectedRecord.products.map((product, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                            >
                              <div className="font-medium">{product.productSpec}</div>
                              <div className="text-sm text-gray-600">
                                Quantity: {product.quantity || 'N/A'} | 
                                Length: {product.length || 'N/A'} {product.lengthUnit || ''} | 
                                Target Price: ₹{product.targetPrice || 'N/A'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">No products</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Delivery Timeline
                      </label>
                      <div className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {selectedRecord.delivery_timeline
                          ? new Date(selectedRecord.delivery_timeline).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </div>
                    </div>
                    {selectedRecord.special_requirements && (
                      <div>
                        <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Special Requirements
                        </label>
                        <div className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {selectedRecord.special_requirements}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Status
                      </label>
                      <div className="mt-1">
                        {getRecordStatusBadge(selectedRecord.status, selectedRecord.record_type)}
                      </div>
                    </div>
                    <div>
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Created At
                      </label>
                      <div className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {selectedRecord.created_at 
                          ? new Date(selectedRecord.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
