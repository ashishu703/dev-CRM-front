import React from 'react'
import { X, Eye, Package, Trash2, FileText, Receipt, Pencil, User, Phone, Mail, Clock, CheckCircle, MessageSquare, Bell, Calendar, Send, Upload, Settings, ShieldCheck } from 'lucide-react'
import { QuotationHelper } from '../../utils/QuotationHelper'
import Toast from '../../utils/Toast'
import { useGetRemindersByLeadIdQuery, useCreateReminderMutation, useCompleteReminderMutation, useDeleteReminderMutation } from '../../features/leadReminders'
import { useAuth } from '../../hooks/useAuth'
import { ReminderCard } from '../timeline'
import SectionHeader from '../ui/SectionHeader'
import EmptyState from '../ui/EmptyState'
import ActivityTimelineSimple from '../lead/ActivityTimelineSimple'

const TAB = { OVERVIEW: 'overview', QUOTATIONS: 'quotations', NOTES: 'notes', UPDATE_STATUS: 'updateStatus', RFP: 'rfp', SEND_EMAIL: 'sendEmail', DOCS: 'docs' }
const tabBtn = (isActive) => `flex items-center gap-1.5 py-2.5 px-3 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'}`

function ReminderTab({
  leadId,
  reminders,
  upcomingReminders,
  loadingReminders,
  createReminder,
  creatingReminder,
  completeReminder,
  deleteReminder,
  Toast,
}) {
  const [title, setTitle] = React.useState('')
  const [dueAt, setDueAt] = React.useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !dueAt) {
      Toast.warning('Title and due date required')
      return
    }
    try {
      await createReminder({ leadId, title: title.trim(), due_at: dueAt, repeat_type: 'none' }).unwrap()
      setTitle('')
      setDueAt('')
      Toast.success('Reminder set')
    } catch (err) {
      Toast.error(err?.data?.message || 'Failed to create reminder')
    }
  }
  if (!leadId) return null
  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Set Reminder</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Follow up on quotation"
          className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-sm mb-2"
        />
        <input
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-sm mb-2"
        />
        <button type="submit" disabled={creatingReminder} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {creatingReminder ? 'Adding...' : 'Set Reminder'}
        </button>
      </form>
      <SectionHeader icon={Bell} title="Upcoming Reminders" />
      {loadingReminders ? (
        <div className="h-20 rounded bg-slate-100 animate-pulse" />
      ) : upcomingReminders.length === 0 ? (
        <EmptyState icon={Bell} title="No upcoming reminders" subtitle="Set a reminder above" />
      ) : (
        <div className="space-y-1.5">
          {upcomingReminders.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onComplete={(rem) => completeReminder({ leadId, reminderId: rem.id })}
              onDelete={(rem) => deleteReminder({ leadId, reminderId: rem.id })}
              showCountdown
            />
          ))}
        </div>
      )}
      {(() => { const completed = reminders.filter((r) => r.completed_at); return completed.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-slate-600">Completed</h3>
          <div className="space-y-1.5">
            {completed.slice(0, 5).map((r) => (
              <ReminderCard key={r.id} reminder={r} showCountdown={false} />
            ))}
          </div>
        </>
      ); })()}
    </div>
  )
}

