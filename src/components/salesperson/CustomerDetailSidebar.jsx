import React from 'react'
import { X, Eye, Package, Trash2, FileText, Receipt, Pencil, User, Phone, Mail, Building2, MapPin, Globe, Hash, Tag, Clock, CheckCircle, MessageSquare, Ban } from 'lucide-react'
import { QuotationHelper } from '../../utils/QuotationHelper'
import Toast from '../../utils/Toast'
import apiClient from '../../utils/apiClient'
import { API_ENDPOINTS } from '../../api/admin_api/api'
import DateFormatter from '../../utils/DateFormatter'

export default function CustomerDetailSidebar({ 
  customer, onClose, onEdit, onQuotation, quotations, 
  onViewQuotation, onEditQuotation, onDeleteQuotation, 
  onCreatePI, quotationPIs, piHook, onViewPI 
}) {
  if (!customer) return null

  const isApprovedQuotation = QuotationHelper.isApproved
  const isPaymentCompleted = QuotationHelper.isPaymentCompleted

  const [followUpHistory, setFollowUpHistory] = React.useState([])
  const [loadingHistory, setLoadingHistory] = React.useState(false)
  const [orderCancelRequests, setOrderCancelRequests] = React.useState([])
  const [loadingOrderCancel, setLoadingOrderCancel] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  React.useEffect(() => {
    if (!quotations || quotations.length === 0 || !piHook?.fetchPIsForQuotation) return

    quotations.forEach((q) => {
      if (q.id && !quotationPIs?.[q.id]) {
        piHook.fetchPIsForQuotation(q.id)
      }
    })
  }, [quotations?.length, customer?.id])

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
        setFollowUpHistory(Array.isArray(history) ? history : [])
      } catch (error) {
        console.warn('Failed to fetch follow up history:', error)
        setFollowUpHistory([])
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchFollowUpHistory()
  }, [customer?.id, customer?._id])

  React.useEffect(() => {
    const customerId = customer?.id || customer?._id
    if (!customerId) {
      setOrderCancelRequests([])
      return
    }

    setLoadingOrderCancel(true)
    apiClient
      .get(API_ENDPOINTS.ORDER_CANCEL_BY_CUSTOMER(customerId))
      .then((res) => {
        const data = res?.data?.data || res?.data || []
        setOrderCancelRequests(Array.isArray(data) ? data : [])
      })
      .catch(() => setOrderCancelRequests([]))
      .finally(() => setLoadingOrderCancel(false))
  }, [customer?.id, customer?._id])

  const getPIsForQuotation = (quotationId) => quotationPIs?.[quotationId] || []

  const formatPiDate = (pi) => {
    const dateStr = pi?.pi_date || pi?.piDate || pi?.created_at
    if (!dateStr) return 'N/A'
    const date = typeof dateStr === 'string' && dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getCustomerCreatedDate = () => {
    const createdDate = customer.created_at || customer.createdAt || customer.date
    if (!createdDate) return 'N/A'
    return DateFormatter.formatDate(createdDate)
  }

  const sortedFollowUps = React.useMemo(() => {
    if (!followUpHistory || followUpHistory.length === 0) return []

    return [...followUpHistory].sort((a, b) => {
      const dateA = new Date(a.follow_up_date || a.created_at || 0)
      const dateB = new Date(b.follow_up_date || b.created_at || 0)
      return dateB - dateA
    })
  }, [followUpHistory])

  const formatFollowUpDateTime = (followUp) => {
    if (!followUp) return 'N/A'
    const dateInput = followUp.follow_up_date || followUp.created_at
    const timeInput = followUp.follow_up_time
    if (!dateInput) return 'N/A'
    return DateFormatter.formatDateTime(dateInput, timeInput)
  }

  const getStatusBadgeClass = (salesStatus) => {
    const status = String(salesStatus || '').toLowerCase()
    if (status === 'running') return 'bg-gradient-to-r from-yellow-400 to-orange-400'
    if (status === 'pending') return 'bg-gradient-to-r from-yellow-500 to-amber-500'
    if (status === 'win' || status === 'converted') return 'bg-gradient-to-r from-green-500 to-emerald-500'
    return 'bg-gradient-to-r from-blue-500 to-cyan-500'
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[140] transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>
      
      <div
        className={`fixed inset-y-0 right-0 h-screen w-full sm:w-[360px] lg:w-[420px] bg-white shadow-2xl z-[150] flex flex-col overflow-hidden transform transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="bg-slate-800 pt-6 pb-3 px-4 sm:pt-8 sm:pb-4 flex items-center justify-between flex-shrink-0 gap-2 overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 min-w-0 flex-1 truncate">
            <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-indigo-300" />
            <span>Customer Details</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex-shrink-0" aria-label="Close">
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

          {(orderCancelRequests?.length > 0 || loadingOrderCancel) && (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-lg p-4 mb-4 border border-amber-200 shadow-sm mt-4">
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-3 flex items-center gap-2">
                <Ban className="h-4 w-4 text-amber-600" />
                Order Cancel Details
              </h3>
              {loadingOrderCancel ? (
                <div className="text-center py-3 text-xs text-gray-600">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {orderCancelRequests.map((req, idx) => (
                    <div
                      key={req.id || idx}
                      className="p-3 rounded-lg bg-white border border-amber-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-xs">
                          Quotation: {req.quotation_id ? String(req.quotation_id).slice(0, 8) + '...' : 'N/A'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          req.status === 'approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'approved' ? 'Cancelled' : req.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                      {req.reason && (
                        <p className="text-[11px] text-gray-600 mb-1"><span className="font-medium">Reason:</span> {req.reason}</p>
                      )}
                      <p className="text-[10px] text-gray-500">
                        Requested: {req.created_at ? DateFormatter.formatDateTime(req.created_at) : 'N/A'}
                        {req.approved_at && req.status === 'approved' && ` • Approved: ${DateFormatter.formatDateTime(req.approved_at)}`}
                        {req.rejected_at && req.status === 'rejected' && ` • Rejected: ${DateFormatter.formatDateTime(req.rejected_at)}`}
                        {req.rejection_reason && <span className="block mt-0.5 text-red-600">Rejection: {req.rejection_reason}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {sortedFollowUps.length > 0 && (
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm mt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                Follow Up History
              </h3>
              {loadingHistory ? (
                <div className="text-center py-4 text-xs text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {sortedFollowUps.map((followUp, idx) => (
                    <div
                      key={`follow-up-${followUp.id || idx}`}
                      className="flex gap-3 p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 flex flex-col items-center text-[10px] font-medium text-gray-600">
                        <Clock className="h-3 w-3 text-indigo-500 mb-0.5" />
                        {formatFollowUpDateTime(followUp)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {followUp.follow_up_status && (
                            <span className="text-xs font-medium text-gray-800">{followUp.follow_up_status}</span>
                          )}
                          {followUp.sales_status && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${getStatusBadgeClass(followUp.sales_status)} text-white`}>
                              {String(followUp.sales_status).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {followUp.follow_up_remark && (
                          <p className="text-[11px] text-gray-600 mt-0.5 italic">{followUp.follow_up_remark}</p>
                        )}
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
                                  {pi.parent_pi_id && (
                                    <span className="text-xs text-indigo-600 font-medium">↳ from {pi.parent_pi_number || 'Original'}</span>
                                  )}
                                  <span className="flex items-center gap-0.5 text-xs text-gray-600">
                                    <Clock className="h-3 w-3 text-pink-600" />
                                    {formatPiDate(pi)}
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
