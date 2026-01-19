import React from 'react'
import { X, Eye, Package, Send, Trash2, FileText, Receipt, Pencil, User, Phone, Mail, Building2, MapPin, Globe, Hash, Tag, Clock, CheckCircle, MessageSquare, Calendar } from 'lucide-react'
import { QuotationHelper } from '../../utils/QuotationHelper'
import Toast from '../../utils/Toast'
import apiClient from '../../utils/apiClient'
import { API_ENDPOINTS } from '../../api/admin_api/api'
import DateFormatter from '../../utils/DateFormatter'

export default function CustomerDetailSidebar({ 
  customer, onClose, onEdit, onQuotation, quotations, 
  onViewQuotation, onEditQuotation, onSendQuotation, onDeleteQuotation, 
  onCreatePI, quotationPIs, piHook, onViewPI 
}) {
  if (!customer) return null

  const isApprovedQuotation = QuotationHelper.isApproved
  const isPaymentCompleted = QuotationHelper.isPaymentCompleted

  // State for follow up history
  const [followUpHistory, setFollowUpHistory] = React.useState([])
  const [loadingHistory, setLoadingHistory] = React.useState(false)

  // Fetch PIs for quotations when component mounts or quotations change
  React.useEffect(() => {
    if (quotations && quotations.length > 0 && piHook?.fetchPIsForQuotation) {
      quotations.forEach(q => {
        if (q.id && !quotationPIs?.[q.id]) {
          piHook.fetchPIsForQuotation(q.id)
        }
      })
    }
  }, [quotations?.length, customer?.id])

  // Fetch follow up history when customer changes
  React.useEffect(() => {
    const fetchFollowUpHistory = async () => {
      const customerId = customer?.id || customer?._id
      if (!customerId) {
        setFollowUpHistory([])
        return
      }
      
      setLoadingHistory(true)
      try {
        const response = await apiClient.get(API_ENDPOINTS.SALESPERSON_LEAD_HISTORY(customerId))
        const history = response?.data?.data || response?.data || []
        // Sort by date, most recent first
        const sortedHistory = [...history].sort((a, b) => {
          const dateA = new Date(a.follow_up_date || a.created_at || 0)
          const dateB = new Date(b.follow_up_date || b.created_at || 0)
          return dateB - dateA
        })
        setFollowUpHistory(sortedHistory)
      } catch (error) {
        console.warn('Failed to fetch follow up history:', error)
        setFollowUpHistory([])
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchFollowUpHistory()
  }, [customer?.id, customer?._id])

  const getPIsForQuotation = (quotationId) => {
    return quotationPIs?.[quotationId] || []
  }

  // Get customer created date
  const getCustomerCreatedDate = () => {
    const createdDate = customer.created_at || customer.createdAt || customer.date
    if (!createdDate) return 'N/A'
    return DateFormatter.formatDate(createdDate)
  }

  // Group follow ups by date
  const groupedFollowUps = React.useMemo(() => {
    if (!followUpHistory || followUpHistory.length === 0) return {}
    
    const groups = {}
    followUpHistory.forEach((followUp) => {
      const dateInput = followUp.follow_up_date || followUp.created_at || Date.now()
      const dateKey = DateFormatter.formatDate(dateInput)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(followUp)
    })
    
    // Sort each group by time (most recent first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const dateA = new Date(a.follow_up_date || a.created_at || 0)
        const dateB = new Date(b.follow_up_date || b.created_at || 0)
        return dateB - dateA
      })
    })
    
    return groups
  }, [followUpHistory])

  // Get sorted date keys for display (most recent first)
  const sortedDateKeys = React.useMemo(() => {
    return Object.keys(groupedFollowUps).sort((a, b) => {
      // Parse date strings like "15 Jan 2024" back to Date objects for comparison
      try {
        const dateA = new Date(groupedFollowUps[a][0]?.follow_up_date || groupedFollowUps[a][0]?.created_at || 0)
        const dateB = new Date(groupedFollowUps[b][0]?.follow_up_date || groupedFollowUps[b][0]?.created_at || 0)
        return dateB - dateA // Most recent first
      } catch {
        return 0
      }
    })
  }, [groupedFollowUps])

  // Format follow up date and time
  const formatFollowUpDateTime = (followUp) => {
    if (!followUp) return 'N/A'
    const dateInput = followUp.follow_up_date || followUp.created_at
    const timeInput = followUp.follow_up_time
    if (!dateInput) return 'N/A'
    return DateFormatter.formatDateTime(dateInput, timeInput)
  }

  // Get status badge color class
  const getStatusBadgeClass = (salesStatus) => {
    const status = String(salesStatus || '').toLowerCase()
    if (status === 'running') return 'bg-gradient-to-r from-yellow-400 to-orange-400'
    if (status === 'pending') return 'bg-gradient-to-r from-yellow-500 to-amber-500'
    if (status === 'win' || status === 'converted') return 'bg-gradient-to-r from-green-500 to-emerald-500'
    return 'bg-gradient-to-r from-blue-500 to-cyan-500'
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      
      <div className="fixed right-0 top-12 sm:top-14 h-[calc(100vh-3rem)] sm:h-[calc(100vh-3.5rem)] w-full max-w-full sm:w-96 lg:max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 pt-6 pb-3 px-3 sm:pt-8 sm:pb-4 sm:px-4 flex items-center justify-between shadow-lg flex-shrink-0 gap-2 sm:gap-3 overflow-hidden">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 leading-none overflow-hidden">
            <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Customer Details</span>
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0 flex items-center justify-center" aria-label="Close">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-200 shadow-sm">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              Customer Information
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-purple-700 text-xs">Name:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{customer.name || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-blue-700 text-xs">Phone:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{customer.phone || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-pink-700 text-xs">Email:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{customer.email || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-indigo-700 text-xs">Business:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{customer.business || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-red-700 text-xs">Address:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{customer.address || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-teal-700 text-xs">State:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{customer.state || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Hash className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-cyan-700 text-xs">GST No:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{customer.gstNo || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-orange-700 text-xs">Type:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{customer.customerType || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-green-700 text-xs">Customer Created:</span>
                  <span className="ml-2 text-gray-800 font-medium text-xs break-words">{getCustomerCreatedDate()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Follow Up Information Section - All Follow Ups */}
          {Object.keys(groupedFollowUps).length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-200 shadow-sm mt-4">
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                Follow Up History
              </h3>
              
              {loadingHistory ? (
                <div className="text-center py-4">
                  <div className="animate-pulse text-xs text-gray-600">Loading follow ups...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedDateKeys.map((dateKey) => (
                      <div key={dateKey} className="mb-3">
                        <div className="flex justify-center mb-2">
                          <span className="text-[10px] font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full shadow-md">
                            {dateKey}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {groupedFollowUps[dateKey].map((followUp, idx) => (
                            <div
                              key={`follow-up-${followUp.id || idx}`}
                              className="max-w-full rounded-lg rounded-tl-none bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 p-3 shadow-sm"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                                  <MessageSquare className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-900">
                                  Follow Up
                                </span>
                                {followUp.sales_status && (
                                  <span className={`ml-auto px-2 py-0.5 text-[9px] font-semibold rounded-full bg-gradient-to-r ${getStatusBadgeClass(followUp.sales_status)} text-white shadow-sm`}>
                                    {String(followUp.sales_status).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-800 ml-7 space-y-1">
                                {followUp.follow_up_status && (
                                  <div>
                                    <span className="font-semibold text-blue-700">Status:</span>{' '}
                                    <span className="text-gray-800">{followUp.follow_up_status}</span>
                                  </div>
                                )}
                                {followUp.follow_up_remark && (
                                  <div>
                                    <span className="font-semibold text-purple-700">Remark:</span>{' '}
                                    <span className="text-gray-700 italic">{followUp.follow_up_remark}</span>
                                  </div>
                                )}
                                {(followUp.follow_up_date || followUp.follow_up_time || followUp.created_at) && (
                                  <div className="flex items-center gap-1 text-[9px] text-gray-600">
                                    <Clock className="h-2.5 w-2.5 text-pink-600" />
                                    {formatFollowUpDateTime(followUp)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-3">
              <h3 className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span>Quotations</span>
              </h3>
              <button 
                onClick={() => {
                  onQuotation(customer)
                  onClose()
                }} 
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              >
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" /> 
                <span className="truncate">Create Quotation</span>
              </button>
            </div>
            
            {quotations && quotations.length > 0 ? (
              <div className="space-y-3">
                {quotations.filter(q => q.customerId === customer.id || !q.customerId).map((quotation, index) => {
                  const pis = getPIsForQuotation(quotation.id)
                  return (
                    <div key={quotation.id || index} className="p-4 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:border-purple-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-gray-900">{quotation.quotationNumber || `Quotation #${index + 1}`}</span>
                          </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <Clock className="h-3.5 w-3.5 text-pink-600" />
                          {quotation.quotationDate ? (quotation.quotationDate.includes('T') ? new Date(quotation.quotationDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : quotation.quotationDate) : 'N/A'}
                        </div>
                          <div className="text-sm font-semibold text-gray-800 mb-2">
                            Total: <span className="text-blue-700">₹{quotation.total ? Number(quotation.total).toLocaleString('en-IN') : '0.00'}</span>
                          </div>
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm ${
                            quotation.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 
                            quotation.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' : 
                            quotation.status === 'pending' || quotation.status === 'pending_verification' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' :
                            'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          }`}>
                            {quotation.status === 'approved' ? '✅ Approved' :
                             quotation.status === 'rejected' ? '❌ Rejected' :
                             quotation.status === 'pending' || quotation.status === 'pending_verification' ? '⏳ Pending' :
                             quotation.status || 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                          <button 
                            onClick={() => onViewQuotation(quotation)} 
                            className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-lg shadow-sm transition-all duration-200" 
                            title="View Quotation"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {quotation.id && onEditQuotation && (
                            <button 
                              onClick={() => {
                                onEditQuotation(quotation, customer)
                                onClose()
                              }} 
                              className="p-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-sm transition-all duration-200" 
                              title="Edit Quotation"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {quotation.status !== 'approved' && quotation.status !== 'rejected' && quotation.status !== 'pending_verification' && quotation.status !== 'pending' && (
                            <button 
                              onClick={() => onSendQuotation(quotation)} 
                              className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-lg shadow-sm transition-all duration-200" 
                              title="Send for Verification"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {isApprovedQuotation(quotation) && !isPaymentCompleted(quotation) && (
                            <button 
                              onClick={() => {
                                if (onCreatePI && quotation.id) {
                                  onCreatePI(quotation, customer)
                                } else {
                                  Toast.info('Please save the quotation first')
                                }
                              }} 
                              className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-lg shadow-sm transition-all duration-200" 
                              title="Create PI"
                            >
                              <Package className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {quotation.status !== 'approved' && quotation.status !== 'pending_verification' && quotation.status !== 'pending' && quotation.status !== 'completed' && (
                            <button 
                              onClick={() => onDeleteQuotation(quotation)} 
                              className="p-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 rounded-lg shadow-sm transition-all duration-200" 
                              title="Delete Quotation"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {quotation.id && pis && pis.length > 0 && (
                        <div className="mt-3 pt-3 border-t-2 border-gray-300">
                          <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                            <div className="p-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded">
                              <Receipt className="h-3 w-3 text-white" />
                            </div>
                            Proforma Invoices ({pis.length})
                          </div>
                          <div className="space-y-2">
                            {pis.map((pi, piIndex) => (
                              <div key={pi.id || piIndex} className="flex items-center justify-between p-2.5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 shadow-sm">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="p-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded">
                                    <Receipt className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="font-bold text-gray-800">{pi.pi_number || pi.piNumber || `PI-${piIndex + 1}`}</span>
                                  <span className="flex items-center gap-0.5 text-xs text-gray-600">
                                    <Clock className="h-3 w-3 text-pink-600" />
                                    {pi.pi_date || pi.piDate || pi.created_at ? (() => {
                                      const dateStr = pi.pi_date || pi.piDate || pi.created_at
                                      const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr)
                                      return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                                    })() : 'N/A'}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm ${
                                    pi.status === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                    pi.status === 'pending_approval' || pi.status === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' :
                                    'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                  }`}>
                                    {pi.status || 'Draft'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      if (onViewPI && pi.id) {
                                        onViewPI(pi.id, quotation)
                                      }
                                    }}
                                    className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-lg shadow-sm transition-all duration-200"
                                    title="View PI"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </button>
                                  {pi.status !== 'approved' && pi.status !== 'pending_approval' && pi.status !== 'pending_verification' && pi.status !== 'completed' && (
                                    <button
                                      onClick={() => {
                                        if (piHook?.handleDeletePI && pi.id && quotation.id) {
                                          piHook.handleDeletePI(pi.id, quotation.id)
                                        }
                                      }}
                                      className="p-1 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 rounded-lg shadow-sm transition-all duration-200"
                                      title="Delete PI"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-600 font-medium mb-4">No quotations found</p>
                <button 
                  onClick={() => {
                    onQuotation(customer)
                    onClose()
                  }} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Create First Quotation
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 flex-shrink-0 overflow-hidden">
          <button 
            onClick={() => {
              onEdit()
              onClose()
            }} 
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
          >
            Edit Customer
          </button>
          <button 
            onClick={onClose} 
            className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm sm:text-base font-semibold transition-all duration-200 w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
