import apiClient from '../../utils/apiClient';

class PaymentService {
  // Create payment
  async createPayment(paymentData) {
    try {
      const response = await apiClient.post('/api/payments', paymentData);
      return response;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Get full lead details for Payment Status view: lead, payment summary, quotations, payments, rfps
  async getLeadDetails(customerId) {
    try {
      const response = await apiClient.get(`/api/payments/lead-details/${encodeURIComponent(customerId)}`);
      return response;
    } catch (error) {
      console.error('Error fetching lead details:', error);
      throw error;
    }
  }

  // Get payment status by lead (salesperson, lead name, total/paid/pending) for SuperAdmin
  // Optional params: department_head, salesperson, lead_name, start_date, end_date
  async getPaymentStatusByLead(params = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          query.append(key, String(value).trim());
        }
      });
      const url = query.toString() ? `/api/payments/payment-status?${query.toString()}` : '/api/payments/payment-status';
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching payment status by lead:', error);
      throw error;
    }
  }

  // Get all payments with pagination and filtering
  async getAllPayments(params = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      const response = await apiClient.get(`/api/payments?${query.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching all payments:', error);
      throw error;
    }
  }

  // Get payment by ID
  async getPayment(id) {
    try {
      const response = await apiClient.get(`/api/payments/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  // Get payments by PI
  async getPaymentsByPI(piId) {
    try {
      const response = await apiClient.get(`/api/payments/pi/${piId}`);
      return response;
    } catch (error) {
      console.error('Error fetching PI payments:', error);
      throw error;
    }
  }

  // Get payments by quotation
  async getPaymentsByQuotation(quotationId) {
    try {
      const response = await apiClient.get(`/api/payments/quotation/${quotationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching quotation payments:', error);
      throw error;
    }
  }

  // Get payments by customer
  async getPaymentsByCustomer(customerId) {
    try {
      const response = await apiClient.get(`/api/payments/customer/${customerId}`);
      return response;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(id, status, gatewayResponse = null) {
    try {
      const response = await apiClient.put(`/api/payments/${id}/status`, { status, gatewayResponse });
      return response;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Update approval status
  async updateApprovalStatus(id, status, notes = '') {
    try {
      return await apiClient.put(`/api/payments/${id}/approval`, { status, notes });
    } catch (error) {
      console.error('Error updating payment approval status:', error);
      throw error;
    }
  }

  // Approve payment shortcut
  async approvePayment(id, notes = '') {
    try {
      return await apiClient.put(`/api/payments/${id}/approve`, { notes });
    } catch (error) {
      console.error('Error approving payment:', error);
      throw error;
    }
  }

  // Get payment summary by customer
  async getPaymentSummary(customerId) {
    try {
      const response = await apiClient.get(`/api/payments/summary/customer/${customerId}`);
      return response;
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      throw error;
    }
  }

  // Get payment summary by quotation
  async getPaymentSummaryByQuotation(quotationId) {
    try {
      const response = await apiClient.get(`/api/payments/summary/quotation/${quotationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching quotation payment summary:', error);
      throw error;
    }
  }

  // Get detailed installment breakdown for a quotation
  async getInstallmentBreakdown(quotationId) {
    try {
      const response = await apiClient.get(`/api/payments/installment-breakdown/quotation/${quotationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching installment breakdown:', error);
      throw error;
    }
  }

  // Get customer credit balance
  async getCustomerCredit(customerId) {
    try {
      const response = await apiClient.get(`/api/payments/credit/${customerId}`);
      return response;
    } catch (error) {
      console.error('Error fetching customer credit:', error);
      throw error;
    }
  }

  // Refund
  async refund(body) {
    try {
      const response = await apiClient.post(`/api/payments/refund`, body);
      return response;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  // Transfer credit
  async transferCredit(body) {
    try {
      const response = await apiClient.post(`/api/payments/transfer`, body);
      return response;
    } catch (error) {
      console.error('Error transferring credit:', error);
      throw error;
    }
  }

  // Update payment
  async updatePayment(id, updateData) {
    try {
      const response = await apiClient.put(`/api/payments/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  // Delete payment
  async deletePayment(id) {
    try {
      const response = await apiClient.delete(`/api/payments/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // OPTIMIZED: Get payments for multiple quotations in one call
  // OPTIMIZED: Get payments for multiple quotations in one call
  // Uses POST for large arrays (>100 IDs) to avoid URL length limits
  async getBulkPaymentsByQuotations(quotationIds) {
    try {
      // Use POST for large arrays to avoid URL length limits (431 error)
      if (quotationIds.length > 100) {
        const response = await apiClient.post('/api/payments/bulk-by-quotations', {
          quotationIds: quotationIds
        });
        return response;
      } else {
        // Use GET for small arrays (backward compatibility)
        const idsParam = JSON.stringify(quotationIds);
        const response = await apiClient.get(`/api/payments/bulk-by-quotations?quotationIds=${encodeURIComponent(idsParam)}`);
        return response;
      }
    } catch (error) {
      console.error('Error fetching bulk payments by quotations:', error);
      throw error;
    }
  }

  // OPTIMIZED: Get payments for multiple customers in one call
  // Uses POST for large arrays (>100 IDs) to avoid URL length limits
  async getBulkPaymentsByCustomers(customerIds) {
    try {
      // Use POST for large arrays to avoid URL length limits (431 error)
      if (customerIds.length > 100) {
        const response = await apiClient.post('/api/payments/bulk-by-customers', {
          customerIds: customerIds
        });
        return response;
      } else {
        // Use GET for small arrays (backward compatibility)
        const idsParam = JSON.stringify(customerIds);
        const response = await apiClient.get(`/api/payments/bulk-by-customers?customerIds=${encodeURIComponent(idsParam)}`);
        return response;
      }
    } catch (error) {
      console.error('Error fetching bulk payments by customers:', error);
      throw error;
    }
  }
}

export default new PaymentService();
