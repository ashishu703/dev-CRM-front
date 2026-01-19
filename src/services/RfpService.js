import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../api/admin_api/api';

class RfpService {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(API_ENDPOINTS.RFPS_LIST(query));
  }

  async getById(id) {
    return apiClient.get(API_ENDPOINTS.RFP_BY_ID(id));
  }

  async create(data) {
    return apiClient.post(API_ENDPOINTS.RFPS_CREATE(), data);
  }

  async approve(id) {
    return apiClient.post(API_ENDPOINTS.RFP_APPROVE(id));
  }

  async reject(id, reason) {
    return apiClient.post(API_ENDPOINTS.RFP_REJECT(id), { reason });
  }

  async addPrice(id, data) {
    return apiClient.post(API_ENDPOINTS.RFP_ADD_PRICE(id), data);
  }

  async generateQuotation(id) {
    return apiClient.post(API_ENDPOINTS.RFP_QUOTATION(id));
  }

  async submitToAccounts(id, data) {
    return apiClient.post(API_ENDPOINTS.RFP_SUBMIT_ACCOUNTS(id), data);
  }

  async updateAccountsApproval(id, data) {
    return apiClient.post(API_ENDPOINTS.RFP_ACCOUNTS_APPROVAL(id), data);
  }

  async updateSeniorApproval(id, data) {
    return apiClient.post(API_ENDPOINTS.RFP_SENIOR_APPROVAL(id), data);
  }
}

export default new RfpService();
