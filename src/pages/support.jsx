import { useState } from "react"
import { Clock, CheckCircle, Circle, Search, X, AlertCircle } from "lucide-react"
import AshvayChat from "../components/AshvayChat"
import apiClient from "../utils/apiClient"
import { API_ENDPOINTS } from "../api/admin_api/api"
import toastManager from "../utils/ToastManager"

const ANOCAB_LOGO = "https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"
const DEPARTMENTS = ["IT Department", "Accounts Department", "Sales", "Marketing Sales", "Production", "Gate Entry", "Transportation Department"]
const PRIORITIES = ["low", "medium", "high", "critical"]
const INITIAL_FORM_DATA = { name: "", email: "", phone: "", department: "", priority: "", subject: "", description: "", screenshot: null }

const STATUS_CONFIG = {
  pending: { bgColor: "bg-orange-500", icon: Clock },
  open: { bgColor: "bg-blue-500", icon: AlertCircle },
  "in progress": { bgColor: "bg-amber-500", icon: Clock },
  inprogress: { bgColor: "bg-amber-500", icon: Clock },
  resolved: { bgColor: "bg-green-500", icon: CheckCircle },
  closed: { bgColor: "bg-gray-500", icon: CheckCircle }
}

export default function SupportPage() {
  const [trackTicketId, setTrackTicketId] = useState("")
  const [trackedTicket, setTrackedTicket] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [ticketNumber, setTicketNumber] = useState("")

  const handleNavigation = (path) => window.location.href = path

  const updateFormData = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))
  
  const handleInputChange = (e) => updateFormData(e.target.name, e.target.value)
  
  const handleSelectChange = (field, value) => updateFormData(field, value)
  
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) updateFormData("screenshot", e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Create FormData for file upload
      const submitFormData = new FormData()
      submitFormData.append('name', formData.name)
      submitFormData.append('email', formData.email)
      submitFormData.append('phone', formData.phone || '')
      submitFormData.append('department', 'IT Department') // Always send to IT Department
      submitFormData.append('priority', formData.priority)
      submitFormData.append('subject', formData.subject)
      submitFormData.append('description', formData.description)
      
      if (formData.screenshot) {
        submitFormData.append('screenshot', formData.screenshot)
      }

      const response = await apiClient.postFormData(API_ENDPOINTS.TICKETS_CREATE(), submitFormData)
      
      if (response.success) {
        const ticketId = response.data.ticketId || response.data.id
        setTicketNumber(ticketId)
        toastManager.success(`Ticket ${ticketId} created successfully! You will receive updates via email.`)
        setFormData(INITIAL_FORM_DATA)
        setTimeout(() => setTicketNumber(""), 5000)
      }
    } catch (error) {
      const errorMessage = error.message || error.data?.message || 'Unable to submit ticket. Please check your connection and try again.'
      toastManager.error(errorMessage)
    }
  }

  const handleTrackTicket = async () => {
    if (!trackTicketId.trim()) {
      toastManager.warning('Please enter a ticket ID to track')
      return
    }
    
    try {
      const ticketId = trackTicketId.trim().toUpperCase()
      const response = await apiClient.get(API_ENDPOINTS.TICKET_BY_ID(ticketId))
      
      if (response.success && response.data) {
        const apiStatus = response.data.status?.toLowerCase() || 'open'
        let statusHistory = []
        
        // Parse status history - handle both array and JSON string
        if (response.data.statusHistory) {
          if (Array.isArray(response.data.statusHistory)) {
            statusHistory = response.data.statusHistory
          } else if (typeof response.data.statusHistory === 'string') {
            try {
              statusHistory = JSON.parse(response.data.statusHistory)
            } catch {
              statusHistory = []
            }
          }
        }
        
        // Map status history with proper message handling (resolution notes)
        const mappedHistory = statusHistory.length > 0
          ? statusHistory.map(h => ({
              status: (h.status || '').toLowerCase(),
              timestamp: h.timestamp || response.data.createdAt,
              message: h.message || h.resolution || 'Status updated',
              imageUrl: h.imageUrl || null,
              imageName: h.imageName || null
            }))
          : [{
              status: apiStatus,
              timestamp: response.data.createdAt || new Date().toISOString(),
              message: 'Ticket created and submitted',
              imageUrl: response.data.fileUrl || response.data.filePath || null,
              imageName: response.data.fileName || null
            }]
        
        setTrackedTicket({
          id: response.data.id,
          subject: response.data.title,
          description: response.data.description,
          department: response.data.department || 'IT Department',
          priority: response.data.priority,
          status: apiStatus,
          date: response.data.createdAt,
          fileUrl: response.data.fileUrl || response.data.filePath,
          fileName: response.data.fileName,
          statusHistory: mappedHistory
        })
        setSidebarOpen(true)
        toastManager.success(`Ticket ${ticketId} found`)
      } else {
        setTrackedTicket(null)
        setSidebarOpen(false)
        toastManager.error(`Ticket ${ticketId} not found. Please check your Ticket ID.`)
      }
    } catch (error) {
      setTrackedTicket(null)
      setSidebarOpen(false)
      toastManager.error(error.message || error.data?.message || 'Unable to fetch ticket. Please check your connection and try again.')
    }
  }

  const getStatusConfig = (status) => {
    const normalized = (status || '').toLowerCase().replace(/\s+/g, ' ')
    return STATUS_CONFIG[normalized] || STATUS_CONFIG[normalized.replace(' ', '')] || { bgColor: "bg-gray-500", icon: Circle }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const renderImage = (imageUrl, imageName) => {
    if (!imageUrl) return null
    
    const isImage = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    
    return (
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-2">
          {imageName ? `Attachment: ${imageName}` : 'Attachment'}
        </p>
        {isImage ? (
          <img
            src={imageUrl}
            alt={imageName || 'Ticket attachment'}
            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(imageUrl, '_blank')}
          />
        ) : (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            View Attachment
          </a>
        )}
      </div>
    )
  }


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between shadow-sm">
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          onClick={() => handleNavigation('/')}
        >
          <img
            src={ANOCAB_LOGO}
            alt="Anocab Logo"
            width={120}
            height={48}
            className="object-contain w-20 sm:w-24 md:w-28 lg:w-[120px] h-auto"
          />
        </div>
        <button 
          className="rounded-full bg-transparent border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
          onClick={() => handleNavigation('/')}
        >
          Back to Home
        </button>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-100 to-cyan-100 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Support & Ticket System</h1>
          <p className="text-sm sm:text-base text-gray-600">Report issues, track tickets, and get help from our support team</p>
        </div>
      </section>

      {/* Ashvay Chat Component */}
      <AshvayChat />

      {/* Main Content */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 relative pb-24 sm:pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Tabs and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 border-b-2 border-purple-200 pb-3 sm:pb-4">
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold border-b-2 text-purple-600 border-purple-600 transition-all self-start sm:self-auto"
            >
              Report Issue
            </button>
            <div className="flex-1 w-full sm:w-auto sm:max-w-md sm:ml-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search Ticket ID (e.g., TIK-122501)"
                  value={trackTicketId}
                  onChange={(e) => setTrackTicketId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackTicket()}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleTrackTicket}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Track</span>
                </button>
              </div>
            </div>
          </div>

          {/* Report Issue Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <div className="p-4 sm:p-6 md:p-8 shadow-xl bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl border-2 border-blue-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Report a New Issue</h2>

                  {ticketNumber && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-semibold text-sm sm:text-base">
                        Ticket created successfully! Your ticket number: <span className="text-base sm:text-lg">{ticketNumber}</span>
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          required
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@company.com"
                          required
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Department and Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Department</label>
                        <select
                          value={formData.department}
                          onChange={(e) => handleSelectChange("department", e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select Department</option>
                          {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => handleSelectChange("priority", e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Priority</option>
                          {PRIORITIES.map(priority => <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of the issue"
                        required
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Detailed Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Please provide detailed information about the issue you're experiencing..."
                        required
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] sm:min-h-[150px]"
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">
                        Attach Screenshot or File
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*,.pdf,.doc,.docx"
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <p className="text-sm sm:text-base text-gray-600">
                            {formData.screenshot ? (
                              <>
                                <span className="text-green-600 font-semibold break-all">{formData.screenshot.name}</span>
                                <br />
                                <span className="text-xs sm:text-sm">(Click to change)</span>
                              </>
                            ) : (
                              <>
                                Drag and drop your files or{" "}
                                <span className="text-blue-600 font-semibold">click to upload</span>
                              </>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF, DOC up to 5MB</p>
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all shadow-lg"
                    >
                      Submit Support Ticket
                    </button>
                  </form>
                </div>
              </div>

              {/* Sidebar Info - Merged */}
              <div className="lg:col-span-1">
                <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-xl sm:rounded-2xl shadow-lg">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Help & Support</h3>
                  
                  {/* Quick Help Section */}
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Tips:</h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                      <li className="flex gap-2">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span>Provide as much detail as possible to help us resolve faster</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span>Screenshots help us understand the issue better</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span>Critical issues get priority response within 1 hour</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span>You'll receive updates via email</span>
                      </li>
                    </ul>
                  </div>

                  {/* Support Hours Section */}
                  <div className="border-t-2 border-blue-200 pt-3 sm:pt-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Support Hours:</h4>
                    <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">AI Support (Ashvay):</span> 24/7
                      </p>
                      <p>
                        <span className="font-semibold">Human Support:</span> Mon-Sat (6 days)
                      </p>
                      <p>
                        <span className="font-semibold">All Departments:</span> Mon-Sat (6 days)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Right Sidebar for Ticket Tracking */}
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full sm:max-w-[538px] bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Ticket Details</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>

              {trackedTicket ? (
                <div className="p-4 sm:p-6">
                  {/* Ticket Info */}
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Ticket ID:</span>
                        <span className="ml-2 text-purple-600 font-bold text-lg">{trackedTicket.id}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Department:</span>
                        <span className="ml-2">{trackedTicket.department}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-gray-700">Subject:</span>
                        <span className="ml-2">{trackedTicket.subject}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Priority:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                          trackedTicket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          trackedTicket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          trackedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {trackedTicket.priority?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Status:</span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800`}>
                          {trackedTicket.status.charAt(0).toUpperCase() + trackedTicket.status.slice(1)}
                        </span>
                      </div>
                      {trackedTicket.description && (
                        <div className="col-span-2 mt-2">
                          <span className="font-semibold text-gray-700">Description:</span>
                          <p className="mt-1 text-gray-600">{trackedTicket.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Status Timeline</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Ticket progress and updates</p>
                    <div className="relative">
                      {(() => {
                        const statusHistory = trackedTicket.statusHistory || []
                        const hasHistory = statusHistory.length > 0
                        const lastResolvedIndex = hasHistory 
                          ? statusHistory.findLastIndex(item => 
                              item.status === 'resolved' || item.status === 'closed'
                            )
                          : -1
                        const shouldStopLine = lastResolvedIndex !== -1
                        
                        return (
                          <>
                            {/* Timeline Line */}
                            {shouldStopLine ? (
                              <div 
                                className="absolute left-5 top-0 w-0.5 bg-gray-200"
                                style={{ height: `${(lastResolvedIndex * 96) + 40}px` }}
                              />
                            ) : !hasHistory && (trackedTicket.status === 'resolved' || trackedTicket.status === 'closed') ? null : (
                              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                            )}
                            
                            {/* Timeline Items */}
                            <div className="space-y-6">
                              {hasHistory ? (
                                statusHistory.map((item, index) => {
                                  const config = getStatusConfig(item.status)
                                  const Icon = config.icon
                                  
                                  return (
                                    <div key={index} className="relative flex items-start gap-4">
                                      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                      </div>
                                      <div className="flex-1 pt-1">
                                        <p className="text-sm text-gray-600 mb-1">{formatDate(item.timestamp)}</p>
                                        <p className="text-gray-900 whitespace-pre-wrap">{item.message || 'Status updated'}</p>
                                        {renderImage(item.imageUrl, item.imageName)}
                                      </div>
                                    </div>
                                  )
                                })
                              ) : (
                                <div className="relative flex items-start gap-4">
                                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${getStatusConfig(trackedTicket.status).bgColor} flex items-center justify-center`}>
                                    {(() => {
                                      const config = getStatusConfig(trackedTicket.status)
                                      const Icon = config.icon
                                      return <Icon className="w-5 h-5 text-white" />
                                    })()}
                                  </div>
                                  <div className="flex-1 pt-1">
                                    <p className="text-sm text-gray-600 mb-1">{formatDate(trackedTicket.date)}</p>
                                    <p className="text-gray-900">Ticket created and submitted</p>
                                    {renderImage(trackedTicket.fileUrl, trackedTicket.fileName)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600 font-semibold text-lg">No ticket data available</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
