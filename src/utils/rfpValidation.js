/**
 * RFP Validation Utilities - Algorithm-based validation functions
 * Centralized validation logic for RFP forms and data
 */

// Validation Constants
export const RFP_VALIDATION_RULES = {
  PRODUCT: {
    PRODUCT_SPEC: {
      required: true,
      minLength: 1,
      maxLength: 500,
      pattern: /^.+$/
    },
    QUANTITY: {
      required: true,
      min: 0.01,
      max: 999999999,
      type: 'number'
    },
    LENGTH: {
      required: true,
      min: 0.01,
      max: 999999,
      type: 'number'
    },
    TARGET_PRICE: {
      required: true,
      min: 0.01,
      max: 999999999,
      type: 'number'
    },
    AVAILABILITY_STATUS: {
      required: true,
      allowedValues: [
        'custom_product_pricing_needed',
        'in_stock_price_unavailable',
        'not_in_stock_price_unavailable'
      ]
    }
  },
  DELIVERY_TIMELINE: {
    required: false,
    cannotBePast: true
  },
  SPECIAL_REQUIREMENTS: {
    maxLength: 2000,
    optional: true
  }
}

/**
 * Validates a single product field
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value to validate
 * @param {Object} rules - Validation rules for the field
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateProductField = (fieldName, value, rules) => {
  const trimmedValue = typeof value === 'string' ? value.trim() : value
  const errors = []

  // Required check
  if (rules.required) {
    if (trimmedValue === '' || trimmedValue === null || trimmedValue === undefined) {
      return {
        isValid: false,
        error: `${fieldName} is required`
      }
    }
  }

  // Skip further validation if field is empty and not required
  if (!trimmedValue && !rules.required) {
    return { isValid: true, error: '' }
  }

  // Type validation
  if (rules.type === 'number') {
    const numValue = parseFloat(trimmedValue)
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${fieldName} must be a valid number`
      }
    }
    if (rules.min !== undefined && numValue < rules.min) {
      return {
        isValid: false,
        error: `${fieldName} must be greater than or equal to ${rules.min}`
      }
    }
    if (rules.max !== undefined && numValue > rules.max) {
      return {
        isValid: false,
        error: `${fieldName} must be less than or equal to ${rules.max}`
      }
    }
  }

  // String length validation
  if (typeof trimmedValue === 'string') {
    if (rules.minLength && trimmedValue.length < rules.minLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${rules.minLength} characters`
      }
    }
    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} must not exceed ${rules.maxLength} characters`
      }
    }
    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      return {
        isValid: false,
        error: `${fieldName} format is invalid`
      }
    }
  }

  // Allowed values validation
  if (rules.allowedValues && !rules.allowedValues.includes(trimmedValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${rules.allowedValues.join(', ')}`
    }
  }

  return { isValid: true, error: '' }
}

/**
 * Validates delivery timeline
 * @param {string} deliveryTimeline - Date string
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateDeliveryTimeline = (deliveryTimeline) => {
  const rules = RFP_VALIDATION_RULES.DELIVERY_TIMELINE
  const trimmedValue = deliveryTimeline?.trim() || ''

  if (rules.required && !trimmedValue) {
    return {
      isValid: false,
      error: 'Delivery Timeline is required'
    }
  }

  if (trimmedValue && rules.cannotBePast) {
    const selectedDate = new Date(trimmedValue)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(selectedDate.getTime())) {
      return {
        isValid: false,
        error: 'Delivery Timeline must be a valid date'
      }
    }

    if (selectedDate < today) {
      return {
        isValid: false,
        error: 'Delivery date cannot be in the past'
      }
    }
  }

  return { isValid: true, error: '' }
}

/**
 * Validates a complete product object
 * @param {Object} product - Product object to validate
 * @param {number} index - Index of product in array (for error messages)
 * @param {boolean} needsRfp - Whether this product needs RFP
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateProduct = (product, index = 0, needsRfp = true) => {
  const errors = {}
  let isValid = true

  // Validate productSpec
  const productSpecValidation = validateProductField(
    'Product Specification',
    product.productSpec,
    RFP_VALIDATION_RULES.PRODUCT.PRODUCT_SPEC
  )
  if (!productSpecValidation.isValid) {
    errors.productSpec = productSpecValidation.error
    isValid = false
  }

  if (needsRfp) {
    // For RFP products: length is mandatory, quantity & target price optional
    const lengthValidation = validateProductField(
      'Length',
      product.length,
      RFP_VALIDATION_RULES.PRODUCT.LENGTH
    )
    if (!lengthValidation.isValid) {
      errors.length = lengthValidation.error
      isValid = false
    }
  } else {
    // For non-RFP save-decision products: original strict rules
    const quantityValidation = validateProductField(
      'Quantity',
      product.quantity,
      RFP_VALIDATION_RULES.PRODUCT.QUANTITY
    )
    if (!quantityValidation.isValid) {
      errors.quantity = quantityValidation.error
      isValid = false
    }

    const lengthValidation = validateProductField(
      'Length',
      product.length,
      RFP_VALIDATION_RULES.PRODUCT.LENGTH
    )
    if (!lengthValidation.isValid) {
      errors.length = lengthValidation.error
      isValid = false
    }

    const targetPriceValidation = validateProductField(
      'Target Price',
      product.targetPrice,
      RFP_VALIDATION_RULES.PRODUCT.TARGET_PRICE
    )
    if (!targetPriceValidation.isValid) {
      errors.targetPrice = targetPriceValidation.error
      isValid = false
    }
  }

  return { isValid, errors }
}

/**
 * Validates complete RFP form
 * @param {Object} formData - Form data object (with deliveryTimeline, specialRequirements)
 * @param {Array} products - Array of products
 * @param {Function} isCustomProduct - Function to check if product is custom
 * @param {Function} hasPrice - Function to check if product has price
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateRfpForm = (formData, products, isCustomProduct, hasPrice) => {
  const errors = {
    products: {},
    deliveryTimeline: '',
    general: ''
  }
  let hasErrors = false

  // Validate: At least one product required
  if (!products || products.length === 0) {
    errors.general = 'Please add at least one product'
    return { isValid: false, errors }
  }

  // Algorithm-based filtering: Get products that need RFP
  const productsToRaise = products.filter(product => {
    const isCustom = isCustomProduct(product.productSpec)
    if (isCustom) return true
    const hasApprovedPrice = hasPrice(product)
    return !hasApprovedPrice
  })

  if (productsToRaise.length === 0) {
    errors.general = 'No products need RFP. All products have price available.'
    return { isValid: false, errors }
  }

  // Algorithm-based validation: Validate each product
  products.forEach((product, index) => {
    const isCustom = isCustomProduct(product.productSpec)
    const hasApprovedPrice = hasPrice(product)
    const needsRfp = isCustom || !hasApprovedPrice

    const productValidation = validateProduct(product, index, needsRfp)
    if (!productValidation.isValid) {
      errors.products[index] = productValidation.errors
      hasErrors = true
    }
  })

  // Algorithm-based validation: Validate delivery timeline
  const deliveryValidation = validateDeliveryTimeline(formData.deliveryTimeline)
  if (!deliveryValidation.isValid) {
    errors.deliveryTimeline = deliveryValidation.error
    hasErrors = true
  }

  return { isValid: !hasErrors, errors }
}

/**
 * Validates products array for backend
 * @param {Array} products - Array of product objects
 * @returns {Object} { isValid: boolean, error: string, index: number }
 */
export const validateProductsArray = (products) => {
  if (!products || !Array.isArray(products)) {
    return {
      isValid: false,
      error: 'products must be an array',
      index: -1
    }
  }

  if (products.length === 0) {
    return {
      isValid: false,
      error: 'products array cannot be empty',
      index: -1
    }
  }

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    
    if (!product || !product.productSpec || (typeof product.productSpec === 'string' && product.productSpec.trim() === '')) {
      return {
        isValid: false,
        error: `Product at index ${i} is missing productSpec. All products must have a valid productSpec.`,
        index: i
      }
    }

    if (!product.availabilityStatus || (typeof product.availabilityStatus === 'string' && product.availabilityStatus.trim() === '')) {
      return {
        isValid: false,
        error: `Product at index ${i} (${product.productSpec}) is missing availabilityStatus. All products must have availabilityStatus.`,
        index: i
      }
    }
  }

  return { isValid: true, error: '', index: -1 }
}
