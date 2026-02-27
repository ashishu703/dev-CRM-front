import apiClient from '../../utils/apiClient';

class PaymentService {
  async createPayment(paymentData) {
    try {
      const response = await apiClient.post('/api/payments', paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getLeadDetails(customerId) {
    try {
      const response = await apiClient.get(`/api/payments/lead-details/${encodeURIComponent(customerId)}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
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
      throw error;
    }
  }

  async getPaymentTracking(params = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          query.append(key, String(value).trim());
        }
      });
      const url = query.toString() ? `/api/payments/tracking?${query.toString()}` : '/api/payments/tracking';
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

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
      throw error;
    }
  }

  // Get payment by ID
  async getPayment(id) {
    try {
      const response = await apiClient.get(`/api/payments/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get payments by PI
  async getPaymentsByPI(piId) {
    try {
      const response = await apiClient.get(`/api/payments/pi/${piId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get payments by quotation
  async getPaymentsByQuotation(quotationId) {
    try {
      const response = await apiClient.get(`/api/payments/quotation/${quotationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get payments by customer
  async getPaymentsByCustomer(customerId) {
    try {
      const response = await apiClient.get(`/api/payments/customer/${customerId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(id, status, gatewayResponse = null) {
    try {
      const response = await apiClient.put(`/api/payments/${id}/status`, { status, gatewayResponse });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update approval status
  async updateApprovalStatus(id, status, notes = '') {
    try {
      return await apiClient.put(`/api/payments/${id}/approval`, { status, notes });
    } catch (error) {
      throw error;
    }
  }

  // Approve payment shortcut
  async approvePayment(id, notes = '') {
    try {
      return await apiClient.put(`/api/payments/${id}/approve`, { notes });
    } catch (error) {
      throw error;
    }
  }

  // Get payment summary by customer
  async getPaymentSummary(customerId) {
    try {
      const response = await apiClient.get(`/api/payments/summary/customer/${customerId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get payment summary by quotation
  async getPaymentSummaryByQuotation(quotationId) {
    try {
      const response = await apiClient.get(`/api/payments/summary/quotation/${quotationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getInstallmentBreakdown(quotationId) {
    try {
      const response = await apiClient.get(`/api/payments/installment-breakdown/quotation/${quotationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerCredit(customerId) {
    try {
      const response = await apiClient.get(`/api/payments/credit/${customerId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderDelivery(quotationId, payload) {
    const response = await apiClient.patch('/api/payments/order-delivery', {
      quotation_id: quotationId,
      delivery_date: payload.delivery_date ?? payload.deliveryDate ?? null,
      delivery_status: payload.delivery_status ?? payload.deliveryStatus ?? null,
    });
    return response;
  }

  // Refund
  async refund(body) {
    try {
      const response = await apiClient.post(`/api/payments/refund`, body);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Transfer credit
  async transferCredit(body) {
    try {
      const response = await apiClient.post(`/api/payments/transfer`, body);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update payment
  async updatePayment(id, updateData) {
    try {
      const response = await apiClient.put(`/api/payments/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete payment
  async deletePayment(id) {
    try {
      const response = await apiClient.delete(`/api/payments/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getBulkPaymentsByQuotations(quotationIds) {
    try {
      if (quotationIds.length > 100) {
        const response = await apiClient.post('/api/payments/bulk-by-quotations', {
          quotationIds: quotationIds
        });
        return response;
      } else {
        const idsParam = JSON.stringify(quotationIds);
        const response = await apiClient.get(`/api/payments/bulk-by-quotations?quotationIds=${encodeURIComponent(idsParam)}`);
        return response;
      }
    } catch (error) {
      throw error;
    }
  }

  async getBulkPaymentsByCustomers(customerIds) {
    try {
      if (customerIds.length > 100) {
        const response = await apiClient.post('/api/payments/bulk-by-customers', {
          customerIds: customerIds
        });
        return response;
      } else {
        const idsParam = JSON.stringify(customerIds);
        const response = await apiClient.get(`/api/payments/bulk-by-customers?customerIds=${encodeURIComponent(idsParam)}`);
        return response;
      }
    } catch (error) {
      throw error;
    }
  }
}

export default new PaymentService();
