import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../api/admin_api/api';

class ReportService {
  constructor() {
    this.baseUrl = API_ENDPOINTS.API_BASE_URL;
  }

  async fetchSalesReport(params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/sales${queryString}`;
    return this.executeRequest(endpoint);
  }

  async fetchLeadsReport(params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/leads${queryString}`;
    return this.executeRequest(endpoint);
  }

  async fetchActivityReport(params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/activity${queryString}`;
    return this.executeRequest(endpoint);
  }

  async fetchRevenueReport(params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/revenue${queryString}`;
    return this.executeRequest(endpoint);
  }

  async fetchForecastReport(params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/forecast${queryString}`;
    return this.executeRequest(endpoint);
  }

  async fetchCustomReport(reportType, params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/custom/${reportType}${queryString}`;
    return this.executeRequest(endpoint);
  }

  async fetchDashboardReport(params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/dashboard${queryString}`;
    return this.executeRequest(endpoint);
  }

  async fetchOrganisationReport(params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/organisation${queryString}`;
    return this.executeRequest(endpoint);
  }

  async fetchCallReport(params = {}) {
    const queryString = this.buildQueryString(params);
    const endpoint = `${this.baseUrl}/api/reports/calls${queryString}`;
    return this.executeRequest(endpoint);
  }

  buildQueryString(params) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async executeRequest(endpoint) {
    const response = await apiClient.get(endpoint);
    return response.data;
  }

  transformToTableFormat(data, columns) {
    return {
      type: 'table',
      columns,
      rows: data.map(item => columns.map(col => item[col] || '-'))
    };
  }

  transformToSummaryFormat(metrics) {
    return {
      type: 'summary',
      metrics: metrics.map(metric => ({
        label: metric.label,
        value: metric.value,
        change: metric.change,
        trend: metric.change > 0 ? 'up' : metric.change < 0 ? 'down' : 'neutral'
      }))
    };
  }
}

export default new ReportService();

