import apiClient from '../../utils/apiClient';

class ProformaInvoiceService {
  // Create PI from quotation
  async createFromQuotation(quotationId, piData) {
    try {
      const response = await apiClient.post(`/api/proforma-invoices/quotation/${quotationId}`, piData);
      return response;
    } catch (error) {
      console.error('Error creating PI from quotation:', error);
      throw error;
    }
  }

  // Get PI by ID
  async getPI(id) {
    try {
      const response = await apiClient.get(`/api/proforma-invoices/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching PI:', error);
      throw error;
    }
  }

  // Get PI with payments
  async getPIWithPayments(id) {
    try {
      const response = await apiClient.get(`/api/proforma-invoices/${id}/payments`);
      return response;
    } catch (error) {
      console.error('Error fetching PI with payments:', error);
      throw error;
    }
  }

  // Get PIs by quotation
  async getPIsByQuotation(quotationId) {
    try {
      const response = await apiClient.get(`/api/proforma-invoices/quotation/${quotationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching PIs by quotation:', error);
      throw error;
    }
  }

  // Update PI
  async updatePI(id, updateData) {
    try {
      const response = await apiClient.put(`/api/proforma-invoices/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating PI:', error);
      throw error;
    }
  }

  // Delete PI
  async deletePI(id) {
    try {
      const response = await apiClient.delete(`/api/proforma-invoices/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting PI:', error);
      throw error;
    }
  }

  // Send PI to customer
  async sendToCustomer(id) {
    try {
      const response = await apiClient.post(`/api/proforma-invoices/${id}/send`);
      return response;
    } catch (error) {
      console.error('Error sending PI to customer:', error);
      throw error;
    }
  }

  // OPTIMIZED: Get PIs for multiple quotations in one call
  // OPTIMIZED: Get PIs for multiple quotations in one call
  // Uses POST for large arrays (>100 IDs) to avoid URL length limits
  async getBulkPIsByQuotations(quotationIds) {
    try {
      // Use POST for large arrays to avoid URL length limits (431 error)
      if (quotationIds.length > 100) {
        const response = await apiClient.post('/api/proforma-invoices/bulk-by-quotations', {
          quotationIds: quotationIds
        });
        return response;
      } else {
        // Use GET for small arrays (backward compatibility)
        const idsParam = JSON.stringify(quotationIds);
        const response = await apiClient.get(`/api/proforma-invoices/bulk-by-quotations?quotationIds=${encodeURIComponent(idsParam)}`);
        return response;
      }
    } catch (error) {
      console.error('Error fetching bulk PIs by quotations:', error);
      throw error;
    }
  }
}

export default new ProformaInvoiceService();
