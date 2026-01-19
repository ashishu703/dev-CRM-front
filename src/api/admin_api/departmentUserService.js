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
class DepartmentUserService {
  async createUser(payload) {
    return apiClient.post(API_ENDPOINTS.DEPARTMENT_USERS_CREATE(), payload);
  }

  async listUsers(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return apiClient.get(API_ENDPOINTS.DEPARTMENT_USERS_LIST(query.toString()));
  }

  async getStats() {
    return apiClient.get(API_ENDPOINTS.DEPARTMENT_USERS_STATS());
  }

  async getByHeadId(headUserId) {
    return apiClient.get(API_ENDPOINTS.DEPARTMENT_USERS_BY_HEAD(headUserId));
  }

  async getUserById(id) {
    return apiClient.get(API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id));
  }

  async updateUser(id, payload) {
    return apiClient.put(API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id), payload);
  }

  async updateStatus(id, isActive) {
    return apiClient.put(API_ENDPOINTS.DEPARTMENT_USER_STATUS(id), { isActive });
  }

  async deleteUser(id) {
    return apiClient.request(API_ENDPOINTS.DEPARTMENT_USER_BY_ID(id), { method: 'DELETE' });
  }
}

const departmentUserService = new DepartmentUserService();
export default departmentUserService;
