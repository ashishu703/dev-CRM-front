"use client"

import { useEffect, useMemo, useState } from "react"
import { X, User, Phone, MessageCircle, Mail, Building2, FileText, MapPin, Globe, Package, UserPlus } from "lucide-react"
import departmentUserService from "../../api/admin_api/departmentUserService"
import apiClient from "../../utils/apiClient"
import { API_ENDPOINTS } from "../../api/admin_api/api"
import { findIndiaStateByName, getIndiaDivisionsForStateIso, getIndiaStates } from "../../utils/indiaLocation"

function Card({ className, children }) {
  return <div className={`rounded-xl border bg-white shadow-xl ${className || ''}`}>{children}</div>
}

function CardContent({ className, children }) {
  return <div className={`p-0 ${className || ''}`}>{children}</div>
}

function CardHeader({ className, children }) {
  return <div className={`p-6 ${className || ''}`}>{children}</div>
}

function CardTitle({ className, children }) {
  return <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>
}

export default function AddCustomerForm({ onClose, onSave, editingCustomer }) {
  const [salespersons, setSalespersons] = useState([])
  const [loadingSalespersons, setLoadingSalespersons] = useState(false)
  
  const [formData, setFormData] = useState({
    customerName: editingCustomer?.name || "",
    mobileNumber: editingCustomer?.phone || "",
    whatsappNumber: editingCustomer?.whatsapp?.replace('+91', '') || "",
    email: editingCustomer?.email === "N/A" ? "" : editingCustomer?.email || "",
    business: editingCustomer?.business || "",
    productName: editingCustomer?.productName || "",
    gstNumber: editingCustomer?.gstNo === "N/A" ? "" : editingCustomer?.gstNo || "",
    address: editingCustomer?.address || "",
    state: editingCustomer?.state === "N/A" ? "" : (editingCustomer?.state || ""),
    customerType: editingCustomer?.customerType || "",
    leadSource: editingCustomer?.enquiryBy || "",
    salesStatus: editingCustomer?.salesStatus || '',
    salesStatusRemark: editingCustomer?.salesStatusRemark || '',
    followUpStatus: editingCustomer?.followUpStatus || '',
    followUpRemark: editingCustomer?.followUpRemark || '',
    followUpDate: editingCustomer?.followUpDate || '',
    followUpTime: editingCustomer?.followUpTime || '',
    callDurationSeconds: editingCustomer?.callDurationSeconds || '',
    callRecordingFile: null,
    transferredTo: editingCustomer?.transferredTo || '',
    date: new Date().toISOString().split('T')[0],
    division: editingCustomer?.division === "N/A" ? "" : (editingCustomer?.division || ''),
  })

  const indiaStates = useMemo(() => getIndiaStates(), [])
  const [selectedStateIso, setSelectedStateIso] = useState(() => {
    const found = findIndiaStateByName(editingCustomer?.state === 'N/A' ? '' : editingCustomer?.state)
    return found?.isoCode || ''
  })

  useEffect(() => {
    const found = findIndiaStateByName(editingCustomer?.state === 'N/A' ? '' : editingCustomer?.state)
    setSelectedStateIso(found?.isoCode || '')
  }, [editingCustomer?.state])

  const divisionOptions = useMemo(() => {
    return getIndiaDivisionsForStateIso(selectedStateIso)
  }, [selectedStateIso])

  // Fetch salespersons when form opens
  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        setLoadingSalespersons(true)
        
        let headUserId = null
        let currentUsername = ''
        let currentEmail = ''

        // First, try to fetch profile from backend (contains head_user_id)
        try {
          const profileRes = await apiClient.get(API_ENDPOINTS.PROFILE)
          const profileUser = profileRes?.data?.user || profileRes?.user
          if (profileUser) {
            headUserId = profileUser.headUserId || profileUser.head_user_id || headUserId
            currentUsername = (profileUser.username || profileUser.name || '').toLowerCase()
            currentEmail = (profileUser.email || '').toLowerCase()
          }
        } catch (profileErr) {
        }

        // Fallback: read from localStorage
        if (!headUserId || !currentUsername || !currentEmail) {
          try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            headUserId = headUserId || userData.headUserId || userData.head_user_id
            currentUsername = currentUsername || (userData.username || userData.name || '').toLowerCase()
            currentEmail = currentEmail || (userData.email || '').toLowerCase()
          } catch (e) {
          }
        }
        
        // If still missing headUserId, attempt to fetch the current user record
        if (!headUserId) {
          try {
            const currentUserRes = await departmentUserService.listUsers({ page: 1, limit: 1 })
            const currentUserPayload = currentUserRes?.data || currentUserRes
            const currentUser = (currentUserPayload.users || [])[0]
            if (currentUser) {
              headUserId = currentUser.head_user_id || currentUser.headUserId || headUserId
              currentUsername = currentUsername || (currentUser.username || currentUser.name || '').toLowerCase()
              currentEmail = currentEmail || (currentUser.email || '').toLowerCase()
            }
          } catch (err) {
          }
        }
        
        let users = []
        
        // If we have headUserId, use getByHeadId to get all users under that head
        if (headUserId) {
          try {
            const res = await departmentUserService.getByHeadId(headUserId)
            
            // Handle different response structures for getByHeadId
            if (res?.data?.users && Array.isArray(res.data.users)) {
              users = res.data.users
            } else if (Array.isArray(res?.data)) {
              users = res.data
            } else if (Array.isArray(res)) {
              users = res
            } else if (res?.success && res.data?.users && Array.isArray(res.data.users)) {
              users = res.data.users
            } else if (res?.success && Array.isArray(res.data)) {
              users = res.data
            } else if (res?.users && Array.isArray(res.users)) {
              users = res.users
            }
            
            // fetched users by head ID
          } catch (headErr) {
            try {
              const res = await departmentUserService.listUsers({ page: 1, limit: 1000 })
              const payload = res?.data || res
              users = payload.users || []
            } catch (listErr) {
            }
          }
        } else {
          try {
            const res = await departmentUserService.listUsers({ page: 1, limit: 1000 })
            const payload = res?.data || res
            users = payload.users || []
          } catch (listErr) {
          }
        }
        
        const mappedUsers = users
          .filter(u => u && (u.username || u.email))
          .map(u => ({
            id: u.id,
            username: u.username || u.name || u.email?.split('@')[0] || 'Unknown',
            email: u.email || ''
          }))
          .filter((u, index, self) => 
            index === self.findIndex((user) => user.username === u.username)
          )

        const filteredUsers = mappedUsers.filter(u => {
          const uname = (u.username || '').toLowerCase()
          const uemail = (u.email || '').toLowerCase()
          return (
            (currentUsername && uname ? uname !== currentUsername : true) &&
            (currentEmail && uemail ? uemail !== currentEmail : true)
          )
        })
        
        setSalespersons(filteredUsers)
      } catch (error) {
      } finally {
        setLoadingSalespersons(false)
      }
    }
    fetchSalespersons()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStateSelect = (isoCode) => {
    const st = indiaStates.find((s) => s.isoCode === isoCode)
    setSelectedStateIso(isoCode || '')
    setFormData((prev) => ({
      ...prev,
      state: st?.name || '',
      division: ''
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.mobileNumber || !formData.mobileNumber.trim()) {
      alert('Please enter mobile number')
      return
    }
    
    if (!onSave) {
      alert('Error: Save handler is not configured. Please contact support.')
      return
    }
    
    onSave(formData)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-0.5">
                {editingCustomer ? 'Update the customer details below' : 'Fill in the customer details below'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter WhatsApp number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange("productName", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name (optional)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter GST number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-red-500" />
                  State
                </label>
                <select
                  value={selectedStateIso}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select state</option>
                  {indiaStates.map((s) => (
                    <option key={`st-${s.isoCode}`} value={s.isoCode}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Division
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => handleInputChange("division", e.target.value)}
                  disabled={!selectedStateIso}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">{selectedStateIso ? 'Select division' : 'Select state first'}</option>
                  {divisionOptions.map((d) => (
                    <option key={`dv-${selectedStateIso}-${d.name}`} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Business
                </label>
                <input
                  type="text"
                  value={formData.business}
                  onChange={(e) => handleInputChange("business", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business name"
                />
              </div>
              
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter complete address"
              />
            </div>


            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500" />
                  Customer Type
                </label>
                <input
                  type="text"
                  value={formData.customerType}
                  onChange={(e) => handleInputChange("customerType", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer type"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-orange-500" />
                  Lead Source
                </label>
                <input
                  type="text"
                  value={formData.leadSource}
                  onChange={(e) => handleInputChange("leadSource", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter lead source"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Date
                </label>
                <input
                  type="date"
                  disabled
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  readOnly={true}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Date is auto-detected</p>
              </div>
            </div>

            {/* Follow Up + Sales Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-600" />
                  Follow Up Status
                </label>
                <select
                  value={formData.followUpStatus}
                  onChange={(e) => handleInputChange('followUpStatus', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Follow Up Status</option>
                  <option value="Appointment Scheduled">Appointment Scheduled</option>
                  <option value="Next Meeting">Next Meeting</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Interested">Interested</option>
                  <option value="Quotation Sent">Quotation Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Close Order">Close Order</option>
                  <option value="Closed/Lost">Closed/Lost</option>
                  <option value="Call Back Request">Call Back Request</option>
                  <option value="Unreachable/Call Not Connected">Unreachable/Call Not Connected</option>
                  <option value="Currently Not Required">Currently Not Required</option>
                  <option value="Not Relevant">Not Relevant</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Sales Status
                </label>
                <select
                  value={formData.salesStatus}
                  onChange={(e) => handleInputChange("salesStatus", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Lead Status</option>
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="converted">Converted</option>
                  <option value="interested">Interested</option>
                  <option value="loose">Loose</option>
                  <option value="win/closed">Win/Closed</option>
                  <option value="lost">Lost</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Sales Status Remark */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sales Status Remark</label>
                <textarea
                  value={formData.salesStatusRemark}
                  onChange={(e) => handleInputChange("salesStatusRemark", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter remark for sales status"
                />
              </div>
            </div>


            {/* Transfer Lead field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" />
                Transfer Lead to
              </label>
              <select
                value={formData.transferredTo}
                onChange={(e) => handleInputChange("transferredTo", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingSalespersons}
              >
                <option value="">Select a salesperson...</option>
                {salespersons.map((salesperson) => (
                  <option key={salesperson.id} value={salesperson.username}>
                    {salesperson.username} {salesperson.email ? `(${salesperson.email})` : ''}
                  </option>
                ))}
              </select>
              {loadingSalespersons && (
                <p className="text-xs text-gray-500">Loading salespersons...</p>
              )}
            </div>

            

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md">
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
