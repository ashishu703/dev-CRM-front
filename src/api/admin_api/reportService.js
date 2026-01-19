import apiClient from '../../utils/apiClient';

/**
 * Report Service
 * Handles API calls for salesperson reports
 * Uses parallel API calls where possible
 */
class ReportService {
  /**
   * Get Activity Report for a salesperson
   * @param {string} salespersonUsername - Username or email of salesperson
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise<Object>} Activity report data
   */
  async getActivityReport(salespersonUsername, params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);

      const response = await apiClient.get(
        `/api/reports/salesperson/activity/${encodeURIComponent(salespersonUsername)}?${query.toString()}`
      );
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching activity report:', error);
      throw error;
    }
  }

  /**
   * Get Performance Report for a salesperson
   * @param {string} salespersonUsername - Username or email of salesperson
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise<Object>} Performance report data
   */
  async getPerformanceReport(salespersonUsername, params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);

      const response = await apiClient.get(
        `/api/reports/salesperson/performance/${encodeURIComponent(salespersonUsername)}?${query.toString()}`
      );
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching performance report:', error);
      throw error;
    }
  }

  /**
   * Get Top Performer Comparison Report
   * @param {Object} params - Query parameters (startDate, endDate, departmentType)
   * @returns {Promise<Object>} Top performer comparison data
   */
  async getTopPerformerComparison(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
      if (params.departmentType) query.append('departmentType', params.departmentType);

      const response = await apiClient.get(
        `/api/reports/salesperson/top-performers?${query.toString()}`
      );
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching top performer comparison:', error);
      throw error;
    }
  }

  /**
   * Get Salespersons List
   * @param {Object} params - Query parameters (departmentType)
   * @returns {Promise<Object>} Salespersons list
   */
  async getSalespersonsList(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.departmentType) query.append('departmentType', params.departmentType);

      const response = await apiClient.get(
        `/api/reports/salesperson/list?${query.toString()}`
      );
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching salespersons list:', error);
      throw error;
    }
  }

  /**
   * Get Orders Report
   * @param {Object} params - Query parameters (salesperson, startDate, endDate)
   * @returns {Promise<Object>} Orders report data
   */
  async getOrdersReport(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.salesperson) query.append('salesperson', params.salesperson);
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);

      const response = await apiClient.get(
        `/api/reports/orders?${query.toString()}`
      );
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching orders report:', error);
      throw error;
    }
  }

  /**
   * Get Salespersons with Orders
   * @returns {Promise<Array>} Salespersons list with orders
   */
  async getSalespersonsWithOrders() {
    try {
      const response = await apiClient.get('/api/reports/orders/salespersons');
      // Backend returns { success: true, data: { salespersons: [...] } }
      const data = response?.data?.data || response?.data || {};
      return Array.isArray(data) ? data : (data.salespersons || []);
    } catch (error) {
      console.error('Error fetching salespersons with orders:', error);
      throw error;
    }
  }

  /**
   * Fetch multiple reports in parallel
   * @param {Array} reportRequests - Array of {type, salespersonUsername, params}
   * @returns {Promise<Object>} Combined report data
   */
  async fetchReportsInParallel(reportRequests) {
    try {
      const promises = reportRequests.map(request => {
        switch (request.type) {
          case 'activity':
            return this.getActivityReport(request.salespersonUsername, request.params);
          case 'performance':
            return this.getPerformanceReport(request.salespersonUsername, request.params);
          case 'topPerformers':
            return this.getTopPerformerComparison(request.params);
          case 'orders':
            return this.getOrdersReport(request.params);
          default:
            return Promise.resolve(null);
        }
      });

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error fetching reports in parallel:', error);
      throw error;
    }
  }
}

const reportService = new ReportService();
export default reportService;

