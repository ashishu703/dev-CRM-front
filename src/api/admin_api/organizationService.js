import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from './api';

class OrganizationService {
  async createOrganization(payload) {
    return apiClient.post(API_ENDPOINTS.ORGANIZATIONS_CREATE(), payload);
  }

  async updateOrganization(id, payload) {
    return apiClient.put(`${API_ENDPOINTS.ORGANIZATIONS_BASE}/${id}`, payload);
  }

  async deleteOrganization(id) {
    return apiClient.delete(`${API_ENDPOINTS.ORGANIZATIONS_BASE}/${id}`);
  }

  async listOrganizations(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(API_ENDPOINTS.ORGANIZATIONS_LIST(query.toString()));
  }

  async listActive() {
    return apiClient.get(API_ENDPOINTS.ORGANIZATIONS_ACTIVE());
  }
}

const organizationService = new OrganizationService();
export default organizationService;


