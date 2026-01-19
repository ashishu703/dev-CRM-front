import apiClient from '../utils/apiClient';
import DateFormatter from '../utils/DateFormatter';

/**
 * WorkOrderService class for managing work order operations.
 * Follows OOP principles and DRY to centralize work order logic.
 */
class WorkOrderService {
  /**
   * Fetch quotation details by ID
   * @param {string} quotationId - Quotation ID
   * @returns {Promise<Object>} Quotation data
   */
  async fetchQuotationDetails(quotationId) {
    try {
      const response = await apiClient.get(`/api/quotations/${quotationId}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching quotation:', error);
      return null;
    }
  }

  /**
   * Fetch current user profile
   * @returns {Promise<Object>} User profile data
   */
  async fetchUserProfile() {
    try {
      const response = await apiClient.get('/api/auth/profile');
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Helper: Sanitize date values (DRY principle)
   * @param {*} dateValue - Date value to sanitize
   * @returns {string|null} Sanitized date or null
   */
  sanitizeDate(dateValue) {
    if (!dateValue) return null;
    if (typeof dateValue === 'string') {
      const trimmed = dateValue.trim().toUpperCase();
      if (['N/A', '', 'NULL', 'NONE'].includes(trimmed)) return null;
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : DateFormatter.formatDateISO(parsed);
    }
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : DateFormatter.formatDateISO(dateValue);
    }
    return null;
  }
  /**
   * Generates a work order number
   * @param {string} prefix - Prefix for work order (default: 'WO')
   * @returns {string} Generated work order number
   */
  generateWorkOrderNumber(prefix = 'WO') {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${random}`;
  }

  /**
   * Builds work order data from payment data (with auto-fetch from quotation)
   * @param {Object} paymentData - Payment data object
   * @param {Object} quotationData - Optional quotation data (if already fetched)
   * @param {Object} userData - Optional user data (if already fetched)
   * @returns {Promise<Object>} Work order data object
   */
  async buildWorkOrderFromPayment(paymentData, quotationData = null, userData = null) {
    const workOrderNumber = this.generateWorkOrderNumber();
    const today = DateFormatter.formatDateISO(new Date());
    
    const rawDeliveryDate = paymentData.deliveryDate || paymentData.paymentData?.delivery_date;
    const deliveryDate = this.sanitizeDate(rawDeliveryDate) || DateFormatter.formatDateISO(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    
    const quotationId = paymentData.quotationId || paymentData.paymentData?.quotation_number || paymentData.paymentData?.quotation_id || paymentData.orderId || null;
    
    // Fetch quotation details if quotationId exists and quotationData not provided
    if (quotationId && !quotationData) {
      quotationData = await this.fetchQuotationDetails(quotationId);
    }

    // Fetch user profile if not provided
    if (!userData) {
      userData = await this.fetchUserProfile();
    }

    // Build work order with quotation data if available
    const workOrder = {
      workOrderNumber,
      quotationId: quotationId,
      date: today,
      deliveryDate: deliveryDate,
      contact: quotationData?.customer_phone || paymentData.customer?.phone || paymentData.paymentData?.lead_phone || '',
      from: {
        companyName: quotationData?.from_company_name || 'Your Company Name',
        address: quotationData?.from_address || '123 Business Street, City, State - 400001',
        email: quotationData?.from_email || 'info@company.com',
        gstin: quotationData?.from_gstin || '',
        state: quotationData?.from_state || '',
        website: quotationData?.from_website || ''
      },
      to: {
        companyName: quotationData?.to_company_name || paymentData.customer?.name || 'Customer Company Ltd.',
        address: quotationData?.to_address || paymentData.address || paymentData.paymentData?.address || '',
        email: quotationData?.to_email || paymentData.customer?.email || paymentData.paymentData?.lead_email || ''
      },
      customer: {
        businessName: quotationData?.to_company_name || paymentData.customer?.name || '',
        buyerName: quotationData?.buyer_name || '',
        gst: quotationData?.to_gstin || quotationData?.customer_gst_no || '',
        contact: quotationData?.customer_phone || paymentData.customer?.phone || '',
        address: quotationData?.to_address || paymentData.address || '',
        state: quotationData?.to_state || ''
      },
      additionalDetails: {
        paymentMode: quotationData?.payment_terms || 'As per agreement',
        transportTc: quotationData?.transport_tc || '',
        dispatchThrough: quotationData?.dispatch_through || '',
        deliveryTerms: quotationData?.delivery_terms || '',
        materialType: quotationData?.material_type || '',
        deliveryLocation: quotationData?.delivery_location || quotationData?.to_address || ''
      },
      orderDetails: {
        title: quotationData?.order_title || paymentData.productName || '',
        description: quotationData?.order_description || '',
        quantity: quotationData?.order_quantity || '0',
        type: quotationData?.order_type || '',
        length: quotationData?.order_length || '',
        colour: quotationData?.order_colour || '',
        print: quotationData?.order_print || '',
        total: quotationData?.order_total || paymentData.totalAmount || paymentData.amount || 0
      },
      items: quotationData?.items || [],
      production: {
        rawMaterials: quotationData?.raw_materials || '',
        qualityStandards: quotationData?.quality_standards || '',
        specialInstructions: quotationData?.special_instructions || '',
        priority: 'medium'
      },
      unitRate: quotationData?.unit_rate || '0',
      terms: quotationData?.terms || [],
      preparedBy: userData ? {
        name: userData.username || userData.name || '',
        designation: userData.role || userData.departmentType || ''
      } : { name: '', designation: '' },
      receivedBy: '',
      remarks: ''
    };

    return workOrder;
  }

  /**
   * Check if work order exists for a quotation
   * @param {string} quotationId - Quotation ID
   * @returns {Promise<Object>} Check result with exists flag and data
   */
  async checkQuotationWorkOrder(quotationId) {
    try {
      if (!quotationId) {
        return { success: false, exists: false, data: null };
      }
      const response = await apiClient.get(`/api/work-orders/check/quotation/${quotationId}`);
      console.log('🔍 checkQuotationWorkOrder raw response for', quotationId, ':', response);
      
      if (response && typeof response === 'object') {
        if (response.success !== undefined && response.exists !== undefined) {
          console.log('📦 API response wrapper received:', { success: response.success, exists: response.exists, hasData: !!response.data });
          return response;
        }
        if (response.work_order_number || response.id) {
          console.log('📦 Work order object received directly (unexpected)');
          return {
            success: true,
            exists: true,
            data: response
          };
        }
      }
      
      console.log('❌ Work order not found in response');
      return { success: false, exists: false, data: null };
    } catch (error) {
      console.error('❌ Error checking quotation work order:', error);
      return {
        success: false,
        exists: false,
        data: null,
        error: error.message || 'Failed to check quotation work order'
      };
    }
  }

  /**
   * Saves work order to backend
   * @param {Object} workOrderData - Work order data
   * @param {Object} paymentData - Optional payment data for references
   * @param {string} templateKey - Template key for rendering
   * @returns {Promise<Object>} Saved work order
   */
  async saveWorkOrder(workOrderData, paymentData = null, templateKey = null) {
    try {
      const payload = {
        ...workOrderData,
        paymentId: paymentData?.paymentData?.id || paymentData?.id || null,
        quotationId: paymentData?.quotationId || paymentData?.paymentData?.quotation_id || paymentData?.orderId || null,
        leadId: paymentData?.leadId || paymentData?.paymentData?.lead_id || null,
        templateKey: templateKey || workOrderData.templateKey || null,
        status: workOrderData.status || 'pending'
      };
      const response = await apiClient.post('/api/work-orders', payload);
      const result = response?.data || response;
      return result || { success: false, data: null };
    } catch (error) {
      console.error('Error saving work order:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to save work order'
      };
    }
  }

  /**
   * Get all work orders
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of work orders
   */
  async getAllWorkOrders(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.quotationId) params.append('quotationId', filters.quotationId);
      if (filters.paymentId) params.append('paymentId', filters.paymentId);
      
      const response = await apiClient.get(`/api/work-orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }
  }

  /**
   * Get work order by ID
   * @param {number} id - Work order ID
   * @returns {Promise<Object>} Work order data
   */
  async getWorkOrderById(id) {
    try {
      const response = await apiClient.get(`/api/work-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }
  }

  /**
   * Update work order status
   * @param {number} id - Work order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated work order
   */
  async updateWorkOrderStatus(id, status) {
    try {
      const response = await apiClient.patch(`/api/work-orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating work order status:', error);
      throw error;
    }
  }

  /**
   * Update work order (DRY principle - reusable update method)
   * @param {number} id - Work order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated work order
   */
  async updateWorkOrder(id, updateData) {
    try {
      const response = await apiClient.put(`/api/work-orders/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating work order:', error);
      throw error;
    }
  }

  /**
   * Delete work order (soft delete)
   * @param {number} id - Work order ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteWorkOrder(id) {
    try {
      const response = await apiClient.delete(`/api/work-orders/${id}`);
      return response?.data || response || { success: true, message: 'Work order deleted successfully' };
    } catch (error) {
      console.error('Error deleting work order:', error);
      throw error;
    }
  }

  /**
   * Formats currency in Indian format
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

const workOrderService = new WorkOrderService();
export default workOrderService;