export default function CustomerDetailSidebar({
  customer, onClose, onEdit, onQuotation, quotations,
  onViewQuotation, onEditQuotation, onDeleteQuotation,
  onCreatePI, quotationPIs, piHook, onViewPI,
  onUpdateStatus, onPricingRfp, onSendEmail, onDocs,
  renderUpdateStatusContent, renderRfpContent, renderSendEmailContent, renderDocsContent,
  onPricingRfpTabSelect, onUpdateStatusTabSelect,
  hasPending = false,
  onFinalSave,
  onViewActivity,
  onDeleteActivity,
  onEditEnquiry,
}) {
  if (!customer) return null

  const isApprovedQuotation = QuotationHelper.isApproved
  const isPaymentCompleted = QuotationHelper.isPaymentCompleted

  const leadId = customer?.id ?? customer?._id
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = React.useState(TAB.OVERVIEW)
  const [isVisible, setIsVisible] = React.useState(false)
  const [viewingEmail, setViewingEmail] = React.useState(null)

  // Default handlers if not provided
  const handleViewActivity = onViewActivity || ((activity) => {
    // Silently handle if no handler provided
  });

  const handleDeleteActivity = onDeleteActivity || ((activity) => {
    // Silently handle if no handler provided
  });

  const handleEditEnquiry = onEditEnquiry || ((activity) => {
    // Silently handle if no handler provided
  });

  const { data: remindersResult, isLoading: loadingReminders } = useGetRemindersByLeadIdQuery(
    leadId ? { leadId, page: 1, limit: 50 } : undefined,
    { skip: !leadId }
  )
  const reminders = remindersResult?.reminders ?? []
  const upcomingReminders = React.useMemo(() => reminders.filter((r) => !r.completed_at && r.due_at && new Date(r.due_at) >= new Date()), [reminders])
  const quotationCount = (quotations && quotations.filter(q => (q.customerId || q.customer_id) === customer?.id || !(q.customerId || q.customer_id)).length) || 0
  const notesCount = reminders.filter((r) => !r.completed_at).length || 0
  const [createReminder, { isLoading: creatingReminder }] = useCreateReminderMutation()
  const [completeReminder] = useCompleteReminderMutation()
  const [deleteReminder] = useDeleteReminderMutation()

  const custQuotations = React.useMemo(() => (quotations || []).filter(q => (q.customerId || q.customer_id) === customer?.id || !(q.customerId || q.customer_id)), [quotations, customer?.id])

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

  const getPIsForQuotation = (quotationId) => quotationPIs?.[quotationId] || []

  const formatPiDate = (pi) => {
    const dateStr = pi?.pi_date || pi?.piDate || pi?.created_at
    if (!dateStr) return 'N/A'
    const date = typeof dateStr === 'string' && dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const initials = (customer?.name || 'U').trim().split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const CustomerInfoBlock = () => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 mb-4">
      <div className="flex gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-base font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="sm:col-span-2"><span className="font-semibold text-slate-500">Name</span><p className="font-medium text-slate-900 truncate">{customer.name || 'N/A'}</p></div>
          <div><span className="font-semibold text-slate-500">Business name</span><p className="font-medium text-slate-900 truncate">{customer.business || customer.customerType || 'N/A'}</p></div>
          <div><span className="font-semibold text-slate-500">Mobile no</span><p className="font-medium text-slate-900 flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-500" /> {customer.phone || 'N/A'}</p></div>
          <div><span className="font-semibold text-slate-500">Email address</span><p className="font-medium text-slate-900 truncate flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" /> {customer.email || 'N/A'}</p></div>
          <div><span className="font-semibold text-slate-500">State</span><p className="font-medium text-slate-900">{customer.state || 'N/A'}</p></div>
          <div><span className="font-semibold text-slate-500">Division</span><p className="font-medium text-slate-900">{customer.division || 'N/A'}</p></div>
          <div><span className="font-semibold text-slate-500">Assigned salesperson</span><p className="font-medium text-slate-900 flex items-center gap-1"><User className="h-3.5 w-3.5 text-indigo-600" /> {authUser?.username || authUser?.name || '—'}</p></div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[140] transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>
      
      <div
        className={`fixed inset-y-0 right-0 h-full w-full sm:w-[936px] lg:w-[1092px] bg-white shadow-2xl z-[150] flex flex-col overflow-hidden transform transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ top: 0, bottom: 0 }}
      >
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-bold text-slate-900 truncate">Customer Details</h2>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 flex-shrink-0" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-1 border-b border-slate-200 -mb-px flex-wrap">
            <button type="button" onClick={() => setActiveTab(TAB.OVERVIEW)} className={tabBtn(activeTab === TAB.OVERVIEW)}>
              <FileText className="h-3.5 w-3.5" /> Overview
            </button>
            <button type="button" onClick={() => setActiveTab(TAB.QUOTATIONS)} className={tabBtn(activeTab === TAB.QUOTATIONS)}>
              <FileText className="h-3.5 w-3.5" /> Quotations {quotationCount > 0 && <span className="bg-emerald-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{quotationCount}</span>}
            </button>
            <button type="button" onClick={() => setActiveTab(TAB.NOTES)} className={tabBtn(activeTab === TAB.NOTES)}>
              <MessageSquare className="h-3.5 w-3.5" /> Notes {notesCount > 0 && <span className="bg-amber-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{notesCount}</span>}
            </button>
            {(typeof renderUpdateStatusContent === 'function' || typeof onUpdateStatus === 'function') && (
              <button type="button" onClick={() => { if (typeof renderUpdateStatusContent === 'function') { typeof onUpdateStatusTabSelect === 'function' && onUpdateStatusTabSelect(customer); setActiveTab(TAB.UPDATE_STATUS); } else onUpdateStatus?.(); }} className={tabBtn(activeTab === TAB.UPDATE_STATUS)}>
                <Settings className="h-3.5 w-3.5" /> Enquiry
              </button>
            )}
            {(typeof renderRfpContent === 'function' || typeof onPricingRfp === 'function') && (
              <button type="button" onClick={() => { if (typeof renderRfpContent === 'function') { typeof onPricingRfpTabSelect === 'function' && onPricingRfpTabSelect(customer); setActiveTab(TAB.RFP); } else onPricingRfp?.(); }} className={tabBtn(activeTab === TAB.RFP)}>
                <ShieldCheck className="h-3.5 w-3.5" /> Request for Price
              </button>
            )}
            {(typeof renderSendEmailContent === 'function' || typeof onSendEmail === 'function') && (
              <button type="button" onClick={() => { if (typeof renderSendEmailContent === 'function') setActiveTab(TAB.SEND_EMAIL); else onSendEmail?.(); }} className={tabBtn(activeTab === TAB.SEND_EMAIL)}>
                <Send className="h-3.5 w-3.5" /> Send Email
              </button>
            )}
            {(typeof renderDocsContent === 'function' || typeof onDocs === 'function') && (
              <button type="button" onClick={() => { if (typeof renderDocsContent === 'function') setActiveTab(TAB.DOCS); else onDocs?.(); }} className={tabBtn(activeTab === TAB.DOCS)}>
                <Upload className="h-3.5 w-3.5" /> Docs
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          {activeTab === TAB.UPDATE_STATUS && typeof renderUpdateStatusContent === 'function' && (
            <div className="min-h-0 overflow-y-auto">{renderUpdateStatusContent(() => setActiveTab(TAB.OVERVIEW))}</div>
          )}
          {activeTab === TAB.RFP && typeof renderRfpContent === 'function' && (
            <div className="min-h-0 overflow-y-auto">{renderRfpContent(() => setActiveTab(TAB.OVERVIEW))}</div>
          )}
          {activeTab === TAB.SEND_EMAIL && typeof renderSendEmailContent === 'function' && (
            <div className="min-h-0 overflow-y-auto">{renderSendEmailContent(() => setActiveTab(TAB.OVERVIEW))}</div>
          )}
          {activeTab === TAB.DOCS && typeof renderDocsContent === 'function' && (
            <div className="min-h-0 overflow-y-auto">{renderDocsContent(() => setActiveTab(TAB.OVERVIEW))}</div>
          )}
          {activeTab === TAB.NOTES && (
            <ReminderTab
              leadId={leadId}
              reminders={reminders}
              upcomingReminders={upcomingReminders}
              loadingReminders={loadingReminders}
              createReminder={createReminder}
              creatingReminder={creatingReminder}
              completeReminder={completeReminder}
              deleteReminder={deleteReminder}
              Toast={Toast}
            />
          )}

          {activeTab === TAB.OVERVIEW && (
            <div className="space-y-4">
              <CustomerInfoBlock />
              {hasPending && typeof onFinalSave === 'function' && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <button type="button" onClick={onFinalSave} className="w-full py-2 px-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Final Save</button>
                </div>
              )}
              {upcomingReminders.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3"><Calendar className="h-4 w-4 text-indigo-600" /> Upcoming Activities</h3>
                  <div className="space-y-2">
                    {upcomingReminders.slice(0, 5).map((r) => (
                      <ReminderCard key={r.id} reminder={r} onComplete={(rem) => completeReminder({ leadId, reminderId: rem.id })} onDelete={(rem) => deleteReminder({ leadId, reminderId: rem.id })} showCountdown />
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-600" /> 
                    Customer Timeline Overview
                  </h3>
                </div>
                <div className="p-3 max-h-[500px] overflow-y-auto">
                  <ActivityTimelineSimple 
                    leadId={leadId} 
                    onViewActivity={handleViewActivity}
                    onDeleteActivity={handleDeleteActivity}
                    onEditEnquiry={handleEditEnquiry}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === TAB.QUOTATIONS && (
            <>
              <CustomerInfoBlock />
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
                {quotations.filter(q => (q.customerId || q.customer_id) === customer.id || !(q.customerId || q.customer_id)).map((quotation, index) => {
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
                                  {(pi.status === 'pending_approval' || pi.status === 'pending') && piHook?.handleApprovePI && (
                                    <>
                                      <button
                                        onClick={() => {
                                          if (piHook.handleApprovePI && pi.id) {
                                            piHook.handleApprovePI(pi.id)
                                          }
                                        }}
                                        className="p-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-lg shadow-sm transition-all duration-200"
                                        title="Approve PI"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (piHook.handleRejectPI && pi.id) {
                                            piHook.handleRejectPI(pi.id)
                                          }
                                        }}
                                        className="p-1 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 rounded-lg shadow-sm transition-all duration-200"
                                        title="Reject PI"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </>
                                  )}
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
          </>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-3 sm:px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold transition-colors">
            Close
          </button>
          <button onClick={() => { onEdit(); onClose(); }} className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-colors">
            Edit Customer
          </button>
        </div>
      </div>

      {viewingEmail && (
        <div className="fixed inset-0 bg-black/50 z-[160] flex items-center justify-center p-4" onClick={() => setViewingEmail(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Send className="h-4 w-4 text-indigo-600" /> Email</h3>
              <button type="button" onClick={() => setViewingEmail(null)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-sm space-y-3">
              {(() => {
                let payload = viewingEmail.payload
                if (typeof payload === 'string') {
                  try { payload = JSON.parse(payload || '{}'); } catch (_) { payload = {}; }
                }
                payload = payload || {}
                const to = Array.isArray(payload.to) ? payload.to.join(', ') : (payload.to || '—')
                const subject = payload.subject || '—'
                const text = payload.text || payload.body || payload.html || ''
                return (
                  <>
                    <div><span className="font-semibold text-slate-500">From:</span> <span className="text-slate-800">{viewingEmail.sentBy || viewingEmail.sent_by || '—'}</span></div>
                    <div><span className="font-semibold text-slate-500">To:</span> <span className="text-slate-800">{to}</span></div>
                    <div><span className="font-semibold text-slate-500">Subject:</span> <span className="text-slate-800">{subject}</span></div>
                    {text && <div className="pt-2 border-t border-slate-100"><span className="font-semibold text-slate-500 block mb-1">Body:</span><div className="text-slate-700 whitespace-pre-wrap break-words">{typeof text === 'string' && text.includes('<') ? <span dangerouslySetInnerHTML={{ __html: text }} /> : text}</div></div>}
                  </>
                )
              })()}
            </div>
            <div className="p-3 border-t border-slate-200 flex justify-end">
              <button type="button" onClick={() => setViewingEmail(null)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
