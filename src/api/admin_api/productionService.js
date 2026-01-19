import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from './api';

class ProductionService {
  async getMetrics(companyName) {
    return apiClient.get(API_ENDPOINTS.PRODUCTION_METRICS(companyName));
  }

  async getSchedule(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return apiClient.get(API_ENDPOINTS.PRODUCTION_SCHEDULE(query.toString()));
  }

  async getTasks(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return apiClient.get(API_ENDPOINTS.PRODUCTION_TASKS(query.toString()));
  }

  async getQcLots(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return apiClient.get(API_ENDPOINTS.PRODUCTION_QC_LOTS(query.toString()));
  }

  async getMaintenanceOrders(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return apiClient.get(API_ENDPOINTS.PRODUCTION_MAINT_ORDERS(query.toString()));
  }

  async getInventory(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return apiClient.get(API_ENDPOINTS.PRODUCTION_INVENTORY(query.toString()));
  }
}

const productionService = new ProductionService();
export default productionService;


