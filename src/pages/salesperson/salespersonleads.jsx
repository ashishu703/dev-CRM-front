import React from 'react'
import { useSharedData } from './SharedDataContext'
import { useSalespersonLeads } from '../../hooks/useSalespersonLeads'
import { useQuotationFlow } from '../../hooks/useQuotationFlow'
import { usePIFlow } from '../../hooks/usePIFlow'
import CompanyBranchService from '../../services/CompanyBranchService'
import QuotationPreview from '../../components/QuotationPreview'
import PIPreview from '../../components/PIPreview'
import LeadFilters from '../../components/salesperson/LeadFilters'
import EnquiryFilters from '../../components/salesperson/EnquiryFilters'
import TagManager from '../../components/salesperson/TagManager'
import CustomerDetailSidebar from '../../components/salesperson/CustomerDetailSidebar'
import ImportLeadsModal from '../../components/salesperson/ImportLeadsModal'
import ColumnVisibilityModal from '../../components/salesperson/ColumnVisibilityModal'
import InlineStatusDropdown from '../../components/InlineStatusDropdown'
import InlineFollowUpStatusCell from '../../components/InlineFollowUpStatusCell'
import AddCustomerForm from './salespersonaddcustomer.jsx'
import CreateQuotationForm from './salespersoncreatequotation.jsx'
import CreatePIForm from './CreatePIForm.jsx'
import Toast from '../../utils/Toast'
import { QuotationHelper } from '../../utils/QuotationHelper'
import { Search, RefreshCw, Plus, Filter, Eye, Pencil, FileText, Upload, Settings, Tag, X, User, Mail, Building2, Package, Hash, MapPin, Globe, Users, TrendingUp, Calendar, Clock, MoreHorizontal, ShieldCheck, Copy } from 'lucide-react'
import { apiClient, API_ENDPOINTS, quotationService } from '../../utils/globalImports'
import rfpService from '../../services/RfpService'
import productPriceService from '../../services/ProductPriceService'
import { validateRfpForm as validateRfpFormUtil } from '../../utils/rfpValidation'
import { filterProductsNeedingRfp, transformProductsArrayForRfp } from '../../utils/rfpHelpers'
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton'
import { EditLeadStatusModal } from './LeadStatus'
import EnquiryTable from '../../components/EnquiryTable'
import { useAuth } from '../../hooks/useAuth'
import { useClickOutside } from '../../hooks/useClickOutside'
import { getProducts } from '../../constants/products'
import { getDisplayPriority } from '../../utils/leadPriorityUtils'
import { mapApiRowToLead } from '../../utils/leadMapping'

const getUserData = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    return { username: userData.username || userData.name || 'User', email: userData.email || '', name: userData.name || userData.username || 'User' }
  } catch {
    return { username: 'User', email: '', name: 'User' }
  }
}

