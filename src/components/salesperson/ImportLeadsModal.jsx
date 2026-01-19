import React from 'react'
import { X, Upload, Download, Info, RefreshCw, FileText, CheckCircle2, AlertCircle, FileCheck, Users, AlertTriangle } from 'lucide-react'
import { apiClient, API_ENDPOINTS } from '../../utils/globalImports'
import Toast from '../../utils/Toast'

export default function ImportLeadsModal({ show, onClose, onImportSuccess }) {
  const [importFile, setImportFile] = React.useState(null)
  const [importing, setImporting] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [showInfoTooltip, setShowInfoTooltip] = React.useState(false)
  const [importPreview, setImportPreview] = React.useState([])
  const [showPreviewModal, setShowPreviewModal] = React.useState(false)
  const [duplicateMap, setDuplicateMap] = React.useState(new Map())
  const [checkingDuplicates, setCheckingDuplicates] = React.useState(false)
  const [existingPhones, setExistingPhones] = React.useState(new Set())
  const fileInputRef = React.useRef(null)

  // Normalize phone number (extract last 10 digits)
  const normalizePhone = (phone) => {
    if (!phone) return null
    const digits = String(phone).replace(/\D/g, '')
    return digits.length >= 10 ? digits.slice(-10) : null
  }

  // Check for duplicates when preview modal opens
  React.useEffect(() => {
    if (!showPreviewModal || importPreview.length === 0) {
      setDuplicateMap(new Map())
      setExistingPhones(new Set())
      return
    }

    const checkDuplicates = async () => {
      setCheckingDuplicates(true)
      try {
        // Load existing phone numbers from salesperson's assigned leads
        const existingPhonesSet = new Set()
        
        try {
          const response = await apiClient.get(API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME())
          
          console.log('[Salesperson Duplicate Check] Response:', {
            hasData: !!response?.data,
            dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
            dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A'
          })
          
          // Handle different response structures
          let leadsData = null
          if (Array.isArray(response?.data)) {
            leadsData = response.data
          } else if (response?.data?.data && Array.isArray(response.data.data)) {
            leadsData = response.data.data
          } else if (response?.data?.leads && Array.isArray(response.data.leads)) {
            leadsData = response.data.leads
          }
          
          if (leadsData && Array.isArray(leadsData)) {
            leadsData.forEach(lead => {
              const phone = lead.phone || lead.mobileNumber || lead.mobile || ''
              if (phone) {
                const normalized = normalizePhone(phone)
                if (normalized) {
                  existingPhonesSet.add(normalized)
                }
              }
            })
            console.log(`[Salesperson Duplicate Check] Loaded ${existingPhonesSet.size} existing phone numbers`)
          }
        } catch (error) {
          console.error('[Salesperson Duplicate Check] Error loading existing phones:', error)
        }

        setExistingPhones(existingPhonesSet)

        // Check for duplicates in import preview
        const duplicateMapNew = new Map()
        const seenInPreview = new Map()

        importPreview.forEach((row, index) => {
          const phone = row['Mobile Number'] || row['mobile number'] || row.Phone || row.phone || ''
          const normalizedPhone = normalizePhone(phone)
          
          if (normalizedPhone) {
            // Check if duplicate within preview
            if (seenInPreview.has(normalizedPhone)) {
              const firstIndex = seenInPreview.get(normalizedPhone)
              duplicateMapNew.set(index, { type: 'preview', phone: normalizedPhone, firstIndex })
              // Also mark the first occurrence
              if (!duplicateMapNew.has(firstIndex)) {
                duplicateMapNew.set(firstIndex, { type: 'preview', phone: normalizedPhone, firstIndex: firstIndex })
              }
            } else {
              seenInPreview.set(normalizedPhone, index)
              // Check if exists in database
              if (existingPhonesSet.has(normalizedPhone)) {
                duplicateMapNew.set(index, { type: 'existing', phone: normalizedPhone })
              }
            }
          }
        })

        console.log(`[Salesperson Duplicate Check] Found ${duplicateMapNew.size} duplicates`)
        setDuplicateMap(duplicateMapNew)
      } catch (error) {
        console.error('[Salesperson Duplicate Check] Fatal error:', error)
        
        // Fallback: At least check for duplicates within preview file
        const duplicateMapNew = new Map()
        const seenInPreview = new Map()
        
        importPreview.forEach((row, index) => {
          const phone = row['Mobile Number'] || row['mobile number'] || row.Phone || row.phone || ''
          const normalizedPhone = normalizePhone(phone)
          
          if (normalizedPhone) {
            if (seenInPreview.has(normalizedPhone)) {
              const firstIndex = seenInPreview.get(normalizedPhone)
              duplicateMapNew.set(index, { type: 'preview', phone: normalizedPhone, firstIndex })
              if (!duplicateMapNew.has(firstIndex)) {
                duplicateMapNew.set(firstIndex, { type: 'preview', phone: normalizedPhone, firstIndex: firstIndex })
              }
            } else {
              seenInPreview.set(normalizedPhone, index)
            }
          }
        })
        
        setDuplicateMap(duplicateMapNew)
      } finally {
        setCheckingDuplicates(false)
      }
    }

    checkDuplicates()
  }, [showPreviewModal, importPreview])

  const parseCSVLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) {
      console.warn('CSV file is empty')
      return []
    }
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim())
    console.log('CSV Headers:', headers)
    
    // Check if Division header exists
    const hasDivisionHeader = headers.some(h => h.toLowerCase() === 'division')
    if (process.env.NODE_ENV === 'development') {
      console.log('[CSV Parse] Division header check:', {
        hasDivisionHeader,
        headers,
        divisionIndex: headers.findIndex(h => h.toLowerCase() === 'division')
      })
    }
    
    const data = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCSVLine(lines[i])
        const row = {}
        headers.forEach((header, idx) => {
          row[header] = values[idx] ? values[idx].replace(/"/g, '').trim() : ''
        })
        
        // Debug division for first row
        if (i === 1 && process.env.NODE_ENV === 'development') {
          console.log('[CSV Parse] First row division debug:', {
            rowKeys: Object.keys(row),
            divisionValue: row['Division'] || row['division'],
            allRowValues: row
          })
        }
        
        // Accept row if it has at least one non-empty field
        const hasData = Object.values(row).some(val => val && val.trim().length > 0)
        if (hasData) {
          data.push(row)
          console.log(`Row ${i} parsed:`, row)
        } else {
          console.warn(`Row ${i} skipped - no data`)
        }
      }
    }
    
    console.log(`Total rows parsed: ${data.length}`)
    return data
  }

  const handleFileSelect = (file) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setImportFile(file)
      // Parse CSV and show preview
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const csvText = e.target.result
          const parsedData = parseCSV(csvText)
          if (parsedData.length === 0) {
            Toast.error('No data found in CSV file')
            setImportFile(null)
            return
          }
          setImportPreview(parsedData)
          setShowPreviewModal(true)
        } catch (error) {
          console.error('Error parsing CSV:', error)
          Toast.error('Failed to parse CSV file')
          setImportFile(null)
        }
      }
      reader.readAsText(file)
    } else {
      Toast.error('Please select a valid CSV file')
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDownloadTemplate = () => {
    const headers = [
      'Customer Name',
      'Mobile Number', 
      'WhatsApp Number',
      'Email',
      'Address',
      'GST Number',
      'Business Name',
      'Business Category',
      'Lead Source',
      'Product Names (comma separated)',
      'Assigned Salesperson',
      'Assigned Telecaller',
      'State',
      'Division',
      'Date (DD/MM/YYYY or YYYY-MM-DD)'
    ]
    
    // Demo data as provided by user for Marketing Department Head
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      '"saurabh jhariya","9876549874","9876547564","jhariya@gmail.com","right town jabalpur","23FDGT546GF54","samriddhi","business","social media","acsr","NA","NA","MP","jabalpur","06/12/2025"'
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'leads_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    Toast.success('Template downloaded')
  }

  const handleImportLeads = async () => {
    if (importPreview.length === 0) {
      Toast.warning('No data to import')
      return
    }
    setImporting(true)
    setShowPreviewModal(false)
    try {
      const leadsPayload = importPreview.map((row, index) => {
            // Handle assigned_salesperson - if NA or empty, set to null so backend auto-assigns
            const assignedSalespersonRaw = row['Assigned Salesperson'] || row['assigned salesperson'] || row.assignedSalesperson || ''
            const assignedSalesperson = (assignedSalespersonRaw === 'NA' || assignedSalespersonRaw === 'N/A' || !assignedSalespersonRaw.trim()) ? null : assignedSalespersonRaw.trim()
            
            // Handle assigned_telecaller - if NA or empty, set to null
            const assignedTelecallerRaw = row['Assigned Telecaller'] || row['assigned telecaller'] || row.assignedTelecaller || ''
            const assignedTelecaller = (assignedTelecallerRaw === 'NA' || assignedTelecallerRaw === 'N/A' || !assignedTelecallerRaw.trim()) ? null : assignedTelecallerRaw.trim()
            
            // Clean phone number - remove non-digits and take last 10 digits (matches backend DataValidator.cleanPhone)
            const phoneRaw = row['Mobile Number'] || row['mobile number'] || row.Phone || row.phone || ''
            const phoneCleaned = phoneRaw.replace(/\D/g, '')
            // Backend DataValidator.cleanPhone takes last 10 digits if >= 10, otherwise returns the cleaned string
            const phone = phoneCleaned.length >= 10 ? phoneCleaned.slice(-10) : (phoneCleaned.length > 0 ? phoneCleaned : null)
            
            // Clean WhatsApp number
            const whatsappRaw = row['WhatsApp Number'] || row['whatsapp number'] || row.WhatsApp || row.whatsapp || phoneRaw
            const whatsappCleaned = whatsappRaw.replace(/\D/g, '')
            const whatsapp = whatsappCleaned.length >= 10 ? whatsappCleaned.slice(-10) : (phoneCleaned.length >= 10 ? phoneCleaned.slice(-10) : null)
            
            // Parse date - handle DD/MM/YYYY format
            const dateRaw = row['Date (DD/MM/YYYY or YYYY-MM-DD)'] || row['date (dd/mm/yyyy or yyyy-mm-dd)'] || row.Date || row.date || ''
            let date = new Date().toISOString().split('T')[0]
            if (dateRaw && dateRaw.trim() && dateRaw !== 'NA' && dateRaw !== 'N/A') {
              // Try DD/MM/YYYY format
              const ddmmyyyyMatch = dateRaw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
              if (ddmmyyyyMatch) {
                const [, day, month, year] = ddmmyyyyMatch
                date = `${year}-${month}-${day}`
              } else if (dateRaw.includes('-')) {
                // Already in YYYY-MM-DD format
                date = dateRaw.trim()
              }
            }
            
            // Extract division with multiple fallback options - preserve actual values
            const divisionRaw = row['Division'] || row['division'] || row.Division || row.division || ''
            let division = null
            if (divisionRaw) {
              const trimmed = String(divisionRaw).trim()
              // Only set to null if truly empty, preserve actual values like "jabalpur"
              if (trimmed && trimmed.toLowerCase() !== 'n/a' && trimmed !== '') {
                division = trimmed
              }
            }
            
            // Debug division extraction
            if (process.env.NODE_ENV === 'development' && index === 0) {
              console.log('[Import] Division extraction for first row:', {
                raw: divisionRaw,
                processed: division,
                rowDivision: row['Division'] || row['division'],
                allRowKeys: Object.keys(row)
              })
            }
            
            const lead = {
              name: (row['Customer Name'] || row['customer name'] || row.name || '').trim(),
              phone: phone && phone.length > 0 ? phone : null,
              whatsapp: whatsapp && whatsapp.length > 0 ? whatsapp : null,
              email: (row.Email || row.email || '').trim() || null,
              address: (row.Address || row.address || '').trim() || null,
              state: (row.State || row.state || '').trim() || null,
              division: division && division.length > 0 ? division : null,
              gst_no: (row['GST Number'] || row['gst number'] || row['GST No'] || row.gst_no || '').trim() || null,
              business: (row['Business Name'] || row['business name'] || row.business || '').trim() || null,
              category: (row['Business Category'] || row['business category'] || row.category || '').trim() || null,
              product_type: (row['Product Names (comma separated)'] || row['product names (comma separated)'] || row['Product Name'] || row.product_type || '').trim() || null,
              lead_source: (row['Lead Source'] || row['lead source'] || row.lead_source || '').trim() || null,
              assignedSalesperson: assignedSalesperson,
              assignedTelecaller: assignedTelecaller,
              date: date || null
            }
            
            // Debug division specifically
            if (process.env.NODE_ENV === 'development') {
              console.log(`Row ${index + 1} division debug:`, {
                raw: divisionRaw,
                processed: division,
                rowKeys: Object.keys(row),
                divisionInRow: row['Division'] || row['division'],
                finalLeadDivision: lead.division
              })
            }
            console.log(`Row ${index + 1} mapped:`, lead)
            return lead
          }).filter((lead, index) => {
            // Filter: must have at least name or phone (phone can be any length, backend will validate)
            const hasName = lead.name && lead.name.trim().length > 0
            const hasPhone = lead.phone && lead.phone.length > 0
            const isValid = hasName || hasPhone
            
            if (!isValid) {
              console.warn(`Row ${index + 1} filtered out - no name or phone:`, lead)
            } else {
              console.log(`Row ${index + 1} is valid:`, { name: lead.name, phone: lead.phone })
            }
            
            return isValid
          })
          
          // Validate payload before sending
          if (leadsPayload.length === 0) {
            Toast.error('No valid leads found in CSV. Please ensure you have Customer Name or Mobile Number in your data.')
            setImporting(false)
            return
          }
          
          console.log('Final leads payload to send:', leadsPayload.length, 'leads')
          console.log('Sample lead:', leadsPayload[0])
          
          try {
            const response = await apiClient.post(API_ENDPOINTS.SALESPERSON_IMPORT_LEADS(), { leads: leadsPayload })
            console.log('Import API response:', response)
            
            if (response?.success) {
              const importedCount = response.created || response.data?.importedCount || response.data?.created || 0
              const duplicatesCount = response.duplicatesCount || response.data?.duplicatesCount || 0
              const skippedCount = response.skippedCount || response.data?.skippedCount || 0
              const skippedRows = response.skippedRows || response.data?.skippedRows || []
              
              // Show detailed information about skipped rows
              if (skippedRows.length > 0) {
                console.log('Skipped rows details:', skippedRows)
                const skippedReasons = skippedRows.map(s => `Row ${s.row}: ${s.reason}`).join('\n')
                console.log('Skipped reasons:', skippedReasons)
              }
              
              let message = `Successfully imported ${importedCount} lead(s)`
              if (duplicatesCount > 0) {
                message += `, ${duplicatesCount} duplicate(s) skipped`
              }
              if (skippedCount > 0) {
                message += `, ${skippedCount} row(s) skipped`
              }
              
              if (importedCount === 0 && leadsPayload.length > 0) {
                // Show detailed error message with skipped reasons
                let errorMessage = `No leads were imported. `
                
                if (skippedRows.length > 0) {
                  // Show specific reasons from skippedRows
                  const duplicateReasons = skippedRows.filter(s => s.reason && s.reason.includes('Duplicate'))
                  const otherReasons = skippedRows.filter(s => !s.reason || !s.reason.includes('Duplicate'))
                  
                  if (duplicateReasons.length > 0) {
                    const duplicatePhones = duplicateReasons.map(s => {
                      const phoneMatch = s.reason.match(/Duplicate phone number: (\d+)/)
                      return phoneMatch ? phoneMatch[1] : 'phone'
                    }).join(', ')
                    errorMessage += `Phone number(s) already exist: ${duplicatePhones}. `
                  }
                  
                  if (otherReasons.length > 0) {
                    const reasons = otherReasons.map(s => s.reason).join(', ')
                    errorMessage += `Other issues: ${reasons}. `
                  }
                  
                  errorMessage += `Please use different phone numbers or check existing leads.`
                } else if (duplicatesCount > 0) {
                  errorMessage += `${duplicatesCount} duplicate(s) found. Please use different phone numbers.`
                } else {
                  errorMessage += `Please check your data.`
                }
                
                Toast.warning(errorMessage, { duration: 5000 })
              } else if (importedCount > 0) {
                Toast.success(message)
                // Show warning if some were skipped
                if (duplicatesCount > 0 || skippedCount > 0) {
                  const skippedDetails = skippedRows.length > 0 
                    ? skippedRows.map(s => `Row ${s.row}: ${s.reason}`).join('; ')
                    : `${duplicatesCount} duplicate(s) and ${skippedCount} other row(s) skipped`
                  console.warn('Skipped rows:', skippedDetails)
                }
              } else {
                Toast.success(message)
              }
              
              // Wait a bit for backend to process and sync data
              await new Promise(resolve => setTimeout(resolve, 2000))
              
              // Call onImportSuccess to trigger refresh
              if (onImportSuccess) {
                onImportSuccess()
              }
              
              onClose()
              setImportFile(null)
              setImportPreview([])
              if (fileInputRef.current) fileInputRef.current.value = ''
            } else {
              const errorMsg = response?.message || response?.error || 'Failed to import leads'
              console.error('Import failed:', errorMsg, response)
              Toast.error(`Failed to import leads: ${errorMsg}`)
            }
          } catch (apiError) {
            console.error('API Error:', apiError)
            const errorMessage = apiError?.response?.data?.message || apiError?.message || 'Failed to import leads'
            Toast.error(`Import error: ${errorMessage}`)
          }
    } catch (error) {
      console.error('Import error:', error)
      Toast.error('Failed to import leads')
      setImporting(false)
    }
  }

  if (!show) return null

  return (
    <>
      {/* Preview Modal */}
      {showPreviewModal && (() => {
        const validRecords = importPreview.length
        const hasData = validRecords > 0
        const duplicateCount = duplicateMap.size
        const newRecordsCount = validRecords - duplicateCount

        return (
          <div className="fixed inset-0 z-[60] overflow-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl mx-auto max-h-[95vh] overflow-hidden flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Import Leads Preview</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Review and confirm the data before importing</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowPreviewModal(false)
                    setImportPreview([])
                    setImportFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }} 
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  disabled={importing}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Summary Cards */}
              <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Records</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">{validRecords}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">New Records</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900">{newRecordsCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`bg-white rounded-lg p-3 sm:p-4 border shadow-sm ${duplicateCount > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${duplicateCount > 0 ? 'bg-amber-100' : 'bg-purple-100'}`}>
                        {duplicateCount > 0 ? (
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                        ) : (
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Duplicates</p>
                        <p className={`text-lg sm:text-xl font-bold ${duplicateCount > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                          {checkingDuplicates ? '...' : duplicateCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
                {!hasData ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
                    <p className="text-sm text-gray-600 max-w-md">
                      The CSV file doesn't contain any valid records. Please check your file and try again.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-gray-700">
                            Showing all {validRecords} record{validRecords !== 1 ? 's' : ''} to be imported
                          </p>
                          {checkingDuplicates && (
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Checking duplicates...</span>
                            </div>
                          )}
                          {!checkingDuplicates && duplicateCount > 0 && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} found</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Scroll to view all columns →
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                      <table className="w-full text-xs sm:text-sm border-collapse bg-white">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider">#</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[80px]">Status</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[120px]">Customer Name</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">Mobile</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">WhatsApp</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[140px]">Email</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[120px]">Business</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[150px]">Address</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[80px]">State</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">Division</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">GST No</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">Category</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[150px]">Product</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[100px]">Lead Source</th>
                            <th className="px-3 py-3 text-left border-b border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider min-w-[120px]">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importPreview.map((row, index) => {
                            const duplicateInfo = duplicateMap.get(index)
                            const isDuplicate = !!duplicateInfo
                            const isPreviewDuplicate = duplicateInfo?.type === 'preview'
                            
                            return (
                              <tr 
                                key={index} 
                                className={`transition-colors duration-150 border-b ${
                                  isDuplicate 
                                    ? 'bg-amber-50/50 hover:bg-amber-100/50 border-amber-200' 
                                    : 'hover:bg-blue-50/50 border-gray-100'
                                }`}
                              >
                                <td className="px-3 py-3 text-gray-500 font-medium">{index + 1}</td>
                                <td className="px-3 py-3">
                                  {checkingDuplicates ? (
                                    <div className="flex items-center gap-1">
                                      <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                                      <span className="text-xs text-gray-500">Checking...</span>
                                    </div>
                                  ) : isDuplicate ? (
                                    <div className="flex flex-col gap-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        isPreviewDuplicate 
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {isPreviewDuplicate ? 'Duplicate in File' : 'Already Exists'}
                                      </span>
                                      {duplicateInfo?.phone && (
                                        <span className="text-xs text-gray-500 font-mono">{duplicateInfo.phone}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      New
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-3 font-semibold text-gray-900">{row['Customer Name'] || row['customer name'] || row.name || <span className="text-gray-400 italic">-</span>}</td>
                                <td className="px-3 py-3 text-gray-700 font-mono text-xs">
                                  {(() => {
                                    const phone = row['Mobile Number'] || row['mobile number'] || row.Phone || row.phone || ''
                                    const normalized = normalizePhone(phone)
                                    return normalized || phone || <span className="text-gray-400 italic">-</span>
                                  })()}
                                </td>
                                <td className="px-3 py-3 text-gray-700 font-mono text-xs">{row['WhatsApp Number'] || row['whatsapp number'] || row.WhatsApp || row.whatsapp || <span className="text-gray-400 italic">-</span>}</td>
                                <td className="px-3 py-3 text-gray-700">{row.Email || row.email || <span className="text-gray-400 italic">-</span>}</td>
                                <td className="px-3 py-3 text-gray-700">{row['Business Name'] || row['business name'] || row.business || <span className="text-gray-400 italic">-</span>}</td>
                                <td className="px-3 py-3 text-gray-700 max-w-[200px] truncate" title={row.Address || row.address || ''}>
                                  {row.Address || row.address || <span className="text-gray-400 italic">-</span>}
                                </td>
                                <td className="px-3 py-3">
                                  {row.State || row.state ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {row.State || row.state}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {row.Division || row.division ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      {row.Division || row.division}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-gray-700 font-mono text-xs">{row['GST Number'] || row['gst number'] || row['GST No'] || row.gst_no || <span className="text-gray-400 italic">-</span>}</td>
                                <td className="px-3 py-3">
                                  {row['Business Category'] || row['business category'] || row.category ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      {row['Business Category'] || row['business category'] || row.category}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-gray-700 max-w-[200px] truncate" title={row['Product Names (comma separated)'] || row['product names (comma separated)'] || row['Product Name'] || row.product_type || ''}>
                                  {row['Product Names (comma separated)'] || row['product names (comma separated)'] || row['Product Name'] || row.product_type || <span className="text-gray-400 italic">-</span>}
                                </td>
                                <td className="px-3 py-3 text-gray-700">{row['Lead Source'] || row['lead source'] || row.lead_source || <span className="text-gray-400 italic">-</span>}</td>
                                <td className="px-3 py-3 text-gray-700 font-mono text-xs">{row['Date (DD/MM/YYYY or YYYY-MM-DD)'] || row['date (dd/mm/yyyy or yyyy-mm-dd)'] || row['Date (YYYY-MM-DD)'] || row.Date || row.date || <span className="text-gray-400 italic">-</span>}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>Please review all data before confirming the import</span>
                  </div>
                  {duplicateCount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Note: {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} will be skipped during import</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setShowPreviewModal(false)
                      setImportPreview([])
                      setImportFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }} 
                    disabled={importing}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleImportLeads} 
                    disabled={importing || !hasData}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {importing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Import {validRecords} Lead{validRecords !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Main Upload Modal */}
      <div className="fixed inset-0 z-50 overflow-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-lg">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Import Leads</h2>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-500 hover:text-gray-700" disabled={importing}>
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <button 
                onClick={handleDownloadTemplate} 
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 shadow-md disabled:opacity-50" 
                disabled={importing}
              >
                <Download className="h-4 w-4" /> Download Template
              </button>
            </div>
            <div className="relative">
              <Info 
                className="h-5 w-5 text-blue-500 cursor-help hover:text-blue-600 transition-colors" 
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
              />
              {showInfoTooltip && (
                <div className="absolute right-0 top-8 z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                  Upload a CSV file with lead data. Make sure the format matches the template.
                </div>
              )}
            </div>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100' 
                : importFile 
                  ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' 
                  : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-400 hover:from-blue-50 hover:to-purple-50'
            }`}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="csv-upload" 
              disabled={importing} 
            />
            <label htmlFor="csv-upload" className="cursor-pointer block" style={{ pointerEvents: importing ? 'none' : 'auto' }}>
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isDragging 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 scale-110' 
                    : importFile 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
                } shadow-xl`}>
                  <Upload className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                {importFile ? (
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 break-words px-2">{importFile.name}</p>
                    <p className="text-xs text-gray-500">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Click to upload CSV file</p>
                    <p className="text-xs text-gray-500">or drag and drop</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
        <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button onClick={onClose} disabled={importing || showPreviewModal} className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          {importFile && !showPreviewModal && (
            <div className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">
              File selected. Preview will open automatically.
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
