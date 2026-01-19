import apiClient from '../utils/apiClient';

/**
 * SalesOrderService class for managing sales order operations in Production Department
 * Follows OOP principles and DRY to centralize sales order logic
 */
class SalesOrderService {
  /**
   * Get all sales orders
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of sales orders
   */
  async getAllSalesOrders(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      
      const response = await apiClient.get(`/api/sales-orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      throw error;
    }
  }

  /**
   * Get sales order by ID
   * @param {number} id - Sales order ID
   * @returns {Promise<Object>} Sales order data
   */
  async getSalesOrderById(id) {
    try {
      const response = await apiClient.get(`/api/sales-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales order:', error);
      throw error;
    }
  }

  /**
   * Update sales order
   * @param {number} id - Sales order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated sales order
   */
  async updateSalesOrder(id, updateData) {
    try {
      const response = await apiClient.put(`/api/sales-orders/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating sales order:', error);
      throw error;
    }
  }

  /**
   * Delete sales order
   * @param {number} id - Sales order ID
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteSalesOrder(id) {
    try {
      const response = await apiClient.delete(`/api/sales-orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting sales order:', error);
      throw error;
    }
  }

  /**
   * Get sales order statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getStatistics() {
    try {
      const response = await apiClient.get('/api/sales-orders/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Format currency in Indian format
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

  /**
   * Get status badge color
   * @param {string} status - Status value
   * @returns {string} Tailwind CSS color classes
   */
  getStatusColor(status) {
    const statusColors = {
      confirmed: 'bg-blue-100 text-blue-800',
      in_production: 'bg-yellow-100 text-yellow-800',
      quality_check: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      shipped: 'bg-teal-100 text-teal-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get payment status badge color
   * @param {string} paymentStatus - Payment status value
   * @returns {string} Tailwind CSS color classes
   */
  getPaymentStatusColor(paymentStatus) {
    const paymentColors = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-orange-100 text-orange-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return paymentColors[paymentStatus] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get priority badge color
   * @param {string} priority - Priority value
   * @returns {string} Tailwind CSS color classes
   */
  getPriorityColor(priority) {
    const priorityColors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Format status for display
   * @param {string} status - Status value
   * @returns {string} Formatted status string
   */
  formatStatus(status) {
    const statusMap = {
      confirmed: 'Confirmed',
      in_production: 'In Production',
      quality_check: 'Quality Check',
      completed: 'Completed',
      shipped: 'Shipped',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  /**
   * Format payment status for display
   * @param {string} paymentStatus - Payment status value
   * @returns {string} Formatted payment status string
   */
  formatPaymentStatus(paymentStatus) {
    const paymentMap = {
      paid: 'Paid',
      partial: 'Partial',
      pending: 'Pending',
      overdue: 'Overdue'
    };
    return paymentMap[paymentStatus] || paymentStatus;
  }
}

// Export singleton instance
const salesOrderService = new SalesOrderService();
export default salesOrderService;