export default function CustomerListContent({ isDarkMode = false, selectedCustomerId = null }) {
  const { customers, setCustomers, loading } = useSharedData()
  const [initialLoading, setInitialLoading] = React.useState(true)
  const user = getUserData()
  const [activeTab, setActiveTab] = React.useState('leads')
  const { user: authUser } = useAuth()
  const [enquiries, setEnquiries] = React.useState([])
  const [enquiriesGroupedByDate, setEnquiriesGroupedByDate] = React.useState({})
  const [enquiriesLoading, setEnquiriesLoading] = React.useState(false)
  const [enquiryPage, setEnquiryPage] = React.useState(1)
  const [enquiryLimit, setEnquiryLimit] = React.useState(50)
  const [enquiryTotal, setEnquiryTotal] = React.useState(0)
  const [showEnquiryFilters, setShowEnquiryFilters] = React.useState(false)
  const [enquirySearchQuery, setEnquirySearchQuery] = React.useState('')
  const [debouncedEnquirySearchQuery, setDebouncedEnquirySearchQuery] = React.useState('')
  const [enquiryFilters, setEnquiryFilters] = React.useState({
    state: '', division: '', product: '', followUpStatus: '', salesStatus: '', salesperson: '', telecaller: '', dateFrom: '', dateTo: ''
  })
  const [enquiryEnabledFilters, setEnquiryEnabledFilters] = React.useState({
    state: false, division: false, product: false, followUpStatus: false, salesStatus: false, salesperson: false, telecaller: false, dateRange: false
  })
  const [enquirySortBy, setEnquirySortBy] = React.useState('none')
  const [enquirySortOrder, setEnquirySortOrder] = React.useState('asc')
  const [viewingCustomer, setViewingCustomer] = React.useState(null)
  const [viewingCustomerForQuotation, setViewingCustomerForQuotation] = React.useState(null)
  const [showAddCustomer, setShowAddCustomer] = React.useState(false)
  const [showCreateQuotation, setShowCreateQuotation] = React.useState(false)
  const [editingQuotation, setEditingQuotation] = React.useState(null)
  const [selectedCustomerForQuotation, setSelectedCustomerForQuotation] = React.useState(null)
  const [selectedCustomerForPI, setSelectedCustomerForPI] = React.useState(null)
  const [selectedQuotationForPI, setSelectedQuotationForPI] = React.useState(null)
  const [showCreatePIModal, setShowCreatePIModal] = React.useState(false)
  const [editingCustomer, setEditingCustomer] = React.useState(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showPricingModal, setShowPricingModal] = React.useState(false)
  const [pricingLead, setPricingLead] = React.useState(null)
  const [pricingLoading, setPricingLoading] = React.useState(false)
  const [pricingError, setPricingError] = React.useState('')
  const [pricingStock, setPricingStock] = React.useState(null)
  const [pricingPrice, setPricingPrice] = React.useState(null)
  const [rfpForm, setRfpForm] = React.useState({
    products: [],
    deliveryTimeline: '',
    specialRequirements: ''
  })
  const [products, setProducts] = React.useState([])
  const [productSearch, setProductSearch] = React.useState('')
  const [showProductDropdown, setShowProductDropdown] = React.useState(false)
  const productDropdownRef = React.useRef(null)
  const [savedRfpId, setSavedRfpId] = React.useState(null)
  const [savingDecision, setSavingDecision] = React.useState(false)
  const [rfpIdInput, setRfpIdInput] = React.useState('')
  const [validatingRfpId, setValidatingRfpId] = React.useState(false)
  const [validatedRfpDecision, setValidatedRfpDecision] = React.useState(null)
  const [showRfpIdValidationModal, setShowRfpIdValidationModal] = React.useState(false)
  const [validationError, setValidationError] = React.useState('')
  const [rfpValidationErrors, setRfpValidationErrors] = React.useState({
    products: {},
    deliveryTimeline: '',
    general: ''
  })

  React.useEffect(() => {
    if (showPricingModal && pricingLead) {
      setProducts(getProducts())
    }
  }, [showPricingModal, pricingLead])

  useClickOutside(productDropdownRef, () => setShowProductDropdown(false), showProductDropdown)
  const [selectedBranch, setSelectedBranch] = React.useState('')
  const [companyBranches, setCompanyBranches] = React.useState({})

  const [showCreateTagModal, setShowCreateTagModal] = React.useState(false)
  const [newTagName, setNewTagName] = React.useState('')
  const [selectedLeadsForTag, setSelectedLeadsForTag] = React.useState([])
  const [isCreatingTag, setIsCreatingTag] = React.useState(false)
  const [showBulkActions, setShowBulkActions] = React.useState(false)
  const [bulkActionType, setBulkActionType] = React.useState('tag') // 'tag' or 'sku'
  const [bulkTagValue, setBulkTagValue] = React.useState('')
  const [bulkSkuValue, setBulkSkuValue] = React.useState('')
  const [showDuplicateModal, setShowDuplicateModal] = React.useState(false)
  const [duplicateLeadInfo, setDuplicateLeadInfo] = React.useState(null)

  const [showImportModal, setShowImportModal] = React.useState(false)
  const [showEditLeadStatusModal, setShowEditLeadStatusModal] = React.useState(false)
  const [selectedCustomerForLeadStatus, setSelectedCustomerForLeadStatus] = React.useState(null)
  const [actionMenuOpen, setActionMenuOpen] = React.useState(null)

  const defaultColumns = React.useMemo(() => ({
    leadId: true,
    namePhone: true,
    email: true,
    business: true,
    productType: false,
    gstNo: false,
    address: true,
    state: true,
    division: true,
    customerType: false,
    leadSource: false,
    salesStatus: true,
    followUpStatus: true,
    followUpDate: false,
    followUpTime: false,
    date: false
  }), [])
  const [columnVisibility, setColumnVisibility] = React.useState(defaultColumns)
  const [showColumnModal, setShowColumnModal] = React.useState(false)

  const handleToggleColumn = (columnKey) => {
    setColumnVisibility(prev => ({ ...prev, [columnKey]: !prev[columnKey] }))
  }

  const handleImportSuccess = async () => {
    setShowImportModal(false)
    await new Promise(resolve => setTimeout(resolve, 500))
    await handleRefresh()
  }

  const leadsHook = useSalespersonLeads(customers)
  const activeCustomerId = viewingCustomer?.id || viewingCustomerForQuotation?.id

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const createdToday = params.get('createdToday') === 'true'
    if (leadsHook.setFilterCreatedToday) {
      leadsHook.setFilterCreatedToday(createdToday)
    }
  }, [])
  const quotationHook = useQuotationFlow(activeCustomerId, isRefreshing)
  const piHook = usePIFlow(viewingCustomer, viewingCustomerForQuotation, selectedBranch)

  React.useEffect(() => {
    const loadBranches = async () => {
      try {
        const { branches } = await CompanyBranchService.fetchBranches()
        setCompanyBranches(branches)
        if (Object.keys(branches).length > 0 && !selectedBranch) {
          setSelectedBranch(Object.keys(branches)[0])
        }
      } catch (error) {
        Toast.error('Failed to load company branches')
      }
    }
    loadBranches()
  }, [])
  const initialLoadRef = React.useRef(false)
  React.useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      handleRefresh()
    }
  }, [])

  React.useEffect(() => {
    if (!selectedCustomerId) return
    const found = (customers || []).find(c => String(c.id) === String(selectedCustomerId))
    if (found) setViewingCustomer(found)
  }, [selectedCustomerId, customers])

  const refreshingRef = React.useRef(false)
  
  const handleRefresh = async () => {
    if (refreshingRef.current) {
      return
    }
    
    try {
      refreshingRef.current = true
      setIsRefreshing(true)
      const res = await apiClient.get(API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME())
      const rows = res?.data || []
      const mapped = rows.map(mapApiRowToLead)
      leadsHook.setCustomers(mapped)
      setCustomers(mapped)
    } catch (err) {
      Toast.error('Failed to refresh leads')
    } finally {
      setIsRefreshing(false)
      refreshingRef.current = false
      setInitialLoading(false)
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setShowAddCustomer(true)
  }

  const handleView = (customer) => {
    setViewingCustomer(customer)
  }

  const handleQuotation = (customer) => {
    setViewingCustomerForQuotation(customer)
    setRfpIdInput('')
    setValidatedRfpDecision(null)
    setValidationError('')
    setShowRfpIdValidationModal(true)
  }

  // Filter products based on search – when empty show first 150 so dropdown lists all products/types
  const filteredProducts = React.useMemo(() => {
    if (!productSearch.trim()) {
      return products.slice(0, 150)
    }
    const searchLower = productSearch.toLowerCase()
    return products.filter(p => p.name.toLowerCase().includes(searchLower)).slice(0, 80)
  }, [productSearch, products])

  // Check stock for a product
  const checkProductStock = async (productName) => {
    try {
      const stockRes = await apiClient.get(API_ENDPOINTS.STOCK_GET_BY_PRODUCT(productName)).catch(() => null)
      return stockRes?.data || null
    } catch (error) {
      return null
    }
  }

  // Handle adding product from search input or dropdown
  const handleAddProduct = async (productName = null) => {
    const productToAdd = (productName || productSearch.trim() || '').trim()
    if (!productToAdd || productToAdd.toLowerCase() === 'n/a') return
    
    // Don't add if already exists (exact match)
    if (rfpForm.products.some(p => p.productSpec.toLowerCase() === productToAdd.toLowerCase())) {
      setProductSearch('')
      setShowProductDropdown(false)
      return
    }
    
    // Add product with stock checking
    const newProduct = {
      productSpec: productToAdd,
      quantity: '',
      quantityUnit: 'Mtr',
      targetPrice: '',
      stockStatus: null,
      stockLoading: true,
      approvedPrice: null
    }
    
    setRfpForm(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }))
    
    setProductSearch('')
    setShowProductDropdown(false)
    
    // Check stock and price for the new product
    try {
      const [stockRes, priceRes] = await Promise.all([
        checkProductStock(productToAdd),
        productPriceService.getApprovedPrice(productToAdd).catch(() => null)
      ])
      
      setRfpForm(prev => ({
        ...prev,
        products: prev.products.map(p => 
          p.productSpec === productToAdd 
            ? { ...p, stockStatus: stockRes, approvedPrice: priceRes?.data || null, stockLoading: false }
            : p
        )
      }))
    } catch (error) {
      setRfpForm(prev => ({
        ...prev,
        products: prev.products.map(p => 
          p.productSpec === productToAdd 
            ? { ...p, stockStatus: null, approvedPrice: null, stockLoading: false }
            : p
        )
      }))
    }
  }

  const handleProductSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddProduct()
    } else if (e.key === 'Escape') {
      setShowProductDropdown(false)
    }
  }

  const handleRemoveProduct = (index) => {
    setRfpForm(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const handleProductQuantityChange = (index, quantity) => {
    setRfpForm(prev => ({
      ...prev,
      products: prev.products.map((p, i) => i === index ? { ...p, quantity } : p)
    }))
  }

  const handleProductQuantityUnitChange = (index, quantityUnit) => {
    setRfpForm(prev => ({
      ...prev,
      products: prev.products.map((p, i) => i === index ? { ...p, quantityUnit } : p)
    }))
  }

  const handleProductTargetPriceChange = (index, targetPrice) => {
    setRfpForm(prev => ({
      ...prev,
      products: prev.products.map((p, i) => i === index ? { ...p, targetPrice } : p)
    }))
  }

  const openPricingModal = async (customer) => {
    const rawSpec = (customer?.productName || '').trim()
    const productSpec = rawSpec && rawSpec.toLowerCase() !== 'n/a' ? rawSpec : ''
    setPricingLead(customer)
    setPricingError('')
    setPricingPrice(null)
    setPricingStock(null)
    setRfpValidationErrors({ products: {}, deliveryTimeline: '', general: '' }) // Clear validation errors
    setRfpForm({
      products: productSpec ? [{
      productSpec,
      quantity: '',
        quantityUnit: 'Mtr',
        targetPrice: '',
        stockStatus: null,
        stockLoading: true,
        approvedPrice: null
      }] : [],
      deliveryTimeline: '',
      specialRequirements: ''
    })
    setProducts(getProducts())
    setProductSearch('')
    setShowProductDropdown(false)
    setShowPricingModal(true)
    setPricingLoading(true)
    
    // If initial product exists, check its stock
    if (productSpec) {
    try {
      const [stockRes, priceRes] = await Promise.all([
          checkProductStock(productSpec),
        productPriceService.getApprovedPrice(productSpec).catch(() => null)
      ])
        setPricingStock(stockRes)
      setPricingPrice(priceRes?.data || null)
        setRfpForm(prev => ({
          ...prev,
          products: prev.products.map(p => 
            p.productSpec === productSpec 
              ? { ...p, stockStatus: stockRes, approvedPrice: priceRes?.data || null, stockLoading: false }
              : p
          )
        }))
    } catch (error) {
      setPricingError(error.message || 'Failed to load pricing details')
    } finally {
        setPricingLoading(false)
      }
    } else {
      setPricingLoading(false)
    }
  }

  const closePricingModal = () => {
    setRfpValidationErrors({ products: {}, deliveryTimeline: '', general: '' }) // Clear validation errors
    setShowPricingModal(false)
    setPricingLead(null)
    setPricingError('')
    setPricingStock(null)
    setPricingPrice(null)
    setProductSearch('')
    setShowProductDropdown(false)
    setSavedRfpId(null)
    setRfpIdInput('')
    setValidatedRfpDecision(null)
  }

  // Helper: Check if product is custom (not in products list)
  const isCustomProduct = (productSpec) => {
    return !products.some(p => p.name.toLowerCase() === productSpec.toLowerCase())
  }

  // Helper: Check if all products have price available (for Save Decision button)
  const canSaveDecision = () => {
    if (rfpForm.products.length === 0 || savedRfpId) return false
    
    // ALL products must have price available (stock doesn't matter)
    return rfpForm.products.every(product => {
      const isCustom = isCustomProduct(product.productSpec)
      if (isCustom) return false // Custom products don't have price
      return !!product.approvedPrice // Must have approved price
    })
  }

  // Helper: Check if any product needs RFP (price NOT available, regardless of stock)
  const canRaiseRfp = () => {
    if (rfpForm.products.length === 0) return false
    
    return rfpForm.products.some(product => {
      const isCustom = isCustomProduct(product.productSpec)
      if (isCustom) return true // Custom products always need RFP
      
      const hasPrice = !!product.approvedPrice
      
      // Raise RFP when price NOT available (stock doesn't matter)
      return !hasPrice
    })
  }

  // Validation function for Save Decision (validates ALL products)
  const validateSaveDecision = () => {
    const errors = {
      products: {},
      deliveryTimeline: '',
      general: ''
    }
    let hasErrors = false

    // Validate: At least one product required
    if (!pricingLead || rfpForm.products.length === 0) {
      errors.general = 'Please add at least one product'
      hasErrors = true
      setRfpValidationErrors(errors)
      return { isValid: false, errors }
    }

    // Save Decision: Only when ALL products have price available (stock doesn't matter)
    const productsToSave = rfpForm.products.filter(product => {
      const isCustom = isCustomProduct(product.productSpec)
      if (isCustom) return false // Custom products don't have price, can't save
      
      const hasPrice = !!product.approvedPrice
      return hasPrice // Only save if price is available
    })
    
    if (productsToSave.length === 0) {
      errors.general = 'Cannot save decision. No products have approved pricing. Please raise RFP for pricing approval.'
      hasErrors = true
      setRfpValidationErrors(errors)
      return { isValid: false, errors }
    }
    
    if (productsToSave.length < rfpForm.products.length) {
      errors.general = `Only ${productsToSave.length} out of ${rfpForm.products.length} products have pricing. Please raise RFP for products without pricing.`
      hasErrors = true
      setRfpValidationErrors(errors)
      return { isValid: false, errors }
    }

    // Validate ALL products that are being saved (all should have required fields)
    productsToSave.forEach((product, originalIndex) => {
      // Find the original index in rfpForm.products
      const productIndex = rfpForm.products.findIndex(p => p.productSpec === product.productSpec)
      if (productIndex === -1) return
      
      const productErrors = {}

      // Validate Quantity (required)
      const quantity = product.quantity?.toString().trim() || ''
      if (!quantity) {
        productErrors.quantity = 'Quantity is required'
        hasErrors = true
      } else {
        const quantityNum = parseFloat(quantity)
        if (isNaN(quantityNum) || quantityNum <= 0) {
          productErrors.quantity = 'Quantity must be greater than 0'
          hasErrors = true
        }
      }

      // Validate Target Price (optional - if provided, must be > 0)
      const targetPrice = product.targetPrice?.toString().trim() || ''
      if (targetPrice) {
        const priceNum = parseFloat(targetPrice)
        if (isNaN(priceNum) || priceNum <= 0) {
          productErrors.targetPrice = 'Target Price must be greater than 0'
          hasErrors = true
        }
      }

      if (Object.keys(productErrors).length > 0) {
        errors.products[productIndex] = productErrors
      }
    })

    // Validate Delivery Timeline (required)
    const deliveryTimeline = rfpForm.deliveryTimeline?.trim() || ''
    if (!deliveryTimeline) {
      errors.deliveryTimeline = 'Delivery Timeline is required'
      hasErrors = true
    } else {
      // Validate date is not in the past
      const selectedDate = new Date(deliveryTimeline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.deliveryTimeline = 'Delivery date cannot be in the past'
        hasErrors = true
      }
    }

    setRfpValidationErrors(errors)
    return { isValid: !hasErrors, errors }
  }

  // Save Pricing & RFP Decision
  const handleSaveDecision = async () => {
    // Clear previous errors
    setPricingError('')
    setRfpValidationErrors({ products: {}, deliveryTimeline: '', general: '' })
    
    // Validate form before proceeding
    const validation = validateSaveDecision()
    if (!validation.isValid) {
      // Show general error if exists
      if (validation.errors.general) {
        setPricingError(validation.errors.general)
      } else {
        setPricingError('Please fill all required fields')
      }
      // Scroll to top of modal to show errors
      const modalContent = document.querySelector('[class*="rounded-2xl"]')
      if (modalContent) {
        modalContent.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    
    setSavingDecision(true)
    
    try {
      // Save Decision: Only when ALL products have price available (stock doesn't matter)
      // This function only saves, doesn't raise RFP
      const productsToSave = rfpForm.products.filter(product => {
        const isCustom = isCustomProduct(product.productSpec)
        if (isCustom) return false // Custom products don't have price, can't save
        
        const hasPrice = !!product.approvedPrice
        return hasPrice // Only save if price is available
      })
      
      // ALWAYS create new RFP ID on save (one lead can have multiple RFP IDs)
      // Create new pricing decision with new RFP ID
      const response = await apiClient.post(API_ENDPOINTS.PRICING_RFP_DECISION_CREATE(), {
        leadId: pricingLead.id,
        products: productsToSave.map(p => ({
          productSpec: p.productSpec,
          quantity: p.quantity || '',
          quantityUnit: p.quantityUnit || 'Mtr',
          targetPrice: p.targetPrice || ''
        })),
        deliveryTimeline: rfpForm.deliveryTimeline,
        specialRequirements: rfpForm.specialRequirements
      })
      
      if (response.success && response.data) {
        setSavedRfpId(response.data.rfp_id)
        Toast.success('Pricing & RFP Decision saved successfully! RFP ID generated.')
        // Trigger refresh of RFP Record tab
        window.dispatchEvent(new CustomEvent('rfpRecordUpdated', { detail: { type: 'saved', rfpId: response.data.rfp_id } }))
      }
    } catch (error) {
      setPricingError(error.message || 'Failed to save pricing decision or raise RFP')
    } finally {
      setSavingDecision(false)
    }
  }

  // Copy RFP ID to clipboard
  const handleCopyRfpId = () => {
    if (savedRfpId) {
      navigator.clipboard.writeText(savedRfpId)
      Toast.success('RFP ID copied to clipboard!')
    }
  }

  // Validate RFP ID – only accept if RFP is linked to this lead (not any other lead)
  const handleValidateRfpId = async () => {
    if (!rfpIdInput.trim()) {
      setValidationError('Please enter RFP ID')
      return
    }

    const currentLeadId = viewingCustomerForQuotation?.id ?? viewingCustomerForQuotation?.lead_id ?? null
    const leadIdParam = currentLeadId != null ? `?leadId=${encodeURIComponent(currentLeadId)}` : ''

    setValidationError('')
    setValidatingRfpId(true)
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRICING_RFP_DECISION_GET(rfpIdInput.trim()) + leadIdParam)
      if (response.success && response.data) {
        const decision = response.data
        const decisionLeadId = decision.lead_id ?? decision.leadId ?? decision.rfp_request?.lead_id
        if (currentLeadId != null && decisionLeadId != null && String(decisionLeadId) !== String(currentLeadId)) {
          const leadName = viewingCustomerForQuotation?.name || viewingCustomerForQuotation?.business || 'this lead'
          setValidationError(`This RFP ID is linked to a different lead. Please enter the RFP ID that belongs to ${leadName} only.`)
          setValidatedRfpDecision(null)
          setValidatingRfpId(false)
          return
        }
        setValidatedRfpDecision(decision)
        Toast.success('RFP ID validated successfully!')

        sessionStorage.setItem('pricingRfpDecisionId', rfpIdInput.trim())
        sessionStorage.setItem('pricingRfpDecisionData', JSON.stringify(decision))

        setShowRfpIdValidationModal(false)
        const rfpId = rfpIdInput.trim()
        try {
          const res = await quotationService.getQuotationsByCustomer(viewingCustomerForQuotation.id)
          const list = res?.data || []
          const existing = list.find(q => (q.rfp_id || q.master_rfp_id || '') === rfpId)
          if (existing) {
            const full = await quotationService.getQuotation(existing.id)
            if (full?.success) {
              setEditingQuotation(full.data)
              Toast.info('This RFP already has a quotation. Opened for editing.')
            }
          } else {
            setEditingQuotation(null)
          }
        } catch (_) {
          setEditingQuotation(null)
        }
        setShowCreateQuotation(true)
      } else {
        setValidationError('Invalid RFP ID. Please check and try again.')
        setValidatedRfpDecision(null)
      }
    } catch (error) {
      const data = error?.response?.data
      const linkedToLeadName = data?.linkedToLeadName
      const currentLeadName = viewingCustomerForQuotation?.name || viewingCustomerForQuotation?.business || 'this lead'
      let msg = data?.message || error.message
      if (linkedToLeadName && !msg.includes(linkedToLeadName)) {
        msg = `This RFP ID is linked to ${linkedToLeadName}. Please enter the RFP ID that belongs to ${currentLeadName} only.`
      }
      setValidationError(msg || 'Failed to validate RFP ID. Please check and try again.')
      setValidatedRfpDecision(null)
    } finally {
      setValidatingRfpId(false)
    }
  }

  // Algorithm-based validation function for RFP form
  const validateRfpForm = () => {
    // Use centralized validation utility with algorithm-based rules
    const validation = validateRfpFormUtil(
      rfpForm,
      rfpForm.products,
      isCustomProduct,
      (product) => !!product.approvedPrice
    )
    
    setRfpValidationErrors(validation.errors)
    return validation
  }

  const handleRaiseRfp = async () => {
    // Clear previous errors
    setPricingError('')
    setRfpValidationErrors({ products: {}, deliveryTimeline: '', general: '' })
    
    // Validate form before proceeding
    const validation = validateRfpForm()
    if (!validation.isValid) {
      // Show general error if exists
      if (validation.errors.general) {
        setPricingError(validation.errors.general)
      } else {
        setPricingError('Please fill all required fields')
      }
      // Scroll to top of modal to show errors
      const modalContent = document.querySelector('[class*="rounded-2xl"]')
      if (modalContent) {
        modalContent.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    
    setPricingLoading(true)
    
    try {
      // Algorithm-based filtering: Get products that need RFP
      const productsToRaise = filterProductsNeedingRfp(
        rfpForm.products,
        isCustomProduct,
        (product) => !!product.approvedPrice
      )
      
      if (productsToRaise.length === 0) {
        setPricingError('No products need RFP. All products have price available.')
        setPricingLoading(false)
        return
      }
      
      // Algorithm-based product transformation for RFP creation
      // Use centralized helper function for consistent processing
      const productsArray = transformProductsArrayForRfp(productsToRaise, isCustomProduct)
      
      // Algorithm-based validation: Validate products array before sending
      const { validateProductsArray } = await import('../../utils/rfpValidation')
      const productsValidation = validateProductsArray(productsArray)
      
      if (!productsValidation.isValid) {
        setPricingError(productsValidation.error)
        setPricingLoading(false)
        return
      }
      
      console.log('[RFP Raise] Sending request:', {
        leadId: pricingLead.id,
        productsCount: productsArray.length,
        products: productsArray.map(p => ({ productSpec: p.productSpec, availabilityStatus: p.availabilityStatus }))
      })
      
      // Create ONE RFP request with all products
      await rfpService.create({
        leadId: pricingLead.id,
        products: productsArray,
        deliveryTimeline: rfpForm.deliveryTimeline,
        specialRequirements: rfpForm.specialRequirements || '',
        // Store same-to-same snapshot of what salesperson raised from Pricing & RFP Decision
        source: 'pricing_rfp_decision',
        sourcePayload: {
          lead: {
            id: pricingLead?.id,
            name: pricingLead?.name,
            business: pricingLead?.business,
            phone: pricingLead?.phone,
            email: pricingLead?.email
          },
          form: {
            deliveryTimeline: rfpForm.deliveryTimeline,
            specialRequirements: rfpForm.specialRequirements || '',
            // Full products as seen in Pricing & RFP Decision UI (same-to-same copy)
            allProducts: rfpForm.products || []
          },
          // Workflow payload actually sent for approval (subset that needs RFP)
          workflowProducts: productsArray || []
        }
      })
      
      Toast.success(`Successfully raised RFP with ${productsToRaise.length} product${productsToRaise.length > 1 ? 's' : ''} to Department Head. RFP ID will be generated after approval.`)
      // Trigger refresh of RFP Record tab and RFP Requests list
      window.dispatchEvent(new CustomEvent('rfpRecordUpdated', { detail: { type: 'raised' } }))
      window.dispatchEvent(new CustomEvent('rfpUpdated', { detail: { type: 'raised' } }))
      closePricingModal()
    } catch (error) {
      console.error('[RFP Raise] Error:', error)
      console.error('[RFP Raise] Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      })
      // Show more detailed error message
      const errorMessage = error.data?.message || error.message || 'Failed to raise RFP'
      setPricingError(errorMessage)
    } finally {
      setPricingLoading(false)
    }
  }

  const handleEditLeadStatus = (customer) => {
    const leadFormat = {
      id: customer.id,
      sales_status: customer.salesStatus || '',
      sales_status_remark: customer.salesStatusRemark || '',
      follow_up_status: customer.followUpStatus || '',
      follow_up_remark: customer.followUpRemark || '',
      follow_up_date: customer.followUpDate || '',
      follow_up_time: customer.followUpTime || '',
      enquired_products: customer.enquired_products || customer.enquiredProducts || [],
      other_product: customer.other_product || customer.otherProduct || ''
    }
    setSelectedCustomerForLeadStatus(leadFormat)
    setShowEditLeadStatusModal(true)
  }

  const handleUpdateLeadStatus = async (leadId, statusData) => {
    try {
      const enquiredProducts = statusData.enquired_products || [];
      const enquiredProductsStr = Array.isArray(enquiredProducts) 
        ? JSON.stringify(enquiredProducts) 
        : enquiredProducts;
      
      const payload = {
        sales_status: statusData.sales_status ?? statusData.salesStatus ?? '',
        sales_status_remark: statusData.sales_status_remark ?? statusData.salesStatusRemark ?? '',
        follow_up_status: statusData.follow_up_status ?? statusData.followUpStatus ?? '',
        follow_up_remark: statusData.follow_up_remark ?? statusData.followUpRemark ?? '',
        follow_up_date: statusData.follow_up_date ?? statusData.followUpDate ?? '',
        follow_up_time: statusData.follow_up_time ?? statusData.followUpTime ?? '',
        enquired_products: enquiredProductsStr,
        other_product: statusData.other_product || '',
      }
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v == null ? '' : v))
      const response = await apiClient.putFormData(API_ENDPOINTS.SALESPERSON_LEAD_BY_ID(leadId), fd);
      
      if (response.success) {
        let formattedProductsForState = [];
        try {
          formattedProductsForState = typeof enquiredProductsStr === 'string' 
            ? JSON.parse(enquiredProductsStr) 
            : enquiredProducts;
        } catch {
          formattedProductsForState = enquiredProducts;
        }
        
        // Update the customers list
        const updatedCustomers = leadsHook.customers.map(customer => 
          customer.id === leadId 
            ? { 
                ...customer, 
                salesStatus: payload.sales_status,
                salesStatusRemark: payload.sales_status_remark,
                followUpStatus: payload.follow_up_status,
                followUpRemark: payload.follow_up_remark,
                followUpDate: payload.follow_up_date,
                followUpTime: payload.follow_up_time,
                enquired_products: formattedProductsForState,
                enquiredProducts: formattedProductsForState,
                other_product: payload.other_product,
                otherProduct: payload.other_product,
                updated_at: new Date().toISOString() 
              }
            : customer
        );
        
        leadsHook.setCustomers(updatedCustomers)
        setCustomers(updatedCustomers)
        
        Toast.success('Enquiry updated successfully!')
        setShowEditLeadStatusModal(false)
        setSelectedCustomerForLeadStatus(null)
      }
    } catch (error) {
        Toast.error('Failed to update enquiry')
      throw error
    }
  }

  const handleInlineStatusChange = React.useCallback(async (leadId, field, newStatus) => {
    const customer = leadsHook.customers.find(c => c.id === leadId)
    if (!customer) return
    const payload = {
      sales_status: field === 'salesStatus' ? newStatus : (customer.salesStatus ?? ''),
      sales_status_remark: customer.salesStatusRemark ?? '',
      follow_up_status: field === 'followUpStatus' ? newStatus : (customer.followUpStatus ?? ''),
      follow_up_remark: customer.followUpRemark ?? '',
      follow_up_date: customer.followUpDate ?? '',
      follow_up_time: customer.followUpTime ?? '',
      enquired_products: JSON.stringify(customer.enquired_products || customer.enquiredProducts || []),
      other_product: customer.other_product || customer.otherProduct || ''
    }
    try {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v == null ? '' : v))
      const response = await apiClient.putFormData(API_ENDPOINTS.SALESPERSON_LEAD_BY_ID(leadId), fd)
      if (response.success) {
        const updated = leadsHook.customers.map(c =>
          c.id === leadId ? { ...c, [field]: newStatus } : c
        )
        leadsHook.setCustomers(updated)
        setCustomers(updated)
        Toast.success(`${field === 'followUpStatus' ? 'Follow up' : 'Sales'} status updated`)
      }
    } catch {
      Toast.error('Failed to update status')
    }
  }, [leadsHook.customers, leadsHook.setCustomers, setCustomers])

  const handleAppointmentChange = React.useCallback(async (leadId, { followUpDate, followUpTime }) => {
    const customer = leadsHook.customers.find(c => c.id === leadId)
    if (!customer) return
    const payload = {
      sales_status: customer.salesStatus ?? '',
      sales_status_remark: customer.salesStatusRemark ?? '',
      follow_up_status: customer.followUpStatus ?? 'appointment scheduled',
      follow_up_remark: customer.followUpRemark ?? '',
      follow_up_date: followUpDate ?? '',
      follow_up_time: followUpTime ?? '',
      enquired_products: JSON.stringify(customer.enquired_products || customer.enquiredProducts || []),
      other_product: customer.other_product || customer.otherProduct || ''
    }
    try {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v == null ? '' : v))
      const response = await apiClient.putFormData(API_ENDPOINTS.SALESPERSON_LEAD_BY_ID(leadId), fd)
      if (response.success) {
        const updated = leadsHook.customers.map(c =>
          c.id === leadId ? { ...c, followUpDate: followUpDate ?? '', followUpTime: followUpTime ?? '' } : c
        )
        leadsHook.setCustomers(updated)
        setCustomers(updated)
        Toast.success('Appointment updated')
      }
    } catch {
      Toast.error('Failed to update appointment')
    }
  }, [leadsHook.customers, leadsHook.setCustomers, setCustomers])

  const handleToggleLeadForTag = (leadId) => {
    setSelectedLeadsForTag(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId])
  }

  const handleSelectAllLeadsForTag = () => {
    setSelectedLeadsForTag(prev => prev.length === leadsHook.paginatedCustomers.length ? [] : leadsHook.paginatedCustomers.map(c => c.id))
  }

  const handleBulkTagChange = async () => {
    const trimmedTag = bulkTagValue.trim().toLowerCase()
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
        const lead = leadsHook.customers.find(c => c.id === leadId)
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
      
      // Update local state
      const updatedCustomers = leadsHook.customers.map(customer => 
        selectedLeadsForTag.includes(customer.id) 
          ? { ...customer, customerType: trimmedTag } 
          : customer
      )
      
      leadsHook.setCustomers(updatedCustomers)
      setCustomers(updatedCustomers)
      
      Toast.success(`Tag "${trimmedTag}" created and assigned to ${selectedLeadsForTag.length} lead(s) successfully!`)
      setSelectedLeadsForTag([])
      setBulkTagValue('')
      setShowBulkActions(false)
    } catch (error) {
      Toast.error('Failed to create tag. Please try again.')
    } finally {
      setIsCreatingTag(false)
    }
  }

  const handleBulkSkuChange = async () => {
    if (selectedLeadsForTag.length === 0) {
      Toast.error('Please select at least one lead')
      return
    }
    if (!bulkSkuValue.trim()) {
      Toast.error('Please enter a SKU value')
      return
    }
    
    setIsCreatingTag(true)
    try {
      // Update product type (SKU) for selected leads via API
      const updatePromises = selectedLeadsForTag.map(async (leadId) => {
        const lead = leadsHook.customers.find(c => c.id === leadId)
        if (!lead) return null
        const formData = new FormData()
        formData.append('name', lead.name)
        formData.append('phone', lead.phone)
        formData.append('email', lead.email === 'N/A' ? '' : lead.email)
        formData.append('business', lead.business)
        formData.append('address', lead.address)
        formData.append('gst_no', lead.gstNo === 'N/A' ? '' : lead.gstNo)
        formData.append('product_type', bulkSkuValue.trim())
        formData.append('state', lead.state)
        formData.append('lead_source', lead.enquiryBy)
        formData.append('customer_type', lead.customerType || '')
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
      
      // Update local state
      const updatedCustomers = leadsHook.customers.map(customer => {
        if (selectedLeadsForTag.includes(customer.id)) {
          return { ...customer, productName: bulkSkuValue.trim(), product_type: bulkSkuValue.trim() }
        }
        return customer
      })
      
      leadsHook.setCustomers(updatedCustomers)
      setCustomers(updatedCustomers)
      
      Toast.success(`SKU updated for ${selectedLeadsForTag.length} lead(s)`)
      setSelectedLeadsForTag([])
      setBulkSkuValue('')
      setShowBulkActions(false)
    } catch (error) {
      Toast.error('Failed to update SKU')
    } finally {
      setIsCreatingTag(false)
    }
  }

  // Save customer handler (create or update)
  const handleSaveCustomer = async (customerData) => {
    try {
      const formData = new FormData()
      
      if (editingCustomer) {
        // Update existing customer
        formData.append('name', customerData.customerName)
        formData.append('phone', customerData.mobileNumber.replace(/\D/g, '').slice(-10))
        formData.append('whatsapp', customerData.whatsappNumber ? customerData.whatsappNumber.replace(/\D/g, '').slice(-10) : customerData.mobileNumber.replace(/\D/g, '').slice(-10))
        formData.append('email', customerData.email || '')
        formData.append('business', customerData.business || 'N/A')
        formData.append('address', customerData.address || 'N/A')
        formData.append('gst_no', customerData.gstNumber || '')
        formData.append('product_type', customerData.productName || 'N/A')
        formData.append('state', customerData.state || 'N/A')
        formData.append('division', customerData.division || '')
        formData.append('lead_source', customerData.leadSource || 'N/A')
        formData.append('customer_type', customerData.customerType || 'N/A')
        formData.append('date', customerData.date)
        formData.append('sales_status', customerData.salesStatus || 'pending')
        formData.append('sales_status_remark', customerData.salesStatusRemark || '')
        formData.append('follow_up_status', customerData.followUpStatus || '')
        formData.append('follow_up_remark', customerData.followUpRemark || '')
        formData.append('follow_up_date', customerData.followUpDate || '')
        formData.append('follow_up_time', customerData.followUpTime || '')
        formData.append('call_duration_seconds', customerData.callDurationSeconds || '')
        formData.append('transferred_to', customerData.transferredTo || '')
        
        if (customerData.callRecordingFile) {
          formData.append('call_recording', customerData.callRecordingFile)
        }
        
        const updateResponse = await apiClient.putFormData(API_ENDPOINTS.SALESPERSON_LEAD_BY_ID(editingCustomer.id), formData)
        
        if (!updateResponse?.success) {
          throw new Error(updateResponse?.message || 'Failed to update customer')
        }
        
        // Update local state immediately for instant feedback
        const updatedCustomer = {
          ...editingCustomer,
          name: customerData.customerName,
          phone: customerData.mobileNumber.replace(/\D/g, '').slice(-10),
          whatsapp: customerData.whatsappNumber ? `+91${customerData.whatsappNumber.replace(/\D/g, '').slice(-10)}` : `+91${customerData.mobileNumber.replace(/\D/g, '').slice(-10)}`,
          email: customerData.email || 'N/A',
          business: customerData.business || 'N/A',
          address: customerData.address || 'N/A',
          gstNo: customerData.gstNumber || 'N/A',
          productName: customerData.productName || 'N/A',
          product_type: customerData.productName || 'N/A',
          state: customerData.state || 'N/A',
          division: customerData.division || null,
          enquiryBy: customerData.leadSource || 'N/A',
          customerType: customerData.customerType || 'N/A',
          salesStatus: customerData.salesStatus || 'pending',
          salesStatusRemark: customerData.salesStatusRemark || null,
          followUpStatus: customerData.followUpStatus || null,
          followUpRemark: customerData.followUpRemark || null,
          followUpDate: customerData.followUpDate || null,
          followUpTime: customerData.followUpTime || null,
          callDurationSeconds: customerData.callDurationSeconds || null,
          transferredTo: customerData.transferredTo || null,
        }
        
        // Update local state immediately
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updatedCustomer : c))
        leadsHook.setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updatedCustomer : c))
        
        // If lead is being transferred, call the transfer API
        if (customerData.transferredTo) {
          try {
            await apiClient.post(API_ENDPOINTS.LEAD_TRANSFER(editingCustomer.id), {
              transferredTo: customerData.transferredTo,
              reason: `Transferred via edit form`
            })
            Toast.success(`Customer updated and transferred to ${customerData.transferredTo} successfully!`)
          } catch (transferErr) {
            Toast.warning('Customer updated but transfer failed. Please try again.')
          }
        } else {
          Toast.success('Customer updated successfully!')
        }
        
        // Close modal immediately
        setShowAddCustomer(false)
        setEditingCustomer(null)
        
        // Refresh from API in background to ensure data is in sync
        setTimeout(async () => {
          await handleRefresh()
        }, 500)
      } else {
        // Create new customer
        // Send actual data if present, empty string if not - backend will handle 'N/A' conversion
        formData.append('name', customerData.customerName || '')
        formData.append('phone', customerData.mobileNumber.replace(/\D/g, '').slice(-10))
        formData.append('whatsapp', customerData.whatsappNumber ? customerData.whatsappNumber.replace(/\D/g, '').slice(-10) : customerData.mobileNumber.replace(/\D/g, '').slice(-10))
        formData.append('email', customerData.email || '')
        formData.append('business', customerData.business || '')
        formData.append('address', customerData.address || '')
        formData.append('gst_no', customerData.gstNumber || '')
        formData.append('product_type', customerData.productName || '')
        formData.append('state', customerData.state || '')
        formData.append('division', customerData.division || '')
        formData.append('lead_source', customerData.leadSource || '')
        formData.append('customer_type', customerData.customerType || '')
        formData.append('date', customerData.date || '')
        formData.append('sales_status', customerData.salesStatus || 'pending')
        formData.append('sales_status_remark', customerData.salesStatusRemark || '')
        formData.append('follow_up_status', customerData.followUpStatus || '')
        formData.append('follow_up_remark', customerData.followUpRemark || '')
        formData.append('follow_up_date', customerData.followUpDate || '')
        formData.append('follow_up_time', customerData.followUpTime || '')
        formData.append('call_duration_seconds', customerData.callDurationSeconds || '')
        formData.append('transferred_to', customerData.transferredTo || '')
        
        if (customerData.callRecordingFile) {
          formData.append('call_recording', customerData.callRecordingFile)
        }
        
        try {
          const response = await apiClient.postFormData(API_ENDPOINTS.SALESPERSON_CREATE_LEAD(), formData)
          
          // Check if response indicates duplicate (shouldn't happen if API throws error, but just in case)
          if (response?.isDuplicate || response?.data?.isDuplicate) {
            const duplicateInfo = response?.duplicateLead || response?.data?.duplicateLead
            setDuplicateLeadInfo(duplicateInfo)
            setShowDuplicateModal(true)
            Toast.error('Duplicate lead found! Lead not added.')
            return // Don't close modal or refresh
          }
          
          Toast.success('Customer added successfully!')
          
          // Refresh leads from API
          await handleRefresh()
          
          // Close modal and reset editing state
          setShowAddCustomer(false)
          setEditingCustomer(null)
        } catch (createError) {
          // Check if error is due to duplicate (409 status)
          if (createError.status === 409 || createError.data?.isDuplicate) {
            // Extract duplicate info from error response
            const duplicateInfo = createError.data?.duplicateLead || createError.duplicateLead
            if (duplicateInfo) {
              setDuplicateLeadInfo(duplicateInfo)
              setShowDuplicateModal(true)
              Toast.error('Duplicate lead found! Lead not added.')
              return // Don't close modal or refresh
            }
          }
          
          // Re-throw if not a duplicate error so it gets caught by outer catch
          throw createError
        }
      }
    } catch (error) {
      if (error.status === 409 || error.data?.isDuplicate) {
        const duplicateInfo = error.data?.duplicateLead || error.duplicateLead
        if (duplicateInfo) {
          setDuplicateLeadInfo(duplicateInfo)
          setShowDuplicateModal(true)
          Toast.error('Duplicate lead found! Lead not added.')
          return
        }
      }
      
      const errorMessage = error.data?.message || error.message || 'Failed to add customer. Please try again.'
      Toast.error(editingCustomer ? 'Failed to update customer. Please try again.' : errorMessage)
    }
  }

  // Edit quotation handler
  const handleEditQuotation = async (quotation, customer) => {
    try {
      // Fetch full quotation details
      const response = await quotationService.getQuotation(quotation.id)
      if (response?.success) {
        const fullQuotation = response.data
        // Set customer and quotation for editing
        setViewingCustomerForQuotation(customer)
        setEditingQuotation(fullQuotation)
        setShowCreateQuotation(true)
      } else {
        Toast.error('Failed to load quotation for editing')
      }
    } catch (error) {
      Toast.error('Failed to load quotation for editing')
    }
  }

  // Save quotation handler
  const handleSaveQuotation = async (quotationData) => {
    const customerToUse = viewingCustomerForQuotation || viewingCustomer
    if (!customerToUse) {
      Toast.error('Customer not found')
      return
    }
    const quotationId = quotationData.quotationId || editingQuotation?.id || null
    const result = await quotationHook.handleSaveQuotation(quotationData, customerToUse, quotationId)
    if (result?.success) {
      setShowCreateQuotation(false)
      setViewingCustomerForQuotation(null)
      setEditingQuotation(null)
      if (customerToUse.id) {
        const res = await quotationService.getQuotationsByCustomer(customerToUse.id)
        if (res?.success) {
          quotationHook.setQuotations((res.data || []).map(q => QuotationHelper.normalizeQuotation(q)))
        }
      }
    } else if (result?.existingQuotationId) {
      try {
        const res = await quotationService.getQuotation(result.existingQuotationId)
        if (res?.success) {
          setEditingQuotation(res.data)
          Toast.success('Opened existing quotation for this RFP. Only one quotation per RFP is allowed.')
        }
      } catch (_) {
        Toast.error('Could not open existing quotation.')
      }
    }
  }

  const handleViewQuotation = async (quotationSummary) => {
    try {
      const response = await quotationService.getQuotation(quotationSummary.id);
      
      if (response?.success && response?.data) {
        const dbQuotation = response.data;
        const normalized = {
          id: dbQuotation.id,
          quotationNumber: dbQuotation.quotation_number,
          quotationDate: dbQuotation.quotation_date,
          validUpto: dbQuotation.valid_until,
          validUntil: dbQuotation.valid_until,
          selectedBranch: dbQuotation.branch,
          template: dbQuotation.template,
          
          // Customer and billing info - EXACT from DB
          customer: {
            id: dbQuotation.customer_id,
            name: dbQuotation.customer_name,
            business: dbQuotation.customer_business,
            phone: dbQuotation.customer_phone,
            email: dbQuotation.customer_email,
            address: dbQuotation.customer_address,
            gstNo: dbQuotation.customer_gst_no,
            state: dbQuotation.customer_state
          },
          billTo: dbQuotation.bill_to ? dbQuotation.bill_to : {
            business: dbQuotation.customer_business,
            buyerName: dbQuotation.customer_business,
            address: dbQuotation.customer_address,
            phone: dbQuotation.customer_phone,
            gstNo: dbQuotation.customer_gst_no,
            state: dbQuotation.customer_state
          },
          
          items: (dbQuotation.items || []).map(i => ({
            productName: i.product_name,
            description: i.description,
            quantity: i.quantity,
            unit: i.unit,
            buyerRate: i.unit_price,
            unitPrice: i.unit_price,
            rate: i.unit_price,
            amount: i.taxable_amount,
            total: i.total_amount,
            hsn: i.hsn_code,
            hsnCode: i.hsn_code,
            gstRate: i.gst_rate
          })),
          
          // Financial details - EXACT
          subtotal: parseFloat(dbQuotation.subtotal),
          discountRate: parseFloat(dbQuotation.discount_rate),
          discountAmount: parseFloat(dbQuotation.discount_amount),
          taxRate: parseFloat(dbQuotation.tax_rate),
          taxAmount: parseFloat(dbQuotation.tax_amount),
          total: parseFloat(dbQuotation.total_amount),
          
          // Customer ID
          customerId: dbQuotation.customer_id,
          
          // New fields for delivery & payment - EXACT (handle nulls)
          paymentMode: dbQuotation.payment_mode || '',
          transportTc: dbQuotation.transport_tc || '',
          dispatchThrough: dbQuotation.dispatch_through || '',
          deliveryTerms: dbQuotation.delivery_terms || '',
          materialType: dbQuotation.material_type || '',
          
          // Bank details and terms - EXACT (parse JSON if string)
          bankDetails: typeof dbQuotation.bank_details === 'string' 
            ? JSON.parse(dbQuotation.bank_details) 
            : dbQuotation.bank_details,
          termsSections: typeof dbQuotation.terms_sections === 'string' 
            ? JSON.parse(dbQuotation.terms_sections) 
            : dbQuotation.terms_sections,
          
          status: dbQuotation.status
        };
        
        await quotationHook.handleViewQuotation(normalized);
      } else {
        Toast.error('Failed to load full quotation details. Please try again.');
      }
    } catch (error) {
      Toast.error('Failed to load quotation details');
    }
  }

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen && !event.target.closest('.action-menu-container')) {
        setActionMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [actionMenuOpen])

  const truncateText = (text, maxLength = 30) => {
    if (!text || text === 'N/A' || text === '-') return text === 'N/A' || text === '-' ? '-' : (text || '-')
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const totalPages = Math.ceil(leadsHook.filteredCustomers.length / leadsHook.itemsPerPage)
  const goToPreviousPage = () => leadsHook.setCurrentPage(prev => Math.max(1, prev - 1))
  const goToNextPage = () => leadsHook.setCurrentPage(prev => Math.min(totalPages, prev + 1))

  // Ref to prevent multiple simultaneous fetches
  const fetchingEnquiriesRef = React.useRef(false);
  const enquiryInitialLoadRef = React.useRef(false);
  const lastEnquiryFetchRef = React.useRef({ page: 0, limit: 0, date: '' });

  // Get stable user identifier
  const salespersonIdentifier = React.useMemo(() => {
    return authUser?.username || authUser?.email || user?.username || user?.email || '';
  }, [authUser?.username, authUser?.email, user?.username, user?.email]);

  // Fetch enquiries function for manual refresh
  const fetchEnquiries = React.useCallback(async (forceRefresh = false) => {
    if (activeTab !== 'enquiry') return;
    
    // Prevent multiple simultaneous calls
    if (fetchingEnquiriesRef.current && !forceRefresh) return;
    
    fetchingEnquiriesRef.current = true;
    setEnquiriesLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', enquiryPage.toString());
      params.append('limit', enquiryLimit.toString());
      if (enquiryEnabledFilters.dateRange && enquiryFilters.dateFrom) params.append('enquiryDate', enquiryFilters.dateFrom);
      
      // Fetch grouped data
      const groupedParams = new URLSearchParams();
        if (enquiryEnabledFilters.dateRange && enquiryFilters.dateFrom) groupedParams.append('enquiryDate', enquiryFilters.dateFrom);
      
      const [paginatedResponse, groupedResponse] = await Promise.all([
        apiClient.get(`${API_ENDPOINTS.ENQUIRIES_DEPARTMENT_HEAD()}?${params.toString()}`),
        apiClient.get(`${API_ENDPOINTS.ENQUIRIES_DEPARTMENT_HEAD()}?${groupedParams.toString()}`)
      ]);
      
      if (paginatedResponse.success && groupedResponse.success) {
        // Filter by current salesperson (username or email)
        const filterBySalesperson = (enquiryList) => {
          if (!salespersonIdentifier) return enquiryList;
          return enquiryList.filter(enquiry => {
            const enquirySalesperson = enquiry.salesperson || '';
            const enquiryTelecaller = enquiry.telecaller || '';
            const identifierLower = salespersonIdentifier.toLowerCase().trim();
            return enquirySalesperson.toLowerCase().trim() === identifierLower ||
                   enquiryTelecaller.toLowerCase().trim() === identifierLower;
          });
        };
        
        const allEnquiries = paginatedResponse.data?.enquiries || [];
        const allGrouped = groupedResponse.data?.groupedByDate || {};
        
        // Filter enquiries by salesperson
        const filteredEnquiries = filterBySalesperson(allEnquiries);
        const filteredGrouped = {};
        Object.keys(allGrouped).forEach(date => {
          const dateEnquiries = filterBySalesperson(allGrouped[date]);
          if (dateEnquiries.length > 0) {
            filteredGrouped[date] = dateEnquiries;
          }
        });
        
        setEnquiries(filteredEnquiries);
        setEnquiriesGroupedByDate(filteredGrouped);
        setEnquiryTotal(filteredEnquiries.length);
        
        // Update total based on filtered results
        setEnquiryTotal(filteredEnquiries.length);
        
        // Update last fetch key
        lastEnquiryFetchRef.current = { page: enquiryPage, limit: enquiryLimit, date: enquiryFilters.dateFrom || '' };
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setEnquiriesLoading(false);
      fetchingEnquiriesRef.current = false;
    }
  }, [activeTab, enquiryPage, enquiryLimit, enquiryFilters.dateFrom, enquiryEnabledFilters.dateRange, salespersonIdentifier]);

  // Fetch enquiries when tab changes or filters/pagination change
  React.useEffect(() => {
    if (activeTab !== 'enquiry') {
      enquiryInitialLoadRef.current = false;
      lastEnquiryFetchRef.current = { page: 0, limit: 0, date: '' };
      return;
    }

    // Prevent multiple simultaneous calls
    if (fetchingEnquiriesRef.current) return;
    
    // Check if we need to fetch (avoid unnecessary calls)
    const currentFetchKey = `${enquiryPage}-${enquiryLimit}-${enquiryFilters.dateFrom || ''}`;
    const lastFetchKey = `${lastEnquiryFetchRef.current.page}-${lastEnquiryFetchRef.current.limit}-${lastEnquiryFetchRef.current.date}`;
    if (currentFetchKey === lastFetchKey && enquiryInitialLoadRef.current) {
      return;
    }

    const loadEnquiries = async () => {
      fetchingEnquiriesRef.current = true;
      setEnquiriesLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        params.append('page', enquiryPage.toString());
        params.append('limit', enquiryLimit.toString());
        if (enquiryEnabledFilters.dateRange && enquiryFilters.dateFrom) params.append('enquiryDate', enquiryFilters.dateFrom);
        
        // Fetch grouped data
        const groupedParams = new URLSearchParams();
        if (enquiryEnabledFilters.dateRange && enquiryFilters.dateFrom) groupedParams.append('enquiryDate', enquiryFilters.dateFrom);
        
        const [paginatedResponse, groupedResponse] = await Promise.all([
          apiClient.get(`${API_ENDPOINTS.ENQUIRIES_DEPARTMENT_HEAD()}?${params.toString()}`),
          apiClient.get(`${API_ENDPOINTS.ENQUIRIES_DEPARTMENT_HEAD()}?${groupedParams.toString()}`)
        ]);
        
        if (paginatedResponse.success && groupedResponse.success) {
          // Filter by current salesperson (username or email)
          const filterBySalesperson = (enquiryList) => {
            if (!salespersonIdentifier) return enquiryList;
            return enquiryList.filter(enquiry => {
              const enquirySalesperson = enquiry.salesperson || '';
              const enquiryTelecaller = enquiry.telecaller || '';
              const identifierLower = salespersonIdentifier.toLowerCase().trim();
              return enquirySalesperson.toLowerCase().trim() === identifierLower ||
                     enquiryTelecaller.toLowerCase().trim() === identifierLower;
            });
          };
          
          const allEnquiries = paginatedResponse.data?.enquiries || [];
          const allGrouped = groupedResponse.data?.groupedByDate || {};
          
          // Filter enquiries by salesperson
          const filteredEnquiries = filterBySalesperson(allEnquiries);
          const filteredGrouped = {};
          Object.keys(allGrouped).forEach(date => {
            const dateEnquiries = filterBySalesperson(allGrouped[date]);
            if (dateEnquiries.length > 0) {
              filteredGrouped[date] = dateEnquiries;
            }
          });
          
        setEnquiries(filteredEnquiries);
        setEnquiriesGroupedByDate(filteredGrouped);
        
        // Update total will be set after client-side filtering
          enquiryInitialLoadRef.current = true;
        }
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      } finally {
        setEnquiriesLoading(false);
        fetchingEnquiriesRef.current = false;
      }
    };

    loadEnquiries();
  }, [activeTab, enquiryPage, enquiryLimit, enquiryFilters.dateFrom, enquiryEnabledFilters.dateRange, salespersonIdentifier]);

  // Debounce search query for enquiries
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEnquirySearchQuery(enquirySearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [enquirySearchQuery]);

  // Extract unique filter options from enquiries
  const enquiryUniqueFilterOptions = React.useMemo(() => {
    const allEnquiries = enquiries || []
    return {
      states: [...new Set(allEnquiries.map(e => e.state).filter(s => s && s !== 'N/A'))].sort(),
      divisions: [...new Set(allEnquiries.map(e => e.division).filter(d => d && d !== 'N/A'))].sort(),
      products: [...new Set(allEnquiries.map(e => e.enquired_product || e.product_name).filter(p => p && p !== 'N/A'))].sort(),
      followUpStatuses: [...new Set(allEnquiries.map(e => e.follow_up_status).filter(s => s && s !== 'N/A'))].sort(),
      salesStatuses: [...new Set(allEnquiries.map(e => e.sales_status).filter(s => s && s !== 'N/A'))].sort(),
      salespersons: [...new Set(allEnquiries.map(e => e.salesperson).filter(s => s && s !== 'N/A'))].sort(),
      telecallers: [...new Set(allEnquiries.map(e => e.telecaller).filter(t => t && t !== 'N/A'))].sort()
    }
  }, [enquiries])

  // Filter and sort enquiries client-side
  const filteredEnquiries = React.useMemo(() => {
    let filtered = [...enquiries];
    
    // Apply search query - search in customer name, business, address, state, product, etc.
    if (debouncedEnquirySearchQuery && debouncedEnquirySearchQuery.trim()) {
      const query = debouncedEnquirySearchQuery.toLowerCase().trim();
      filtered = filtered.filter(e => {
        const customerName = (e.customer_name || e.customer || e.name || '').toLowerCase();
        const business = (e.business || '').toLowerCase();
        const address = (e.address || '').toLowerCase();
        const state = (e.state || '').toLowerCase();
        const product = ((e.enquired_product || e.product_name || '')).toLowerCase();
        const division = (e.division || '').toLowerCase();
        const phone = String(e.phone || e.mobile || '').toLowerCase();
        
        return customerName.includes(query) || 
               business.includes(query) || 
               address.includes(query) ||
               state.includes(query) ||
               product.includes(query) ||
               division.includes(query) ||
               phone.includes(query);
      });
    }
    
    // Apply filters
    Object.entries(enquiryFilters).forEach(([key, value]) => {
      if (enquiryEnabledFilters[key] && value) {
        if (key === 'dateRange' || key === 'dateFrom' || key === 'dateTo') {
          // Date range filtering is handled separately
        } else {
          // Handle product field which might be enquired_product or product_name
          if (key === 'product') {
            filtered = filtered.filter(e => {
              const productValue = e.enquired_product || e.product_name || '';
              return String(productValue).toLowerCase() === String(value).toLowerCase();
            });
          } else {
            const fieldMap = {
              state: 'state',
              division: 'division',
              followUpStatus: 'follow_up_status',
              salesStatus: 'sales_status',
              salesperson: 'salesperson',
              telecaller: 'telecaller'
            }
            if (fieldMap[key]) {
              filtered = filtered.filter(e => {
                const fieldValue = e[fieldMap[key]] || '';
                return String(fieldValue).toLowerCase() === String(value).toLowerCase();
              });
            }
          }
        }
      }
    });
    
    // Date range filter
    if (enquiryEnabledFilters.dateRange) {
      if (enquiryFilters.dateFrom) {
        filtered = filtered.filter(e => {
          const enquiryDate = e.enquiry_date || e.date || '';
          return enquiryDate >= enquiryFilters.dateFrom;
        });
      }
      if (enquiryFilters.dateTo) {
        filtered = filtered.filter(e => {
          const enquiryDate = e.enquiry_date || e.date || '';
          return enquiryDate <= enquiryFilters.dateTo;
        });
      }
    }
    
    // Apply sorting
    if (enquirySortBy && enquirySortBy !== 'none') {
      filtered = filtered.sort((a, b) => {
        let aVal = a[enquirySortBy];
        let bVal = b[enquirySortBy];
        
        if (enquirySortBy === 'enquiry_date' || enquirySortBy === 'date') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }
        
        if (aVal < bVal) return enquirySortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return enquirySortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [enquiries, debouncedEnquirySearchQuery, enquiryFilters, enquiryEnabledFilters, enquirySortBy, enquirySortOrder]);

  // Group filtered enquiries by date
  const filteredEnquiriesGroupedByDate = React.useMemo(() => {
    const grouped = {};
    filteredEnquiries.forEach(enquiry => {
      const date = enquiry.enquiry_date || enquiry.date || '';
      if (date) {
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(enquiry);
      }
    });
    return grouped;
  }, [filteredEnquiries]);

  // Update enquiry total based on filtered results
  React.useEffect(() => {
    if (activeTab === 'enquiry') {
      setEnquiryTotal(filteredEnquiries.length);
      // Reset to page 1 when search query changes
      if (debouncedEnquirySearchQuery) {
        setEnquiryPage(1);
      }
    }
  }, [filteredEnquiries, activeTab, debouncedEnquirySearchQuery]);

  // Enquiry filter handlers
  const handleEnquiryAdvancedFilterChange = React.useCallback((filterKey, value) => {
    setEnquiryFilters(prev => ({ ...prev, [filterKey]: value }));
    setEnquiryPage(1);
  }, []);

  const handleEnquiryToggleFilterSection = React.useCallback((filterKey) => {
    setEnquiryEnabledFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
    if (enquiryEnabledFilters[filterKey]) {
      if (filterKey === 'dateRange') {
        setEnquiryFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
      } else {
        setEnquiryFilters(prev => ({ ...prev, [filterKey]: '' }));
      }
    }
  }, [enquiryEnabledFilters]);

  const handleEnquiryClearFilters = React.useCallback(() => {
    setEnquiryFilters({ state: '', division: '', product: '', followUpStatus: '', salesStatus: '', salesperson: '', telecaller: '', dateFrom: '', dateTo: '' });
    setEnquiryEnabledFilters({ state: false, division: false, product: false, followUpStatus: false, salesStatus: false, salesperson: false, telecaller: false, dateRange: false });
    setEnquiryPage(1);
  }, []);

  const handleEnquirySortChange = React.useCallback((newSortBy) => {
    setEnquirySortBy(newSortBy);
    setEnquiryPage(1);
  }, []);

  const handleEnquirySortOrderChange = React.useCallback((newSortOrder) => {
    setEnquirySortOrder(newSortOrder);
    setEnquiryPage(1);
  }, []);

  // Close enquiry filter panel when clicking outside
  React.useEffect(() => {
    if (!showEnquiryFilters) return;
    
    const handleClickOutside = (event) => {
      const filterPanel = document.getElementById('enquiry-filter-panel');
      const filterButton = document.getElementById('enquiry-filter-button');
      if (filterPanel && !filterPanel.contains(event.target) && !filterButton?.contains(event.target)) {
        setShowEnquiryFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEnquiryFilters]);

  if (initialLoading && activeTab === 'leads') {
    return <DashboardSkeleton />;
  }

  return (
    <main className={`flex-1 overflow-auto p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Tabs */}
      <div className={`border-b mb-4 sm:mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              activeTab === 'leads'
                ? 'border-blue-500 text-blue-600'
                : isDarkMode 
                  ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            Leads
          </button>
          <button
            onClick={() => setActiveTab('enquiry')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              activeTab === 'enquiry'
                ? 'border-blue-500 text-blue-600'
                : isDarkMode 
                  ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
            Enquiry
          </button>
        </nav>
      </div>

      {activeTab === 'leads' && (
        <>
      {/* Search and Action Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
            <div className="flex shadow-lg rounded-xl overflow-hidden flex-1 sm:flex-initial">
              <input 
                type="text" 
                placeholder="Search items..." 
                value={leadsHook.searchQuery} 
                onChange={(e) => leadsHook.setSearchQuery(e.target.value)} 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`} 
              />
              <button className={`px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md`}>
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => leadsHook.setShowFilterPanel(!leadsHook.showFilterPanel)} 
              className={`p-2.5 rounded-xl border-2 inline-flex items-center relative transition-all duration-200 shadow-md ${
                leadsHook.showFilterPanel 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-blue-200/50' 
                  : isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              }`} 
              id="filter-button"
            >
              <Filter className={`h-4 w-4 ${leadsHook.showFilterPanel ? 'text-blue-600' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              {Object.values(leadsHook.enabledFilters).some(Boolean) && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
                  {Object.values(leadsHook.enabledFilters).filter(Boolean).length}
                </span>
              )}
            </button>
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing} 
              className={`p-2.5 rounded-xl border-2 transition-all duration-200 shadow-md ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
              } disabled:opacity-50`} 
              data-refresh-btn
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowAddCustomer(true)} 
              className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30" 
              title="Add Lead"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowImportModal(true)} 
              className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/30" 
              title="Import Leads"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowCreateTagModal(true)} 
              className="p-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/30" 
              title="Create Tag"
            >
              <Tag className="h-4 w-4" />
            </button>
            {selectedLeadsForTag.length > 0 && (
              <button 
                onClick={() => setShowBulkActions(true)} 
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/30"
                title="Bulk Actions"
              >
                Bulk Actions ({selectedLeadsForTag.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters {...leadsHook} sortBy={leadsHook.sortBy} setSortBy={leadsHook.setSortBy} sortOrder={leadsHook.sortOrder} setSortOrder={leadsHook.setSortOrder} handleSortChange={leadsHook.handleSortChange} handleSortOrderChange={leadsHook.handleSortOrderChange} />

      {/* Customer Table */}
        <div className={`rounded-xl shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full">
            <thead className={`bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b-2 ${
              isDarkMode ? 'from-gray-800 via-gray-750 to-gray-800 border-gray-700' : 'border-blue-200'
            }`}>
              <tr>
                <th className="px-2 py-2 text-left text-[10px] font-bold uppercase w-10">
                  <input
                    type="checkbox"
                    checked={selectedLeadsForTag.length > 0 && selectedLeadsForTag.length === leadsHook.paginatedCustomers.length}
                    onChange={handleSelectAllLeadsForTag}
                    className={`w-4 h-4 rounded border-2 focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'text-blue-500 bg-gray-700 border-gray-600' 
                        : 'text-blue-600 bg-white border-gray-300'
                    }`}
                  />
                </th>
                {columnVisibility.leadId && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-purple-600" />
                      <span>LEAD ID</span>
                    </div>
                  </th>
                )}
                {(columnVisibility.namePhone || columnVisibility.email) && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>CUSTOMER</span>
                    </div>
                  </th>
                )}
                {columnVisibility.business && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <span>BUSINESS</span>
                    </div>
                  </th>
                )}
                {columnVisibility.productType && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span>Product Type</span>
                    </div>
                  </th>
                )}
                {columnVisibility.gstNo && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-orange-600" />
                      <span>GST No</span>
                    </div>
                  </th>
                )}
                {columnVisibility.address && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span>ADDRESS</span>
                    </div>
                  </th>
                )}
                {columnVisibility.state && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-600" />
                      <span>STATE</span>
                    </div>
                  </th>
                )}
                {columnVisibility.division && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-600" />
                      <span>Division</span>
                    </div>
                  </th>
                )}
                {columnVisibility.customerType && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-pink-600" />
                      <span>Customer Type</span>
                    </div>
                  </th>
                )}
                {columnVisibility.leadSource && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span>Lead Source</span>
                    </div>
                  </th>
                )}
                {columnVisibility.salesStatus && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span>SALES STATUS</span>
                    </div>
                  </th>
                )}
                {columnVisibility.followUpStatus && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-teal-600" />
                      <span>FOLLOW UP STATUS</span>
                    </div>
                  </th>
                )}
                {columnVisibility.followUpDate && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Follow Up Date</span>
                    </div>
                  </th>
                )}
                {columnVisibility.followUpTime && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Follow Up Time</span>
                    </div>
                  </th>
                )}
                {columnVisibility.date && (
                  <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date</span>
                    </div>
                  </th>
                )}
                <th className={`px-2 py-2 text-left text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    <span>Actions</span>
                    <button 
                      onClick={() => setShowColumnModal(true)} 
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`} 
                      title="Column Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {leadsHook.paginatedCustomers.map((customer) => (
                <tr key={customer.id} className={`transition-colors duration-150 ${
                  isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'
                }`}>
                  <td className="px-2 py-2">
                    {(() => {
                      const priority = getDisplayPriority(customer)
                      return (
                    <label className={`cursor-pointer inline-flex items-center justify-center select-none ${priority === 'CRITICAL' ? 'animate-pulse' : ''}`} title={
                      priority === 'CRITICAL' ? 'Critical – act first' : priority === 'HIGH' ? 'High priority' : priority === 'MEDIUM' ? 'Medium priority' : priority === 'LOW' ? 'Low priority' : 'Lead'
                    }>
                      <input
                        type="checkbox"
                        checked={selectedLeadsForTag.includes(customer.id)}
                        onChange={() => handleToggleLeadForTag(customer.id)}
                        className="sr-only peer"
                      />
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 ${
                        priority === 'CRITICAL'
                          ? selectedLeadsForTag.includes(customer.id)
                            ? 'bg-red-600 border-red-700 ring-2 ring-red-400'
                            : 'bg-red-100 border-red-600 ring-2 ring-red-400 text-red-800'
                          : selectedLeadsForTag.includes(customer.id)
                            ? priority === 'HIGH'
                              ? 'bg-green-500 border-green-600'
                              : priority === 'MEDIUM'
                                ? 'bg-amber-500 border-amber-600'
                                : priority === 'LOW'
                                  ? 'bg-red-500 border-red-600'
                                  : isDarkMode
                                    ? 'bg-blue-500 border-blue-400'
                                    : 'bg-blue-500 border-blue-600'
                            : priority === 'HIGH'
                              ? 'bg-green-100 border-green-500 text-green-700'
                              : priority === 'MEDIUM'
                                ? 'bg-amber-100 border-amber-500 text-amber-700'
                                : priority === 'LOW'
                                  ? 'bg-red-100 border-red-500 text-red-700'
                                  : isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                                    : 'bg-gray-100 border-gray-400 text-gray-600'
                      }`}>
                        {selectedLeadsForTag.includes(customer.id) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </label>
                      ); })()}
                  </td>
                  {columnVisibility.leadId && (
                    <td className={`px-2 py-2 text-xs font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`} title={`Lead ID: ${customer.id}`}>
                      {customer.id}
                    </td>
                  )}
                  {(columnVisibility.namePhone || columnVisibility.email) && (
                    <td className="px-2 py-2">
                      <div className="space-y-1">
                        {columnVisibility.namePhone && (
                          <div className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`} title={customer.name}>
                            {truncateText(customer.name, 30)}
                          </div>
                        )}
                        {columnVisibility.namePhone && (
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} title={customer.phone}>
                            {truncateText(customer.phone, 15)}
                          </div>
                        )}
                        {columnVisibility.email && customer.email !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <Mail className={`h-3 w-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <a 
                              href={`mailto:${customer.email}`} 
                              className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                              title={customer.email}
                            >
                              {truncateText(customer.email, 25)}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  {columnVisibility.business && (
                    <td className={`px-2 py-2 text-xs font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`} title={customer.business}>
                      {truncateText(customer.business, 30)}
                    </td>
                  )}
                  {columnVisibility.productType && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title={customer.productName !== 'N/A' ? customer.productName : ''}>
                      {customer.productName !== 'N/A' ? truncateText(customer.productName, 20) : '-'}
                    </td>
                  )}
                  {columnVisibility.gstNo && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title={customer.gstNo !== 'N/A' ? customer.gstNo : ''}>
                      {customer.gstNo !== 'N/A' ? truncateText(customer.gstNo, 15) : '-'}
                    </td>
                  )}
                  {columnVisibility.address && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title={customer.address}>
                      <div className="whitespace-pre-line">{truncateText(customer.address, 60)}</div>
                    </td>
                  )}
                  {columnVisibility.state && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title={customer.state}>
                      {truncateText(customer.state, 20)}
                    </td>
                  )}
                  {columnVisibility.division && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title={customer.division || ''}>
                      {customer.division ? truncateText(customer.division, 20) : '-'}
                    </td>
                  )}
                  {columnVisibility.customerType && (
                    <td className="px-2 py-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 shadow-sm ${
                        isDarkMode ? 'from-blue-900/50 to-purple-900/50 text-blue-200 border-blue-700' : ''
                      }`} title={customer.customerType}>
                        {truncateText(customer.customerType, 15)}
                      </span>
                    </td>
                  )}
                  {columnVisibility.leadSource && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} title={customer.enquiryBy !== 'N/A' ? customer.enquiryBy : ''}>
                      {customer.enquiryBy !== 'N/A' ? truncateText(customer.enquiryBy, 20) : '-'}
                    </td>
                  )}
                  {columnVisibility.salesStatus && (
                    <td className="px-2 py-2">
                      <div className="space-y-1">
                        <InlineStatusDropdown
                          value={customer.salesStatus}
                          leadId={customer.id}
                          onChange={(id, status) => handleInlineStatusChange(id, 'salesStatus', status)}
                        />
                        {customer.salesStatusRemark && (
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} title={customer.salesStatusRemark}>
                            "{truncateText(customer.salesStatusRemark, 40)}"
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  {columnVisibility.followUpStatus && (
                    <td className="px-2 py-2">
                      <InlineFollowUpStatusCell
                        value={customer.followUpStatus}
                        leadId={customer.id}
                        followUpDate={customer.followUpDate}
                        followUpTime={customer.followUpTime}
                        followUpRemark={customer.followUpRemark}
                        onChange={(id, status) => handleInlineStatusChange(id, 'followUpStatus', status)}
                        onAppointmentChange={handleAppointmentChange}
                        isDarkMode={isDarkMode}
                      />
                    </td>
                  )}
                  {columnVisibility.followUpDate && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {customer.followUpDate || '-'}
                    </td>
                  )}
                  {columnVisibility.followUpTime && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {customer.followUpTime || '-'}
                    </td>
                  )}
                  {columnVisibility.date && (
                    <td className={`px-2 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {customer.date ? new Date(customer.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                  )}
                  <td className="px-2 py-2">
                    <div className="relative action-menu-container">
                      <button 
                        onClick={() => setActionMenuOpen(actionMenuOpen === customer.id ? null : customer.id)} 
                        className={`p-2 rounded-lg transition-all duration-200 shadow-sm ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`} 
                        title="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {actionMenuOpen === customer.id && (
                        <div className={`absolute right-0 top-full mt-1 z-50 rounded-lg shadow-xl border min-w-[180px] ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-200'
                        }`} style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                          <button 
                            onClick={() => { handleView(customer); setActionMenuOpen(null) }} 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-blue-50 text-gray-700'
                            }`}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                            <span>View</span>
                          </button>
                          <button 
                            onClick={() => { handleEdit(customer); setActionMenuOpen(null) }} 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-green-50 text-gray-700'
                            }`}
                          >
                            <Pencil className="h-4 w-4 text-green-600" />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => { handleEditLeadStatus(customer); setActionMenuOpen(null) }} 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-orange-50 text-gray-700'
                            }`}
                          >
                            <Settings className="h-4 w-4 text-orange-600" />
                            <span>Update Status</span>
                          </button>
                          <button 
                            onClick={() => { handleQuotation(customer); setActionMenuOpen(null) }} 
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-purple-50 text-gray-700'
                            }`}
                          >
                            <FileText className="h-4 w-4 text-purple-600" />
                            <span>Create Quotation</span>
                          </button>
                          <button
                            onClick={() => { openPricingModal(customer); setActionMenuOpen(null) }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isDarkMode
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-indigo-50 text-gray-700'
                            }`}
                          >
                            <ShieldCheck className="h-4 w-4 text-indigo-600" />
                            <span>Pricing / RFP</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={`px-4 py-4 border-t-2 flex items-center justify-between ${
          isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Page <span className="font-bold text-blue-600">{leadsHook.currentPage}</span> of <span className="font-bold text-purple-600">{totalPages}</span>
            </span>
            <select 
              value={leadsHook.itemsPerPage} 
              onChange={(e) => { leadsHook.setItemsPerPage(Number(e.target.value)); leadsHook.setCurrentPage(1) }} 
              className={`ml-2 px-3 py-1.5 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
              }`}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => leadsHook.setCurrentPage(1)} 
              disabled={leadsHook.currentPage === 1} 
              className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:hover:bg-white'
              }`}
            >
              First
            </button>
            <button 
              onClick={goToPreviousPage} 
              disabled={leadsHook.currentPage === 1} 
              className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:hover:bg-white'
              }`}
            >
              Previous
            </button>
            <button 
              onClick={goToNextPage} 
              disabled={leadsHook.currentPage === totalPages} 
              className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-400 disabled:hover:bg-white'
              }`}
            >
              Next
            </button>
            <button 
              onClick={() => leadsHook.setCurrentPage(totalPages)} 
              disabled={leadsHook.currentPage === totalPages} 
              className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-400 disabled:hover:bg-white'
              }`}
            >
              Last
            </button>
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'enquiry' && (
        <>
          {/* Enquiry Search and Action Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
                <div className="flex shadow-lg rounded-xl overflow-hidden flex-1 sm:flex-initial">
                  <input 
                    type="text" 
                    placeholder="Search items..." 
                    value={enquirySearchQuery} 
                    onChange={(e) => setEnquirySearchQuery(e.target.value)} 
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`} 
                  />
                  <button className={`px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md flex-shrink-0`}>
                    <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowEnquiryFilters(!showEnquiryFilters)} 
                  className={`p-2.5 rounded-xl border-2 inline-flex items-center relative transition-all duration-200 shadow-md ${
                    showEnquiryFilters 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-blue-200/50' 
                      : isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`} 
                  id="enquiry-filter-button"
                >
                  <Filter className={`h-4 w-4 ${showEnquiryFilters ? 'text-blue-600' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  {Object.values(enquiryEnabledFilters).some(Boolean) && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
                      {Object.values(enquiryEnabledFilters).filter(Boolean).length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => fetchEnquiries(true)} 
                  disabled={enquiriesLoading} 
                  className={`p-2.5 rounded-xl border-2 transition-all duration-200 shadow-md ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                  } disabled:opacity-50`}
                >
                  <RefreshCw className={`h-4 w-4 ${enquiriesLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Enquiry Filters */}
          <EnquiryFilters 
            showFilterPanel={showEnquiryFilters}
            setShowFilterPanel={setShowEnquiryFilters}
            enabledFilters={enquiryEnabledFilters}
            advancedFilters={enquiryFilters}
            getUniqueFilterOptions={enquiryUniqueFilterOptions}
            handleAdvancedFilterChange={handleEnquiryAdvancedFilterChange}
            toggleFilterSection={handleEnquiryToggleFilterSection}
            clearAdvancedFilters={handleEnquiryClearFilters}
            sortBy={enquirySortBy}
            setSortBy={setEnquirySortBy}
            sortOrder={enquirySortOrder}
            setSortOrder={setEnquirySortOrder}
            handleSortChange={handleEnquirySortChange}
            handleSortOrderChange={handleEnquirySortOrderChange}
          />

          {/* Enquiry Table */}
          {enquiriesLoading && enquiryPage === 1 ? (
            <DashboardSkeleton />
          ) : (
            <>
              <EnquiryTable 
                enquiries={filteredEnquiries}
                loading={enquiriesLoading}
                groupedByDate={filteredEnquiriesGroupedByDate}
                onRefresh={() => fetchEnquiries(true)}
                visibleColumns={{
                  customer_name: true,
                  business: true,
                  address: true,
                  state: true,
                  division: true,
                  enquired_product: true,
                  product_quantity: true,
                  follow_up_status: false,
                  follow_up_remark: false,
                  sales_status: false,
                  salesperson: false,
                  telecaller: false,
                  enquiry_date: false
                }}
              />
              
              {/* Enquiry Pagination */}
              {enquiryTotal > 0 && (
                <div className={`mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-4 py-4 border-t rounded-lg overflow-x-auto ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                    <span className={`text-xs sm:text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Show:</span>
                    <select
                      value={enquiryLimit}
                      onChange={(e) => {
                        setEnquiryPage(1);
                        setEnquiryLimit(Number(e.target.value));
                      }}
                      className={`px-3 py-1 border rounded-md text-xs sm:text-sm flex-shrink-0 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className={`text-xs sm:text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Showing {((enquiryPage - 1) * enquiryLimit) + 1} to {Math.min(enquiryPage * enquiryLimit, enquiryTotal)} of {enquiryTotal} enquiries
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => setEnquiryPage(1)}
                      disabled={enquiryPage === 1}
                      className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      First
                    </button>
                    <button
                      onClick={() => setEnquiryPage(p => Math.max(1, p - 1))}
                      disabled={enquiryPage === 1}
                      className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <span className={`text-xs sm:text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Page {enquiryPage} of {Math.ceil(enquiryTotal / enquiryLimit) || 1}
                    </span>
                    <button
                      onClick={() => setEnquiryPage(p => p < Math.ceil(enquiryTotal / enquiryLimit) ? p + 1 : p)}
                      disabled={enquiryPage >= Math.ceil(enquiryTotal / enquiryLimit)}
                      className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setEnquiryPage(Math.ceil(enquiryTotal / enquiryLimit))}
                      disabled={enquiryPage >= Math.ceil(enquiryTotal / enquiryLimit)}
                      className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {viewingCustomer && (
        <CustomerDetailSidebar
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onEdit={() => {
            setEditingCustomer(viewingCustomer)
            setViewingCustomer(null)
            setShowAddCustomer(true)
          }}
          onQuotation={handleQuotation}
          quotations={quotationHook.quotations}
          onViewQuotation={handleViewQuotation}
          onEditQuotation={handleEditQuotation}
          onDeleteQuotation={quotationHook.handleDeleteQuotation}
          onCreatePI={(quotation, customer) => {
            setSelectedQuotationForPI(quotation)
            setViewingCustomerForQuotation(customer)
            setShowCreatePIModal(true)
            setViewingCustomer(null)
          }}
          quotationPIs={piHook.quotationPIs}
          piHook={piHook}
          onViewPI={piHook.handleViewPI}
        />
      )}
      {showAddCustomer && <AddCustomerForm onClose={() => { setShowAddCustomer(false); setEditingCustomer(null) }} onSave={handleSaveCustomer} editingCustomer={editingCustomer} />}
      
      {/* Duplicate Lead Modal */}
      {showDuplicateModal && duplicateLeadInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Duplicate Lead Found</h3>
                    <p className="text-sm text-gray-600">This lead already exists in the system</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false)
                    setDuplicateLeadInfo(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-red-800 mb-2">Lead not added due to duplicate entry.</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <span className="font-semibold">Business Name:</span>{' '}
                    <span className="text-gray-900">{duplicateLeadInfo.business || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Assigned Salesperson:</span>{' '}
                    <span className="text-gray-900">
                      {duplicateLeadInfo.assignedSalesperson && duplicateLeadInfo.assignedSalesperson !== 'N/A' 
                        ? duplicateLeadInfo.assignedSalesperson 
                        : 'Contact to your Department Head'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowDuplicateModal(false)
                    setDuplicateLeadInfo(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* RFP ID Validation Modal - Must be validated before opening Create Quotation */}
      {showRfpIdValidationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[115] p-4">
          <div className={`w-full max-w-md rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Validate RFP ID</h2>
                <button
                  onClick={() => {
                    setShowRfpIdValidationModal(false)
                    setRfpIdInput('')
                    setValidatedRfpDecision(null)
                    setValidationError('')
                    setViewingCustomerForQuotation(null)
                  }}
                  className="p-1 rounded-lg hover:bg-black/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Please enter your RFP ID to proceed with creating quotation.
              </p>
              {viewingCustomerForQuotation && (
                <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Lead: <span className="font-semibold">{viewingCustomerForQuotation.name || viewingCustomerForQuotation.business || '—'}</span>
                  {viewingCustomerForQuotation.business && viewingCustomerForQuotation.name !== viewingCustomerForQuotation.business && (
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}> ({viewingCustomerForQuotation.business})</span>
                  )}
                </p>
              )}
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  RFP ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={rfpIdInput}
                  onChange={(e) => {
                    setRfpIdInput(e.target.value)
                    setValidationError('')
                  }}
                  placeholder="Enter RFP ID (e.g., RFP-202412-0001)"
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                    validationError
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                      : validatedRfpDecision
                      ? 'border-green-400 focus:ring-green-500 focus:border-green-500'
                      : isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  disabled={validatingRfpId || !!validatedRfpDecision}
                  autoFocus
                />
                {validationError && (
                  <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
                {validatedRfpDecision && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ RFP ID validated successfully! Opening quotation form...
                  </p>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRfpIdValidationModal(false)
                    setRfpIdInput('')
                    setValidatedRfpDecision(null)
                    setValidationError('')
                    setViewingCustomerForQuotation(null)
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleValidateRfpId}
                  disabled={validatingRfpId || !rfpIdInput.trim() || !!validatedRfpDecision}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    validatedRfpDecision
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {validatingRfpId ? 'Validating...' : validatedRfpDecision ? '✓ Validated' : 'Validate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showCreateQuotation && viewingCustomerForQuotation && <CreateQuotationForm customer={viewingCustomerForQuotation} user={user} existingQuotation={editingQuotation} onClose={() => { setShowCreateQuotation(false); setViewingCustomerForQuotation(null); setEditingQuotation(null); setRfpIdInput(''); setValidatedRfpDecision(null); sessionStorage.removeItem('pricingRfpDecisionId'); sessionStorage.removeItem('pricingRfpDecisionData'); }} onSave={handleSaveQuotation} />}
      {showPricingModal && pricingLead && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120] p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            {/* Fixed Header */}
            <div className={`flex items-start justify-between gap-4 p-6 pb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <div>
                <h2 className="text-lg font-semibold">Pricing & RFP Decision</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Lead: {pricingLead.name}
                </p>
              </div>
              <button onClick={closePricingModal} className="p-2 rounded-lg hover:bg-black/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(pricingError || rfpValidationErrors.general) && (
                <div className={`px-4 py-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-rose-900/30 text-rose-300 border-rose-700' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  <p className="font-semibold text-sm mb-1">Validation Errors:</p>
                  <p className="text-sm">{pricingError || rfpValidationErrors.general}</p>
                  {Object.keys(rfpValidationErrors.products).length > 0 && (
                    <p className="text-xs mt-2 opacity-90">
                      Please check the highlighted fields below for specific errors.
                    </p>
                  )}
                </div>
            )}
              {/* Product Combobox */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Add Products
                </label>
                <div className="relative" ref={productDropdownRef}>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onFocus={() => setShowProductDropdown(true)}
                        onKeyDown={handleProductSearchKeyPress}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'}`}
                        placeholder="Click to see all products or type to search..."
                      />
                      
                      {/* Dropdown List – all products & types when focused */}
                      {showProductDropdown && (
                        <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-xl max-h-80 overflow-y-auto ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                          {filteredProducts.length > 0 ? (
                            <div className="py-1">
                              {filteredProducts.map((product, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleAddProduct(product.name)}
                                  className={`w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900'}`}
                                >
                                  {product.name}
                                </button>
                              ))}
                  </div>
                ) : (
                            <div className={`px-4 py-2.5 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No products found. Press Enter to add as custom product.
                            </div>
                          )}
                          {productSearch.trim() && !filteredProducts.some(p => p.name.toLowerCase() === productSearch.toLowerCase()) && (
                            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-1`}>
                              <button
                                type="button"
                                onClick={() => handleAddProduct()}
                                className={`w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm font-medium ${isDarkMode ? 'text-emerald-400 hover:bg-gray-700' : 'text-emerald-600'}`}
                              >
                                + Add "{productSearch}" as custom product
                              </button>
              </div>
                          )}
                  </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddProduct()}
                      disabled={!productSearch.trim()}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap text-sm"
                    >
                      Add
                    </button>
                  </div>
              </div>
            </div>

              {/* Products List */}
              {rfpForm.products.length > 0 && (
                      <div className="space-y-3">
                  {rfpForm.products.map((product, index) => {
                    const inStock = product.stockStatus && (product.stockStatus.status === 'available' || product.stockStatus.status === 'limited' || Number(product.stockStatus.quantity || 0) > 0)
                    const hasPrice = !!product.approvedPrice
                    const needsRfpForProduct = (() => {
                      const isCustom = isCustomProduct(product.productSpec)
                      if (isCustom) return true
                      return !hasPrice
                    })()
                    return (
                      <div key={index} className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {product.productSpec}
                            </h4>
                            {/* Stock Status */}
                            <div className="mt-2 flex items-center gap-4 text-xs">
                              {product.stockLoading ? (
                                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Checking stock...</span>
                              ) : product.stockStatus ? (
                                <span className={`font-medium ${inStock ? 'text-emerald-600' : 'text-red-600'}`}>
                                  Stock: {inStock ? 'Available' : 'Not Available'} 
                                  {product.stockStatus.quantity && ` (${product.stockStatus.quantity} ${product.stockStatus.unit || ''})`}
                                </span>
                              ) : (
                                <span className={`font-medium text-orange-600`}>Stock: Not Found</span>
                              )}
                              {product.approvedPrice ? (
                                <span className={`font-medium text-emerald-600`}>
                                  Price: ₹{Number(product.approvedPrice.unit_price || 0).toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className={`font-medium text-red-600`}>Price: Not Available</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(index)}
                            className="ml-2 px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {/* Quantity Field (mandatory for all products) */}
                          <div>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                step="0.01"
                                className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                                  rfpValidationErrors.products[index]?.quantity
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200'
                                }`}
                                placeholder="Quantity *"
                                value={product.quantity}
                                onChange={(e) => {
                                  handleProductQuantityChange(index, e.target.value)
                                  if (rfpValidationErrors.products[index]?.quantity) {
                                    setRfpValidationErrors(prev => ({
                                      ...prev,
                                      products: {
                                        ...prev.products,
                                        [index]: { ...prev.products[index], quantity: '' }
                                      }
                                    }))
                                  }
                                }}
                              />
                              <select
                                className={`w-32 rounded-lg border px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200'}`}
                                value={product.quantityUnit || 'Mtr'}
                                onChange={(e) => handleProductQuantityUnitChange(index, e.target.value)}
                              >
                                <option value="Mtr">Meters</option>
                                <option value="Ft">Feet</option>
                                <option value="In">Inches</option>
                                <option value="Yd">Yards</option>
                                <option value="Km">Kilometers</option>
                                <option value="Cm">Centimeters</option>
                                <option value="Mm">Millimeters</option>
                                <option value="Miles">Miles</option>
                                <option value="Kg">Kg</option>
                                <option value="Nos">Nos</option>
                              </select>
                            </div>
                            {rfpValidationErrors.products[index]?.quantity && (
                              <p className="mt-1 text-xs text-red-600">{rfpValidationErrors.products[index].quantity}</p>
                            )}
                          </div>
                          
                          {/* Target Price Field */}
                          <div>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                                rfpValidationErrors.products[index]?.targetPrice
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                  : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200'
                              }`}
                              placeholder="Target Price (₹) (optional)"
                              value={product.targetPrice}
                              onChange={(e) => {
                                const value = e.target.value
                                // Only allow integers (no decimals)
                                if (value === '' || /^\d+$/.test(value)) {
                                  handleProductTargetPriceChange(index, value)
                                  // Clear error when user starts typing
                                  if (rfpValidationErrors.products[index]?.targetPrice) {
                                    setRfpValidationErrors(prev => ({
                                      ...prev,
                                      products: {
                                        ...prev.products,
                                        [index]: {
                                          ...prev.products[index],
                                          targetPrice: ''
                                        }
                                      }
                                    }))
                                  }
                                }
                              }}
                            />
                            {rfpValidationErrors.products[index]?.targetPrice && (
                              <p className="mt-1 text-xs text-red-600">{rfpValidationErrors.products[index].targetPrice}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Common Fields */}
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Delivery Timeline (Required By Date) *
                  </label>
                  <input
                    type="date"
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      rfpValidationErrors.deliveryTimeline
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
                    }`}
                    placeholder="Select delivery date"
                    value={rfpForm.deliveryTimeline}
                    onChange={(e) => {
                      setRfpForm((prev) => ({ ...prev, deliveryTimeline: e.target.value }))
                      // Clear error when user selects a date
                      if (rfpValidationErrors.deliveryTimeline) {
                        setRfpValidationErrors(prev => ({ ...prev, deliveryTimeline: '' }))
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {rfpValidationErrors.deliveryTimeline && (
                    <p className="mt-1 text-xs text-red-600">{rfpValidationErrors.deliveryTimeline}</p>
                  )}
                  {rfpForm.deliveryTimeline && !rfpValidationErrors.deliveryTimeline && (
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Delivery required by: {new Date(rfpForm.deliveryTimeline).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
                <textarea
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200'}`}
                  rows={3}
                  placeholder="Special Requirements"
                  value={rfpForm.specialRequirements}
                  onChange={(e) => setRfpForm((prev) => ({ ...prev, specialRequirements: e.target.value }))}
                />
              </div>

            </div>

            {/* Fixed Footer */}
            <div className={`p-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0 space-y-3`}>
              {/* RFP ID Display */}
              {savedRfpId && (
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>RFP ID:</p>
                      <p className={`text-sm font-mono font-bold ${isDarkMode ? 'text-emerald-200' : 'text-emerald-900'}`}>{savedRfpId}</p>
                    </div>
                <button
                      onClick={handleCopyRfpId}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-emerald-800' : 'hover:bg-emerald-100'}`}
                      title="Copy RFP ID"
                    >
                      <Copy className={`h-4 w-4 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDecision}
                  disabled={savingDecision || !canSaveDecision()}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white ${
                    savingDecision || !canSaveDecision()
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {savingDecision ? 'Saving...' : savedRfpId ? 'Saved' : 'Save Decision'}
                </button>
                <button
                  onClick={handleRaiseRfp}
                  disabled={pricingLoading || !canRaiseRfp()}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white ${
                    pricingLoading || !canRaiseRfp()
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {pricingLoading ? 'Raising RFP...' : `Raise RFP${rfpForm.products.length > 1 ? ` (${rfpForm.products.length} products)` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCreatePIModal && selectedQuotationForPI && viewingCustomerForQuotation && <CreatePIForm quotation={selectedQuotationForPI} customer={viewingCustomerForQuotation} user={user} modal={true} onClose={async (savedPI) => { 
        setShowCreatePIModal(false)
        if (selectedQuotationForPI?.id) {
          await piHook.fetchPIsForQuotation(selectedQuotationForPI.id)
        }
        setTimeout(() => {
          setSelectedQuotationForPI(null)
        }, 100)
      }} />}
      {quotationHook.showQuotationPopup && quotationHook.quotationPopupData && <QuotationPreview quotationData={quotationHook.quotationPopupData} companyBranches={companyBranches} user={user} onClose={() => quotationHook.setShowQuotationPopup(false)} />}
      {piHook.showPIPreview && piHook.savedPiPreview && (
        <PIPreview
          // Merge core PI preview data with template + branch metadata
          piData={{
            ...piHook.savedPiPreview.data,
            template: piHook.savedPiPreview.template,
            selectedBranch: piHook.savedPiPreview.selectedBranch
          }}
          companyBranches={companyBranches}
          user={user}
          onClose={() => piHook.setShowPIPreview(false)}
        />
      )}
      <ImportLeadsModal show={showImportModal} onClose={() => setShowImportModal(false)} onImportSuccess={handleImportSuccess} />
      <ColumnVisibilityModal show={showColumnModal} onClose={() => setShowColumnModal(false)} columns={{ leadId: 'Lead ID', namePhone: 'Name/Phone', email: 'Email', business: 'Business', productType: 'Product Type', gstNo: 'GST No', address: 'Address', state: 'State', division: 'Division', customerType: 'Customer Type', leadSource: 'Lead Source', salesStatus: 'Sales Status', followUpStatus: 'Follow Up Status', followUpDate: 'Follow Up Date', followUpTime: 'Follow Up Time', date: 'Date' }} visibleColumns={columnVisibility} onToggleColumn={handleToggleColumn} />
      <TagManager showCreateTagModal={showCreateTagModal} setShowCreateTagModal={setShowCreateTagModal} newTagName={newTagName} setNewTagName={setNewTagName} selectedLeadsForTag={selectedLeadsForTag} setSelectedLeadsForTag={setSelectedLeadsForTag} customers={leadsHook.customers} setCustomers={leadsHook.setCustomers} isCreatingTag={isCreatingTag} setIsCreatingTag={setIsCreatingTag} handleToggleLeadForTag={handleToggleLeadForTag} handleSelectAllLeadsForTag={handleSelectAllLeadsForTag} />
      
      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bulk Actions ({selectedLeadsForTag.length} selected)
              </h3>
              <button
                onClick={() => {
                  setShowBulkActions(false)
                  setBulkTagValue('')
                  setBulkSkuValue('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="tag"
                      checked={bulkActionType === 'tag'}
                      onChange={(e) => setBulkActionType(e.target.value)}
                      className="mr-2"
                    />
                    <span>Create/Add Tag</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="sku"
                      checked={bulkActionType === 'sku'}
                      onChange={(e) => setBulkActionType(e.target.value)}
                      className="mr-2"
                    />
                    <span>Change SKU/Product Type</span>
                  </label>
                </div>
              </div>

              {bulkActionType === 'tag' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={bulkTagValue}
                    onChange={(e) => setBulkTagValue(e.target.value)}
                    placeholder="Enter tag name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU/Product Type
                  </label>
                  <input
                    type="text"
                    value={bulkSkuValue}
                    onChange={(e) => setBulkSkuValue(e.target.value)}
                    placeholder="Enter SKU or Product Type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkActions(false)
                  setBulkTagValue('')
                  setBulkSkuValue('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={bulkActionType === 'tag' ? handleBulkTagChange : handleBulkSkuChange}
                disabled={isCreatingTag}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isCreatingTag ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Status Modal */}
      {showEditLeadStatusModal && selectedCustomerForLeadStatus && (
        <EditLeadStatusModal
          lead={selectedCustomerForLeadStatus}
          onClose={() => {
            setShowEditLeadStatusModal(false);
            setSelectedCustomerForLeadStatus(null);
          }}
          onSave={handleUpdateLeadStatus}
        />
      )}
    </main>
  )
}
