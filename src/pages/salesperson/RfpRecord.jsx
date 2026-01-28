"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, FileText, RefreshCw, ChevronLeft, ChevronRight, Eye, Copy, CheckCircle, Clock, XCircle } from 'lucide-react'
import { apiClient, API_ENDPOINTS } from '../../utils/globalImports'
import Toast from '../../utils/Toast'

const RfpRecord = ({ isDarkMode = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(50)
  const [total, setTotal] = useState(0)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const fetchRecords = useCallback(async (date, pageNum = 1) => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        date,
        page: pageNum.toString(),
        limit: limit.toString()
      }).toString()
      
      const response = await apiClient.get(API_ENDPOINTS.PRICING_RFP_DECISION_RECORDS_BY_DATE(query))
      
      if (response.success) {
        setRecords(response.data || [])
        setTotal(response.pagination?.total || 0)
        setPage(pageNum)
      } else {
        Toast.error(response.message || 'Failed to fetch RFP records')
        setRecords([])
      }
    } catch (error) {
      console.error('Error fetching RFP records:', error)
      Toast.error(error.message || 'Failed to fetch RFP records')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchRecords(selectedDate, 1)
  }, [selectedDate, fetchRecords])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setPage(1)
  }

  const handlePreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
    setPage(1)
  }

  const handleNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    const today = new Date().toISOString().split('T')[0]
    if (date.toISOString().split('T')[0] <= today) {
      setSelectedDate(date.toISOString().split('T')[0])
      setPage(1)
    }
  }

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
    setPage(1)
  }

  const handleCopyRfpId = (rfpId) => {
    navigator.clipboard.writeText(rfpId)
    Toast.success('RFP ID copied to clipboard!')
  }

  const handleViewDetails = (record) => {
    setSelectedRecord(record)
    setShowDetails(true)
  }

  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase()
    if (statusLower === 'approved' || statusLower === 'rfp_created') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Approved</span>
    } else if (statusLower === 'draft') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Draft</span>
    } else if (statusLower === 'rejected') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'Pending'}</span>
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
      <div className={`max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              RFP Record
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              View daily RFP records with complete history
            </p>
          </div>
          <button
            onClick={() => fetchRecords(selectedDate, page)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Date Navigation */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handlePreviousDay}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
                className={`px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <button
              onClick={handleNextDay}
              disabled={selectedDate >= new Date().toISOString().split('T')[0]}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleToday}
              className={`ml-auto px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* Records Table */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading RFP records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No RFP records found for {new Date(selectedDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      RFP ID
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lead Name
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Products
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Created At
                    </th>
                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={record.id || index}
                      className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {record.rfp_id}
                          </span>
                          <button
                            onClick={() => handleCopyRfpId(record.rfp_id)}
                            className={`p-1 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-600' : ''}`}
                            title="Copy RFP ID"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div>
                          <div className="font-medium">{record.lead_name || 'N/A'}</div>
                          {record.lead_business && (
                            <div className="text-xs text-gray-500">{record.lead_business}</div>
                          )}
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="text-sm">
                          {Array.isArray(record.products) ? (
                            <div className="space-y-1">
                              {record.products.slice(0, 2).map((product, idx) => (
                                <div key={idx} className="text-xs">
                                  {product.productSpec} {product.quantity ? `(Qty: ${product.quantity})` : ''}
                                </div>
                              ))}
                              {record.products.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{record.products.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">No products</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(record.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                            isDarkMode
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`mt-6 flex items-center justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="text-sm">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchRecords(selectedDate, page - 1)}
                    disabled={page === 1 || loading}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchRecords(selectedDate, page + 1)}
                    disabled={page >= totalPages || loading}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Details Modal */}
        {showDetails && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-3xl rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    RFP Details
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <XCircle className="w-5 h-5" />
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
                      onClick={() => handleCopyRfpId(selectedRecord.rfp_id)}
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
                  <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Products
                  </label>
                  <div className="mt-1 space-y-2">
                    {Array.isArray(selectedRecord.products) ? (
                      selectedRecord.products.map((product, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                        >
                          <div className="font-medium">{product.productSpec}</div>
                          <div className="text-sm text-gray-600">
                            Length / Qty: {product.length || product.quantity || 'N/A'} {product.lengthUnit || ''} | 
                            Target Price: {product.targetPrice ? `₹${product.targetPrice}` : 'N/A'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">No products</span>
                    )}
                  </div>
                </div>
                {selectedRecord.calculator_pricing_log && (
                  <div>
                    <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pricing Log (Calculator)
                    </label>
                    {(() => {
                      const log = selectedRecord.calculator_pricing_log || {}
                      const rateTypeLabelMap = {
                        alu_per_mtr: 'Aluminium / Mtr',
                        alloy_per_mtr: 'Alloy / Mtr',
                        alu_per_kg: 'Aluminium / Kg',
                        alloy_per_kg: 'Alloy / Kg'
                      }
                      const lengthUsed =
                        log.length !== undefined && log.length !== null
                          ? log.length
                          : (log.quantity !== undefined && log.quantity !== null ? log.quantity : '—')
                      return (
                        <div className={`mt-2 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Selected Product</div>
                              <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>{log.productSpec || '—'}</div>
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Family</div>
                              <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>{log.family || 'AAAC'}</div>
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Length / Qty Used</div>
                              <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>{lengthUsed}</div>
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rate Type</div>
                              <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
                                {log.rateType ? rateTypeLabelMap[log.rateType] || log.rateType : '—'}
                              </div>
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Base Rate</div>
                              <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
                                {typeof log.basePerUnit === 'number' ? `₹${log.basePerUnit.toFixed(2)}` : (log.basePerUnit || '—')}
                              </div>
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Base Amount</div>
                              <div className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
                                {typeof log.baseTotal === 'number' ? `₹${log.baseTotal.toFixed(2)}` : (log.baseTotal || '—')}
                              </div>
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total After Charges</div>
                              <div className="font-semibold text-emerald-500">
                                {typeof log.totalPrice === 'number' ? `₹${log.totalPrice.toFixed(2)}` : (log.totalPrice || '—')}
                              </div>
                            </div>
                          </div>
                          {Array.isArray(log.extraCharges) && log.extraCharges.length > 0 && (
                            <div className="mt-3">
                              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Additional Charges</div>
                              <ul className={isDarkMode ? 'text-gray-100 text-sm list-disc list-inside' : 'text-gray-900 text-sm list-disc list-inside'}>
                                {log.extraCharges.map((row, idx) => (
                                  <li key={idx}>
                                    {(row.label || 'Charge')} – {row.amount ? `₹${row.amount}` : '₹0'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
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
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Created At
                  </label>
                  <div className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formatDate(selectedRecord.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RfpRecord
