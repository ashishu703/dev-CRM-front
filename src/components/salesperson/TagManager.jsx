import React from 'react'
import { X, RefreshCw, Tag } from 'lucide-react'
import { apiClient, API_ENDPOINTS } from '../../utils/globalImports'
import Toast from '../../utils/Toast'

export default function TagManager({ 
  showCreateTagModal, setShowCreateTagModal, newTagName, setNewTagName,
  selectedLeadsForTag, setSelectedLeadsForTag, customers, setCustomers,
  isCreatingTag, setIsCreatingTag, handleToggleLeadForTag, handleSelectAllLeadsForTag
}) {
  const handleCreateTag = async () => {
    const trimmedTag = newTagName.trim().toLowerCase()
    if (!trimmedTag) {
      Toast.warning('Please enter a tag name')
      return
    }
    if (selectedLeadsForTag.length === 0) {
      Toast.warning('Please select at least one lead to assign this tag')
      return
    }
    setIsCreatingTag(true)
    try {
      const updatePromises = selectedLeadsForTag.map(async (leadId) => {
        const lead = customers.find(c => c.id === leadId)
        if (!lead) return null
        const formData = new FormData()
        formData.append('name', lead.name)
        formData.append('phone', lead.phone)
        formData.append('email', lead.email === 'N/A' ? '' : lead.email)
        formData.append('business', lead.business)
        formData.append('address', lead.address)
        formData.append('gst_no', lead.gstNo === 'N/A' ? '' : lead.gstNo)
        formData.append('product_type', lead.productName)
        formData.append('state', lead.state)
        formData.append('lead_source', lead.enquiryBy)
        formData.append('customer_type', trimmedTag)
        formData.append('date', lead.date)
        formData.append('whatsapp', lead.whatsapp ? lead.whatsapp.replace('+91','') : '')
        formData.append('sales_status', lead.salesStatus)
        formData.append('sales_status_remark', lead.salesStatusRemark || '')
        formData.append('follow_up_status', lead.followUpStatus || '')
        formData.append('follow_up_remark', lead.followUpRemark || '')
        formData.append('follow_up_date', lead.followUpDate || '')
        formData.append('follow_up_time', lead.followUpTime || '')
        return apiClient.putFormData(API_ENDPOINTS.SALESPERSON_LEAD_BY_ID(leadId), formData)
      })
      await Promise.all(updatePromises)
      setCustomers(prev => prev.map(customer => selectedLeadsForTag.includes(customer.id) ? { ...customer, customerType: trimmedTag } : customer))
      setNewTagName('')
      setSelectedLeadsForTag([])
      setShowCreateTagModal(false)
      Toast.success(`Tag "${trimmedTag}" created and assigned to ${selectedLeadsForTag.length} lead(s) successfully!`)
    } catch (error) {
      Toast.error('Failed to create tag. Please try again.')
    } finally {
      setIsCreatingTag(false)
    }
  }

  if (!showCreateTagModal) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { if (!isCreatingTag) { setShowCreateTagModal(false); setNewTagName(''); setSelectedLeadsForTag([]) } }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Create New Tag</h3>
            </div>
            <button onClick={() => { setShowCreateTagModal(false); setNewTagName(''); setSelectedLeadsForTag([]) }} className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-500 hover:text-gray-700" disabled={isCreatingTag}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name</label>
            <input 
              type="text" 
              value={newTagName} 
              onChange={(e) => setNewTagName(e.target.value)} 
              placeholder="e.g. Dealer, Contractor, Distributor" 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
              autoFocus 
              disabled={isCreatingTag} 
            />
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Select Leads to Tag ({selectedLeadsForTag.length} selected)</label>
              <button onClick={handleSelectAllLeadsForTag} className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors" disabled={isCreatingTag}>
                {selectedLeadsForTag.length === customers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {customers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No leads available</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {customers.map((customer) => {
                    const hasTag = customer.customerType && customer.customerType !== 'N/A'
                    return (
                      <label key={customer.id} className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors ${isCreatingTag ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input type="checkbox" checked={selectedLeadsForTag.includes(customer.id)} onChange={() => handleToggleLeadForTag(customer.id)} disabled={isCreatingTag} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.phone} {customer.business && customer.business !== 'N/A' ? `• ${customer.business}` : ''}</p>
                            </div>
                            {hasTag && (
                              <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full border border-blue-200 font-medium">
                                {customer.customerType}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-600">{selectedLeadsForTag.length > 0 ? `${selectedLeadsForTag.length} lead(s) will be tagged as "${newTagName || '...'}"` : 'Select leads to tag'}</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowCreateTagModal(false); setNewTagName(''); setSelectedLeadsForTag([]) }} disabled={isCreatingTag} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleCreateTag} disabled={!newTagName.trim() || selectedLeadsForTag.length === 0 || isCreatingTag} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 inline-flex items-center gap-2 transition-all duration-200 shadow-md">
              {isCreatingTag ? <><RefreshCw className="h-4 w-4 animate-spin" /> Creating...</> : 'Create Tag'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
