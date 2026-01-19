import quotationService from '../api/admin_api/quotationService';
import apiErrorHandler from '../utils/ApiErrorHandler';
import toastManager from '../utils/ToastManager';
import { QUOTATION_MESSAGES } from '../config/appConfig';

class QuotationService {
  constructor() {
    this.quotationService = quotationService;
  }

  async fetchQuotationsByCustomer(leadId) {
    try {
      const response = await this.quotationService.getQuotationsByCustomer(leadId);
      if (response && response.success) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }
  }

  async approveQuotation(quotationId, previewLeadId = null) {
    try {
      const response = await this.quotationService.approveQuotation(
        quotationId,
        QUOTATION_MESSAGES.APPROVE
      );
      if (response && response.success) {
        toastManager.success(QUOTATION_MESSAGES.APPROVE_SUCCESS);
        if (previewLeadId) {
          return await this.fetchQuotationsByCustomer(previewLeadId);
        }
        return [];
      }
      return [];
    } catch (error) {
      apiErrorHandler.handleError(error, 'approve quotation');
      return [];
    }
  }

  async rejectQuotation(quotationId, previewLeadId = null) {
    try {
      const response = await this.quotationService.rejectQuotation(
        quotationId,
        QUOTATION_MESSAGES.REJECT
      );
      if (response && response.success) {
        toastManager.success(QUOTATION_MESSAGES.REJECT_SUCCESS);
        if (previewLeadId) {
          return await this.fetchQuotationsByCustomer(previewLeadId);
        }
        return [];
      }
      return [];
    } catch (error) {
      apiErrorHandler.handleError(error, 'reject quotation');
      return [];
    }
  }

  async getQuotation(quotationId) {
    try {
      const response = await this.quotationService.getQuotation(quotationId);
      if (response && response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      apiErrorHandler.handleError(error, 'view quotation');
      return null;
    }
  }
}

export default QuotationService;

