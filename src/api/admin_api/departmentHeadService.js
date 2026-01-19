import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from './api';

// Domain enums and mapping helpers
export const DepartmentType = {
  MARKETING_SALES: 'marketing_sales',
  OFFICE_SALES: 'office_sales',
  HR: 'hr',
  PRODUCTION: 'production',
  ACCOUNTS: 'accounts',
  IT: 'it',
};

export const uiToApiDepartment = (uiValue) => {
  const map = {
    'Sales Department': DepartmentType.OFFICE_SALES,
    'Marketing Department': DepartmentType.MARKETING_SALES,
    'HR Department': DepartmentType.HR,
    'Production Department': DepartmentType.PRODUCTION,
    'Accounts Department': DepartmentType.ACCOUNTS,
    'IT Department': DepartmentType.IT,
  };
  return map[uiValue] || uiValue;
};

export const apiToUiDepartment = (apiValue) => {
  const map = {
    [DepartmentType.OFFICE_SALES]: 'Sales Department',
    [DepartmentType.MARKETING_SALES]: 'Marketing Department',
    [DepartmentType.HR]: 'HR Department',
    [DepartmentType.PRODUCTION]: 'Production Department',
    [DepartmentType.ACCOUNTS]: 'Accounts Department',
    [DepartmentType.IT]: 'IT Department',
  };
  return map[apiValue] || apiValue;
};

// Service class encapsulating endpoints
class DepartmentHeadService {
  async createHead(payload) {
    return apiClient.post(API_ENDPOINTS.DEPARTMENT_HEADS_CREATE(), payload);
  }

  async listHeads(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(API_ENDPOINTS.DEPARTMENT_HEADS_LIST(query.toString()));
  }

  async getStats() {
    return apiClient.get(API_ENDPOINTS.DEPARTMENT_HEADS_STATS());
  }

  async getByCompanyAndDepartment(companyName, departmentType) {
    return apiClient.get(API_ENDPOINTS.DEPARTMENT_HEADS_BY_COMPANY_DEPARTMENT(companyName, departmentType));
  }

  async getHeadById(id) {
    return apiClient.get(API_ENDPOINTS.DEPARTMENT_HEAD_BY_ID(id));
  }

  async updateHead(id, payload) {
    return apiClient.put(API_ENDPOINTS.DEPARTMENT_HEAD_BY_ID(id), payload);
  }

  async updateStatus(id, isActive) {
    return apiClient.put(API_ENDPOINTS.DEPARTMENT_HEAD_STATUS(id), { isActive });
  }

  async deleteHead(id) {
    return apiClient.request(API_ENDPOINTS.DEPARTMENT_HEAD_BY_ID(id), { method: 'DELETE' });
  }

  // Leads
  async getAllLeads(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(API_ENDPOINTS.LEADS_LIST(query.toString()));
  }

  async createLead(payload) {
    return apiClient.post(API_ENDPOINTS.LEADS_CREATE(), payload);
  }

  async importLeads(leadsArray) {
    return apiClient.post(API_ENDPOINTS.LEADS_IMPORT(), { leads: leadsArray });
  }

  async updateLead(id, payload) {
    return apiClient.put(API_ENDPOINTS.LEAD_BY_ID(id), payload);
  }

  async batchUpdateLeads(ids, payload) {
    return apiClient.put(API_ENDPOINTS.LEADS_BATCH_UPDATE(), { ids, updateData: payload });
  }

  async deleteLead(id) {
    return apiClient.request(API_ENDPOINTS.LEAD_BY_ID(id), { method: 'DELETE' });
  }

  async getLastCallLeads(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(API_ENDPOINTS.LEADS_LAST_CALL(query.toString()));
  }

  async getLastCallSummary(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(API_ENDPOINTS.LEADS_LAST_CALL_SUMMARY(query.toString()));
  }

  // Proforma Invoices
  async getAllPendingPIs() {
    return apiClient.get('/api/proforma-invoices/pending');
  }

  async getAllPIs() {
    return apiClient.get('/api/proforma-invoices/all');
  }
}

const departmentHeadService = new DepartmentHeadService();
export default departmentHeadService;
