/**
 * RFP Helper Utilities - Algorithm-based helper functions
 * Reusable functions for RFP data processing and transformation
 */

/**
 * Determines if a product needs RFP
 * @param {Object} product - Product object
 * @param {Function} isCustomProduct - Function to check if product is custom
 * @param {Function} hasPrice - Function to check if product has approved price
 * @returns {boolean}
 */
export const productNeedsRfp = (product, isCustomProduct, hasPrice) => {
  const isCustom = isCustomProduct(product.productSpec)
  if (isCustom) return true
  const hasApprovedPrice = hasPrice(product)
  return !hasApprovedPrice
}

/**
 * Filters products that need RFP
 * @param {Array} products - Array of products
 * @param {Function} isCustomProduct - Function to check if product is custom
 * @param {Function} hasPrice - Function to check if product has approved price
 * @returns {Array} Filtered products array
 */
export const filterProductsNeedingRfp = (products, isCustomProduct, hasPrice) => {
  if (!Array.isArray(products)) return []
  return products.filter(product => productNeedsRfp(product, isCustomProduct, hasPrice))
}

/**
 * Determines availability status for a product
 * @param {Object} product - Product object with stockStatus and approvedPrice
 * @param {Function} isCustomProduct - Function to check if product is custom
 * @returns {string} Availability status
 */
export const determineAvailabilityStatus = (product, isCustomProduct) => {
  const isCustom = isCustomProduct(product.productSpec)
  
  if (isCustom) {
    return 'custom_product_pricing_needed'
  }

  const inStock = product.stockStatus && (
    product.stockStatus.status === 'available' || 
    product.stockStatus.status === 'limited' || 
    Number(product.stockStatus.quantity || 0) > 0
  )
  const hasPrice = !!product.approvedPrice

  if (inStock && !hasPrice) {
    return 'in_stock_price_unavailable'
  } else if (!inStock && !hasPrice) {
    return 'not_in_stock_price_unavailable'
  }

  // Default fallback
  return 'not_in_stock_price_unavailable'
}

/**
 * Transforms product data for RFP creation
 * @param {Object} product - Product object
 * @param {Function} isCustomProduct - Function to check if product is custom
 * @returns {Object} Transformed product object
 */
export const transformProductForRfp = (product, isCustomProduct) => {
  const availabilityStatus = determineAvailabilityStatus(product, isCustomProduct)
  
  return {
    productSpec: product.productSpec || '',
    quantity: product.quantity || '',
    length: product.length || '',
    lengthUnit: product.lengthUnit || 'Mtr',
    targetPrice: product.targetPrice || '',
    availabilityStatus: availabilityStatus
  }
}

/**
 * Transforms array of products for RFP creation
 * @param {Array} products - Array of products
 * @param {Function} isCustomProduct - Function to check if product is custom
 * @returns {Array} Transformed products array
 */
export const transformProductsArrayForRfp = (products, isCustomProduct) => {
  if (!Array.isArray(products)) return []
  
  return products
    .map(product => transformProductForRfp(product, isCustomProduct))
    .filter(product => product.productSpec && product.productSpec.trim() !== '')
}

/**
 * Calculates total quantity from products array
 * @param {Array} products - Array of products
 * @returns {number} Total quantity
 */
export const calculateTotalQuantity = (products) => {
  if (!Array.isArray(products)) return 0
  return products.reduce((sum, product) => {
    const quantity = parseFloat(product.quantity) || 0
    return sum + quantity
  }, 0)
}

/**
 * Formats RFP status for display
 * @param {string} status - RFP status
 * @returns {Object} { label: string, color: string, icon: string }
 */
export const formatRfpStatus = (status) => {
  const statusMap = {
    pending_dh: {
      label: 'Pending DH Approval',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: 'Clock'
    },
    approved: {
      label: 'Approved',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: 'CheckCircle'
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: 'XCircle'
    },
    pricing_ready: {
      label: 'Pricing Ready',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: 'FileText'
    }
  }

  return statusMap[status] || {
    label: status || 'Unknown',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: 'FileText'
  }
}

/**
 * Groups RFPs by status
 * @param {Array} rfps - Array of RFP objects
 * @returns {Object} Grouped RFPs by status
 */
export const groupRfpsByStatus = (rfps) => {
  if (!Array.isArray(rfps)) return {}
  
  return rfps.reduce((groups, rfp) => {
    const status = rfp.status || 'unknown'
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(rfp)
    return groups
  }, {})
}

/**
 * Filters RFPs by search query
 * @param {Array} rfps - Array of RFP objects
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered RFPs
 */
export const filterRfpsBySearch = (rfps, searchQuery) => {
  if (!Array.isArray(rfps)) return []
  if (!searchQuery || searchQuery.trim() === '') return rfps

  const query = searchQuery.toLowerCase().trim()
  
  return rfps.filter(rfp => {
    // Search in RFP ID
    if (rfp.rfp_id && rfp.rfp_id.toLowerCase().includes(query)) {
      return true
    }

    // Search in lead ID
    if (rfp.lead_id && `ld-${rfp.lead_id}`.toLowerCase().includes(query)) {
      return true
    }

    // Search in customer name
    if (rfp.customer_name && rfp.customer_name.toLowerCase().includes(query)) {
      return true
    }

    // Search in products
    if (rfp.products && Array.isArray(rfp.products)) {
      const productMatch = rfp.products.some(product => 
        product.product_spec && product.product_spec.toLowerCase().includes(query)
      )
      if (productMatch) return true
    }

    // Search in product_spec (backward compatibility)
    if (rfp.product_spec && rfp.product_spec.toLowerCase().includes(query)) {
      return true
    }

    return false
  })
}

/**
 * Sorts RFPs by date (newest first)
 * @param {Array} rfps - Array of RFP objects
 * @returns {Array} Sorted RFPs
 */
export const sortRfpsByDate = (rfps, ascending = false) => {
  if (!Array.isArray(rfps)) return []
  
  return [...rfps].sort((a, b) => {
    const dateA = new Date(a.created_at || 0)
    const dateB = new Date(b.created_at || 0)
    
    if (ascending) {
      return dateA - dateB
    }
    return dateB - dateA
  })
}
